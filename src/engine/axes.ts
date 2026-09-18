import type { AnswerMap, Scored, FourAxes, VerdictShape, SafetyRead, Evidence, Context, DimensionId } from './types'
import { DIM_BY_ID } from './dimensions'
import { composite } from './score'
import { ITEM_BY_ID } from '../items'
import { scaleFor } from './score'

/**
 * THE FOUR AXES.
 *
 * Rusbult & Martz (1995) found that among women in abusive relationships, what predicted staying
 * was investment size and poor alternatives — NOT satisfaction. People do not stay because it is
 * good. They stay because leaving costs something. Separating those two is the difference between
 * a verdict that is useful and a verdict that is a horoscope.
 *
 *   QUALITY — how this is actually going, on the dimensions with published predictive evidence.
 *   PULL    — what draws you toward this person.
 *   HOLD    — what keeps you here regardless of quality.
 *   SAFETY  — orthogonal. Never composited. Opens a chapter; never moves a number (LAW 6).
 *
 * "This should end" is reachable only when HOLD, not QUALITY, explains the staying. That is the
 * founder's own case, and it is the one reading that no astrology app can produce.
 *
 * LAW 4 — nothing here predicts anything. Every output is present tense. Divorce-prediction
 * equations lose roughly half their sensitivity on cross-validation (Heyman & Slep 2001), so we
 * do not make them.
 */

const PULL_DIMS: DimensionId[] = ['satisfaction', 'appreciation', 'responsiveness', 'growth', 'closeness', 'trust']
const HOLD_DIMS: DimensionId[] = ['constraint', 'alternatives', 'familyApproval']

function meanOriented(scored: Scored[], ids: DimensionId[], invertHold = false): number | null {
  const rows = scored.filter((s) => ids.includes(s.id) && !s.thin)
  if (rows.length === 0) return null
  const vals = rows.map((s) => {
    const d = DIM_BY_ID[s.id]
    if (!invertHold) return d.higherIsBetter ? s.pomp : 100 - s.pomp
    // For HOLD we want "how much is keeping you here", so the orientation flips.
    switch (s.id) {
      case 'constraint': return s.pomp                 // high constraint = strong hold
      case 'alternatives': return 100 - s.pomp         // few alternatives = strong hold
      case 'familyApproval': return 100 - s.pomp       // family pressure/disapproval = strong hold
      default: return s.pomp
    }
  })
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

/* ────────────────────────────  safety  ──────────────────────────── */

const AFFIRMED = 60 // POMP threshold at which a safety item counts as answered affirmatively

function affirmed(id: string, safetyAnswers: AnswerMap): boolean {
  const a = safetyAnswers[id]
  if (!a || typeof a.value !== 'number') return false
  const i = ITEM_BY_ID[id]
  if (!i) return false
  const scale = scaleFor(i)
  const span = scale.max - scale.min
  if (span <= 0) return false
  return ((a.value - scale.min) / span) * 100 >= AFFIRMED
}

function safetyEvidence(id: string, safetyAnswers: AnswerMap): Evidence | null {
  const a = safetyAnswers[id]
  const i = ITEM_BY_ID[id]
  if (!a || !i) return null
  const scale = scaleFor(i)
  const label = typeof a.value === 'number' ? scale.labels[Math.round(a.value) - scale.min] ?? String(a.value) : String(a.value)
  return {
    id: `ev:safety:${id}`,
    kind: 'item',
    label: 'Safety',
    detail: typeof a.value === 'string' ? `"${a.value.trim()}"` : `You chose: ${label}`,
    itemText: i.text,
    sources: i.sources,
  }
}

export function readSafety(safetyAnswers: AnswerMap): SafetyRead {
  const physical = ['saf_phys', 'saf_escalate', 'saf_threat', 'saf_pregnancy'].some((id) => affirmed(id, safetyAnswers))
  const coercive = ['saf_monitor', 'saf_isolate', 'saf_money', 'saf_food', 'saf_inlaws', 'saf_blame', 'saf_consent'].some((id) => affirmed(id, safetyAnswers))
  const selfRisk = ['saf_self_1', 'saf_self_2'].some((id) => affirmed(id, safetyAnswers))
  const perpetration = affirmed('saf_perp', safetyAnswers)

  /* Elevated-danger constructs from the India-adapted Danger Assessment (Sabri et al. 2024).
     Escalation, threats, violence in pregnancy, in-law participation and food/care deprivation
     carried the largest risk ratios in the Indian validation. This opens depth; it never gates. */
  const elevatedItems = ['saf_escalate', 'saf_threat', 'saf_pregnancy', 'saf_inlaws', 'saf_food']
  const elevatedCount = elevatedItems.filter((id) => affirmed(id, safetyAnswers)).length
  const elevated = physical && elevatedCount >= 2

  const evidence = Object.keys(safetyAnswers)
    .map((id) => safetyEvidence(id, safetyAnswers))
    .filter((e): e is Evidence => e !== null)

  return {
    flagged: physical || coercive || selfRisk || perpetration,
    physical,
    coercive,
    selfRisk,
    perpetration,
    elevated,
    evidence,
  }
}

/* ────────────────────────────  the shape  ──────────────────────────── */

const LOW = 40
const MID = 55
const HIGH = 65

function shapeOf(
  ctx: Context,
  quality: number,
  pull: number,
  hold: number,
  confidence: number,
  scored: Scored[],
): VerdictShape {
  const by = (id: DimensionId) => scored.find((s) => s.id === id && !s.thin)

  if (ctx.stage === 'ended' || ctx.stage === 'divorced') return 'ending'
  if (ctx.stage === 'one-sided') return 'one-sided'
  if (ctx.stage === 'arranged-considering' || ctx.stage === 'talking') return 'too-early'

  // Not enough measured to say anything. We say that, rather than bluffing (brief §13).
  if (confidence < 0.45) return 'unclear'

  const pcom = by('partnerCommitment')
  const ded = by('ownDedication')
  if (pcom && ded && pcom.pomp <= 30 && ded.pomp >= 70) return 'one-sided'

  // Seven of the top seven presenting problems in Indian threads are family-system problems
  // wearing a relationship costume. The verdict must be able to conclude the dyad is not the drag.
  const fam = by('familyApproval')
  if (fam && fam.pomp <= 30 && quality >= MID && pull >= MID) return 'not-between-you'

  // The founder's case: held by cost, not by wanting.
  if (quality < LOW && hold >= HIGH && pull < MID) return 'held-by-cost'
  if (quality < LOW && hold - pull >= 20) return 'held-by-cost'

  if (quality >= HIGH && hold <= MID) return 'working'
  return 'strained-repairable'
}

export function computeAxes(
  ctx: Context,
  scored: Scored[],
  safetyAnswers: AnswerMap,
): FourAxes {
  const comp = composite(scored)
  const pull = meanOriented(scored, PULL_DIMS) ?? comp.value
  const hold = meanOriented(scored, HOLD_DIMS, true) ?? 50
  const safety = readSafety(safetyAnswers)

  return {
    quality: comp.value,
    pull,
    hold,
    safety,
    confidence: comp.confidence,
    shape: shapeOf(ctx, comp.value, pull, hold, comp.confidence, scored),
  }
}

/**
 * What each shape MEANS, deterministically. This text ships as-is when the writer is unavailable,
 * so it has to be good on its own — not a placeholder.
 *
 * Note what none of these do: instruct. Aaina names what the pattern is and hands the decision
 * back explicitly. Being directive about the formulation while staying non-directive about
 * stay-or-leave is the split the clinical evidence actually supports — people hold many reasons
 * to stay and many to leave at once (Joel et al. 2018), and resolving that by fiat ignores half
 * of someone's own reasons.
 */
export const SHAPE_COPY: Record<VerdictShape, { title: string; lead: string; sources: string[] }> = {
  working: {
    title: 'This is held together by wanting it, not by the cost of leaving',
    lead: 'On the dimensions with the strongest published evidence, this relationship is going well — and, importantly, the things keeping you in it are not fear, cost, or obligation. That combination is less common than it sounds, and it is worth knowing you have it.',
    sources: ['joel2020', 'rusbult1998'],
  },
  'strained-repairable': {
    title: 'The strain is real, and it is concentrated in specific places',
    lead: 'This is not a relationship in general trouble. Most of what you reported is holding, and the difficulty sits in named dimensions that your own answers point at directly. That matters, because a diffuse problem cannot be worked on and a located one can.',
    sources: ['christensen2004', 'doss2016'],
  },
  'held-by-cost': {
    title: 'What is keeping you here is not the same as what is drawing you here',
    lead: 'Your answers separate cleanly into two groups. The things that would make leaving hard score high. The things that make staying good score low. Research on why people remain in relationships that are not working found the same split: what predicted staying was investment and a lack of alternatives, not satisfaction. This is a description of your answers, not an instruction about your life.',
    sources: ['rusbult1995', 'rusbult1998', 'joel2018'],
  },
  'not-between-you': {
    title: 'The problem you are carrying may not be between the two of you',
    lead: 'What you reported about the relationship itself is largely sound. What you reported about the world around it is not. It is common to experience external pressure as though it were evidence of something wrong between you — and to start looking for a fault in the relationship to explain a pain that is coming from somewhere else.',
    sources: ['sprecher1992', 'sinclair2014'],
  },
  'one-sided': {
    title: 'You are the one holding this',
    lead: 'The weight in your answers is not evenly distributed. What you are giving and what you report receiving are on different scales. This is the reading your own numbers produce, and it is worth sitting with before anything else.',
    sources: ['joel2020', 'rusbult1998'],
  },
  ending: {
    title: 'This has ended, and you are still in it',
    lead: 'The relationship is over in fact. What you are carrying is not a decision — it is the aftermath, and the aftermath has its own shape, its own timeline, and its own things that actually help.',
    sources: ['treynor2003', 'neff2003'],
  },
  'too-early': {
    title: 'There is not enough here yet for a verdict, and that is the honest answer',
    lead: 'You are being asked to decide on very little information — which is a feature of your situation, not a failure of yours. What we can do is show you what your own answers already reveal about what you want, what you are afraid of, and which questions would actually be worth getting answered before you decide.',
    sources: ['doherty2016'],
  },
  unclear: {
    title: 'We do not have enough to give you a reading, and we will not invent one',
    lead: 'Too much was skipped or left thin for any overall conclusion to be honest. Everything below is still true and still yours — but the overall picture is not something we are willing to guess at. Adding the sections you skipped would change that.',
    sources: ['heyman2001'],
  },
}

/* ────────────────────────────  the self lens  ──────────────────────────── */

/**
 * The self lens must never be handed a relationship verdict.
 *
 * Caught by walking it: somebody who came through the "Know thyself" door saw
 * "We do not have enough to give you a reading" as the headline of their report — because the
 * verdict card was rendering a stay-or-leave shape computed from relationship dimensions that
 * were never asked. A self-knowledge report has no verdict to give; what it has is a shape, and
 * the shape is about how clearly somebody sees themselves and how kindly they treat what they see.
 *
 * Those two are separable and the combination is the finding. Campbell's work put self-concept
 * clarity at the centre of self-knowledge; Neff's put self-compassion at the centre of what people
 * do with it. Knowing yourself precisely and treating yourself badly is a different situation from
 * not knowing yourself at all, and it needs a different report.
 */
export type SelfShape = 'clear-and-kind' | 'clear-and-harsh' | 'unclear-and-kind' | 'unclear-and-harsh' | 'thin'

export function selfShapeOf(scored: Scored[]): SelfShape {
  const get = (id: DimensionId) => scored.find((s) => s.id === id && !s.thin)
  const clarity = get('selfConceptClarity')
  const kindness = get('selfCompassion')
  if (!clarity || !kindness) return 'thin'
  const clear = clarity.pomp >= 50
  const kind = kindness.pomp >= 50
  if (clear && kind) return 'clear-and-kind'
  if (clear && !kind) return 'clear-and-harsh'
  if (!clear && kind) return 'unclear-and-kind'
  return 'unclear-and-harsh'
}

export const SELF_SHAPE_COPY: Record<SelfShape, { title: string; lead: string; sources: string[] }> = {
  'clear-and-kind': {
    title: 'You see yourself clearly, and you are not cruel about what you see',
    lead: 'That combination is less common than it sounds. Most people who can describe themselves accurately do it in the voice of a prosecutor. What follows is therefore not about learning to see straight — you already do — but about the distance between what you can see and what you have acted on.',
    sources: ['campbell1996', 'neff2003'],
  },
  'clear-and-harsh': {
    title: 'You know exactly who you are, and you hold it against yourself',
    lead: 'Your self-knowledge is not the problem here, and any advice built on "get to know yourself better" will miss you entirely. You already have the description. What you do not have is a way of holding it that leaves you able to act. Precision and cruelty are separable, and you have inherited both.',
    sources: ['campbell1996', 'neff2003'],
  },
  'unclear-and-kind': {
    title: 'You are gentle with a self you cannot quite make out',
    lead: 'The kindness is real and it is doing more work than you realise. What is missing is definition — a sense of yourself steady enough that other people’s readings of you do not move it. That is buildable, and it is built by evidence rather than by reflection.',
    sources: ['campbell1996', 'neff2003'],
  },
  'unclear-and-harsh': {
    title: 'You are hard on a version of yourself you have never actually seen clearly',
    lead: 'This is the difficult combination, and it is also the most common one. The judging happens anyway — it does not wait for the evidence. Which means the person being convicted is not you; it is a sketch. The work below is about getting a clearer look before passing another sentence.',
    sources: ['campbell1996', 'neff2003', 'treynor2003'],
  },
  thin: {
    title: 'There is not enough here yet for a picture, and that is the honest answer',
    lead: 'Too much was left unanswered for us to say anything about the shape of how you see yourself. Everything below is still true and still yours. Adding the sections you skipped would change what we can say.',
    sources: ['campbell1996'],
  },
}
