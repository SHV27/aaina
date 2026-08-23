import type { Answer, Evidence } from "./types";
import { scoreAssessment } from "./score";
import type { ScaleScores } from "./types";
import { assertCounsellorSafe } from "./counsellorGuard";
import { itemById, JOEL_LEAVE_ITEMS, JOEL_STAY_ITEMS } from "./items";

/** Do Aaine — perception-gap analysis. Joel et al. (2020): each partner's own
 *  perceptions carry the signal; the GAP between two perceptions of the same
 *  relationship is itself a first-class finding, not an error to average away. */

export interface PerceptionGap {
  itemId: string;
  itemText: string;
  mineLabel: string;
  theirsLabel: string;
  /** Normalized 0–1 distance on the item's scale. */
  distance: number;
  evidence: Evidence;
}

export interface CoupleView {
  mine: ScaleScores;
  theirs: ScaleScores;
  /** Scale-level gaps worth naming (normalized 0–1). */
  scaleGaps: { key: string; label: string; mine: number; theirs: number; gap: number }[];
  /** Largest item-level perception gaps (top N, non-Joel scales). */
  topGaps: PerceptionGap[];
  /** Counsellor-safe framing sentence. */
  framing: { text: string; evidence: Evidence };
  agreementNote: { text: string; evidence: Evidence } | null;
}

const norm = (v: number, min: number, max: number) => (v - min) / (max - min);

export function analyzeCouple(
  myAnswers: Record<string, Answer>,
  theirAnswers: Record<string, Answer>,
): CoupleView {
  const mine = scoreAssessment(Object.values(myAnswers));
  const theirs = scoreAssessment(Object.values(theirAnswers));

  const scaleGaps: CoupleView["scaleGaps"] = [];
  const push = (
    key: string,
    label: string,
    m: number | null,
    t: number | null,
    min: number,
    max: number,
  ) => {
    if (m === null || t === null) return;
    scaleGaps.push({
      key,
      label,
      mine: norm(m, min, max),
      theirs: norm(t, min, max),
      gap: Math.abs(norm(m, min, max) - norm(t, min, max)),
    });
  };
  push("csi", "Sukoon", mine.csi16, theirs.csi16, 0, 81);
  push("commitment", "Commitment", mine.imsCommitment, theirs.imsCommitment, 0, 8);
  push("dw", "Zor–chuppi ka chakkar", mine.cpqDemandWithdraw, theirs.cpqDemandWithdraw, 6, 54);
  push("constructive", "Sulajhaane waali baat-cheet", mine.cpqConstructive, theirs.cpqConstructive, 4, 36);

  // Item-level gaps on shared non-Joel items (Joel reasons are personal weights,
  // compared at scale level only).
  const joelIds = new Set([...JOEL_STAY_ITEMS, ...JOEL_LEAVE_ITEMS].map((i) => i.id));
  const gaps: PerceptionGap[] = [];
  for (const [id, a] of Object.entries(myAnswers)) {
    if (joelIds.has(id)) continue;
    const b = theirAnswers[id];
    const item = itemById(id);
    if (!b || !item || item.instrument === "iri" || item.instrument === "mc-c") continue;
    const values = item.scale.map((s) => s.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const d = Math.abs(norm(a.value, min, max) - norm(b.value, min, max));
    if (d < 0.5) continue;
    gaps.push({
      itemId: id,
      itemText: item.text,
      mineLabel: item.scale.find((s) => s.value === a.value)?.label ?? "",
      theirsLabel: item.scale.find((s) => s.value === b.value)?.label ?? "",
      distance: d,
      evidence: { answerIds: [id], source: item.citation },
    });
  }
  gaps.sort((x, y) => y.distance - x.distance);
  const topGaps = gaps.slice(0, 5);

  const framingText =
    topGaps.length > 0
      ? "Do aaine ek jaisa nahi dikhate — aur research kehti hai yehi sabse keemti data hai: jahan dono ki nazar alag hai, wahan rishte ka asli kaam chhupa hota hai. Neeche woh jagahein hain jahan aap dono ne ek hi sawaal ko sabse alag dekha."
      : "Do aaine kaafi ek jaisa dikha rahe hain — sawaalon par aap dono ki nazar zyada tar milti hai. Jo thoda-bahut farak hai, woh scale-level par neeche dikha hai.";
  assertCounsellorSafe(framingText);

  let agreementNote: CoupleView["agreementNote"] = null;
  const bigScaleGap = scaleGaps.filter((g) => g.gap >= 0.25);
  if (bigScaleGap.length > 0) {
    const t = `Sabse bada farak "${bigScaleGap[0].label}" par hai — ek aaina use kaafi upar dikhata hai, doosra kaafi neeche. Is farak ko galti nahi, baat shuru karne ki jagah maaniye.`;
    assertCounsellorSafe(t);
    agreementNote = {
      text: t,
      evidence: { answerIds: Object.keys(myAnswers).slice(0, 50), source: "joel-2020" },
    };
  }

  return {
    mine,
    theirs,
    scaleGaps,
    topGaps,
    framing: {
      text: framingText,
      evidence: { answerIds: Object.keys(myAnswers).slice(0, 50), source: "joel-2020" },
    },
    agreementNote,
  };
}
