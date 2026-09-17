import type { AnswerMap, DimensionId, Scored, Item, Lens } from './types'
import { DIM_BY_ID, dimensionsFor, bandOf } from './dimensions'
import { ITEM_BY_ID } from '../items'
import { SCALES, AGREE5, CLOSE7 } from '../items/scales'

/**
 * Scoring.
 *
 * Every percentage Aaina shows is a POMP score (Cohen et al. 1999): the percentage of the maximum
 * possible, i.e. literally how far up the scale the person answered. It is not a percentile, not a
 * norm, and not a prediction — so it needs no reference sample to be true, and the user can open
 * the answers and check it. That is the whole reason we can give the founder his percentages
 * honestly when a match score would have been a lie.
 *
 * DIRECTION IS ENCODED IN EXACTLY ONE PLACE: `item.reverse`. A previous build encoded it on both
 * the item and the dimension; the two cancelled and a badly-answered profile scored 82/100.
 * `score.test.ts` therefore asserts direction from the MEANING of named items, not from the
 * machinery — a self-consistent test cannot catch a double flip.
 */

export function scaleFor(i: Item) {
  if (i.format === 'likert7') return CLOSE7
  if (i.format === 'likert5') return AGREE5
  return SCALES[AGREE5.id]!
}

/** One item's answer as 0–100, already pointing in the dimension's direction. */
export function itemPomp(itemId: string, raw: number): number {
  const i = ITEM_BY_ID[itemId]
  if (!i) throw new Error(`Unknown item id: ${itemId}`)
  const scale = scaleFor(i)
  const span = scale.max - scale.min
  if (span <= 0) return 0
  const clamped = Math.min(scale.max, Math.max(scale.min, raw))
  const p = ((clamped - scale.min) / span) * 100
  return i.reverse ? 100 - p : p
}

/** Below this many answered items a dimension is shown but kept out of the composite. */
export const MIN_ITEMS_FOR_COMPOSITE = 3

export function scoreDimension(id: DimensionId, answers: AnswerMap): Scored | null {
  const itemIds = Object.values(ITEM_BY_ID)
    .filter((i) => i.dimension === id)
    .map((i) => i.id)

  const answered = itemIds.filter((iid) => {
    const a = answers[iid]
    return a !== undefined && typeof a.value === 'number'
  })

  if (answered.length === 0) return null

  const pomps = answered.map((iid) => itemPomp(iid, answers[iid]!.value as number))
  const pomp = Math.round(pomps.reduce((a, b) => a + b, 0) / pomps.length)

  return {
    id,
    pomp,
    band: bandOf(pomp),
    itemIds: answered,
    answered: answered.length,
    thin: answered.length < MIN_ITEMS_FOR_COMPOSITE,
  }
}

export function scoreAll(answers: AnswerMap, lens: Lens): Scored[] {
  return dimensionsFor(lens)
    .map((d) => scoreDimension(d.id, answers))
    .filter((s): s is Scored => s !== null)
}

/**
 * The composite: "where this stands today".
 *
 * A weighted mean of the quality dimensions, using weights DERIVED in dimensions.ts from published
 * effect sizes — never tuned here. Dimensions where higher is worse are inverted first so that the
 * composite always points the same way. Thin dimensions are excluded and reduce `confidence`
 * rather than silently dragging the number.
 *
 * LAW 3: the bar chart IS this number. `contributions()` exists so the UI can show every part.
 */
export interface Composite {
  value: number
  confidence: number
  contributions: { id: DimensionId; weight: number; pomp: number; oriented: number; share: number }[]
  excluded: DimensionId[]
}

export function composite(scored: Scored[]): Composite {
  const usable = scored.filter((s) => !s.thin && DIM_BY_ID[s.id].compositeWeight > 0)
  const excluded = scored.filter((s) => s.thin && DIM_BY_ID[s.id].compositeWeight > 0).map((s) => s.id)

  if (usable.length === 0) {
    return { value: 0, confidence: 0, contributions: [], excluded }
  }

  const rows = usable.map((s) => {
    const d = DIM_BY_ID[s.id]
    // Orient every dimension so that higher always means "better for this relationship".
    const oriented = d.higherIsBetter ? s.pomp : 100 - s.pomp
    return { id: s.id, weight: d.compositeWeight, pomp: s.pomp, oriented }
  })

  const totalWeight = rows.reduce((a, r) => a + r.weight, 0)
  const value = Math.round(rows.reduce((a, r) => a + r.oriented * r.weight, 0) / totalWeight)

  const contributions = rows
    .map((r) => ({ ...r, share: Number(((r.weight / totalWeight) * 100).toFixed(1)) }))
    .sort((a, b) => b.share - a.share)

  // Confidence = share of the available published weight that we actually measured well.
  const allWeight = dimensionsFor(scored[0] ? DIM_BY_ID[scored[0].id].lens === 'self' ? 'self' : 'relationship' : 'relationship')
    .reduce((a, d) => a + d.compositeWeight, 0)
  const confidence = Math.min(1, Number((totalWeight / Math.max(totalWeight, allWeight)).toFixed(2)))

  return { value, confidence, contributions, excluded }
}

/**
 * Within-profile (ipsative) rarity. Zero norms needed, entirely honest, and rare by construction:
 * "your largest gap anywhere in this profile" is a fact about THIS person's shape, and it cannot
 * be transplanted to anyone else. Lane H ranked this above any normative claim, and we have no
 * Indian norms for these constructs, so this is what we ship.
 */
export function profileShape(scored: Scored[]): {
  mean: number
  spread: number
  highest: Scored | null
  lowest: Scored | null
  /** |z| within the person's own profile — how much a dimension stands out FOR THEM. */
  standouts: { id: DimensionId; z: number; pomp: number }[]
} {
  const usable = scored.filter((s) => !s.thin)
  if (usable.length < 3) {
    return { mean: 0, spread: 0, highest: null, lowest: null, standouts: [] }
  }
  const vals = usable.map((s) => (DIM_BY_ID[s.id].higherIsBetter ? s.pomp : 100 - s.pomp))
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length
  const spread = Math.sqrt(variance)

  const withZ = usable.map((s, idx) => ({
    id: s.id,
    pomp: s.pomp,
    z: spread === 0 ? 0 : Number(((vals[idx]! - mean) / spread).toFixed(2)),
  }))

  const sortedByOriented = [...usable].sort((a, b) => {
    const av = DIM_BY_ID[a.id].higherIsBetter ? a.pomp : 100 - a.pomp
    const bv = DIM_BY_ID[b.id].higherIsBetter ? b.pomp : 100 - b.pomp
    return bv - av
  })

  return {
    mean: Math.round(mean),
    spread: Number(spread.toFixed(1)),
    highest: sortedByOriented[0] ?? null,
    lowest: sortedByOriented[sortedByOriented.length - 1] ?? null,
    standouts: withZ.filter((s) => Math.abs(s.z) >= 1).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)),
  }
}
