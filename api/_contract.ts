import { z } from 'zod'

/**
 * THE WIRE CONTRACT.
 *
 * This file lives in `api/` on purpose. Vercel transpiles functions in place without bundling
 * imports from `src/`, so a function that imports across directories deploys and then 500s with
 * MODULE_NOT_FOUND. Learned the hard way on a previous build. `src/` imports FROM here, so there
 * is still exactly one copy.
 *
 * This is also the privacy choke point. Anything not described below cannot leave the browser,
 * because the server rejects the request before it reaches a model. The schema is the allowlist:
 * `.strict()` everywhere means a field we did not think about is a 400, not a leak.
 */

/**
 * The ladder. Three models, in quality order, each with a GENUINELY independent token bucket.
 *
 * `groq/compound-mini` was on this list and has been removed. It looked like a fourth lane with a
 * 70,000 TPM bucket — but under load it returns 429 with the message "Rate limit reached for model
 * openai/gpt-oss-120b". It is an agentic wrapper that calls 120b underneath, so it shares rung 0's
 * bucket and double-drains it. Only a live run surfaced that; the headers on an idle key say the
 * opposite.
 */
export const MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
] as const

/**
 * Groq reserves `max_tokens` against the per-minute budget AT REQUEST TIME, not on completion.
 * So three concurrent sections asking for 3,000 each reserve 9,000 against an 8,000/min bucket and
 * every one of them 429s before a single word is generated. Sections are 4–6 paragraphs — roughly
 * 900 words, ~1,300 tokens — so this ceiling is generous and the old one was self-sabotage.
 */
export const MAX_OUTPUT_TOKENS = 1600

export type ModelId = (typeof MODELS)[number]

/** One openable receipt, exactly as the reader will see it. */
export const EvidenceZ = z
  .object({
    id: z.string().max(120),
    label: z.string().max(300),
    detail: z.string().max(4000),
    itemText: z.string().max(600).optional(),
  })
  .strict()

export const FindingZ = z
  .object({
    id: z.string().max(120),
    kind: z.string().max(40),
    statement: z.string().max(2500),
    notability: z.number().min(0).max(1),
    finnLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    evidence: z.array(EvidenceZ).max(12),
    citations: z.array(z.string().max(200)).max(12),
  })
  .strict()

export const DimensionZ = z
  .object({
    /** Doubles as the citable evidence id `ev:dim:<id>`, so a number in prose carries a receipt. */
    id: z.string().max(60),
    label: z.string().max(120),
    pomp: z.number().min(0).max(100),
    band: z.string().max(30),
    meaning: z.string().max(400),
  })
  .strict()

export const SectionRequestZ = z
  .object({
    id: z.string().max(60),
    title: z.string().max(200),
    intent: z.string().max(1200),
    words: z.number().int().min(80).max(1600),
  })
  .strict()

export const ContextZ = z
  .object({
    lens: z.enum(['self', 'relationship']),
    voice: z.enum(['solo', 'couple-a', 'couple-b']),
    stage: z.string().max(40),
    durationBucket: z.string().max(20).nullable(),
    familyInPlay: z.boolean(),
    ageBand: z.string().max(20).nullable(),
  })
  .strict()

export const AxesZ = z
  .object({
    quality: z.number().min(0).max(100),
    pull: z.number().min(0).max(100),
    hold: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    shape: z.string().max(40),
    shapeTitle: z.string().max(300),
    shapeLead: z.string().max(1500),
    safety: z
      .object({
        flagged: z.boolean(),
        physical: z.boolean(),
        coercive: z.boolean(),
        selfRisk: z.boolean(),
        perpetration: z.boolean(),
        elevated: z.boolean(),
      })
      .strict(),
  })
  .strict()

/**
 * A prescribed practice, for the plan section only.
 *
 * The engine chooses the intervention; the writer never does. But until this existed the writer
 * wrote "What to actually do, in order" without being told what had been chosen, and the reader
 * got model-invented advice sitting directly above the real staged plan — two different plans on
 * one page. The model gets the chosen practice and explains it in this person's words.
 */
export const PracticeZ = z
  .object({
    id: z.string().max(60),
    title: z.string().max(120),
    purpose: z.string().max(400),
    because: z.string().max(600),
    stage: z.enum(['now', 'week', 'month']),
    minutes: z.number().int().min(1).max(120),
    needsPartner: z.boolean(),
    firstTime: z.string().max(400),
    ifItGoesBadly: z.string().max(400),
    marker: z.string().max(300),
    evidenceIds: z.array(z.string().max(80)).max(6),
  })
  .strict()

export const WriteRequestZ = z
  .object({
    section: SectionRequestZ,
    context: ContextZ,
    axes: AxesZ,
    /** Only the findings this section is allowed to talk about. */
    findings: z.array(FindingZ).max(10),
    /** Verbatim things the person wrote, available for quoting. */
    quotes: z.array(EvidenceZ).max(14),
    /** The dimension table, so numbers in prose are never invented. */
    dimensions: z.array(DimensionZ).max(30),
    /** Headings already written, so the model does not repeat an earlier section. */
    alreadyCovered: z.array(z.string().max(200)).max(24),
    /** Claims the reader has explicitly rejected. The model must not re-assert them. */
    rejected: z.array(z.string().max(2500)).max(12),
    /** The staged plan, sent to the plan section only. The engine chose these, not the writer. */
    practices: z.array(PracticeZ).max(6).optional(),
    /** Deterministic; lets the server cache identical work. */
    fingerprint: z.string().max(32),
    /**
     * Which rung of the model ladder to START on. Groq's token buckets are PER MODEL (measured:
     * qwen sat at 7,370/8,000 while gpt-oss-120b was drained to 2,799), so a report that always
     * starts at rung 0 drains one bucket and 429s across the whole ladder. The client spreads
     * sections across rungs by index; failures still walk the ladder from wherever they began.
     */
    startRung: z.number().int().min(0).max(2).optional(),
  })
  .strict()

export type WriteRequest = z.infer<typeof WriteRequestZ>

export const ParagraphZ = z
  .object({
    text: z.string(),
    evidenceIds: z.array(z.string()),
  })
  .strict()

export const WriteResponseZ = z
  .object({
    paragraphs: z.array(ParagraphZ),
    model: z.string(),
    /** Present whenever the ladder fell past its first rung. Observable degradation (LAW 7). */
    degraded: z.string().nullable(),
  })
  .strict()

export type WriteResponse = z.infer<typeof WriteResponseZ>

/**
 * Phrases that mark the exact failure this product exists to prevent.
 *
 * Every one of these was produced by a frontier model on the first try when asked for a verdict
 * with no evidence attached — "walking on eggshells", "erodes your self-respect", "an act of
 * self-protection". They are true of nearly everyone, which is what makes them worthless.
 * Enforced server-side so that no prompt regression can quietly reintroduce them.
 */
export const BANNED_PHRASES = [
  'walking on eggshells',
  'red flag',
  'toxic relationship',
  'love yourself first',
  'you deserve better',
  'trust your gut',
  'at the end of the day',
  'it is important to remember',
  'it’s important to remember',
  "it's important to remember",
  'remember that you are not alone',
  'you are not alone',
  'journey of self-discovery',
  'self-love journey',
  'communication is key',
  'relationships take work',
  'growth mindset',
  'hold space',
  'honour your truth',
  'honor your truth',
  'authentic self',
  'inner child',
  'narcissist',
  'gaslighting you',
  'emotional labour is real',
  'set healthy boundaries',
  'take time for yourself',
  'practice self-care',
  'listen to your heart',
  'everything happens for a reason',
  'time heals',
  'in the grand scheme',
  'a rollercoaster',
  'delve into',
  'tapestry',
  'navigate the complexities',
  'it is worth noting',
  'ultimately, the choice is yours',
  'only you can decide',
  /* Meta-narration. The model narrating its own instructions back at the reader — every one of
     these appeared in a live run of the real prompt, which is the only way you find them. */
  'the lift is',
  'the quote shows',
  'the quote captures',
  'the quote reveals',
  'this quote',
  'putting the pieces together',
  'in summary',
  'to summarise',
  'to summarize',
  'the numbers say it plainly',
  'the evidence shows that you',
  'as mentioned above',
  'as noted earlier',
  'the research note',
  'the underlying driver is',
  'this section',
  'the evidence provided',
  /* Things a Western-trained product says that are wrong, useless, or harmful in India.
     Each one is a real failure mode, not a style preference:
       · "set boundaries with your parents" — defined against someone else's behaviour, so it
         cannot be acted on alone, and it names the family as the thing to be managed.
       · "it's your life, not theirs" — useless to somebody who will be at the same dinner table
         next week, and factually wrong about how the decision actually works for them.
       · "they'll come around" — a prediction, and one the evidence does not support.
       · "go no-contact" / "toxic family" — cutoff leaves the emotional intensity intact and is
         downstream of LOW differentiation, not high. It is the failure, not the cure.
     67% of Indians say preventing inter-religious marriage is very important (Pew, n=29,999).
     A reader's family is usually inside the majority. That is why this is hard — not because
     their family is unusual, and certainly not because it is a villain. */
  'set boundaries with your parents',
  'set boundaries with your family',
  "it's your life, not theirs",
  'it is your life, not theirs',
  'they will come around',
  "they'll come around",
  'go no-contact',
  'no contact with your family',
  'toxic family',
  'toxic parents',
  'your family is controlling',
  'your family is manipulative',
  'choose yourself',
  'you are an adult, you do not need permission',
  "you're an adult, you don't need permission",
  'just have an honest conversation',
  'love conquers all',
  'stand up to your parents',
] as const

/** Imperatives about the reader's own decision. Aaina names the pattern; it never issues orders. */
export const BANNED_IMPERATIVES = [
  /\byou (?:should|must|need to|have to) (?:leave|end it|break up|stay|marry|forgive|move on)\b/i,
  /\b(?:leave|dump|end) (?:him|her|them)\b/i,
  /\byou (?:will|are going to) (?:be fine|regret|fail|end up)\b/i,
  /\bthis (?:will|won't|will not) (?:last|work out|survive)\b/i,
  /\b\d{1,3}\s?% (?:chance|likely|probability)\b/i,
  /\bcompatib(?:le|ility) (?:score|percentage|match)\b/i,
]


export function violations(text: string): string[] {
  const out: string[] = []
  const lower = text.toLowerCase()
  for (const p of BANNED_PHRASES) if (lower.includes(p)) out.push(`banned phrase: "${p}"`)
  for (const r of BANNED_IMPERATIVES) {
    const m = text.match(r)
    if (m) out.push(`banned move: "${m[0]}"`)
  }
  return out
}
