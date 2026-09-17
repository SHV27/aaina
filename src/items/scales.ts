import type { ItemFormat } from '../engine/types'

/**
 * Response scales.
 *
 * Every label is a thing a person would actually say. "Somewhat agree" is survey language and it
 * makes people answer like respondents instead of like themselves — which flattens exactly the
 * variance we need. Anchors are concrete and slightly conversational on purpose.
 */

export interface Scale {
  id: string
  labels: string[]
  /** Value of the lowest option. Scores are POMP'd, so only the span matters. */
  min: number
  max: number
}

export const AGREE5: Scale = {
  id: 'agree5',
  labels: ['Not at all true', 'A little true', 'Somewhat true', 'Mostly true', 'Completely true'],
  min: 1,
  max: 5,
}

export const FREQ5: Scale = {
  id: 'freq5',
  labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always'],
  min: 1,
  max: 5,
}

export const RECENT5: Scale = {
  id: 'recent5',
  labels: ['Not once', 'Once or twice', 'Every few weeks', 'Most weeks', 'Most days'],
  min: 1,
  max: 5,
}

export const AMOUNT5: Scale = {
  id: 'amount5',
  labels: ['None of it', 'A little', 'Some', 'A lot', 'All of it'],
  min: 1,
  max: 5,
}

export const SIDES5: Scale = {
  id: 'sides5',
  labels: ['Definitely no', 'Probably no', "Genuinely don't know", 'Probably yes', 'Definitely yes'],
  min: 1,
  max: 5,
}

export const CLOSE7: Scale = {
  id: 'close7',
  labels: ['Barely touching', 'Slight overlap', 'Some overlap', 'Half and half', 'Mostly merged', 'Almost one', 'One and the same'],
  min: 1,
  max: 7,
}

export const SCALES: Record<string, Scale> = Object.fromEntries(
  [AGREE5, FREQ5, RECENT5, AMOUNT5, SIDES5, CLOSE7].map((s) => [s.id, s]),
)

/** Which scale an item uses, by format + an explicit override on the item. */
export const DEFAULT_SCALE: Record<Extract<ItemFormat, 'likert5' | 'likert7'>, Scale> = {
  likert5: AGREE5,
  likert7: CLOSE7,
}
