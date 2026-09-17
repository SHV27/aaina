/**
 * The dimensions, and the published numbers that set their weight.
 *
 * LAW 3 — the form is the promise. The composite is not a tuned dial. Every weight is DERIVED
 * here, in the open, from two published sources, and `dimensions.test.ts` asserts the derivation
 * rather than the result. If you disagree with a weight, you disagree with Joel 2020 or Le 2010,
 * not with us.
 */

import type { Dimension, DimensionId, Band } from './types'

/**
 * Published inputs to the weighting. Nothing else may influence a weight.
 *
 * `joel` — success rate of the construct in Joel et al. 2020 (PNAS), the proportion of
 *          machine-learning models in which the predictor carried non-trivial weight for
 *          relationship quality. Higher = more robust across 43 longitudinal studies.
 * `absD` — |Cohen's d| for association with relationship dissolution from Le et al. 2010's
 *          meta-analytic synthesis. Higher = more strongly tied to whether relationships end.
 *
 * A dimension enters the composite only if at least one published number exists for it.
 */
const PUBLISHED: Partial<Record<DimensionId, { joel?: number; absD?: number }>> = {
  satisfaction:       { joel: 0.86, absD: 0.52 },
  partnerCommitment:  { joel: 0.85 },
  ownDedication:      { absD: 0.80 },
  appreciation:       { joel: 0.72 },
  sexualSatisfaction: { joel: 0.71 },
  responsiveness:     { joel: 0.69 },
  conflict:           { joel: 0.69, absD: 0.16 },
  trust:              { joel: 0.68, absD: 0.64 },
  ambivalence:        { absD: 0.67 },
  closeness:          { joel: 0.47, absD: 0.70 },
  familyApproval:     { joel: 0.40 },
  growth:             { joel: 0.38 },
  // Individual-level predictors. Joel 2020 ranked life satisfaction the strongest of these.
  lifeSatisfaction:   { joel: 0.88 },
  attachAnxiety:      { joel: 0.61 },
  attachAvoidance:    { joel: 0.58 },
  // Deliberately weightless in the composite: they explain the verdict, they do not score it.
  constraint:         {},
  alternatives:       {},
}

const MAX_JOEL = 0.88
const MAX_D = 0.80

/**
 * weight = mean of the available normalised published signals.
 * Both signals present → their average. One present → that one. Neither → 0 (reported, not scored).
 */
export function deriveWeight(id: DimensionId): number {
  const p = PUBLISHED[id]
  if (!p) return 0
  const parts: number[] = []
  if (p.joel !== undefined) parts.push(p.joel / MAX_JOEL)
  if (p.absD !== undefined) parts.push(p.absD / MAX_D)
  if (parts.length === 0) return 0
  return Number((parts.reduce((a, b) => a + b, 0) / parts.length).toFixed(4))
}

/** Exposed so the UI can show the user exactly where a weight came from. */
export function weightProvenance(id: DimensionId): { joel?: number; absD?: number } | null {
  return PUBLISHED[id] ?? null
}

const D = (d: Omit<Dimension, 'compositeWeight'>): Dimension => ({
  ...d,
  compositeWeight: deriveWeight(d.id),
})

export const DIMENSIONS: Dimension[] = [
  /* ───────── the relationship lens ───────── */
  D({
    id: 'satisfaction',
    label: 'How good it feels right now',
    meaning: 'How satisfying, warm and rewarding this relationship feels to you at the moment — not how it was, and not how it will be.',
    lens: 'relationship',
    sources: ['funk2007', 'joel2020'],
    higherIsBetter: true,
    cutoff: { at: 45, meaning: 'Below this point, published work classifies the relationship as notably distressed rather than simply having a rough patch.', source: 'funk2007' },
  }),
  D({
    id: 'partnerCommitment',
    label: 'How committed they seem to you',
    meaning: 'Your read on how invested your partner is in a future with you. This is your perception — which is exactly what the research measures, and exactly what you can answer honestly.',
    lens: 'relationship',
    sources: ['joel2020', 'rusbult1998'],
    higherIsBetter: true,
  }),
  D({
    id: 'ownDedication',
    label: 'How committed you are',
    meaning: 'How much you want this to last, and how much of your future you have built around it.',
    lens: 'relationship',
    sources: ['rusbult1998', 'le2010'],
    higherIsBetter: true,
  }),
  D({
    id: 'appreciation',
    label: 'Feeling appreciated',
    meaning: 'Whether the ordinary things you do get noticed. Small, and one of the strongest signals there is.',
    lens: 'relationship',
    sources: ['algoe2010', 'joel2020'],
    higherIsBetter: true,
  }),
  D({
    id: 'responsiveness',
    label: 'Being understood',
    meaning: 'Whether you feel your partner actually gets you, takes you seriously, and cares about what matters to you.',
    lens: 'relationship',
    sources: ['reis2004', 'joel2020'],
    higherIsBetter: true,
  }),
  D({
    id: 'conflict',
    label: 'How fights go',
    meaning: 'What happens when you disagree — whether it gets resolved, and whether one of you chases while the other shuts down.',
    lens: 'relationship',
    sources: ['christensen1990', 'joel2020'],
    higherIsBetter: false,
  }),
  D({
    id: 'trust',
    label: 'Trust',
    meaning: 'Whether you can predict them, depend on them, and believe they will be there when it costs them something.',
    lens: 'relationship',
    sources: ['rempel1985', 'le2010'],
    higherIsBetter: true,
  }),
  D({
    id: 'ambivalence',
    label: 'Being in two minds',
    meaning: 'How often you find yourself genuinely unsure whether to stay. Doubt is ordinary; its frequency is informative.',
    lens: 'relationship',
    sources: ['joel2018', 'le2010'],
    higherIsBetter: false,
  }),
  D({
    id: 'constraint',
    label: 'What would make leaving hard',
    meaning: 'Everything that would cost you if this ended — time, money, family, shared life, the fear of what people would say. This is not a bad score. It is the thing most often mistaken for love.',
    lens: 'relationship',
    sources: ['rusbult1998', 'rusbult1995'],
    higherIsBetter: false,
  }),
  D({
    id: 'alternatives',
    label: 'Whether you feel you have options',
    meaning: 'How you see your life outside this relationship — not whether someone else exists, but whether you believe you would be alright.',
    lens: 'relationship',
    sources: ['rusbult1998', 'rusbult1995'],
    higherIsBetter: true,
  }),
  D({
    id: 'familyApproval',
    label: 'Where your families stand',
    meaning: 'Whether the people around you are behind this relationship, against it, or silent. In India this is rarely background noise.',
    lens: 'relationship',
    sources: ['sprecher1992', 'sinclair2014'],
    higherIsBetter: true,
  }),
  D({
    id: 'growth',
    label: 'Growing, together or apart',
    meaning: 'Whether being with this person makes you more of who you are trying to become, or less.',
    lens: 'relationship',
    sources: ['aron1986', 'drigotas1999'],
    higherIsBetter: true,
  }),
  D({
    id: 'closeness',
    label: 'Closeness',
    meaning: 'How much your life and theirs have merged into one thing.',
    lens: 'relationship',
    sources: ['aron1992', 'le2010'],
    higherIsBetter: true,
  }),
  D({
    id: 'sexualSatisfaction',
    label: 'Physical closeness',
    meaning: 'Whether the physical side of this feels good to you. Optional — skipping it changes nothing else.',
    lens: 'relationship',
    sources: ['joel2020'],
    higherIsBetter: true,
  }),

  /* ───────── the shared spine: both lenses ───────── */
  D({
    id: 'attachAnxiety',
    label: 'Fear of being left',
    meaning: 'How much of your attention goes to whether you are about to be abandoned. A dimension, not a type.',
    lens: 'both',
    sources: ['wei2007', 'joel2020'],
    higherIsBetter: false,
  }),
  D({
    id: 'attachAvoidance',
    label: 'Distance when it gets close',
    meaning: 'How much you pull back when closeness gets real. A dimension, not a type.',
    lens: 'both',
    sources: ['wei2007', 'joel2020'],
    higherIsBetter: false,
  }),
  D({
    id: 'emotionRegulation',
    label: 'Handling hard feelings',
    meaning: 'What you do with a difficult emotion — whether you can reframe it, or whether you mostly push it down.',
    lens: 'both',
    sources: ['gross2003'],
    higherIsBetter: true,
  }),
  D({
    id: 'lifeSatisfaction',
    label: 'How life is going overall',
    meaning: 'Your life as a whole, separate from this relationship. It matters more than most people expect.',
    lens: 'both',
    sources: ['diener1985', 'topp2015', 'joel2020'],
    higherIsBetter: true,
  }),

  /* ───────── the self lens ───────── */
  D({
    id: 'selfConceptClarity',
    label: 'How clearly you see yourself',
    meaning: 'Whether your sense of who you are is clear and steady, or shifts depending on who you are with.',
    lens: 'self',
    sources: ['campbell1996'],
    higherIsBetter: true,
  }),
  D({
    id: 'selfCompassion',
    label: 'How you treat yourself when you fail',
    meaning: 'Whether you meet your own mistakes with the tone you would use with a friend, or with something much harder.',
    lens: 'self',
    sources: ['neff2003'],
    higherIsBetter: true,
  }),
  D({
    id: 'coreBeliefSelf',
    label: 'What you believe about yourself',
    meaning: 'The beliefs about your own worth that sit underneath everything and rarely get examined out loud.',
    lens: 'self',
    sources: ['kegan2009', 'campbell1996'],
    higherIsBetter: true,
  }),
  D({
    id: 'coreBeliefOther',
    label: 'What you believe about other people',
    meaning: 'Your working assumption about whether people can be relied on. It is usually older than any relationship you are in.',
    lens: 'both',
    sources: ['kegan2009', 'wei2007'],
    higherIsBetter: true,
  }),
  D({
    id: 'rumination',
    label: 'Overthinking',
    meaning: 'How much you replay things that have already happened. Specifically the brooding kind, which is the kind that costs you.',
    lens: 'self',
    sources: ['treynor2003'],
    higherIsBetter: false,
  }),
  D({
    id: 'valuesLived',
    label: 'Living by what you value',
    meaning: 'The distance between what you said matters most to you and where your week actually goes.',
    lens: 'self',
    sources: ['schwartz2012', 'miller2013'],
    higherIsBetter: true,
  }),
  D({
    id: 'futureSelfContinuity',
    label: 'Connection to your future self',
    meaning: 'Whether the person you will be in ten years feels like you, or like a stranger you are vaguely responsible for.',
    lens: 'self',
    sources: ['hershfield2011', 'markus1986'],
    higherIsBetter: true,
  }),
  D({
    id: 'autonomy',
    label: 'Choosing your own life',
    meaning: 'How much of what you do comes from your own reasons rather than from pressure. Note that this is not the same as independence — a person can fully and freely choose what their family wants, and that is a strength rather than submission.',
    lens: 'both',
    sources: ['ryan2000', 'chirkov2003'],
    higherIsBetter: true,
  }),
  D({
    id: 'competence',
    label: 'Feeling capable',
    meaning: 'Whether you feel effective at the things that matter to you.',
    lens: 'self',
    sources: ['ryan2000'],
    higherIsBetter: true,
  }),
  D({
    id: 'relatedness',
    label: 'Feeling connected',
    meaning: 'Whether there are people in your life you feel genuinely close to — beyond the one this is about.',
    lens: 'both',
    sources: ['ryan2000'],
    higherIsBetter: true,
  }),
  D({
    id: 'agency',
    label: 'Belief that you can act',
    meaning: 'Whether you believe your own choices change what happens to you.',
    lens: 'self',
    sources: ['ryan2000', 'kegan2009'],
    higherIsBetter: true,
  }),
]

export const DIM_BY_ID: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimensionId, Dimension>

export function dimensionsFor(lens: 'self' | 'relationship'): Dimension[] {
  return DIMENSIONS.filter((d) => d.lens === lens || d.lens === 'both')
}

/**
 * POMP → band. Bands are how a number becomes a meaning; the number is always shown beside it,
 * so the band never hides anything.
 */
export function bandOf(pomp: number): Band {
  if (pomp < 20) return 'very-low'
  if (pomp < 40) return 'low'
  if (pomp < 60) return 'mixed'
  if (pomp < 80) return 'high'
  return 'very-high'
}

/** Reads a band in the direction the dimension actually points. */
export function bandLabel(id: DimensionId, pomp: number): string {
  const d = DIM_BY_ID[id]
  const b = bandOf(pomp)
  const good = d.higherIsBetter
  const scale: Record<Band, [string, string]> = {
    'very-low': ['a real weak point', 'about as low as this gets, which here is good news'],
    low: ['on the low side', 'low, which here works in your favour'],
    mixed: ['mixed', 'mixed'],
    high: ['strong', 'high, and here that costs you'],
    'very-high': ['one of the strongest things you have', 'very high, and here that is the problem'],
  }
  return good ? scale[b][0] : scale[b][1]
}
