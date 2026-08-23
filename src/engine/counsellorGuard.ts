/** Banned-language guard (Referee-enforced, also run by the report generator).
 *  R14: the verdict is confident about evidence, never commanding about the choice.
 *  Anti-pseudoscience: no percentages of compatibility, no prophecy, no lie-proof claims. */

const BANNED_PATTERNS: { pattern: RegExp; why: string }[] = [
  { pattern: /you (must|should|have to|need to) (leave|stay|break ?up|divorce|marry)/i, why: "imperative about the reader's decision (R14)" },
  { pattern: /aap ?ko .*(chhod|shaadi|break ?up).* (chahiye|padega|hoga)/i, why: "imperative about the reader's decision (R14, Hinglish)" },
  { pattern: /\d{1,3}\s?% (compatible|compatibility|match)/i, why: "compatibility percentage — pseudoscience-shaped claim" },
  { pattern: /(predict|predicts|prediction of) (your )?(divorce|breakup|future)/i, why: "future prophecy — Heyman & Slep (2001) forbids this claim class" },
  { pattern: /(cannot|can't|impossible to) (lie|fake|cheat)/i, why: "lie-proofness overclaim (brief §6)" },
  { pattern: /soul ?mate|destiny|kundli|stars? (say|align)|manglik/i, why: "astrology register — the enemy's language" },
  { pattern: /\b(selfish|toxic person|narcissist|loser|worthless)\b/i, why: "character label — pattern-not-person (R12/R13)" },
];

export interface GuardViolation {
  match: string;
  why: string;
}

export function findBannedLanguage(text: string): GuardViolation[] {
  const violations: GuardViolation[] = [];
  for (const { pattern, why } of BANNED_PATTERNS) {
    const m = text.match(pattern);
    if (m) violations.push({ match: m[0], why });
  }
  return violations;
}

/** Throws if generated prose violates counsellor law — used by generator + tests. */
export function assertCounsellorSafe(text: string): void {
  const v = findBannedLanguage(text);
  if (v.length > 0) {
    throw new Error(
      `Counsellor-guard violation: ${v.map((x) => `"${x.match}" (${x.why})`).join("; ")}`,
    );
  }
}
