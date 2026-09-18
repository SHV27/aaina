import type { Item, Stage } from '../engine/types'

/**
 * Context and the Jhalak (झलक — a glimpse).
 *
 * The Jhalak exists because 67% of survey abandonment is front-loaded and the drop-off cliff at
 * roughly question 15 is a COMMITMENT threshold, not fatigue. So the first two minutes must pay
 * out something true before asking for anything more. These are therefore not warm-up questions —
 * they are the highest-information items we have, chosen so that seven answers can already
 * produce a real, specific, non-transplantable reading.
 */

export const STAGE_OPTIONS: { value: Stage; label: string; gloss: string }[] = [
  { value: 'talking', label: 'Talking, but undefined', gloss: 'Something is happening. Nobody has named it.' },
  { value: 'one-sided', label: 'I feel it, they may not', gloss: 'One-sided, unspoken, or waiting for something to change.' },
  { value: 'dating', label: 'Together', gloss: 'In a relationship, not engaged or married.' },
  { value: 'long-distance', label: 'Together, but far apart', gloss: 'Different cities, countries, or schedules.' },
  { value: 'arranged-considering', label: 'A rishta is on the table', gloss: 'You have met once or a few times and a yes or no is being asked of you.' },
  { value: 'engaged', label: 'Engaged', gloss: 'A wedding is planned or being planned.' },
  { value: 'married', label: 'Married', gloss: 'However it began.' },
  { value: 'separated', label: 'Separated, not finished', gloss: 'Living apart, or on a break, with nothing resolved.' },
  { value: 'divorced', label: 'Divorced', gloss: 'Legally over.' },
  { value: 'ended', label: 'It ended', gloss: 'Recently or a while ago. Still carrying it.' },
]

export const CONTEXT_ITEMS: Item[] = [
  {
    id: 'ctx_stage',
    text: 'Where is this, right now?',
    format: 'choice',
    dimension: null,
    reverse: false,
    sources: ['joel2018'],
    licence: 'aaina-authored',
    chapter: 'jhalak',
    options: STAGE_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
  },
  {
    id: 'ctx_duration',
    text: 'How long has this been going on?',
    format: 'choice',
    dimension: null,
    reverse: false,
    sources: ['rusbult1998'],
    licence: 'aaina-authored',
    chapter: 'story',
    options: [
      { value: '<6m', label: 'Less than six months' },
      { value: '6m-2y', label: 'Six months to two years' },
      { value: '2-5y', label: 'Two to five years' },
      { value: '5-10y', label: 'Five to ten years' },
      { value: '10y+', label: 'More than ten years' },
    ],
  },
  {
    id: 'ctx_family',
    text: 'Are families part of this — approving, objecting, waiting, or pushing?',
    format: 'choice',
    dimension: null,
    reverse: false,
    sources: ['sprecher1992'],
    licence: 'aaina-authored',
    chapter: 'story',
    options: [
      { value: 'yes', label: 'Yes, very much' },
      { value: 'somewhat', label: 'In the background' },
      { value: 'no', label: 'Not really' },
    ],
  },
  {
    id: 'ctx_age',
    text: 'Roughly how old are you? This changes what the research applies, nothing else.',
    format: 'choice',
    dimension: null,
    reverse: false,
    sources: ['joel2020'],
    licence: 'aaina-authored',
    chapter: 'story',
    options: [
      { value: '18-21', label: '18–21' },
      { value: '22-25', label: '22–25' },
      { value: '26-30', label: '26–30' },
      { value: '31-40', label: '31–40' },
      { value: '40+', label: 'Over 40' },
    ],
  },
]

/**
 * The seven Jhalak items, in order. Chosen to span PULL and HOLD so that even at two minutes the
 * engine can find the tension between them — which is the product's whole thesis in miniature.
 * Six scored items plus the user's own words, because no reading Aaina produces is allowed to be
 * without them.
 */
export const JHALAK_ORDER = [
  'ctx_stage',
  'sat_1',      // pull: does it feel good
  'amb_1',      // the doubt, asked early and directly
  'cons_3',     // hold: the villain belief
  'alt_1',      // hold: would you be okay
  'pcom_2',     // asymmetry: who is holding on harder
  'txt_why',    // their own words
] as const

/**
 * The self lens gets its own seven.
 *
 * Caught by walking the app: somebody who chose "Know thyself" was being asked "Where is this,
 * right now?" about a relationship, then five more relationship questions. The self door led
 * straight into the other half of the product. These seven are the highest-information self items
 * — the gap between self-knowledge and self-treatment, and the two that generate the first
 * contradiction — so a two-minute glimpse can still find something true.
 */
export const JHALAK_SELF_ORDER = [
  'scc_1',      // do you know what you are like
  'scc_2',      // does that change depending on who you are with
  'cbs_2',      // do you have to earn being loved
  'sco_2',      // are you harder on yourself than anyone else
  'rum_3',      // can you put it down
  'aut_2',      // is this a life someone else designed
  'txt_why',    // their own words
] as const
