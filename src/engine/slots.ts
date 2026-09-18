import type { HelpMode, Lens } from './types'

/**
 * THE REPORT SHAPES.
 *
 * A report is not one fixed document. Somebody who came because they cannot talk about money since
 * the baby arrived should not be handed a stay-or-leave verdict, and somebody deciding whether to
 * say yes to a rishta should not be handed a six-week repair plan. Giving repair work to a person
 * who is still deciding fails, and so does the reverse — that is the finding Doherty's discernment
 * counselling is built on, and it is the single most important structural fact about this product.
 *
 * So the skeleton is assembled per reader: a shared spine that everyone gets, plus the middle that
 * matches the help they actually asked for, plus sections that appear only when the evidence for
 * them exists.
 *
 * What is NOT here is a list of problems. The middle varies by the SHAPE of help, which is finite
 * and which therapists really do triage on. The problem itself arrives in the person's own words
 * and is worked on wherever it lands.
 */

export interface Slot {
  id: string
  title: string
  intent: string
  words: number
  wants: 'none' | 'strengths' | 'theme' | 'cycle' | 'deep' | 'hold' | 'exclusion' | 'exception' | 'future' | 'family' | 'aftermath' | 'assumption' | 'concern' | 'rest'
  minFindings?: number
}

/* ────────────────────────────  shared spine  ──────────────────────────── */

const OPENING: Slot[] = [
  {
    id: 'opening',
    title: 'What you came here with',
    intent:
      'Quote their own words back — the problem exactly as they described it — and name the question underneath it. Nothing else. No analysis, no reassurance, no preview. If they wrote a long account, show them you read all of it by picking out the detail a skimmer would miss, and name what they have already tried so they know it registered.',
    words: 420,
    wants: 'concern',
  },
  {
    id: 'basis',
    title: 'What this is built on',
    intent:
      'Name exactly what was measured, how many answers it rests on, and what it therefore can and cannot support. Credibility before claims.',
    words: 320,
    wants: 'none',
  },
  {
    id: 'working',
    title: 'What is working, and the evidence for it',
    intent:
      'Strengths first, always — but with receipts, so it is not a compliment. Name specific things that are holding, and show the answers that say so.',
    words: 700,
    wants: 'strengths',
    minFindings: 1,
  },
  {
    id: 'turn',
    title: 'Before the next part',
    intent: 'The warning shot. One short paragraph saying the harder section is coming and what kind of hard it is. Then stop.',
    words: 140,
    wants: 'none',
  },
]

/** Appears for everyone: the central insight, in their vocabulary. */
const THEME: Slot = {
  id: 'theme',
  title: 'The thing underneath',
  intent:
    'The single most notable finding, delivered as the report\'s central insight, in their vocabulary. This is the "aha". One idea, stated once, clearly, and connected explicitly to the problem they described in their own words.',
  words: 900,
  wants: 'theme',
  minFindings: 1,
}

const CYCLE: Slot = {
  id: 'cycle',
  title: 'How it actually plays out',
  intent:
    'Draw the loop with their quotes at each node: what starts it, what each person does, what that produces, how it comes round again. A pattern, never a person. If they described a specific recurring scene, use that scene.',
  words: 850,
  wants: 'cycle',
}

const WHY: Slot = {
  id: 'why',
  title: 'Why this makes sense',
  intent:
    'The DEEP formulation — differences, emotional sensitivities, external circumstances, patterns of interaction. The highest-value paragraph in the product: it makes the pattern understandable without making anyone the villain, including anyone\'s family.',
  words: 1000,
  wants: 'deep',
}

const NOT: Slot = {
  id: 'not',
  title: 'What this is not',
  intent:
    'Exclusion claims — what is demonstrably NOT the problem here, given their answers. Costly, falsifiable, and the strongest evidence of real discrimination. Name the explanation people around them have probably already offered, and rule it out.',
  words: 520,
  wants: 'exclusion',
  minFindings: 1,
}

const STANDING: Slot = {
  id: 'standing',
  title: 'Where this stands today',
  intent: 'The numbers, in plain language, with the bands. Present tense only. Never a forecast.',
  words: 620,
  wants: 'rest',
}

/**
 * The collision between what a person wants and what their family expects.
 *
 * This is evidence-gated, not a category: it appears when the answers show a real gap, whatever
 * the presenting problem was. In India most people are living somewhere between a modern life and
 * a traditional obligation, and that distance is itself one of the most common sources of
 * relationship difficulty — so it gets a section of its own rather than a line in someone else's.
 *
 * The hard constraint, and the reason the intent is written this carefully: never take a side
 * against anyone's family. Parents acting on tradition are almost always trying to do right by
 * their child. A product that makes them the villain is both wrong and useless, because the reader
 * still has to live with them.
 */
const FAMILY: Slot = {
  id: 'family',
  title: 'You, them, and everyone else in the room',
  intent:
    'Name the distance between what they want and what their family expects, using their own words for both sides. Hold two things at once: this person is entitled to their own life, AND the people pressuring them are almost certainly trying to protect them by the only logic they know. Do NOT cast the family as an antagonist, do not suggest cutting anyone off, and do not say "it is your life, not theirs" — that sentence is useless to somebody who will still be at the same dinner table next week. Separate being your own person from rejecting your people; those are different things and conflating them is what traps people here.',
  words: 950,
  wants: 'family',
}

/* ────────────────────────────  the middles  ──────────────────────────── */

const HOLDING: Slot = {
  id: 'holding',
  title: 'What is holding you here',
  intent:
    'Separate what draws them from what keeps them. Name constraint, alternatives, family and the beliefs about loyalty and villainy without editorialising.',
  words: 900,
  wants: 'hold',
}

const PATHS: Slot = {
  id: 'paths',
  title: 'Three ways this can go',
  intent: 'Each path with its real cost, stated flatly. Options before any recommendation — never instead of one.',
  words: 950,
  wants: 'none',
}

const READ: Slot = {
  id: 'read',
  title: 'My read',
  intent:
    'The named recommendation: directive about the formulation, non-directive about stay-or-leave. Return the decision explicitly. Never an imperative about their choice.',
  words: 700,
  wants: 'none',
}

const MECHANISM: Slot = {
  id: 'mechanism',
  title: 'What is actually breaking',
  intent:
    'For a repair: name the specific mechanism, not the symptom. "You fight about money" is a symptom; "one of you raises it when already depleted and the other hears an accusation" is a mechanism. Mechanisms can be intervened on; symptoms cannot. Use their described scene.',
  words: 850,
  wants: 'deep',
}

const PRESSURE: Slot = {
  id: 'pressure',
  title: 'What you are actually carrying',
  intent:
    'For a couple under external strain: separate the load from the relationship. Name what is genuinely being done TO them — money, distance, a baby, illness, work, family obligation — and distinguish it from what is going wrong BETWEEN them. Couples under load routinely misread stress as incompatibility; say so if the evidence supports it.',
  words: 850,
  wants: 'deep',
}

const AFTERMATH: Slot = {
  id: 'aftermath',
  title: 'Where you actually are',
  intent:
    'For someone recovering: no decision is pending, so do not offer one, and do not write about the relationship in the present tense. Describe the shape of where they are — what is still open, what they are still arguing with, what they have already survived and not credited themselves for. The findings you are given are written in the past tense on purpose; keep them there.',
  words: 850,
  wants: 'aftermath',
}

/* ────────────────────────────  shared close  ──────────────────────────── */

const PLAN: Slot = {
  id: 'plan',
  title: 'What to actually do, in order',
  intent:
    'A sequenced plan, not a list of tips. First thing this week, then the next, then what only becomes possible after those. Each step in if-then form, specified precisely enough to execute without further thought, and tied to a named finding. Say what to do if a step goes badly, because the first attempt usually does.',
  words: 1000,
  wants: 'rest',
}

const MARKERS: Slot = {
  id: 'markers',
  title: 'How you will know',
  intent:
    'Falsifiable, time-boxed markers. What would have to be observably different in six weeks for this reading to be right, and what would show it wrong. Behaviour, not feelings.',
  words: 480,
  wants: 'none',
}

const LIMITS: Slot = {
  id: 'limits',
  title: 'What this cannot tell you',
  intent: 'The honest limits, stated plainly and without hedging the rest of the report.',
  words: 380,
  wants: 'none',
}

/** The middle of the report, by what they asked for. Ordered; duplicates removed downstream. */
const MIDDLE: Record<HelpMode, Slot[]> = {
  understand: [THEME, CYCLE, WHY, NOT, STANDING],
  decide: [THEME, CYCLE, WHY, HOLDING, NOT, STANDING, PATHS, READ],
  repair: [THEME, MECHANISM, CYCLE, WHY, NOT, STANDING],
  endure: [THEME, PRESSURE, CYCLE, WHY, STANDING],
  recover: [AFTERMATH, THEME, WHY, NOT, STANDING],
}

/**
 * The one true order of the middle of a report, regardless of which help modes produced it.
 *
 * Argument before evidence, mechanism before numbers, numbers before options. Anything not named
 * here sorts to the end, which is the safe direction for a slot added later.
 */
const CANONICAL = [
  'theme', 'pressure', 'aftermath', 'mechanism', 'cycle', 'why', 'family', 'not', 'holding',
  'standing', 'paths', 'read',
]
const canonical = (id: string) => {
  const i = CANONICAL.indexOf(id)
  return i < 0 ? CANONICAL.length : i
}

export function slotsFor(lens: Lens, help: HelpMode[], familyGap: boolean): Slot[] {
  if (lens === 'self') return SELF_SLOTS

  // Never trust the shape of persisted state: an old store, a hand-edited link, a bad migration.
  const modes = Array.isArray(help) && help.length ? help : (['understand'] as HelpMode[])
  const middle: Slot[] = []
  const seen = new Set<string>()
  for (const m of modes) {
    for (const s of MIDDLE[m]) {
      if (seen.has(s.id)) continue
      seen.add(s.id)
      middle.push(s)
    }
  }

  /* Somebody who asks for two kinds of help gets the union of two lists, and concatenating them
     puts the second mode's unique sections after the first mode's closing ones. Vikram, who asked
     to understand AND to repair, was shown "What is actually breaking" after his numbers had
     already been read out. A report has one order regardless of how many doors were ticked. */
  middle.sort((a, b) => canonical(a.id) - canonical(b.id))

  // The family section is earned by the evidence, not by the kind of problem they picked.
  // Its position comes from CANONICAL like everything else, so it is simply appended and sorted.
  if (familyGap && !seen.has('family')) {
    middle.push(FAMILY)
    middle.sort((a, b) => canonical(a.id) - canonical(b.id))
  }

  const close: Slot[] = [PLAN, MARKERS, LIMITS]
  // Anyone who asked to decide gets the decision returned to them explicitly, last.
  if (modes.includes('decide') && !seen.has('read')) close.unshift(READ)

  return [...OPENING, ...middle, ...close]
}

/* ────────────────────────────  the self lens  ──────────────────────────── */

const SELF_SLOTS: Slot[] = [
  { id: 'opening', title: 'What you came here with', intent: 'Their own words back, and the question underneath the question. If they said what they have already tried, name it — it rules things out and it proves you read it.', words: 380, wants: 'concern' },
  { id: 'basis', title: 'What this is built on', intent: 'What was measured and what that supports. No claims yet.', words: 320, wants: 'none' },
  { id: 'ground', title: 'What you stand on', intent: 'Their values in their own words, including the time acting on one cost them something. The foundation of everything after.', words: 700, wants: 'strengths', minFindings: 1 },
  { id: 'working', title: 'What is already strong', intent: 'Strengths with receipts. Specific, evidenced, not reassurance.', words: 620, wants: 'strengths', minFindings: 1 },
  { id: 'turn', title: 'Before the next part', intent: 'The warning shot. One paragraph, then stop.', words: 140, wants: 'none' },
  { id: 'pattern', title: 'The pattern', intent: 'The central finding as the "aha", in their vocabulary. Externalise it — a pattern they run, never a thing they are.', words: 950, wants: 'theme', minFindings: 1 },
  { id: 'belief', title: 'The belief underneath it', intent: "The core belief the pattern protects. Kegan's competing commitment: the pattern is doing a job. Name the job.", words: 900, wants: 'deep' },
  { id: 'exception', title: 'Where it does not hold', intent: 'The unique outcome — a place in their own answers where the pattern did NOT run. Never present a pattern without its exception. Be curious about what was different there rather than prescriptive; the reader knows and you do not.', words: 600, wants: 'exception', minFindings: 1 },
  { id: 'not', title: 'What you are not', intent: 'Exclusion claims from their own profile. What would be true of most people but is demonstrably not true of them.', words: 520, wants: 'exclusion', minFindings: 1 },
  { id: 'standing', title: 'Your profile, read out', intent: 'The dimensions in plain language, with what stands out within their own shape rather than against anyone else.', words: 700, wants: 'rest' },
  { id: 'future', title: 'The person you described', intent: 'Their future self in their own words, and the specific, named distance between here and there.', words: 850, wants: 'future' },
  { id: 'assumption', title: 'The one assumption worth testing', intent: 'The Big Assumption the engine identified, and the one small experiment that would test it — both are given to you in the findings. Your job is to make the experiment feel doable rather than brave, and to say plainly what a result either way would mean. One assumption, one test. Never a list, never a second suggestion.', words: 700, wants: 'assumption', minFindings: 1 },
  { id: 'plan', title: 'What to actually do, in order', intent: 'A sequenced plan in if-then form, each step tied to a finding, with what to do when a step goes badly.', words: 800, wants: 'rest' },
  { id: 'limits', title: 'What this cannot tell you', intent: 'Honest limits.', words: 360, wants: 'none' },
]
