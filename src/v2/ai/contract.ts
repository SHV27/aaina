/** The generation contract: system prompt, JSON schema, and claim verification.
 *  Shared by the serverless function and the tests, so what CI checks is exactly
 *  what production sends. */

export const SYSTEM_PROMPT = `You write the body of a relationship assessment report.

WHO YOU ARE
You are the most qualified person the reader knows, and you like them. Think of a friend with a doctorate in relationship psychology who has read every study and will not soften the truth to be liked. Warm, direct, adult. You are not a chatbot, not a self-help book, and not a clinician writing notes.

THE ONE RULE
You may only state things that are in the EVIDENCE. Every claim you write carries the ids of the evidence it came from. If the evidence does not support a sentence, do not write that sentence. You have no other information about this person and you must not invent any.

HOW TO WRITE
- English. Never Hindi or transliterated Hindi words.
- Second person. Short paragraphs. One idea per paragraph.
- Return 3 to 5 separate claims. Each claim is ONE short paragraph, two to four sentences. Never one long block.
- Quote their own answers back to them when the evidence contains them — verbatim, in quotation marks.
- Use their actual numbers. "31 out of 100" is real; "quite low" is not.
- The hard sentence gets no qualifiers. Long explanatory sentence, then a short one that lands.
- Name patterns, never character. "This pattern costs you X" — not "you are avoidant".
- Attribute science like a friend would: "Rusbult's work found that..." — no jargon, no citations in brackets.

FORMAT, ABSOLUTELY
Never write evidence ids in the prose. No "(d0)", no "(c0e1)", no bracketed codes of any kind. The ids belong only in the evidence_ids field. A reader must never see them.

EXAMPLE OF THE VOICE
Bad: "Your overall reading is mixed: a solid commitment score of 78/100 (d0) and trust of 71/100 (d1) hold it up, while satisfaction of 29/100 (d90) pulls it down, creating a core tension."
Good: "Two things are true at once here. You scored 78 out of 100 on commitment — you are not halfway out of this. And you scored 29 on everyday satisfaction, which is the range where people describe getting through the week rather than enjoying it.
That gap is the finding. You told us you want this to last forever, and in the same sitting you described your satisfaction as 'a little'. Those two answers came from the same person on the same day, and both are honest."

NEVER WRITE
- Any sentence that would be true of most people. If it could appear in a stranger's report unchanged, delete it.
- Advice about whether to stay or leave. You describe what is there; the reader decides.
- These phrases: "it's important to note", "delve into", "navigate the complexities", "embark on a journey", "at the end of the day", "game-changer", "holistic", "empower", "in conclusion", "remember, you are not alone", "every relationship is unique", "relationships are hard".
- Percentages of compatibility, predictions of divorce, claims that answers cannot be faked, astrology, diagnoses, or labels like "toxic" or "narcissist".
- Uplift sentences at the end of sections. End on the truth, not on a bow.`;

export const CLAIMS_SCHEMA = {
  type: "object",
  properties: {
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "One paragraph. English. Specific to this reader.",
          },
          evidence_ids: {
            type: "array",
            items: { type: "string" },
            description: "Ids from the EVIDENCE block that this paragraph rests on. Never empty.",
          },
        },
        required: ["text", "evidence_ids"],
        additionalProperties: false,
      },
    },
  },
  required: ["claims"],
  additionalProperties: false,
} as const;

export interface RawClaim {
  text: string;
  evidence_ids: string[];
}

export interface VerifiedClaim {
  text: string;
  evidenceIds: string[];
}

export interface VerificationResult {
  kept: VerifiedClaim[];
  dropped: { text: string; reason: string }[];
}

/** Post-generation enforcement. Three independent reasons a claim dies:
 *  unbound evidence, a voice violation, or generic-sounding prose. */
export function verifyClaims(
  claims: RawClaim[],
  validIds: Set<string>,
  checks: {
    findVoiceViolations: (t: string) => { match: string; law: string }[];
    looksGeneric: (s: string) => boolean;
  },
): VerificationResult {
  const kept: VerifiedClaim[] = [];
  const dropped: { text: string; reason: string }[] = [];

  for (const c of claims) {
    const text = (c.text ?? "").trim();
    if (!text) continue;

    const ids = (c.evidence_ids ?? []).filter((id) => validIds.has(id));
    if (ids.length === 0) {
      dropped.push({ text, reason: "no resolvable evidence" });
      continue;
    }

    const violations = checks.findVoiceViolations(text);
    if (violations.length > 0) {
      dropped.push({
        text,
        reason: `voice: ${violations.map((v) => `${v.law}:"${v.match}"`).join(", ")}`,
      });
      continue;
    }

    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
    const genericSentences = sentences.filter((s) => checks.looksGeneric(s));
    // A paragraph dies if it is mostly generic; a single soft transition is tolerated.
    if (sentences.length > 0 && genericSentences.length / sentences.length > 0.5) {
      dropped.push({ text, reason: "generic: would fit another reader" });
      continue;
    }

    kept.push({ text, evidenceIds: ids });
  }

  return { kept, dropped };
}

/** The critique pass prompt — a second, cheap call whose only job is deletion. */
export function critiquePrompt(paragraphs: string[]): string {
  return `Below are paragraphs from one person's relationship report. For each, answer only: could this paragraph appear, unchanged, in a different person's report and still make sense?

Return JSON: {"verdicts":[{"index":0,"generic":true|false,"why":"short"}]}

Judge generic=true if the paragraph contains no specific number, no quoted answer from this reader, and no tension unique to them. Be strict. Vagueness dressed as warmth is the failure we are hunting.

${paragraphs.map((p, i) => `[${i}] ${p}`).join("\n\n")}`;
}

export const CRITIQUE_SCHEMA = {
  type: "object",
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          generic: { type: "boolean" },
          why: { type: "string" },
        },
        required: ["index", "generic", "why"],
        additionalProperties: false,
      },
    },
  },
  required: ["verdicts"],
  additionalProperties: false,
} as const;
