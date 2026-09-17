import { create } from 'zustand'
import type { Answer, AnswerMap } from '../engine/types'

/**
 * The safety store — MEMORY ONLY, BY CONSTRUCTION.
 *
 * Note what is missing from this file: any import of `persist`, any import of `createJSONStorage`,
 * any reference to localStorage. That absence is the guarantee. A store that never imports the
 * persistence middleware cannot be persisted by a later edit without someone deliberately adding
 * the import — and `safety-store.test.ts` reads this file's source and fails if that import ever
 * appears. It is cheaper to make a mistake impossible than to remember not to make it.
 *
 * Why it matters: a person may be answering these questions on a shared phone, on a device someone
 * else checks, or in a browser someone else opens. Nothing here reaches disk, nothing here enters
 * a shared link, and closing the tab erases it completely.
 *
 * What this is NOT: a reason to give them less. LAW 5 — a safety flag may only ever ADD. These
 * answers open depth in the report; they never truncate it, never gate a route, and never swap
 * analysis for a phone number.
 */

interface SafetyState {
  answers: AnswerMap
  /** The reader chose to see this chapter's content in a printed copy. Defaults OFF. */
  includeInPrint: boolean
  seen: boolean

  answer: (itemId: string, value: number | string, dwellMs: number) => void
  clear: () => void
  setIncludeInPrint: (v: boolean) => void
  markSeen: () => void
}

export const useSafety = create<SafetyState>((set) => ({
  answers: {},
  includeInPrint: false,
  seen: false,

  answer: (itemId, value, dwellMs) =>
    set((s) => {
      const prev = s.answers[itemId]
      const changed = prev !== undefined && prev.value !== value
      const next: Answer = {
        itemId,
        value,
        revisions: (prev?.revisions ?? 0) + (changed ? 1 : 0),
        dwellMs: prev?.dwellMs ?? dwellMs,
        order: prev?.order ?? Object.keys(s.answers).length,
      }
      return { answers: { ...s.answers, [itemId]: next } }
    }),

  clear: () => set({ answers: {}, includeInPrint: false }),
  setIncludeInPrint: (v) => set({ includeInPrint: v }),
  markSeen: () => set({ seen: true }),
}))
