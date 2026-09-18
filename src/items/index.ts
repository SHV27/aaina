import type { Item, Context, ChapterId, Lens } from '../engine/types'
import { CONTEXT_ITEMS, JHALAK_ORDER, JHALAK_SELF_ORDER } from './context'
import { CONCERN_ITEMS } from './concern'
import { RELATIONSHIP_ITEMS } from './relationship'
import { SPINE_ITEMS, SELF_ITEMS, VALUES_ITEMS, FUTURE_ITEMS } from './self'
import { SAFETY_ITEMS } from './safety'

export * from './scales'
export { STAGE_OPTIONS, JHALAK_ORDER, JHALAK_SELF_ORDER } from './context'
export { CONCERN_ITEMS, suggestedHelp, HELP_BY_ID } from './concern'
export { VALUE_OPTIONS } from './self'
export { SAFETY_ITEMS, SAFETY_PREAMBLE, AMBIENT_SUPPORT } from './safety'

/** Every non-safety item in the bank. Safety items are kept separate by construction. */
export const ALL_ITEMS: Item[] = [
  ...CONTEXT_ITEMS,
  ...CONCERN_ITEMS,
  ...VALUES_ITEMS,
  ...RELATIONSHIP_ITEMS,
  ...SPINE_ITEMS,
  ...SELF_ITEMS,
  ...FUTURE_ITEMS,
]

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(
  [...ALL_ITEMS, ...SAFETY_ITEMS].map((i) => [i.id, i]),
)

/** Which seven open the door, by which door they came through. */
export function jhalakFor(lens: Lens): readonly string[] {
  return lens === 'self' ? JHALAK_SELF_ORDER : JHALAK_ORDER
}

export function item(id: string): Item {
  const i = ITEM_BY_ID[id]
  if (!i) throw new Error(`Unknown item id: ${id}`)
  return i
}

/**
 * The chapter running order.
 *
 * GROUND → DESTABILISE → INSIGHT → RECONSTRUCT → COMMIT. Values first and non-skippable:
 * self-affirmation before threatening information measurably reduces defensive distortion
 * (Steele 1988; Cohen & Sherman 2014). Workshops run the other way round and get away with it
 * only because a facilitator is there to catch you. Nobody is here to catch anyone, so we build
 * the harness first.
 */
export const CHAPTER_ORDER: Record<Lens, ChapterId[]> = {
  relationship: ['jhalak', 'concern', 'ground', 'story', 'you', 'between', 'holding', 'safety'],
  self: ['jhalak', 'concern', 'ground', 'story', 'you', 'patterns', 'future', 'safety'],
}

export const CHAPTER_META: Record<ChapterId, { title: string; hindi?: string; blurb: string; minutes: number }> = {
  jhalak: { title: 'A glimpse', hindi: 'झलक', blurb: 'Seven questions. Then something true, before you decide whether to go further.', minutes: 2 },
  concern: { title: 'What brought you here', blurb: 'In your own words, with room to actually say it — and what kind of help would help.', minutes: 8 },
  ground: { title: 'What you stand on', blurb: 'What you actually value, in your own words. This comes first on purpose.', minutes: 7 },
  story: { title: 'Your situation', blurb: 'The shape of it, and the parts only you can tell us.', minutes: 6 },
  you: { title: 'You', blurb: 'How you attach, how you handle hard feeling, how life is going apart from this.', minutes: 8 },
  between: { title: 'Between you', blurb: 'The relationship itself — closely, on the things the research says actually matter.', minutes: 12 },
  holding: { title: 'What holds you', blurb: 'What would make leaving hard. This is the chapter most people have never been asked.', minutes: 9 },
  patterns: { title: 'Your patterns', blurb: 'The beliefs underneath the behaviour, and where they came from.', minutes: 12 },
  future: { title: 'Who you are becoming', blurb: 'The person on the other side of this, and the distance to them.', minutes: 7 },
  safety: { title: 'Everyone sees this page', blurb: 'The same questions for every person who uses Aaina.', minutes: 3 },
}

/** Items for one chapter, gated by context. Order within a chapter is bank order — deliberate. */
export function itemsForChapter(chapter: ChapterId, ctx: Context): Item[] {
  if (chapter === 'safety') return SAFETY_ITEMS
  if (chapter === 'jhalak') {
    return jhalakFor(ctx.lens).map((id) => item(id))
  }
  return ALL_ITEMS.filter((i) => {
    if (i.chapter !== chapter) return false
    if ((jhalakFor(ctx.lens) as readonly string[]).includes(i.id)) return false
    if (i.dimension) {
      // A dimension belonging to the other lens is not asked at all.
      const lensOk = lensOfItem(i) === ctx.lens || lensOfItem(i) === 'both'
      if (!lensOk) return false
    }
    return i.showWhen ? i.showWhen(ctx) : true
  })
}

import { DIM_BY_ID } from '../engine/dimensions'

function lensOfItem(i: Item): Lens | 'both' {
  if (!i.dimension) return 'both'
  return DIM_BY_ID[i.dimension].lens
}

/** Every item the user will actually be shown, in running order, for this context. */
export function runningOrder(ctx: Context): { chapter: ChapterId; items: Item[] }[] {
  return CHAPTER_ORDER[ctx.lens]
    .map((chapter) => ({ chapter, items: itemsForChapter(chapter, ctx) }))
    .filter((c) => c.items.length > 0)
}

export function totalItems(ctx: Context): number {
  return runningOrder(ctx).reduce((n, c) => n + c.items.length, 0)
}

export function estimatedMinutes(ctx: Context): number {
  return runningOrder(ctx).reduce((n, c) => n + CHAPTER_META[c.chapter].minutes, 0)
}
