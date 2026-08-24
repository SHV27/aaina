import type { Item, Response } from "./types";

/** The risk screen. WAST (Brown et al., 1996), administered gender-neutrally.
 *  Its answers live only in memory and never reach the report generator's
 *  evidence bundle — the report is still delivered in full, but the PLAN
 *  switches to safety-only work and all conjoint exercises are suppressed. */

const freq3 = [
  { value: 1, label: "Never" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
];

export const RISK_ITEMS: Item[] = [
  {
    id: "risk-1",
    dimension: "trust-security",
    section: "you",
    text: "In general, how would you describe your relationship?",
    scale: [
      { value: 1, label: "No tension" },
      { value: 2, label: "Some tension" },
      { value: 3, label: "A lot of tension" },
    ],
    citation: "brown-1996",
  },
  {
    id: "risk-2",
    dimension: "trust-security",
    section: "you",
    text: "Do you and your partner work out arguments with…",
    scale: [
      { value: 1, label: "No difficulty" },
      { value: 2, label: "Some difficulty" },
      { value: 3, label: "Great difficulty" },
    ],
    citation: "brown-1996",
  },
  {
    id: "risk-3",
    dimension: "trust-security",
    section: "you",
    text: "Do arguments ever result in you feeling down or bad about yourself?",
    scale: freq3,
    citation: "brown-1996",
  },
  {
    id: "risk-4",
    dimension: "trust-security",
    section: "you",
    text: "Do arguments ever result in hitting, kicking, or pushing?",
    scale: freq3,
    citation: "brown-1996",
  },
  {
    id: "risk-5",
    dimension: "trust-security",
    section: "you",
    text: "Do you ever feel frightened by what your partner says or does?",
    scale: freq3,
    citation: "brown-1996",
  },
  {
    id: "risk-6",
    dimension: "trust-security",
    section: "you",
    text: "Has your partner ever abused you physically?",
    scale: freq3,
    citation: "brown-1996",
  },
  {
    id: "risk-7",
    dimension: "trust-security",
    section: "you",
    text: "Has your partner ever abused you emotionally?",
    scale: freq3,
    citation: "brown-1996",
  },
  {
    id: "risk-8",
    dimension: "trust-security",
    section: "you",
    text: "Has your partner ever abused you sexually?",
    scale: freq3,
    citation: "brown-1996",
  },
];

export const WAST_CUTOFF = 13;

export interface RiskResult {
  positive: boolean;
  /** Sum 8–24 when the whole screen is answered, else null. */
  total: number | null;
  shortScreenPositive: boolean;
  physicalOrSexual: boolean;
  frightened: boolean;
  answered: number;
}

/** Deliberately conservative: the published cutoff, OR the two-item short screen
 *  at both extremes, OR any endorsement of physical/sexual harm or fear. A false
 *  positive shows someone a page of helplines. A false negative could prescribe
 *  couple exercises to someone being hurt. */
export function scoreRisk(responses: Response[]): RiskResult {
  const map = new Map(responses.map((r) => [r.itemId, r.value]));
  const answered = RISK_ITEMS.filter((i) => map.has(i.id)).length;
  const total =
    answered === RISK_ITEMS.length
      ? RISK_ITEMS.reduce((sum, i) => sum + (map.get(i.id) ?? 0), 0)
      : null;

  const shortScreenPositive = map.get("risk-1") === 3 && map.get("risk-2") === 3;
  const physicalOrSexual = ["risk-4", "risk-6", "risk-8"].some((id) => (map.get(id) ?? 1) >= 2);
  const frightened = (map.get("risk-5") ?? 1) >= 2;

  return {
    positive:
      (total !== null && total >= WAST_CUTOFF) ||
      shortScreenPositive ||
      physicalOrSexual ||
      frightened,
    total,
    shortScreenPositive,
    physicalOrSexual,
    frightened,
    answered,
  };
}
