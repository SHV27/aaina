import type { AnswerMap, Finding, Evidence, Scored, DimensionId } from './types'
import { DIM_BY_ID } from './dimensions'
import { ITEM_BY_ID } from '../items'
import { itemPomp } from './score'
import { dimensionEvidence, itemEvidence, renderAnswer } from './contradictions'

/**
 * THE SELF LENS'S OWN ENGINE.
 *
 * The relationship half earns its keep by holding two answers against each other. The self half
 * has a different job — the one a genuinely good self-knowledge workshop does — and it needs three
 * things the contradiction engine does not produce:
 *
 *   1. **The competing commitment and its Big Assumption** (Kegan & Lahey 2009). A person stuck on
 *      something is rarely lacking willpower; they are usually succeeding at a second, hidden
 *      commitment that the stuckness protects. Naming the job the pattern does is the move that
 *      makes a workshop feel like a workshop instead of a diagnosis.
 *   2. **The unique outcome** (White & Epston 1990). Every problem story contains moments the
 *      problem did not govern. Stating a pattern without one is how you leave somebody feeling
 *      accurately described and completely stuck — which is the specific failure this product
 *      cannot afford.
 *   3. **The measured distance to the person they described.** They wrote a Tuesday ten years out
 *      and named the hardest thing that person has. That is only useful next to what we measured.
 *
 * LAW 2 is the reason this file exists rather than three paragraphs of prompt. The engine decides
 * what is notable; the writer only chooses diction. A Big Assumption invented by a language model
 * from a profile summary is exactly the generic, transplantable output the whole product is built
 * to make impossible.
 */

let seq = 0
const fid = (kind: string) => `f:${kind}:${(seq += 1)}`
export function resetSelfWorkIds() { seq = 0 }

const q = (answers: AnswerMap, id: string): string => {
  const v = answers[id]?.value
  return typeof v === 'string' ? v.trim() : ''
}

const p = (answers: AnswerMap, id: string): number | null => {
  const v = answers[id]?.value
  return typeof v === 'number' ? Math.round(itemPomp(id, v)) : null
}

/** A quote clipped to a readable span without ever cutting inside a word. */
const CLIP = 190
function span(text: string, max = CLIP): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, t.lastIndexOf(' ', max) > 0 ? t.lastIndexOf(' ', max) : max) + '…'
}

function quoteEvidence(answers: AnswerMap, id: string, label: string, sources: string[]): Evidence | null {
  const text = q(answers, id)
  if (text.length < 12) return null
  return { id: `ev:quote:${id}`, kind: 'quote', label, detail: `"${span(text)}"`, sources }
}

/* ══════════════════════════════════════════════════════════════════════════
   1 · THE IMMUNITY MAP — competing commitment and Big Assumption, computed.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Each rule is a hidden commitment we can actually evidence, keyed on the items that betray it.
 *
 * `trigger` is the item whose endorsement puts the commitment in play, and the whole finding is
 * suppressed unless that specific answer exists — so nobody is handed somebody else's immunity.
 * `assumption` is written as a falsifiable sentence, because an untestable Big Assumption is just
 * an accusation, and `test` is the smallest action that would produce evidence against it inside a
 * week. Small on purpose: the assumption has usually never been tested precisely because testing
 * it looks catastrophic from the inside.
 */
interface Immunity {
  id: string
  trigger: string
  /** POMP at or below this on the trigger item means the belief is endorsed (items are reversed). */
  at: number
  support?: DimensionId
  /** What the pattern is getting done. Never framed as a flaw. */
  commitment: string
  /** The belief the commitment rests on, stated so it could turn out to be false. */
  assumption: string
  /** The smallest thing that would produce real evidence, this week. */
  test: string
  dims: DimensionId[]
  sources: string[]
}

const IMMUNITIES: Immunity[] = [
  {
    id: 'earn',
    trigger: 'cbs_2',
    at: 40,
    support: 'coreBeliefSelf',
    commitment:
      'staying useful — being the one who is needed, who handles it, who does not ask for much',
    assumption:
      'that being loved is conditional on what you provide, and that if you stopped providing it you would find out you were only ever tolerated',
    test:
      'ask one person close to you for something small and genuinely inconvenient — a lift, an hour, help with something you could technically manage alone — and do not offer anything in return, and do not explain why you need it',
    dims: ['coreBeliefSelf'],
    sources: ['kegan2009', 'ryan2000'],
  },
  {
    id: 'unseen',
    trigger: 'cbs_3',
    at: 40,
    support: 'coreBeliefSelf',
    commitment:
      'managing what people get to see of you — keeping the version of you in the room a curated one',
    assumption:
      'that the parts you keep back are the disqualifying parts, and that the closeness you have would not survive contact with them',
    test:
      'tell one person one true thing you would normally edit out. Not the worst thing — the smallest thing you have been editing. Then watch what they actually do, rather than what you expected them to do',
    dims: ['coreBeliefSelf'],
    sources: ['kegan2009', 'reis2004'],
  },
  {
    id: 'last',
    trigger: 'cbs_5',
    at: 40,
    support: 'autonomy',
    commitment:
      'being someone nobody has to worry about — the reliable one, whose needs never become a problem for the room',
    assumption:
      'that your needs and the needs of the people you love are in competition, so meeting yours is taken from them',
    test:
      'say one plain no this week to something small that you would normally absorb. No justification, no substitute offered. One sentence',
    dims: ['coreBeliefSelf', 'autonomy'],
    sources: ['kegan2009', 'ryan2000', 'yeh2003'],
  },
  {
    id: 'designed',
    trigger: 'aut_2',
    at: 40,
    support: 'autonomy',
    commitment:
      'keeping the peace with the people whose plan you are living — not making them choose between being proud of you and being right about you',
    assumption:
      'that wanting a different life is the same thing as rejecting the people who wanted this one for you, and that they would experience it that way',
    test:
      'name one small piece of the life you actually want out loud to one person in the family, as information rather than as a request for permission. Not the biggest piece. One',
    dims: ['autonomy'],
    sources: ['kegan2009', 'bowen1978', 'yeh2003'],
  },
  {
    id: 'alone',
    trigger: 'avo_2',
    at: 40,
    support: 'attachAvoidance',
    commitment:
      'never being in a position where somebody could let you down — handling it alone means it cannot be dropped',
    assumption:
      'that depending on someone is how you end up disappointed, so self-sufficiency is not a preference but a defence',
    test:
      'let one person help with one thing this week, at their pace rather than yours, and do not take it back halfway through when they do it differently from how you would have',
    dims: ['attachAvoidance'],
    sources: ['kegan2009', 'wei2007'],
  },
  {
    id: 'vigilance',
    trigger: 'rum_3',
    at: 35,
    support: 'rumination',
    commitment:
      'catching it before it catches you — the replaying is doing the job of never being blindsided again',
    assumption:
      'that if you think about it long enough you will find the thing that makes it safe, and that stopping is the same as being careless',
    test:
      'give it fifteen minutes with a timer, written down, once a day at a fixed time. When the timer ends, stop mid-sentence if you have to. Notice whether the thing you were afraid of actually arrives on the days you stopped',
    dims: ['rumination'],
    sources: ['kegan2009', 'treynor2003'],
  },
  {
    id: 'proof',
    trigger: 'sco_2',
    at: 35,
    support: 'selfCompassion',
    commitment:
      'staying ahead of the criticism by getting there first — if you are already the harshest voice about you, nobody can land a blow you have not already thrown',
    assumption:
      'that the hardness is what makes you good, and that easing it is the first step to becoming someone who does not try',
    test:
      'for one week, write down what you would say to a friend in exactly your situation — the same words, addressed to them. Then read it back with your own name at the top. Watch whether your standards actually drop',
    dims: ['selfCompassion'],
    sources: ['kegan2009', 'neff2003'],
  },
]

/**
 * The immunity finding. At most one: this is the report's spine and the Kegan method is explicit
 * that one Big Assumption worked properly beats four listed.
 */
export function immunityFindings(scored: Scored[], answers: AnswerMap): Finding[] {
  const by = new Map(scored.map((s) => [s.id, s]))
  const goal = q(answers, 'fut_gap')
  const block = q(answers, 'fut_block')

  const candidates = IMMUNITIES
    .map((r) => ({ r, v: p(answers, r.trigger) }))
    .filter((c): c is { r: Immunity; v: number } => c.v !== null && c.v <= c.r.at)
    .sort((a, b) => a.v - b.v)

  const hit = candidates[0]
  if (!hit) return []

  const { r } = hit
  const item = ITEM_BY_ID[r.trigger]
  const support = r.support ? by.get(r.support) : undefined

  const evidence: Evidence[] = []
  const trig = itemEvidence(r.trigger, answers)
  if (trig) evidence.push(trig)
  if (support && !support.thin) evidence.push(dimensionEvidence(support))
  const gapQuote = quoteEvidence(answers, 'fut_gap', 'What that person has that you do not', ['markus1986', 'kegan2009'])
  if (gapQuote) evidence.push(gapQuote)
  const blockQuote = quoteEvidence(answers, 'fut_block', 'What you already know stops you', ['kegan2009', 'oettingen2014'])
  if (blockQuote) evidence.push(blockQuote)

  if (evidence.length === 0) return []

  /* The statement is the deterministic fallback prose, so it has to stand on its own as the
     section. Written as the four Kegan columns in order, in plain sentences. */
  const openers: string[] = []
  if (goal.length > 8) {
    openers.push(`You said the thing that person has, and you do not, is ${sentence(lowerFirst(span(goal, 120)))}`)
  }
  openers.push(
    `You also answered "${item?.text ?? r.trigger}" in a way that is worth stopping on.`,
  )

  const middle =
    `The usual reading of that is a shortage — of confidence, of discipline, of self-worth. ` +
    `There is a second reading, and in thirty years of this work it is the one that turns out to be true more often: you are not failing at the thing you want. You are succeeding at something else you are also committed to, which is ${r.commitment}. ` +
    `That commitment is not a flaw and it did not come from nowhere. It was almost certainly the right adaptation to a situation you were actually in.`

  const close =
    `Underneath it sits a belief you have never had reason to test: ${r.assumption}. ` +
    `It may be true. Most beliefs of this kind have simply never been checked, because checking them looks, from the inside, like the most dangerous thing available.`

  const blockLine =
    block.length > 8
      ? ` When you were asked what stops you, you wrote: "${span(block, 150)}" — which is a description of the same machinery, from the outside.`
      : ''

  return [
    {
      id: fid('imm'),
      kind: 'configural',
      statement: `${openers.join(' ')} ${middle} ${close}${blockLine}`,
      notability: 0.95,
      baseRate: 0.08,
      finnLevel: 3,
      evidence,
      sources: r.sources,
      dimensions: r.dims,
      accepted: true,
    },
  ]
}

/**
 * The experiment, as a finding of its own.
 *
 * Separated from the immunity finding on purpose. That one names the job the pattern does, which is
 * the insight; this one is the only thing in the report that asks them to go and find out something
 * we do not know. An assumption that is merely named has been diagnosed. An assumption with a test
 * attached is the difference between a reader who understood their report and a reader who did
 * something because of it — and the second one is the whole standard this half is judged against.
 *
 * Exactly one. Kegan's method is explicit that a list of assumptions is a way of testing none.
 */
export function assumptionFindings(scored: Scored[], answers: AnswerMap): Finding[] {
  const hit = IMMUNITIES
    .map((r) => ({ r, v: p(answers, r.trigger) }))
    .filter((c): c is { r: Immunity; v: number } => c.v !== null && c.v <= c.r.at)
    .sort((a, b) => a.v - b.v)[0]
  if (!hit) return []

  const { r } = hit
  const by = new Map(scored.map((s) => [s.id, s]))
  const support = r.support ? by.get(r.support) : undefined
  const item = ITEM_BY_ID[r.trigger]

  const evidence: Evidence[] = []
  const trig = itemEvidence(r.trigger, answers)
  if (trig) evidence.push(trig)
  if (support && !support.thin) evidence.push(dimensionEvidence(support))
  if (evidence.length === 0) return []

  return [
    {
      id: fid('asm'),
      kind: 'assumption',
      statement:
        /* Opens on their own answer, not on the library sentence.
           The assumption itself is authored text — it has to be, it is a named construct — but a
           section that begins with authored text is a section that could have been written for
           anybody, and the anti-generic gate is right to flag it. Their answer goes first. */
        `You were asked whether ${lowerFirst(stripFinalStop(item?.text ?? ''))}, and you said ${answerPhrase(answers, r.trigger)}. ` +
        `So here is the one thing worth testing, and it is deliberately only one. The assumption underneath that answer is ${r.assumption}. ` +
        `The test is this: ${r.test}. ` +
        `It is small on purpose. An assumption this old has usually never been checked precisely because checking it properly looks unsurvivable from the inside, so the version that gets done is the version that is almost too small to be frightening. ` +
        `What matters is not whether it goes well. What matters is that afterwards you will know something you currently only believe — and if it goes badly, that is data too, and more useful than the years you have spent assuming without checking.`,
      notability: 0.9,
      baseRate: 0.08,
      finnLevel: 3,
      evidence,
      sources: [...r.sources, 'gollwitzer2006'],
      dimensions: r.dims,
      accepted: true,
    },
  ]
}

/** The smallest safe test for whichever immunity fired — used by the plan and the take-away. */
export function assumptionTest(answers: AnswerMap): { assumption: string; test: string; sources: string[] } | null {
  const hit = IMMUNITIES
    .map((r) => ({ r, v: p(answers, r.trigger) }))
    .filter((c): c is { r: Immunity; v: number } => c.v !== null && c.v <= c.r.at)
    .sort((a, b) => a.v - b.v)[0]
  if (!hit) return null
  return { assumption: hit.r.assumption, test: hit.r.test, sources: hit.r.sources }
}

function lowerFirst(s: string): string {
  return s.length ? s[0]!.toLowerCase() + s.slice(1) : s
}

/** Close a quoted fragment without doubling the punctuation the person already wrote. */
function sentence(s: string): string {
  const t = s.trim()
  const last = t.slice(-1)
  return SENTENCE_ENDS.includes(last) ? t : t + '.'
}

const SENTENCE_ENDS = ['.', '!', '?', '…']

/** An item's text reads as a statement; folding it into a question needs the stop removed. */
function stripFinalStop(s: string): string {
  const t = s.trim()
  return SENTENCE_ENDS.includes(t.slice(-1)) ? t.slice(0, -1) : t
}

/** The label they actually chose on the scale, so the sentence quotes them rather than a number. */
function answerPhrase(answers: AnswerMap, itemId: string): string {
  const i = ITEM_BY_ID[itemId]
  const v = answers[itemId]?.value
  if (!i || typeof v !== 'number') return 'what you said'
  const rendered = renderAnswer(i, v)
  return rendered.startsWith('You chose: ') ? `"${rendered.slice('You chose: '.length).toLowerCase()}"` : 'what you said'
}

/* ══════════════════════════════════════════════════════════════════════════
   2 · THE UNIQUE OUTCOME — the place the pattern did not hold.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * White & Epston's move, made computable.
 *
 * Inside any dimension the person scored low on, find the single item they answered AGAINST that
 * dimension — the question where, on this one thing, the pattern did not run. That item is not an
 * inconsistency to be smoothed away; it is the only material in the report that proves the pattern
 * is a pattern rather than an identity.
 *
 * It is also structurally untransplantable: it is an item-level deviation inside this person's own
 * profile, and it cannot be true of a reader who answered differently.
 */
const EXCEPTION_GAP = 28
const EXCEPTION_DIM_CEILING = 46

export function exceptionFindings(scored: Scored[], answers: AnswerMap): Finding[] {
  const out: Finding[] = []

  const weak = scored
    .filter((s) => !s.thin && s.itemIds.length >= 3)
    .map((s) => ({ s, oriented: DIM_BY_ID[s.id].higherIsBetter ? s.pomp : 100 - s.pomp }))
    .filter((x) => x.oriented <= EXCEPTION_DIM_CEILING)
    .sort((a, b) => a.oriented - b.oriented)

  for (const { s, oriented } of weak.slice(0, 2)) {
    const d = DIM_BY_ID[s.id]
    /* Orient the item the same way the dimension is oriented.
     *
     * `itemPomp` already applies the ITEM's reverse flag, so within a dimension every item points
     * the same way as the construct — but the construct is not always the good direction. For
     * Overthinking, 100 means maximum overthinking. Reading raw item POMP here picked the single
     * strongest instance of the pattern and announced it as the place the pattern did not run,
     * which is the exact opposite of the finding. */
    const scoredItems = s.itemIds
      .map((id) => ({ id, v: p(answers, id) }))
      .filter((x): x is { id: string; v: number } => x.v !== null)
      .map((x) => ({ id: x.id, oriented: d.higherIsBetter ? x.v : 100 - x.v }))
      .sort((a, b) => b.oriented - a.oriented)

    const best = scoredItems[0]
    if (!best) continue
    const gap = best.oriented - oriented
    if (gap < EXCEPTION_GAP) continue

    const item = ITEM_BY_ID[best.id]
    if (!item) continue
    const ev = itemEvidence(best.id, answers)
    if (!ev) continue

    out.push({
      id: fid('exc'),
      kind: 'exclusion',
      statement:
        `${d.label} came out at ${s.pomp}%, and that is the part of this you already know about yourself. ` +
        `But one answer inside it does not match the rest: "${item.text}" — and there you went ${gap} points against your own pattern. ` +
        `That is not an inconsistency and it is not a rounding error. It is a place where the thing that usually runs did not run. ` +
        `Whatever was different there — who you were with, what was at stake, how much sleep you had had — is the most useful information in this report, because it is the only evidence that this is something you do rather than something you are.`,
      notability: 0.82,
      baseRate: 0.12,
      finnLevel: 3,
      evidence: [ev, dimensionEvidence(s)],
      sources: ['white1990', 'jacobson1996', ...d.sources.slice(0, 1)],
      dimensions: [s.id],
      accepted: true,
    })
  }

  return out
}

/* ══════════════════════════════════════════════════════════════════════════
   3 · THE DISTANCE — the person they described, against what we measured.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * They wrote an ordinary Tuesday ten years out and named the hardest thing that person has. That
 * writing is the most alive material in the assessment and it would be a waste to leave it as a
 * quote. What makes it land is putting it next to the measurement: how continuous they feel with
 * that person right now, and which specific measured thing is furthest from the life they drew.
 */
export function futureFindings(scored: Scored[], answers: AnswerMap): Finding[] {
  const tuesday = q(answers, 'fut_write')
  const gap = q(answers, 'fut_gap')
  if (tuesday.length < 25 && gap.length < 12) return []

  const by = new Map(scored.map((s) => [s.id, s]))
  const cont = by.get('futureSelfContinuity')
  const lived = by.get('valuesLived')

  const evidence: Evidence[] = []
  const t = quoteEvidence(answers, 'fut_write', 'The Tuesday you described', ['markus1986', 'hershfield2011'])
  if (t) evidence.push(t)
  const g = quoteEvidence(answers, 'fut_gap', 'The hardest thing to say they have', ['markus1986', 'kegan2009'])
  if (g) evidence.push(g)
  if (cont && !cont.thin) evidence.push(dimensionEvidence(cont))
  if (lived && !lived.thin) evidence.push(dimensionEvidence(lived))
  if (evidence.length === 0) return []

  const parts: string[] = []

  if (tuesday.length >= 25) {
    parts.push(
      `You wrote that Tuesday quickly enough that it was already there before we asked: "${span(tuesday, 220)}"`,
    )
  }

  if (cont && !cont.thin) {
    const dims: DimensionId[] = ['futureSelfContinuity']
    if (cont.pomp <= 42) {
      parts.push(
        `And yet how connected you feel to that person sits at ${cont.pomp}%. That gap is the finding. You can describe them in detail and you do not experience them as you — which is measurable, and which has a documented consequence: people who feel distant from their future self systematically hand them the bill. Every hard thing gets deferred to someone you do not quite believe in.`,
      )
    } else if (cont.pomp >= 62) {
      parts.push(
        `Continuity with that person sits at ${cont.pomp}%, which is high, and it changes what this report is for. You are not someone who needs convincing that the future is real. Nothing below needs to sell you on the long view; what it has to do is name the specific thing in the way.`,
      )
    } else {
      parts.push(
        `Continuity with that person sits at ${cont.pomp}% — they are real to you some days and theoretical on others, which is the most common position and the least stable one.`,
      )
    }
    void dims
  }

  if (gap.length >= 12) {
    parts.push(
      `Asked what they have that you do not, and specifically for the one that was hardest to say, you wrote: "${span(gap, 160)}" You were not asked to solve it. You were asked to name it, and naming it is the part most people never get to — which means the distance between you and that Tuesday is now a specific distance rather than a mood.`,
    )
  }

  if (lived && !lived.thin && lived.pomp <= 45) {
    parts.push(
      `One more number belongs here: how much of your actual week goes to what you said matters most came out at ${lived.pomp}%. That is the distance in its most practical form — not a question of belief, but of where the hours currently go.`,
    )
  }

  const dims: DimensionId[] = []
  if (cont && !cont.thin) dims.push('futureSelfContinuity')
  if (lived && !lived.thin) dims.push('valuesLived')

  return [
    {
      id: fid('fut'),
      kind: 'quote',
      statement: parts.join(' '),
      notability: 0.88,
      baseRate: 0.1,
      finnLevel: cont && !cont.thin && cont.pomp <= 42 ? 3 : 2,
      evidence,
      sources: ['markus1986', 'hershfield2011', 'kegan2009'],
      dimensions: dims.length ? dims : ['futureSelfContinuity'],
      accepted: true,
    },
  ]
}

/* ══════════════════════════════════════════════════════════════════════════
   4 · WHAT YOU STAND ON — the value, and what acting on it cost.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * The values chapter opens the assessment for a reason that is not decorative: self-affirmation
 * before threatening information measurably reduces defensive discounting of it (Steele 1988;
 * Cohen & Sherman 2014). So the report has to actually USE what they wrote, and early, or the
 * mechanism the chapter was placed there for does not fire.
 */
export function groundFindings(scored: Scored[], answers: AnswerMap): Finding[] {
  const story = q(answers, 'val_write')
  if (story.length < 25) return []

  const ev = quoteEvidence(answers, 'val_write', 'A time acting on it cost you something', ['steele1988', 'cohen2014'])
  if (!ev) return []

  const by = new Map(scored.map((s) => [s.id, s]))
  const lived = by.get('valuesLived')
  const evidence: Evidence[] = [ev]
  if (lived && !lived.thin) evidence.push(dimensionEvidence(lived))

  const tail =
    lived && !lived.thin && lived.pomp <= 45
      ? ` The gap between that and an ordinary week of yours is real — how much of your week actually goes there came out at ${lived.pomp}% — and it is worth being precise about what that gap is. It is not evidence that you do not hold the value. It is evidence that holding it has been costing you, and that you have been paying.`
      : lived && !lived.thin
        ? ` And your week backs it up: how much of it actually goes there came out at ${lived.pomp}%, which is the rarer answer. What you say you value and what your calendar says are, unusually, the same thing.`
        : ''

  return [
    {
      id: fid('grd'),
      kind: 'quote',
      statement:
        `Before any of the rest of it, this: asked to describe a time acting on what you value cost you something, you wrote "${span(story, 200)}" ` +
        `That is not a warm-up question. Somebody who can produce a specific instance of paying for a value — not an opinion about the value, an instance — is describing something they actually have rather than something they admire.${tail}`,
      notability: 0.75,
      baseRate: 0.2,
      finnLevel: 1,
      evidence,
      sources: ['steele1988', 'cohen2014', 'schwartz2012'],
      dimensions: lived && !lived.thin ? ['valuesLived'] : [],
      accepted: true,
    },
  ]
}

/** Everything the self lens adds on top of the shared contradiction engine. */
export function selfWorkFindings(scored: Scored[], answers: AnswerMap): Finding[] {
  return [
    ...groundFindings(scored, answers),
    ...immunityFindings(scored, answers),
    ...assumptionFindings(scored, answers),
    ...exceptionFindings(scored, answers),
    ...futureFindings(scored, answers),
  ]
}
