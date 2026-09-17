/**
 * The type spine of Aaina.
 *
 * LAW 2 — Specificity is an input, never an output. Everything a sentence is allowed to say
 * about a person exists here first, computed deterministically, with an id. The writer chooses
 * diction; it never chooses facts.
 */

/* ────────────────────────────────  MODE & CONTEXT  ──────────────────────────────── */

/** Which door the user came through. One engine, two lenses. */
export type Lens = 'self' | 'relationship'

/** Who is answering. Solo is first-class: partner reports add only 0–3.5% (Joel 2020). */
export type Voice = 'solo' | 'couple-a' | 'couple-b'

/** The shape of the situation. Drives item gating, never the verdict. */
export type Stage =
  | 'talking'        // the talking stage / situationship
  | 'one-sided'      // one-sided love, unreciprocated
  | 'dating'
  | 'long-distance'
  | 'arranged-considering' // met once or twice, a yes/no is being asked of them
  | 'engaged'
  | 'married'
  | 'separated'
  | 'divorced'
  | 'ended'          // post-breakup, processing

/**
 * WHAT KIND OF HELP THEY CAME FOR — not what kind of problem they have.
 *
 * This is deliberately NOT a taxonomy of problems. Aaina has to take on the unbounded set of real
 * relationship difficulties — communication, a rough patch, money, a new baby, in-laws, where to
 * live, one-sided love, an arranged match, a divorce — and a fixed list of problems would fail the
 * first person whose situation is not on it.
 *
 * What IS finite, and what therapists actually triage on in a first session, is the SHAPE of the
 * help being asked for. Doherty's discernment work is built on exactly this distinction: giving
 * repair work to someone who is still deciding fails, and so does the reverse. Five shapes cover
 * it, any problem maps onto one or more, and the person chooses — we only suggest.
 */
export type HelpMode =
  /** "I want to understand what is actually going on." No decision pending, no fix requested yet. */
  | 'understand'
  /** A decision is live: stay or go, say yes to this rishta, move in, marry against family. */
  | 'decide'
  /** They are staying. Something specific is broken and they want it working. */
  | 'repair'
  /** The pressure is real and not going away soon — money, distance, illness, a baby, in-laws.
   *  The ask is not "fix us", it is "how do we carry this without it breaking us". */
  | 'endure'
  /** It is over or ending. The ask is how to get through it. */
  | 'recover'

export const HELP_MODES: { id: HelpMode; label: string; gloss: string }[] = [
  { id: 'understand', label: 'I want to understand what is going on', gloss: 'Something is off and you cannot name it yet. No decision needed today.' },
  { id: 'decide', label: 'There is a decision I have to make', gloss: 'Stay or go, say yes or no, move in, marry, hold on or let go.' },
  { id: 'repair', label: 'I want to fix something between us', gloss: 'You are in this. Something specific keeps going wrong and you want it working.' },
  { id: 'endure', label: 'We are carrying something hard right now', gloss: 'Money, distance, family, a new baby, illness, work. The pressure is real and not leaving soon.' },
  { id: 'recover', label: 'It has ended, or it is ending', gloss: 'You are not deciding any more. You are getting through it.' },
]

export interface Context {
  lens: Lens
  voice: Voice
  stage: Stage
  /** What kind of help they asked for. They choose; we only suggest a default from their stage. */
  help: HelpMode[]
  /** Years together, bucketed. Null when not applicable (one-sided, arranged-considering). */
  durationBucket: '<6m' | '6m-2y' | '2-5y' | '5-10y' | '10y+' | null
  /** Whether family approval is live in this situation at all. */
  familyInPlay: boolean
  /** Self-described, free text, optional. Used verbatim; never parsed for facts. */
  ageBand: '18-21' | '22-25' | '26-30' | '31-40' | '40+' | null
}

/* ────────────────────────────────  ITEMS  ──────────────────────────────── */

export type Licence =
  | 'public-domain'
  | 'free-with-citation'
  | 'aaina-authored' // we wrote it against a published construct; disclosed as such

export type ItemFormat = 'likert5' | 'likert7' | 'binary' | 'freetext' | 'choice' | 'allocate' | 'predict'

export interface Item {
  id: string
  /** The exact words the user reads. */
  text: string
  format: ItemFormat
  /** Which scored dimension this feeds. Null for context/free-text items. */
  dimension: DimensionId | null
  /** true when a high answer means LOW on the dimension. The ONLY source of direction. */
  reverse: boolean
  /** Citation keys into sources.ts. Never empty. */
  sources: string[]
  licence: Licence
  /** Chapter this item lives in. */
  chapter: ChapterId
  /** Only shown when this predicate passes. */
  showWhen?: (ctx: Context) => boolean
  /** For 'choice' / 'allocate' items. */
  options?: { value: string; label: string }[]
  /** For 'predict' items: the partner-facing item whose answer is being predicted. */
  predicts?: string
  /** Placeholder for free-text. */
  placeholder?: string
  /** Marks an item whose answers are radioactive: memory-only, never persisted or shared. */
  safety?: true
}

/* ────────────────────────────────  ANSWERS & TELEMETRY  ──────────────────────────────── */

export interface Answer {
  itemId: string
  value: number | string
  /** How many times the user changed this answer. Process telemetry = unfakeable evidence. */
  revisions: number
  /** Milliseconds the item was on screen before first commit. */
  dwellMs: number
  /** Position in the order the user actually answered, not the order we presented. */
  order: number
}

export type AnswerMap = Record<string, Answer>

export interface AssessmentInput {
  context: Context
  answers: AnswerMap
  /** Memory-only. Never persisted, never in a share link. */
  safetyAnswers: AnswerMap
  /** Present only in couple mode once the second person has answered. */
  partnerAnswers?: AnswerMap
  startedAt: number
  finishedAt: number
  /** Item ids the user deliberately skipped. */
  skipped: string[]
}

/* ────────────────────────────────  DIMENSIONS  ──────────────────────────────── */

export type DimensionId =
  // relationship lens
  | 'satisfaction' | 'partnerCommitment' | 'ownDedication' | 'appreciation'
  | 'responsiveness' | 'conflict' | 'trust' | 'ambivalence'
  | 'constraint' | 'alternatives' | 'familyApproval' | 'growth'
  | 'closeness' | 'sexualSatisfaction'
  // shared spine — used by BOTH lenses
  | 'attachAnxiety' | 'attachAvoidance' | 'emotionRegulation' | 'lifeSatisfaction'
  // self lens
  | 'selfConceptClarity' | 'selfCompassion' | 'coreBeliefSelf' | 'coreBeliefOther'
  | 'rumination' | 'valuesLived' | 'futureSelfContinuity' | 'autonomy'
  | 'competence' | 'relatedness' | 'agency'

export interface Dimension {
  id: DimensionId
  /** Shown to the user. Plain, not jargon. */
  label: string
  /** One line the user can read to know what was measured. */
  meaning: string
  lens: Lens | 'both'
  sources: string[]
  /**
   * Weight in the overall composite, derived from PUBLISHED effect sizes
   * (Joel 2020 success rate × Le 2010 |d|) — never hand-tuned. 0 = not in the composite.
   */
  compositeWeight: number
  /** A published interpretive cutoff, when one exists. POMP units 0–100. */
  cutoff?: { at: number; meaning: string; source: string }
  /** Higher is better for the relationship/person? Some dimensions invert by nature. */
  higherIsBetter: boolean
}

export type Band = 'very-low' | 'low' | 'mixed' | 'high' | 'very-high'

export interface Scored {
  id: DimensionId
  /** Percentage of Maximum Possible (Cohen et al. 1999). Literally: how far up the scale. */
  pomp: number
  band: Band
  /** Item ids that produced this, with their raw answers — the receipts. */
  itemIds: string[]
  /** How many items actually answered. Below 3 → the dimension is reported but not composited. */
  answered: number
  /** Present only when the user skipped enough that we should say so. */
  thin: boolean
  /** Partner's POMP on the same dimension, couple mode only. */
  partnerPomp?: number
}

/* ────────────────────────────────  FINDINGS — the notable facts  ──────────────────────────────── */

export type FindingKind =
  | 'contradiction'   // two of the user's own answers collide
  | 'extreme'         // an unusually high or low dimension, within their own profile
  | 'gap'             // the largest distance anywhere in their profile (ipsative rarity)
  | 'telemetry'       // how they answered, not what
  | 'quote'           // something they wrote, verbatim
  | 'predictionGap'   // what they predicted their partner would say vs what matters
  | 'configural'      // an uncommon COMBINATION of two dimensions
  | 'cutoff'          // crossed a published interpretive threshold
  | 'exclusion'       // what is demonstrably NOT true of them
  | 'partnerGap'      // couple mode: the two people disagree

/**
 * Finn's levels of feedback (Therapeutic Assessment). L1 confirms what they already believe,
 * L2 amplifies/reframes, L3 is genuinely discrepant with their self-story.
 * L1 content is capped at 30% of word count — L1 findings are the most transplantable.
 */
export type FinnLevel = 1 | 2 | 3

export interface Finding {
  id: string
  kind: FindingKind
  /** One deterministic sentence stating the fact. This is the FALLBACK PROSE if the writer fails. */
  statement: string
  /** 0–1. How rare/notable within this person's own profile. Drives section planning. */
  notability: number
  /** Estimated proportion of people this would also be true of. Lower = more informative. */
  baseRate: number
  finnLevel: FinnLevel
  /** Everything a sentence about this finding is allowed to cite. */
  evidence: Evidence[]
  /** Citation keys into sources.ts. */
  sources: string[]
  /** Dimensions involved, for cross-referencing and for the receipts drawer. */
  dimensions: DimensionId[]
  /** Set false by a user's ✗ reaction. A rejected finding stops holding anything up. */
  accepted: boolean
}

export type EvidenceKind = 'item' | 'dimension' | 'quote' | 'telemetry' | 'context' | 'partner'

/** The atomic receipt. Everything the user can open. */
export interface Evidence {
  id: string
  kind: EvidenceKind
  /** What we measured / what they did. */
  label: string
  /** The user's own answer, rendered for reading. "You chose: Often" / verbatim text. */
  detail: string
  /** The item's exact wording, when kind === 'item'. */
  itemText?: string
  sources: string[]
}

/* ────────────────────────────────  THE FOUR AXES  ──────────────────────────────── */

/**
 * LAW 6 — four orthogonal axes. Safety NEVER moves Quality.
 * "This should end" is reachable only when HOLD, not QUALITY, explains the staying.
 * This is the founder's own story, made computable.
 */
export interface FourAxes {
  /** Evidence-weighted composite of the quality dimensions. POMP units. */
  quality: number
  /** What is drawing them toward this person: love, appreciation, responsiveness, growth. */
  pull: number
  /** What is keeping them in place regardless of quality: investment, lack of alternatives,
   *  family/social cost, guilt, the belief that leaving is betrayal. */
  hold: number
  /** Separate axis. Never composited. Opens a chapter; never moves a number. */
  safety: SafetyRead
  /** How much of the composite rests on answered (vs skipped/thin) dimensions. 0–1. */
  confidence: number
  /** The dominant reading, computed. Never a prediction. */
  shape: VerdictShape
}

export type VerdictShape =
  | 'working'              // quality high, hold low — it is held by wanting, not by cost
  | 'strained-repairable'  // quality mixed, specific named dimensions are the drag
  | 'held-by-cost'         // quality low, hold high — the founder's case
  | 'not-between-you'      // the drag is family/external, not the dyad
  | 'one-sided'            // the other person is not in this
  | 'ending'               // already over in substance
  | 'too-early'            // arranged-considering / talking stage — not enough has happened
  | 'unclear'              // genuinely insufficient evidence. We say so. We never bluff.

export interface SafetyRead {
  /** Any affirmative safety item. Opens depth; never closes anything. */
  flagged: boolean
  /** Physical violence disclosed. */
  physical: boolean
  /** Coercive control pattern (Stark: a liberty crime, not an injury crime). */
  coercive: boolean
  /** Self-directed risk disclosed. */
  selfRisk: boolean
  /** User discloses their OWN use of violence. Served, never colluded with. */
  perpetration: boolean
  /** High-danger pattern per the India-adapted Danger Assessment items. */
  elevated: boolean
  evidence: Evidence[]
}

/* ────────────────────────────────  THE PLAN & THE PACKET  ──────────────────────────────── */

export type ChapterId =
  | 'jhalak'       // the 2-minute entrance that pays out before asking for more
  | 'concern'      // what they actually came with, in their own words
  | 'ground'       // values first, non-skippable (Steele; Cohen & Sherman)
  | 'story'        // context + free text
  | 'you'          // the shared individual spine
  | 'between'      // the dyad
  | 'holding'      // constraint, alternatives, family
  | 'patterns'     // self-lens deep chapter
  | 'future'       // future self / what changes
  | 'safety'       // universal, ambient, never triggered

export interface SectionPlan {
  id: string
  /** Heading the user sees. */
  title: string
  /** What this section must do, in the report's argument. */
  intent: string
  /** The findings this section is allowed to talk about. Each finding anchors exactly one section. */
  findingIds: string[]
  /** Target word count. Long-form is the deliverable; repetition is the failure mode. */
  words: number
  /** Order in the report. */
  index: number
  /** Which lens this belongs to. */
  lens: Lens
}

/** The ONLY thing renderers, prompts and tests may read. */
export interface EvidencePacket {
  version: string
  context: Context
  dimensions: Scored[]
  findings: Finding[]
  axes: FourAxes
  plan: SectionPlan[]
  /** Verbatim things the user wrote, with ids. Used for quote-anchoring. */
  quotes: Evidence[]
  /** Honest statements of what this assessment cannot support. Rendered, never hidden. */
  limits: string[]
  /**
   * The staged plan: named, published interventions selected for THIS person and filtered against
   * their safety disclosures. Chosen deterministically — the writer explains the chosen practice
   * in their situation and never invents one.
   */
  practices: SelectedPractice[]
  /** Deterministic hash of the input. Same input → same packet → cacheable prose. */
  fingerprint: string
}

/* ────────────────────────────────  REPORT STATE  ──────────────────────────────── */

export type SectionStatus = 'pending' | 'writing' | 'written' | 'deterministic' | 'failed'

export interface Paragraph {
  id: string
  text: string
  /** LAW 1 — non-optional. Validated against the live packet at render time. */
  evidenceIds: string[]
  /** The finding this paragraph is anchored to. */
  findingId: string | null
}

export interface ReportSection {
  id: string
  title: string
  status: SectionStatus
  paragraphs: Paragraph[]
  /** Which model actually wrote it. Shown in the receipts drawer — observable degradation. */
  writtenBy?: string
  /** Why it fell back, when it did. Never silent. */
  fallbackReason?: string
}

export type Reaction = 'yes' | 'no' | null

/** A practice chosen for this person, with the reason it was chosen attached. */
export interface SelectedPractice {
  practiceId: string
  /** Why this one, for this person, in one sentence built from their own data. */
  because: string
  /** The finding it answers, so the plan is anchored to the analysis rather than bolted on. */
  findingId: string | null
  evidenceIds: string[]
}
