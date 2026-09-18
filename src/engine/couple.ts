import type { AnswerMap, Finding, Evidence, Scored, Context, DimensionId } from './types'
import { DIM_BY_ID } from './dimensions'
import { ITEM_BY_ID } from '../items'
import { itemPomp, scaleFor } from './score'
import { renderAnswer } from './contradictions'

/**
 * COUPLE MODE — two accounts, and the distance between them.
 *
 * What this is NOT: a way to make the reading more accurate. Across 11,196 couples, what a
 * partner reported added almost nothing beyond what the person themselves reported (Joel 2020).
 * Anyone selling you "now with your partner's data, 40% more accurate" is selling you nothing.
 *
 * What it IS: the one thing a second account can give you that a first cannot — the size and the
 * location of the gap between two people's versions of the same relationship. That is not a more
 * accurate reading. It is a different finding, and it is usually the finding.
 *
 * The sharpest form of it is already half-built into the solo assessment: the person is asked to
 * predict their partner's answer BEFORE giving their own. In solo mode that prediction hangs
 * there unresolved. In couple mode it gets marked.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * THE RULE THAT GOVERNS EVERY SENTENCE IN THIS FILE
 *
 * A gap is information about the relationship, never a scoreboard. The moment a report can be
 * read as "here is proof that you were right and they were wrong", it has become ammunition for
 * the next argument, and the couple is worse off than before they opened it. So: no sentence
 * here declares anybody correct, no gap is attributed to one person's failure, and where the two
 * of them agree that is stated as plainly as where they do not.
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ══════════════════════════════════════════════════════════════════════════
   WHAT THE SECOND PERSON IS ASKED.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Deliberately short. The second person is doing somebody a favour, usually with less investment
 * in the exercise and often some suspicion about what it is for — a forty-minute assessment gets
 * abandoned, and an abandoned second half is worth less than none because the first person is
 * then waiting for something that is not coming.
 *
 * So: the items that produce the gaps worth having, and nothing else. About six minutes.
 *
 * The first two are the ones their partner was asked to PREDICT, which is what makes the whole
 * mechanism work.
 */
export const PARTNER_ITEM_IDS = [
  'resp_1', 'amb_1',
  'sat_1', 'sat_3', 'sat_5',
  'app_1', 'app_2',
  'resp_4',
  'con_1', 'con_2', 'con_3', 'con_4',
  'tru_1', 'tru_3',
  'clo_3', 'clo_4',
  'amb_3',
  'ded_1', 'ded_2',
  'gro_1',
] as const

/** The one thing the second person writes. They are told, before writing it, who reads it. */
export const PARTNER_NOTE_ID = 'partner_note'

export function partnerItems() {
  return PARTNER_ITEM_IDS.map((id) => ITEM_BY_ID[id]).filter((i): i is NonNullable<typeof i> => !!i)
}

/* ══════════════════════════════════════════════════════════════════════════
   THE CODEC — a link, and no server anywhere in it.
   ══════════════════════════════════════════════════════════════════════════ */

export const COUPLE_CODEC_VERSION = 2

export interface PartnerPayload {
  v: number
  /** Scale answers only, as itemId → raw value. */
  a: Record<string, number>
  /** The one optional note, if they chose to write one. */
  n?: string
  /** Enough context for the second person to have been asked the right questions. */
  c: { stage: string; duration: string | null; family: boolean }
}

/**
 * Items that may never travel, under any circumstances.
 *
 * The safety chapter is memory-only by construction and this is the second fence around it. If a
 * future item id ever starts with `saf_`, it is excluded here without anybody having to remember
 * to add it — and `couple.test.ts` asserts the fence holds by trying to push a disclosure through
 * it. A guard that is only tested for accepting the true is half a guard (LAW 9).
 */
export function mayTravel(itemId: string): boolean {
  if (itemId.startsWith('saf_')) return false
  const item = ITEM_BY_ID[itemId]
  if (!item) return false
  if (item.chapter === 'safety') return false
  // Free text is not swept up wholesale. The only prose that travels is the note, deliberately.
  return item.format === 'likert5' || item.format === 'likert7'
}

export function buildPartnerPayload(answers: AnswerMap, ctx: Context, note: string): PartnerPayload {
  const a: Record<string, number> = {}
  for (const id of PARTNER_ITEM_IDS) {
    if (!mayTravel(id)) continue
    const v = answers[id]?.value
    if (typeof v === 'number') a[id] = v
  }
  const trimmed = note.trim().slice(0, 600)
  return {
    v: COUPLE_CODEC_VERSION,
    a,
    ...(trimmed.length >= 2 ? { n: trimmed } : {}),
    c: { stage: ctx.stage, duration: ctx.durationBucket, family: ctx.familyInPlay },
  }
}

/** Turn a decoded payload back into the AnswerMap shape the engine speaks. */
export function payloadToAnswers(p: PartnerPayload): AnswerMap {
  const out: AnswerMap = {}
  let order = 0
  for (const [id, value] of Object.entries(p.a)) {
    if (!mayTravel(id)) continue
    const item = ITEM_BY_ID[id]
    if (!item) continue
    const scale = scaleFor(item)
    if (typeof value !== 'number' || value < scale.min || value > scale.max) continue
    out[id] = { itemId: id, value, revisions: 0, dwellMs: 0, order: order++ }
  }
  if (p.n) {
    out[PARTNER_NOTE_ID] = { itemId: PARTNER_NOTE_ID, value: p.n, revisions: 0, dwellMs: 0, order: order++ }
  }
  return out
}

/**
 * Validation, written as if the string came from a stranger — because it did. Anything that is
 * not exactly the shape we expect is rejected whole rather than partially trusted.
 */
export function parsePartnerPayload(raw: unknown): PartnerPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (typeof p.v !== 'number' || p.v > COUPLE_CODEC_VERSION) return null
  if (!p.a || typeof p.a !== 'object' || Array.isArray(p.a)) return null

  const a: Record<string, number> = {}
  for (const [id, v] of Object.entries(p.a as Record<string, unknown>)) {
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    if (!mayTravel(id)) continue
    a[id] = Math.round(v)
  }
  if (Object.keys(a).length < 5) return null

  const c = (p.c ?? {}) as Record<string, unknown>
  return {
    v: p.v,
    a,
    ...(typeof p.n === 'string' && p.n.trim().length >= 2 ? { n: p.n.trim().slice(0, 600) } : {}),
    c: {
      stage: typeof c.stage === 'string' ? c.stage : 'dating',
      duration: typeof c.duration === 'string' ? c.duration : null,
      family: c.family === true,
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   THE FINDINGS — what two accounts can say that one cannot.
   ══════════════════════════════════════════════════════════════════════════ */

let seq = 0
const fid = () => `f:two:${(seq += 1)}`
export function resetCoupleIds() { seq = 0 }

/**
 * A paragraph break inside a computed statement, as a constant rather than an escape.
 *
 * Not style. A shell heredoc has eaten the backslash out of this exact character four times in
 * this codebase, and twice it produced a file that still parsed. Naming it means the next edit
 * to this file cannot silently break the same way.
 */
const BREAK = String.fromCharCode(10)

function choiceWord(itemId: string, value: number): string {
  const item = ITEM_BY_ID[itemId]
  if (!item) return String(value)
  return renderAnswer(item, value).replace('You chose: ', '').toLowerCase()
}

function bothEvidence(itemId: string, mine: number, theirs: number): Evidence[] {
  const item = ITEM_BY_ID[itemId]
  if (!item) return []
  return [
    {
      id: `ev:item:${itemId}`,
      kind: 'item',
      label: 'What you said',
      detail: `You chose: ${choiceWord(itemId, mine)}`,
      itemText: item.text,
      sources: item.sources,
    },
    {
      id: `ev:partner:${itemId}`,
      kind: 'item',
      label: 'What they said, to the same question',
      detail: `They chose: ${choiceWord(itemId, theirs)}`,
      itemText: item.text,
      sources: item.sources,
    },
  ]
}

const PREDICTION_GAP = 25
const ITEM_GAP = 40
/**
 * Agreement means the same answer or one step from it.
 *
 * On a five-point scale one step is 25 POMP points, so a tighter threshold would only ever count
 * people who picked the identical option — and would have reported two people who answered
 * "mostly true" and "completely true" as disagreeing. That is not what either of them would say
 * had happened, and this section is read by both of them.
 */
const AGREEMENT_WITHIN = 25

/**
 * 1 · THE PREDICTION, MARKED.
 *
 * The person was asked to guess their partner's answer before giving their own, and until now
 * that guess had nothing to check it against. This is the single most valuable thing couple mode
 * does and the reason the prediction items exist at all.
 *
 * One finding covering every prediction, not one each. There are only two prediction items, and
 * emitting them separately printed the same explanation twice under two different quotes — the
 * same repetition that made the disagreement list read as generated.
 */

interface Marked {
  guessItemId: string
  targetId: string
  guess: number
  actual: number
  own: number | null
  gapToActual: number
  gapBetweenUs: number | null
}

function markPredictions(mine: AnswerMap, theirs: AnswerMap): Marked[] {
  const out: Marked[] = []
  for (const item of Object.values(ITEM_BY_ID)) {
    if (item.format !== 'predict' || !item.predicts) continue
    const guess = mine[item.id]?.value
    const actual = theirs[item.predicts]?.value
    if (typeof guess !== 'number' || typeof actual !== 'number') continue
    const own = mine[item.predicts]?.value
    out.push({
      guessItemId: item.id,
      targetId: item.predicts,
      guess,
      actual,
      own: typeof own === 'number' ? own : null,
      gapToActual: Math.round(Math.abs(itemPomp(item.predicts, guess) - itemPomp(item.predicts, actual))),
      gapBetweenUs:
        typeof own === 'number'
          ? Math.round(Math.abs(itemPomp(item.predicts, own) - itemPomp(item.predicts, actual)))
          : null,
    })
  }
  return out
}

function predictionMarked(marks: Marked[]): Finding[] {
  if (marks.length === 0) return []

  const evidence: Evidence[] = []
  const lines: string[] = []

  for (const m of marks) {
    const guessItem = ITEM_BY_ID[m.guessItemId]!
    const target = ITEM_BY_ID[m.targetId]!
    evidence.push(
      {
        id: `ev:item:${m.guessItemId}`,
        kind: 'item',
        label: 'What you guessed they would say',
        detail: `You chose: ${choiceWord(m.targetId, m.guess)}`,
        itemText: guessItem.text,
        sources: guessItem.sources,
      },
      {
        id: `ev:partner:${m.targetId}`,
        kind: 'item',
        label: 'What they actually said',
        detail: `They chose: ${choiceWord(m.targetId, m.actual)}`,
        itemText: target.text,
        sources: target.sources,
      },
    )
    lines.push(
      `— "${target.text}" You guessed ${choiceWord(m.targetId, m.guess)}. They said ${choiceWord(m.targetId, m.actual)}.` +
        (m.gapToActual >= PREDICTION_GAP ? ` ${m.gapToActual} points out.` : ' Correct.'),
    )
  }

  const wrong = marks.filter((m) => m.gapToActual >= PREDICTION_GAP)
  const rightButApart = marks.filter(
    (m) => m.gapToActual < PREDICTION_GAP && m.gapBetweenUs !== null && m.gapBetweenUs >= ITEM_GAP,
  )

  const parts: string[] = [
    'Before you answered anything for yourself, you were asked to guess how they would answer. ' +
      'They then answered it, without seeing your guess.' +
      BREAK + BREAK + lines.join(BREAK) + BREAK,
  ]

  if (wrong.length > 0) {
    const m = wrong[0]!
    const thoughtWorse = itemPomp(m.targetId, m.guess) < itemPomp(m.targetId, m.actual)
    parts.push(
      thoughtWorse
        ? `You have been carrying a worse version of them than the one that exists. That is not good news and bad news together; it is one thing, and it is that some part of what you have been managing was a story rather than a fact.`
        : `You have been reading them as further in than they are. That is a hard thing to find out, and it is better found from a question than from an announcement.`,
    )
    parts.push(
      `What it is not is evidence that one of you was paying attention and the other was not. A gap that size usually means the thing has never been said out loud in a way that landed — which is a different problem, with a different fix, from not being understood.`,
    )
  }

  if (rightButApart.length > 0) {
    const m = rightButApart[0]!
    const target = ITEM_BY_ID[m.targetId]!
    parts.push(
      `${wrong.length > 0 ? 'On the other one, something else: you' : 'You'} read them correctly — and the two of you are still ${m.gapBetweenUs} points apart on "${target.text}", because you answered it ${choiceWord(m.targetId, m.own!)} for yourself. ` +
        `That combination rules something out, which is why it is worth stopping on. This is not a misunderstanding. You know how they see it. You simply do not see it that way — and the two of you have been treating a real difference as a failure to explain, which is exactly why explaining it harder has not worked.`,
    )
  }

  if (wrong.length === 0 && rightButApart.length === 0) {
    parts.push(
      `You read them correctly, and that is worth more than it sounds. A great deal of what goes wrong between two people goes wrong because they are confidently misreading each other, and whatever else is or is not working here, that is not what is happening.`,
    )
  }

  const sharp = wrong.length > 0 || rightButApart.length > 0
  return [{
    id: fid(),
    kind: 'partnerGap',
    /* Joined as paragraphs, not as sentences. Joining on a space ran the last bullet of the list
       straight into the explanation that follows it, which on the page looked like one of the
       quoted questions had grown a three-line commentary. */
    statement: parts.map((x) => x.trim()).filter(Boolean).join(BREAK + BREAK),
    notability: sharp ? 0.95 : 0.72,
    baseRate: sharp ? 0.12 : 0.3,
    finnLevel: sharp ? 3 : 1,
    evidence,
    sources: ['joel2020', 'reis2004', 'christensen1990'],
    dimensions: marks.map((m) => ITEM_BY_ID[m.targetId]!.dimension).filter((d): d is NonNullable<typeof d> => !!d),
    accepted: true,
  }]
}

/**
 * 2 · THE SAME QUESTION, TWO ANSWERS.
 *
 * Both of them answered the identical item. Where those are far apart, the item text itself is
 * the most useful thing on the page, because it names the exact thing they are not seeing the
 * same way — which is far more workable than "you have communication problems".
 */
function itemDisagreements(mine: AnswerMap, theirs: AnswerMap, covered: Set<string>): Finding[] {
  const gaps: { id: string; mine: number; theirs: number; gap: number }[] = []

  for (const id of PARTNER_ITEM_IDS) {
    // Items the prediction finding already worked through are not raised a second time.
    if (covered.has(id)) continue
    const a = mine[id]?.value
    const b = theirs[id]?.value
    if (typeof a !== 'number' || typeof b !== 'number') continue
    const gap = Math.round(Math.abs(itemPomp(id, a) - itemPomp(id, b)))
    gaps.push({ id, mine: a, theirs: b, gap })
  }

  const wide = gaps.filter((g) => g.gap >= ITEM_GAP).sort((x, y) => y.gap - x.gap).slice(0, 3)
  const out: Finding[] = []

  /* One finding, not one per disagreement.
   *
   * Emitting these separately meant the same sixty words of framing printed verbatim under each
   * one — three paragraphs that differed only in the quoted sentence. That is the exact thing
   * that makes a report read as generated rather than written, and it was doing it in the most
   * sensitive section in the product. The explanation is worth saying. It is worth saying once. */
  if (wide.length > 0) {
    const lines = wide.map((g) => {
      const item = ITEM_BY_ID[g.id]!
      return `— "${item.text}" You said ${choiceWord(g.id, g.mine)}. They said ${choiceWord(g.id, g.theirs)}. ${g.gap} points apart.`
    })

    out.push({
      id: fid(),
      kind: 'partnerGap',
      statement:
        `${wide.length === 1 ? 'There is one question' : `There are ${wide.length} questions`} you were both asked, separately, where your answers are furthest apart.` +
        BREAK + BREAK + lines.join(BREAK) + BREAK + BREAK +
        `Two people who live the same days do not usually answer a question like that differently because one of them is wrong about the facts. They answer differently because they are standing in different parts of the same thing. ` +
        `What makes ${wide.length === 1 ? 'that sentence' : 'those sentences'} worth more than any summary of them is that ${wide.length === 1 ? 'it is' : 'they are'} specific enough to be answered out loud, by name, without either of you having to characterise the whole relationship first.`,
      notability: Math.min(1, 0.7 + (wide[0]?.gap ?? 0) / 150),
      baseRate: 0.22,
      finnLevel: 3,
      evidence: wide.flatMap((g) => bothEvidence(g.id, g.mine, g.theirs)),
      sources: ['christensen1990', 'joel2020'],
      dimensions: wide.map((g) => ITEM_BY_ID[g.id]!.dimension).filter((d): d is NonNullable<typeof d> => !!d),
      accepted: true,
    })
  }

  /* Agreement is a finding too, and leaving it out would turn the whole section into a list of
     everything wrong — which is both dishonest and, for two people reading this together, the
     thing most likely to make it the last time they try something like this. */
  const close = gaps.filter((g) => g.gap <= AGREEMENT_WITHIN)
  if (close.length >= 3) {
    const named = close.slice(0, 3).map((g) => ITEM_BY_ID[g.id]!)
    out.push({
      id: fid(),
      kind: 'partnerGap',
      statement:
        `On ${close.length} of the ${gaps.length} questions you both answered, you gave the same answer or one next to it — including "${named[0]!.text}"` +
        (named[1] ? ` and "${named[1]!.text}"` : '') +
        `. This matters and it is easy to skip past. Two people who are seeing the same relationship on most of it, and differ sharply on a few specific things, are in a completely different position from two people who are not describing the same relationship at all. ` +
        `Whatever the hard parts below turn out to be, they sit on top of a shared account rather than replacing one.`,
      notability: 0.66,
      baseRate: 0.35,
      finnLevel: 1,
      evidence: close.slice(0, 2).flatMap((g) => bothEvidence(g.id, g.mine, g.theirs)),
      sources: ['joel2020'],
      dimensions: [],
      accepted: true,
    })
  }

  return out
}

/**
 * 3 · WHAT THEY WROTE.
 *
 * One optional note, written knowing exactly who reads it. It goes into the report verbatim and
 * is never summarised, because summarising the one thing the other person chose to say in their
 * own words is the single most patronising thing this product could do.
 */
function partnerNote(theirs: AnswerMap): Finding[] {
  const v = theirs[PARTNER_NOTE_ID]?.value
  if (typeof v !== 'string' || v.trim().length < 10) return []
  const text = v.trim()

  return [{
    id: fid(),
    kind: 'partnerGap',
    statement:
      `They were asked whether there was one thing they wanted you to know, and told plainly that you would read it. They wrote: "${text}"` +
      ` That is not analysed here and it is not going to be. It is the one part of this whole report that did not come from you.`,
    notability: 0.94,
    baseRate: 0.05,
    finnLevel: 3,
    evidence: [{
      id: `ev:partner:${PARTNER_NOTE_ID}`,
      kind: 'quote',
      label: 'The one thing they wanted you to know',
      detail: `"${text}"`,
      sources: ['reis2004'],
    }],
    sources: ['reis2004'],
    dimensions: [],
    accepted: true,
  }]
}

/**
 * 4 · THE HONEST LIMIT OF HAVING TWO ACCOUNTS.
 *
 * Stated as a finding rather than buried in the limits, because the temptation this feature
 * creates — to treat the second account as a tiebreaker — is strong enough that it needs
 * answering where the reader is actually looking.
 */
function whatTwoAccountsCannotDo(theirs: AnswerMap): Finding[] {
  const n = Object.keys(theirs).length
  if (n < 5) return []
  return [{
    id: fid(),
    kind: 'partnerGap',
    statement:
      `One thing about what having both of you changes, because it is not what people expect. It does not make the reading more accurate. ` +
      `Across 11,196 couples, what a partner reported added almost nothing to what the person themselves reported — so nobody here is in a position to tell you which of your two accounts is the correct one, and this report is not going to pretend to. ` +
      `What two accounts give you is the only thing one account cannot: the size and the location of the distance between them. That is not a tiebreaker. It is a map of where the conversation actually is.`,
    notability: 0.55,
    baseRate: 0.4,
    finnLevel: 2,
    evidence: [{
      id: 'ev:partner:count',
      kind: 'telemetry',
      label: 'Questions they answered',
      detail: `${n}, on their own, without seeing any of yours`,
      sources: ['joel2020'],
    }],
    sources: ['joel2020'],
    dimensions: [],
    accepted: true,
  }]
}

export function coupleFindings(mine: AnswerMap, theirs: AnswerMap | undefined, _scored: Scored[]): Finding[] {
  if (!theirs || Object.keys(theirs).length === 0) return []
  const marks = markPredictions(mine, theirs)
  const covered = new Set(marks.map((m) => m.targetId))
  return [
    ...partnerNote(theirs),
    ...predictionMarked(marks),
    ...itemDisagreements(mine, theirs, covered),
    ...whatTwoAccountsCannotDo(theirs),
  ]
}

/** Dimensions where both of them answered enough for a side-by-side to mean anything. */
export function sharedDimensions(mine: AnswerMap, theirs: AnswerMap): DimensionId[] {
  const out = new Set<DimensionId>()
  for (const id of PARTNER_ITEM_IDS) {
    const item = ITEM_BY_ID[id]
    if (!item?.dimension) continue
    if (typeof mine[id]?.value === 'number' && typeof theirs[id]?.value === 'number') {
      out.add(item.dimension)
    }
  }
  return [...out].filter((d) => DIM_BY_ID[d])
}
