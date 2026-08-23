import type { Answer, Item, ScaleScores } from "./types";
import {
  ALL_ASSESSMENT_ITEMS,
  CPQ_CONSTRUCTIVE,
  CPQ_PARTNER_DEMAND,
  CPQ_SELF_DEMAND,
  CSI_ITEMS,
  ECR_ANXIETY_IDS,
  ECR_AVOIDANCE_IDS,
  IMS_ALTERNATIVES_ITEMS,
  IMS_COMMITMENT_ITEMS,
  IMS_INVESTMENT_ITEMS,
  IMS_SATISFACTION_ITEMS,
  JOEL_LEAVE_ITEMS,
  JOEL_STAY_ITEMS,
  MCC_ITEMS,
  WAST_CUTOFF,
  WAST_ITEMS,
} from "./items";
import { computeQualityFlags } from "./quality";

/** THE state derivation authority. All scoring flows through this module —
 *  no component computes a score locally. Every threshold here is published;
 *  sources in SCIENCE.md §2. */

export const CSI16_DISTRESS_CUTOFF = 51.5; // Funk & Rogge (2007)

const answerMap = (answers: Answer[]) => new Map(answers.map((a) => [a.itemId, a]));

function sumIfComplete(
  answers: Map<string, Answer>,
  items: Item[],
  minAnswered: number,
): number | null {
  let sum = 0;
  let n = 0;
  for (const item of items) {
    const a = answers.get(item.id);
    if (!a) continue;
    const top = Math.max(...item.scale.map((s) => s.value));
    const bottom = Math.min(...item.scale.map((s) => s.value));
    sum += item.reverse ? top + bottom - a.value : a.value;
    n++;
  }
  return n >= minAnswered ? sum : null;
}

function meanIfComplete(
  answers: Map<string, Answer>,
  items: Item[],
  minAnswered: number,
): number | null {
  const s = sumIfComplete(answers, items, minAnswered);
  if (s === null) return null;
  const n = items.filter((i) => answers.has(i.id)).length;
  return s / n;
}

/** CSI-16: sum 0–81 (prorated if ≥13/16 answered, else null). */
export function scoreCsi16(answers: Map<string, Answer>): number | null {
  const answered = CSI_ITEMS.filter((i) => answers.has(i.id));
  if (answered.length < 13) return null;
  const s = sumIfComplete(answers, CSI_ITEMS, 13)!;
  // Prorate to the full 16-item metric so the published cutoff applies.
  return (s / answered.length) * 16;
}

/** ECR-S subscale means, 1–7 (reverse = 8 − raw), ≥5/6 required. */
function scoreEcr(answers: Map<string, Answer>, ids: string[]): number | null {
  const items = ids
    .map((id) => ALL_ASSESSMENT_ITEMS.find((i) => i.id === id)!)
    .filter(Boolean);
  return meanIfComplete(answers, items, 5);
}

export function scoreAssessment(rawAnswers: Answer[]): ScaleScores {
  const answers = answerMap(rawAnswers);

  const csi16 = scoreCsi16(answers);

  const ecrAnxiety = scoreEcr(answers, ECR_ANXIETY_IDS);
  const ecrAvoidance = scoreEcr(answers, ECR_AVOIDANCE_IDS);

  // CPQ (Crenshaw et al. 2017 mapping): constructive = A2+B4+B6 + (10 − A1).
  const cpqPos = CPQ_CONSTRUCTIVE.positive.map(
    (id) => ALL_ASSESSMENT_ITEMS.find((i) => i.id === id)!,
  );
  const cpqNegA1 = answers.get(CPQ_CONSTRUCTIVE.reversed[0]);
  let cpqConstructive: number | null = null;
  const posSum = sumIfComplete(answers, cpqPos, 3);
  if (posSum !== null && cpqNegA1) cpqConstructive = posSum + (10 - cpqNegA1.value);

  const dwItems = [...CPQ_SELF_DEMAND, ...CPQ_PARTNER_DEMAND].map(
    (id) => ALL_ASSESSMENT_ITEMS.find((i) => i.id === id)!,
  );
  const cpqDemandWithdraw = sumIfComplete(answers, dwItems, 5);

  const imsCommitment = meanIfComplete(answers, IMS_COMMITMENT_ITEMS, 6);
  const imsSatisfaction = meanIfComplete(answers, IMS_SATISFACTION_ITEMS, 4);
  const imsAlternatives = meanIfComplete(answers, IMS_ALTERNATIVES_ITEMS, 4);
  const imsInvestment = meanIfComplete(answers, IMS_INVESTMENT_ITEMS, 4);

  const stayStrength = meanIfComplete(answers, JOEL_STAY_ITEMS, 20);
  const leaveStrength = meanIfComplete(answers, JOEL_LEAVE_ITEMS, 17);
  // Ambivalence: both sides above the scale midpoint (4 on 1–7) — Joel et al. (2018).
  const ambivalent =
    stayStrength !== null && leaveStrength !== null
      ? stayStrength > 4 && leaveStrength > 4
      : null;

  // MC Form C: count of socially-desirable-keyed answers (0–13).
  let mcC: number | null = null;
  const mccAnswered = MCC_ITEMS.filter((i) => answers.has(i.id));
  if (mccAnswered.length >= 10) {
    mcC = mccAnswered.reduce((acc, item) => {
      const a = answers.get(item.id)!;
      const saidTrue = a.value === 1;
      return acc + (saidTrue === item.keyedTrue ? 1 : 0);
    }, 0);
  }

  const quality = computeQualityFlags(
    rawAnswers,
    ALL_ASSESSMENT_ITEMS,
    ALL_ASSESSMENT_ITEMS.length,
  );
  quality.mcC = mcC;

  return {
    csi16,
    csi16Distressed: csi16 === null ? null : csi16 < CSI16_DISTRESS_CUTOFF,
    ecrAnxiety,
    ecrAvoidance,
    cpqDemandWithdraw,
    cpqConstructive,
    imsCommitment,
    imsSatisfaction,
    imsAlternatives,
    imsInvestment,
    stayStrength,
    leaveStrength,
    ambivalent,
    quality,
  };
}

/** WAST — scored from the memory-only safety store; NEVER from answersStore.
 *  Sum 8–24, published cutoff ≥13; WAST-Short positive = both first items at
 *  the extreme. Any physical/sexual endorsement is an immediate signal. */
export interface SafetyScreen {
  wastTotal: number | null;
  wastPositive: boolean;
  shortPositive: boolean;
  physicalOrSexual: boolean;
  frightened: boolean;
  answeredCount: number;
}

export function scoreSafety(rawAnswers: Answer[]): SafetyScreen {
  const answers = answerMap(rawAnswers);
  const answeredCount = WAST_ITEMS.filter((i) => answers.has(i.id)).length;
  const total = answeredCount === WAST_ITEMS.length
    ? WAST_ITEMS.reduce((acc, i) => acc + answers.get(i.id)!.value, 0)
    : null;

  const w1 = answers.get("wast-1")?.value;
  const w2 = answers.get("wast-2")?.value;
  const shortPositive = w1 === 3 && w2 === 3;

  const physicalOrSexual = ["wast-4", "wast-6", "wast-8"].some(
    (id) => (answers.get(id)?.value ?? 1) >= 2,
  );
  const frightened = (answers.get("wast-5")?.value ?? 1) >= 2;

  return {
    wastTotal: total,
    wastPositive: (total !== null && total >= WAST_CUTOFF) || shortPositive || physicalOrSexual,
    shortPositive,
    physicalOrSexual,
    frightened,
    answeredCount,
  };
}

/* ------------------------------------------------------------------ */
/* Jhalak micro-read (Arc 1 slice, now over the real bank)             */
/* ------------------------------------------------------------------ */

export interface MicroRead {
  raw: number;
  max: number;
  band: "warm" | "mixed" | "strained";
  answerIds: string[];
}

export function scoreMicroRead(rawAnswers: Answer[], items: Item[]): MicroRead | null {
  const byId = new Map(items.map((i) => [i.id, i]));
  const scored = rawAnswers.filter((a) => byId.has(a.itemId));
  if (scored.length < items.length) return null;

  let raw = 0;
  let max = 0;
  for (const a of scored) {
    const item = byId.get(a.itemId)!;
    const values = item.scale.map((s) => s.value);
    const top = Math.max(...values);
    const bottom = Math.min(...values);
    raw += item.reverse ? top + bottom - a.value : a.value - bottom;
    max += top - bottom;
  }
  const ratio = raw / max;
  const band = ratio >= 0.66 ? "warm" : ratio >= 0.4 ? "mixed" : "strained";
  return { raw, max, band, answerIds: scored.map((a) => a.itemId) };
}
