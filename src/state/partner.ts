import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AnswerMap } from '../engine/types'

/**
 * The second person's answers, once the first person has accepted them.
 *
 * Kept in its own store rather than folded into the answer store, for one reason that matters:
 * these are somebody else's answers. They are added by a deliberate act, they are removable by a
 * deliberate act, and "erase everything" has to take them with it. Mixing them into the same map
 * as the reader's own answers would make every one of those three things harder to be sure of.
 *
 * Persisted to this browser and nowhere else, exactly like everything else here. There is no
 * server that ever sees them — they arrived in a URL fragment, which is not transmitted in an
 * HTTP request, and they go no further than this device.
 */

interface PartnerState {
  answers: AnswerMap | null
  /** When they were added, so the report can say how fresh the second account is. */
  addedAt: number | null
  set: (answers: AnswerMap) => void
  clear: () => void
}

function safeStorage() {
  return createJSONStorage(() => {
    try {
      const probe = '__aaina_p__'
      window.localStorage.setItem(probe, '1')
      window.localStorage.removeItem(probe)
      return window.localStorage
    } catch {
      const mem = new Map<string, string>()
      return {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => void mem.set(k, v),
        removeItem: (k: string) => void mem.delete(k),
      }
    }
  })
}

export const usePartner = create<PartnerState>()(
  persist(
    (set) => ({
      answers: null,
      addedAt: null,
      set: (answers) => set({ answers, addedAt: Date.now() }),
      clear: () => set({ answers: null, addedAt: null }),
    }),
    { name: 'aaina-partner-v1', storage: safeStorage(), version: 1 },
  ),
)

/** Read once, outside React — used where a component would be the wrong place to re-render. */
export function partnerAnswersNow(): AnswerMap | undefined {
  const a = usePartner.getState().answers
  return a && Object.keys(a).length ? a : undefined
}
