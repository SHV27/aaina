import type { ScalePoint } from "../types";

/** Shared response formats, kept exactly as published. */

export const csiHappiness: ScalePoint[] = [
  { value: 0, label: "Extremely unhappy" },
  { value: 1, label: "Fairly unhappy" },
  { value: 2, label: "A little unhappy" },
  { value: 3, label: "Happy" },
  { value: 4, label: "Very happy" },
  { value: 5, label: "Extremely happy" },
  { value: 6, label: "Perfect" },
];

export const csiFrequency: ScalePoint[] = [
  { value: 5, label: "All the time" },
  { value: 4, label: "Most of the time" },
  { value: 3, label: "More often than not" },
  { value: 2, label: "Occasionally" },
  { value: 1, label: "Rarely" },
  { value: 0, label: "Never" },
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

/** Semantic differential: rendered left pole → right pole, positive pole scores 5. */
export function csiSemantic(left: string, right: string, positiveIsLeft: boolean): ScalePoint[] {
  const values = positiveIsLeft ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
  return values.map((value, i) => ({
    value,
    label:
      i === 0 ? `Closest to "${left}"` : i === 5 ? `Closest to "${right}"` : `${positiveIsLeft ? 5 - value : value + 1} of 6`,
  }));
}

export const agree7: ScalePoint[] = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Slightly disagree" },
  { value: 4, label: "Neutral" },
  { value: 5, label: "Slightly agree" },
  { value: 6, label: "Agree" },
  { value: 7, label: "Strongly agree" },
];

export const likely9: ScalePoint[] = Array.from({ length: 9 }, (_, i) => ({
  value: i + 1,
  label: i === 0 ? "1 — Very unlikely" : i === 8 ? "9 — Very likely" : String(i + 1),
}));

export const agree9: ScalePoint[] = Array.from({ length: 9 }, (_, i) => ({
  value: i,
  label: i === 0 ? "0 — Do not agree at all" : i === 4 ? "4 — Agree somewhat" : i === 8 ? "8 — Agree completely" : String(i),
}));

export const factor7: ScalePoint[] = Array.from({ length: 7 }, (_, i) => ({
  value: i + 1,
  label:
    i === 0 ? "1 — Not a factor at all" : i === 6 ? "7 — A major factor" : String(i + 1),
}));

export const trueFalse: ScalePoint[] = [
  { value: 1, label: "True" },
  { value: 0, label: "False" },
];
