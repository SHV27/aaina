/** THE VOICE GUARD — enforced on every generated sentence, in tests and at runtime.
 *
 *  Three separate laws:
 *   1. No AI tells (the phrases that make writing read as machine-made).
 *   2. No Hinglish in body copy (English product; Hinglish only in the marked
 *      headline registry — see headlines.ts).
 *   3. No commands about the reader's decision, no pseudoscience claims. */

export interface VoiceViolation {
  match: string;
  law: "ai-tell" | "hinglish-body" | "forbidden-claim";
  why: string;
}

/** Phrases that mark text as machine-written. Sourced from practitioner analyses
 *  of AI-overused language (research/v2-lane4-report-craft.md). */
const AI_TELLS: RegExp[] = [
  /\bit'?s (important|worth) (to note|noting)\b/i,
  /\bdelve into\b/i,
  /\bdive (deep )?into\b/i,
  /\bnavigate the (complexities|landscape|nuances)\b/i,
  /\bembark on a journey\b/i,
  /\bin today'?s (fast-paced|modern) world\b/i,
  /\btapestry\b/i,
  /\bfosters? a sense of\b/i,
  /\bat the end of the day\b/i,
  /\b(game[- ]chang(er|ing)|transformative|groundbreaking)\b/i,
  /\bholistic\b/i,
  /\b(empower|unlock|unleash)(s|ing|ed)? (your|their|the)\b/i,
  /^(furthermore|moreover|additionally)\b/im,
  /\bin conclusion\b/i,
  /\bremember,? (that )?(you are not alone|every relationship)\b/i,
  /\brelationships are hard\b/i,
  /\bevery (relationship|couple) is unique\b/i,
  /\bit'?s a journey\b/i,
  /\bat its core\b/i,
  /\bthe key takeaway\b/i,
];

/** Transliterated Hindi that must not appear in body prose. Deliberately narrow:
 *  these are the words v1 leaned on. The headline registry is checked separately. */
const HINGLISH_BODY = [
  "aapke", "aapki", "aapka", "aapne", "aap ", "jawaab", "sawaal", "rishte", "rishta",
  "kuch", "bahut", "nahi ", "nahin", "hain ", "hai ", "kyun", "kaise", "yeh ", "voh ",
  "sirf", "poora", "thoda", "dekhiye", "samajh", "zaroori", "chahiye", "matlab",
  "acha ", "theek", "baat ", "dil ", "pyaar", "shaadi", "ghar ", "mein ", "karein",
];

const FORBIDDEN_CLAIMS: { pattern: RegExp; why: string }[] = [
  {
    pattern: /you (must|should|need to|have to) (leave|stay|break up|end (it|this)|marry|divorce)/i,
    why: "command about the reader's decision — the report reads the pattern, the reader decides",
  },
  {
    pattern: /\b\d{1,3}\s?% (compatible|compatibility|match)\b/i,
    why: "compatibility percentage as a verdict — pseudoscience shape",
  },
  {
    pattern: /\b(predicts?|will) (your )?(divorce|breakup|break up)\b/i,
    why: "prophecy — cross-validation collapses these claims (Heyman & Slep, 2001)",
  },
  {
    pattern: /\b(cannot|can'?t|impossible to) (lie|fake|cheat)\b/i,
    why: "lie-proofness overclaim — no self-report instrument is fake-proof",
  },
  {
    pattern: /\b(soul ?mate|destiny|written in the stars|kundli|manglik|horoscope says)\b/i,
    why: "astrology register — the thing this product exists to replace",
  },
  {
    pattern: /\b(you are|you'?re) (a )?(narcissist|toxic|selfish|codependent|gaslighter)\b/i,
    why: "character label — describe the pattern and its cost, never the person",
  },
  {
    pattern: /\b(diagnos(is|ed|e)|disorder|clinically (depressed|anxious))\b/i,
    why: "clinical diagnosis — outside what a self-report assessment may claim",
  },
];

export function findVoiceViolations(text: string, opts: { allowHinglish?: boolean } = {}): VoiceViolation[] {
  const out: VoiceViolation[] = [];

  for (const p of AI_TELLS) {
    const m = text.match(p);
    if (m) out.push({ match: m[0], law: "ai-tell", why: "reads as machine-written" });
  }

  if (!opts.allowHinglish) {
    const lower = ` ${text.toLowerCase()} `;
    for (const word of HINGLISH_BODY) {
      const idx = lower.indexOf(word);
      if (idx >= 0) {
        out.push({
          match: text.slice(Math.max(0, idx - 1), idx + word.length + 8).trim(),
          law: "hinglish-body",
          why: "product language is English; Hinglish belongs only in the headline registry",
        });
        break; // one report per string is enough to fail
      }
    }
  }

  for (const { pattern, why } of FORBIDDEN_CLAIMS) {
    const m = text.match(pattern);
    if (m) out.push({ match: m[0], law: "forbidden-claim", why });
  }

  return out;
}

export function assertVoice(text: string, opts: { allowHinglish?: boolean } = {}): void {
  const v = findVoiceViolations(text, opts);
  if (v.length > 0) {
    throw new Error(
      `Voice violation: ${v.map((x) => `"${x.match}" (${x.law}: ${x.why})`).join("; ")}`,
    );
  }
}

/** Barnum detection: sentences that would be true of almost anyone.
 *  A claim survives only if it is anchored to something specific — a number, a
 *  quoted answer, a named tension, a second-person specific. */
const BARNUM_PATTERNS: RegExp[] = [
  /^you (sometimes|often|occasionally) (feel|want|need|wonder)/i,
  /^(most|many) (people|couples|relationships)/i,
  /\byou (value|want) (honesty|respect|love|connection|communication)\b/i,
  /\byou have a (need|desire) (for|to be)\b/i,
  /\beveryone (wants|needs|feels)\b/i,
  /\bdeep down,? you\b/i,
  /\bpart of you (wants|feels|knows)\b.*\band part of you\b/i,
];

/** Anchors that make a sentence about THIS person: a score, a quoted answer,
 *  or an explicit reference to something they said. */
const ANCHOR_PATTERNS: RegExp[] = [
  /\b\d{1,3}\s?(out of|\/)\s?\d{1,3}\b/,
  /\b\d{1,3}\b/,
  /[“"][^”"]{8,}[”"]/,
  /\byou (said|rated|answered|chose|marked|described|told)\b/i,
  /\byour own answers?\b/i,
];

export function looksGeneric(sentence: string): boolean {
  const anchored = ANCHOR_PATTERNS.some((p) => p.test(sentence));
  if (anchored) return false;
  return BARNUM_PATTERNS.some((p) => p.test(sentence.trim()));
}
