import type { Answer, Item, QualityFlags } from "./types";

/** Careless-responding detection per Meade & Craig (2012) + Ward & Meade (2023).
 *  Flags lower the visible confidence meter; they never silently invalidate.
 *  Two-sided guards: tests assert flags fire on bad data AND stay quiet on good. */

/** Sub-900ms Likert taps are speeding (lane-4 evidence: <1s reads are noise). */
export const SPEEDING_MS = 900;
/** Identical consecutive responses within one instrument block. */
export const STRAIGHTLINE_THRESHOLD = 8;

export function computeQualityFlags(
  answers: Answer[],
  items: Item[],
  totalItemCount: number,
): QualityFlags {
  const byId = new Map(items.map((i) => [i.id, i]));

  let speedingCount = 0;
  for (const a of answers) {
    if (byId.has(a.itemId) && a.tMs > 0 && a.tMs < SPEEDING_MS) speedingCount++;
  }

  // Long-string: longest run of identical values across answers in item order.
  const ordered = items
    .filter((i) => i.instrument !== "iri")
    .map((i) => answers.find((a) => a.itemId === i.id))
    .filter((a): a is Answer => a !== undefined);
  let longestStraightline = 0;
  let run = 0;
  let prev: number | null = null;
  for (const a of ordered) {
    run = a.value === prev ? run + 1 : 1;
    prev = a.value;
    longestStraightline = Math.max(longestStraightline, run);
  }

  // Instructed-response items (attention checks).
  let irisFailed = 0;
  for (const item of items) {
    if (item.instrument !== "iri") continue;
    const a = answers.find((x) => x.itemId === item.id);
    if (a && a.value !== item.instructedValue) irisFailed++;
  }

  const answeredCount = answers.filter((a) => byId.has(a.itemId)).length;

  return {
    speedingCount,
    longestStraightline,
    irisFailed,
    mcC: null, // filled by score.ts once MC-C items are scored
    answeredCount,
    skippedCount: Math.max(0, totalItemCount - answeredCount),
  };
}

export type ConfidenceLevel = "high" | "moderate" | "tentative";

export interface ConfidenceMeter {
  level: ConfidenceLevel;
  /** Counsellor-register reasons, each mapped to a flag — shown, never hidden. */
  reasons: string[];
}

export function computeConfidence(
  q: QualityFlags,
  mode: "solo" | "couple",
): ConfidenceMeter {
  const reasons: string[] = [];
  let penalty = 0;

  if (mode === "solo") {
    reasons.push(
      "Yeh reading sirf aapki aankhon se hai — research kehti hai aapki perception sabse strong single signal hai (Joel et al., 2020), par doosri taraf ki aankh isme nahi hai.",
    );
  }
  if (q.irisFailed >= 2) {
    penalty += 2;
    reasons.push(
      "Kuch dhyaan-check sawaal chhoot gaye — ho sakta hai kahin jaldi mein jawaab diye gaye hon.",
    );
  }
  if (q.speedingCount > Math.max(5, q.answeredCount * 0.15)) {
    penalty += 1;
    reasons.push(
      "Kaafi jawaab bahut tezi se aaye — aaina utna hi saaf dikhata hai jitna aaram se dekha jaye.",
    );
  }
  if (q.longestStraightline >= STRAIGHTLINE_THRESHOLD) {
    penalty += 1;
    reasons.push(
      "Lagatar ek jaise jawaabon ki ek lambi line dikhi — kabhi kabhi yeh thakaan ka signal hota hai.",
    );
  }
  if (q.skippedCount > q.answeredCount * 0.25) {
    penalty += 1;
    reasons.push("Kuch sections skip hue — jitna dikhaya, utna hi padha ja sakta hai.");
  }
  if (q.mcC !== null && q.mcC >= 11) {
    reasons.push(
      "Aapke jawaabon mein sabko-acha-dikhne ka halka rang hai (yeh aam baat hai) — kadwe sach shayad thode aur kadve hon.",
    );
  }

  const level: ConfidenceLevel =
    penalty >= 3 ? "tentative" : penalty >= 1 ? "moderate" : "high";
  return { level, reasons };
}
