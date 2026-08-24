import type { ScalePoint } from "../types";

/** Response formats, preserved from the published instruments wherever the
 *  instrument specifies one. Where Aaina adapts a format (noted in SCIENCE-v2.md),
 *  the adaptation is the same width as the original. */

export const agree5: ScalePoint[] = [
  { value: 1, label: "Not at all true" },
  { value: 2, label: "A little true" },
  { value: 3, label: "Somewhat true" },
  { value: 4, label: "Mostly true" },
  { value: 5, label: "Very true" },
];

export const agree7: ScalePoint[] = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Slightly disagree" },
  { value: 4, label: "Neither" },
  { value: 5, label: "Slightly agree" },
  { value: 6, label: "Agree" },
  { value: 7, label: "Strongly agree" },
];

/** Rempel trust scale: −3..+3 presented in plain words. */
export const trust7: ScalePoint[] = [
  { value: -3, label: "Strongly disagree" },
  { value: -2, label: "Moderately disagree" },
  { value: -1, label: "Mildly disagree" },
  { value: 0, label: "Neutral" },
  { value: 1, label: "Mildly agree" },
  { value: 2, label: "Moderately agree" },
  { value: 3, label: "Strongly agree" },
];

/** PPRS: "My partner usually…" 9-point, presented at 7 for consistency of feel. */
export const true7: ScalePoint[] = [
  { value: 1, label: "Not at all true" },
  { value: 2, label: "Slightly true" },
  { value: 3, label: "Somewhat true" },
  { value: 4, label: "Moderately true" },
  { value: 5, label: "Mostly true" },
  { value: 6, label: "Very true" },
  { value: 7, label: "Completely true" },
];

export const frequency5: ScalePoint[] = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "All the time" },
];

export const likely7: ScalePoint[] = [
  { value: 1, label: "Very unlikely" },
  { value: 2, label: "Unlikely" },
  { value: 3, label: "Slightly unlikely" },
  { value: 4, label: "Even chance" },
  { value: 5, label: "Slightly likely" },
  { value: 6, label: "Likely" },
  { value: 7, label: "Very likely" },
];

/** Knobloch & Solomon: certainty, reverse-scored into uncertainty. */
export const certain6: ScalePoint[] = [
  { value: 1, label: "Completely uncertain" },
  { value: 2, label: "Mostly uncertain" },
  { value: 3, label: "Slightly uncertain" },
  { value: 4, label: "Slightly certain" },
  { value: 5, label: "Mostly certain" },
  { value: 6, label: "Completely certain" },
];

/** CSI-16 native formats. */
export const csiHappiness: ScalePoint[] = [
  { value: 0, label: "Extremely unhappy" },
  { value: 1, label: "Fairly unhappy" },
  { value: 2, label: "A little unhappy" },
  { value: 3, label: "Happy" },
  { value: 4, label: "Very happy" },
  { value: 5, label: "Extremely happy" },
  { value: 6, label: "Perfect" },
];

export const csiTruth: ScalePoint[] = [
  { value: 0, label: "Not at all true" },
  { value: 1, label: "A little true" },
  { value: 2, label: "Somewhat true" },
  { value: 3, label: "Mostly true" },
  { value: 4, label: "Almost completely true" },
  { value: 5, label: "Completely true" },
];

export const csiExtent: ScalePoint[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "A little" },
  { value: 2, label: "Somewhat" },
  { value: 3, label: "Mostly" },
  { value: 4, label: "Almost completely" },
  { value: 5, label: "Completely" },
];

export const csiFrequency: ScalePoint[] = [
  { value: 5, label: "All the time" },
  { value: 4, label: "Most of the time" },
  { value: 3, label: "More often than not" },
  { value: 2, label: "Occasionally" },
  { value: 1, label: "Rarely" },
  { value: 0, label: "Never" },
];

/** Investment Model Scale, 0–8. */
export const agree9: ScalePoint[] = [
  { value: 0, label: "Do not agree at all" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "Agree somewhat" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "Agree completely" },
];

/** CPQ likelihood, 1–9. */
export const likely9: ScalePoint[] = Array.from({ length: 9 }, (_, i) => ({
  value: i + 1,
  label: i === 0 ? "Very unlikely" : i === 4 ? "Even chance" : i === 8 ? "Very likely" : String(i + 1),
}));

/** GMSEX bipolar pairs rendered as a 7-step slider between two words. */
export function bipolar7(negative: string, positive: string): ScalePoint[] {
  return Array.from({ length: 7 }, (_, i) => ({
    value: i + 1,
    label:
      i === 0
        ? `Completely ${negative.toLowerCase()}`
        : i === 3
          ? "In between"
          : i === 6
            ? `Completely ${positive.toLowerCase()}`
            : i < 3
              ? `Mostly ${negative.toLowerCase()}`
              : `Mostly ${positive.toLowerCase()}`,
  }));
}
