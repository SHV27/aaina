import type { Item, ScalePoint } from "../types";

/** WAST — Brown, Lent, Brett, Sas & Pederson (1996). Gender-neutral administration
 *  (adaptation logged in SCIENCE.md §7). Each item 1–3; sum 8–24; cutoff ≥ 13;
 *  WAST-Short = items 1–2, positive when both at the extreme response.
 *  THESE ITEMS LIVE IN safetyStore ONLY — never persisted, exchanged, or sent. */

const c = "brown-1996" as const;
const ch = "suraksha" as const;

const tension: ScalePoint[] = [
  { value: 1, label: "No tension" },
  { value: 2, label: "Some tension" },
  { value: 3, label: "A lot of tension" },
];
const difficulty: ScalePoint[] = [
  { value: 1, label: "No difficulty" },
  { value: 2, label: "Some difficulty" },
  { value: 3, label: "Great difficulty" },
];
const freq: ScalePoint[] = [
  { value: 1, label: "Never" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
];

const mk = (n: number, text: string, scale: ScalePoint[]): Item => ({
  id: `wast-${n}`,
  chapter: ch,
  instrument: "wast",
  citation: c,
  scale,
  text,
});

export const WAST_ITEMS: Item[] = [
  mk(1, "In general, how would you describe your relationship?", tension),
  mk(2, "Do you and your partner work out arguments with…", difficulty),
  mk(3, "Do arguments ever result in you feeling down or bad about yourself?", freq),
  mk(4, "Do arguments ever result in hitting, kicking, or pushing?", freq),
  mk(5, "Do you ever feel frightened by what your partner says or does?", freq),
  mk(6, "Has your partner ever abused you physically?", freq),
  mk(7, "Has your partner ever abused you emotionally?", freq),
  mk(8, "Has your partner ever abused you sexually?", freq),
];

export const WAST_CUTOFF = 13;
