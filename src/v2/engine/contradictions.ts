import type {
  Contradiction,
  ContradictionKind,
  ContradictionSide,
  DimensionScore,
  Item,
  Response,
} from "./types";
import type { DimensionId } from "./dimensions";

/** THE CONTRADICTION ENGINE — the anti-generic core.
 *
 *  Scores alone produce horoscopes ("your satisfaction is moderate"). Tensions
 *  between a specific person's own answers cannot be written about generically,
 *  because the tension only exists in their data. Every AI-written claim in the
 *  report must attach to one of these, a dimension score, or a verbatim echo.
 *
 *  Each rule states its own research significance; the writer may not invent one. */

const byId = (scores: DimensionScore[]) => new Map(scores.map((s) => [s.dimension, s]));

function side(
  label: string,
  score: DimensionScore | undefined,
  items: Item[],
  responses: Map<string, Response>,
  maxEchoes = 2,
): ContradictionSide {
  const ids = score?.itemIds ?? [];
  const echoes: string[] = [];
  // Echo the most extreme answers this person actually gave on this dimension.
  const ranked = ids
    .map((id) => ({ id, item: items.find((i) => i.id === id), r: responses.get(id) }))
    .filter((x) => x.item && x.r) as { id: string; item: Item; r: Response }[];
  ranked.sort((a, b) => {
    const extremity = (x: { item: Item; r: Response }) => {
      const vals = x.item.scale.map((s) => s.value);
      const mid = (Math.max(...vals) + Math.min(...vals)) / 2;
      return Math.abs(x.r.value - mid);
    };
    return extremity(b) - extremity(a);
  });
  for (const x of ranked.slice(0, maxEchoes)) {
    const label = x.item.scale.find((s) => s.value === x.r.value)?.label;
    if (label) echoes.push(`“${label}” to: ${x.item.text}`);
  }
  return { label, itemIds: ids, echoes, value: score?.normalized ?? 0 };
}

interface Rule {
  kind: ContradictionKind;
  a: DimensionId;
  b: DimensionId;
  /** Fires when a is high and b is low (values on the 0–100 normalized view). */
  aAbove: number;
  bBelow: number;
  headline: (a: number, b: number) => string;
  significance: string;
  citation: Contradiction["citation"];
}

const RULES: Rule[] = [
  {
    kind: "commitment-without-satisfaction",
    a: "commitment",
    b: "satisfaction",
    aAbove: 60,
    bBelow: 45,
    headline: () => "You are committed to a relationship that is not currently making you happy.",
    significance:
      "Commitment and satisfaction usually move together. When commitment stays high while satisfaction falls, the commitment is being held up by something other than how the relationship feels — investment, alternatives, or duty (Rusbult, Martz & Agnew, 1998).",
    citation: "rusbult-1998",
  },
  {
    kind: "staying-from-fear",
    a: "commitment",
    b: "autonomy-fear",
    aAbove: 55,
    bBelow: 40,
    headline: () => "Your reasons for staying and your fear of being alone are hard to tell apart.",
    significance:
      "Fear of being single predicts settling for less responsive partners and staying in relationships people rate as unsatisfying (Spielmann et al., 2013).",
    citation: "spielmann-2013",
  },
  {
    kind: "trust-vs-surveillance",
    a: "trust-security",
    b: "digital-strain",
    aAbove: 60,
    bBelow: 40,
    headline: () => "You say you trust them, and you are still checking.",
    significance:
      "Checking behaviour maintains the anxiety it is meant to relieve: monitoring feeds jealousy, which feeds more monitoring, and the loop predicts lower satisfaction a year later (Muise et al., 2009; Tokunaga, 2011).",
    citation: "tokunaga-2011",
  },
  {
    kind: "closeness-wanted-not-allowed",
    a: "attachment-anxiety",
    b: "attachment-avoidance",
    aAbove: 55,
    bBelow: 45,
    headline: () => "You want to be closer than you let yourself get.",
    significance:
      "Wanting closeness while keeping distance is a recognised attachment pattern, not a contradiction in character: the same system that seeks reassurance also protects against needing it (Wei et al., 2007).",
    citation: "wei-2007",
  },
  {
    kind: "understood-but-unhappy",
    a: "responsiveness",
    b: "satisfaction",
    aAbove: 62,
    bBelow: 42,
    headline: () => "They understand you, and it still is not enough.",
    significance:
      "Being understood is the strongest single ingredient of intimacy, so when responsiveness is high and satisfaction is low, the problem usually sits in circumstances or direction rather than in the connection itself (Reis, Clark & Holmes, 2004).",
    citation: "reis-2004",
  },
  {
    kind: "future-without-agreement",
    a: "commitment",
    b: "values-future",
    aAbove: 60,
    bBelow: 45,
    headline: () => "You are planning a long future with someone who wants a different one.",
    significance:
      "Concrete disagreement about children, money, city or family arrangements does not resolve through affection; unresolved life-direction conflict is one of the enduring vulnerabilities that predicts decline (Karney & Bradbury, 1995).",
    citation: "karney-bradbury-1995",
  },
  {
    kind: "family-pressure-vs-choice",
    a: "commitment",
    b: "family-acceptance",
    aAbove: 50,
    bBelow: 40,
    headline: () => "The relationship is carrying weight from outside it.",
    significance:
      "Approval from the people around a couple is one of the few external factors that reliably predicts whether relationships last (Le et al., 2010; Sprecher & Felmlee, 1992). In India this pressure is closer to the centre of the decision than Western research usually assumes (Lokniti-CSDS, 2017).",
    citation: "sprecher-felmlee-1992",
  },
  {
    kind: "conflict-avoided-not-solved",
    a: "satisfaction",
    b: "conflict-pattern",
    aAbove: 55,
    bBelow: 40,
    headline: () => "Things feel fine because the hard conversation keeps not happening.",
    significance:
      "Avoiding a subject is not the same as resolving it. Demand–withdraw patterns are among the most reliable predictors of decline, and they are often quietest in couples who describe themselves as happy (Christensen & Heavey, 1990).",
    citation: "christensen-1990",
  },
  {
    kind: "intimacy-gap",
    a: "satisfaction",
    b: "intimacy-sexual",
    aAbove: 58,
    bBelow: 38,
    headline: () => "The relationship works everywhere except in the body.",
    significance:
      "Sexual satisfaction and communication about sex are linked closely enough that a persistent gap here tends to spread outward over time (Mallory, 2022).",
    citation: "mallory-2022",
  },
  {
    kind: "certainty-gap",
    a: "commitment",
    b: "relational-certainty",
    aAbove: 55,
    bBelow: 45,
    headline: () => "You are committed to something neither of you has defined.",
    significance:
      "Relational uncertainty — not knowing what this is, or whether they agree — independently predicts distress, and it is the defining feature of the situationship (Knobloch & Solomon, 1999).",
    citation: "knobloch-solomon-1999",
  },
  {
    kind: "network-warning",
    a: "satisfaction",
    b: "support-network",
    aAbove: 55,
    bBelow: 38,
    headline: () => "You are happier in this than the people who know you both are.",
    significance:
      "Friends' and family's assessment of a relationship predicts its survival, sometimes better than the couple's own (Le et al., 2010). That is worth taking seriously without treating it as a verdict.",
    citation: "le-2010",
  },
];

export function findContradictions(
  scores: DimensionScore[],
  items: Item[],
  responses: Response[],
): Contradiction[] {
  const map = byId(scores);
  const rmap = new Map(responses.map((r) => [r.itemId, r]));
  const out: Contradiction[] = [];

  for (const rule of RULES) {
    const a = map.get(rule.a);
    const b = map.get(rule.b);
    if (!a || !b || a.answered === 0 || b.answered === 0) continue;
    if (a.normalized < rule.aAbove || b.normalized > rule.bBelow) continue;

    const magnitude = Math.round(Math.min(100, a.normalized - b.normalized));
    out.push({
      id: rule.kind,
      kind: rule.kind,
      headline: rule.headline(a.normalized, b.normalized),
      aSide: side(a.dimension, a, items, rmap),
      bSide: side(b.dimension, b, items, rmap),
      magnitude,
      citation: rule.citation,
      significance: rule.significance,
    });
  }

  // Within-dimension tension: two answers on the same dimension that point opposite ways.
  for (const score of scores) {
    if (score.answered < 3) continue;
    const answered = score.itemIds
      .map((id) => ({ item: items.find((i) => i.id === id), r: rmap.get(id) }))
      .filter((x) => x.item && x.r) as { item: Item; r: Response }[];
    if (answered.length < 3) continue;

    const positions = answered.map((x) => {
      const vals = x.item.scale.map((s) => s.value);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const p = ((x.r.value - min) / (max - min)) * 100;
      return { ...x, p: x.item.reverse ? 100 - p : p };
    });
    positions.sort((m, n) => n.p - m.p);
    const hi = positions[0];
    const lo = positions[positions.length - 1];
    if (hi.p - lo.p < 70) continue;

    out.push({
      id: `split-${score.dimension}`,
      kind: "self-report-tension",
      headline: `Your own answers about ${score.dimension.replace(/-/g, " ")} point in two directions.`,
      aSide: {
        label: "what you said here",
        itemIds: [hi.item.id],
        echoes: [`“${hi.item.scale.find((s) => s.value === hi.r.value)?.label}” to: ${hi.item.text}`],
        value: Math.round(hi.p),
      },
      bSide: {
        label: "and what you said here",
        itemIds: [lo.item.id],
        echoes: [`“${lo.item.scale.find((s) => s.value === lo.r.value)?.label}” to: ${lo.item.text}`],
        value: Math.round(lo.p),
      },
      magnitude: Math.round(hi.p - lo.p),
      citation: "meade-craig-2012",
      significance:
        "Two answers on the same subject that point opposite ways usually mean the subject is genuinely mixed rather than that either answer is wrong. Mixed feelings on one specific thing are more useful to look at than an averaged score.",
    });
  }

  out.sort((x, y) => y.magnitude - x.magnitude);
  return out;
}
