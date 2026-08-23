import type { Answer, Item } from "./types";

/** THE state derivation authority. All scoring flows through this module —
 *  no component computes a score locally. Arc 2 completes all subscales. */

export interface MicroRead {
  /** Sum over answered skeleton items (0–17 across the 3 seed items). */
  raw: number;
  max: number;
  /** Honest qualitative band for the micro-read (not a verdict). */
  band: "warm" | "mixed" | "strained";
  answerIds: string[];
}

export function scoreMicroRead(answers: Answer[], items: Item[]): MicroRead | null {
  const byId = new Map(items.map((i) => [i.id, i]));
  const scored = answers.filter((a) => byId.has(a.itemId));
  if (scored.length < items.length) return null;

  let raw = 0;
  let max = 0;
  for (const a of scored) {
    const item = byId.get(a.itemId)!;
    const values = item.scale.map((s) => s.value);
    const top = Math.max(...values);
    raw += item.reverse ? top - a.value : a.value;
    max += top;
  }
  const ratio = raw / max;
  const band = ratio >= 0.66 ? "warm" : ratio >= 0.4 ? "mixed" : "strained";
  return { raw, max, band, answerIds: scored.map((a) => a.itemId) };
}
