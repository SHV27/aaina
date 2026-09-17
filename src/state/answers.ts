import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Answer, AnswerMap, Context, ChapterId, Lens, Stage, HelpMode } from '../engine/types'
import { suggestedHelp } from '../items/concern'

/**
 * The answer store — the only source of what the person said.
 *
 * Persisted to THIS BROWSER's localStorage and nowhere else. There is no server that receives
 * content, no account, no database. Someone can close the tab mid-assessment and come back; they
 * can also erase everything with one control, and closing the browser on a public machine is not
 * a trap we set for them.
 *
 * Process telemetry (dwell, revisions, order) is captured here because it is evidence: "you
 * changed this answer three times — the only one of fifty-eight you changed more than once" is a
 * sentence that cannot be transplanted to another person by construction.
 */

interface AnswersState {
  context: Context
  answers: AnswerMap
  skipped: string[]
  startedAt: number
  finishedAt: number
  chapterDone: ChapterId[]
  jhalakDone: boolean
  /** Set true once the reader has been shown the privacy statement. */
  understood: boolean
  storageWorks: boolean

  setLens: (lens: Lens) => void
  setStage: (stage: Stage) => void
  setHelp: (help: HelpMode[]) => void
  setContextField: <K extends keyof Context>(k: K, v: Context[K]) => void
  answer: (itemId: string, value: number | string, dwellMs: number) => void
  skip: (itemId: string) => void
  unskip: (itemId: string) => void
  completeChapter: (c: ChapterId) => void
  finish: () => void
  setUnderstood: (v: boolean) => void
  eraseEverything: () => void
  hydrate: (answers: AnswerMap, context: Context) => void
}

export const EMPTY_CONTEXT: Context = {
  lens: 'relationship',
  voice: 'solo',
  stage: 'dating',
  help: ['understand'],
  durationBucket: null,
  familyInPlay: true,
  ageBand: null,
}

/** localStorage throws in private mode and in some in-app browsers. Never let that crash a page. */
function safeStorage() {
  return createJSONStorage(() => {
    try {
      const probe = '__aaina__'
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

export function localStorageWorks(): boolean {
  try {
    const probe = '__aaina_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export const useAnswers = create<AnswersState>()(
  persist(
    (set) => ({
      context: EMPTY_CONTEXT,
      answers: {},
      skipped: [],
      startedAt: 0,
      finishedAt: 0,
      chapterDone: [],
      jhalakDone: false,
      understood: false,
      storageWorks: true,

      setLens: (lens) => set((s) => ({ context: { ...s.context, lens } })),
      setStage: (stage) =>
        set((s) => ({
          context: {
            ...s.context,
            stage,
            // one-sided and "a rishta is on the table" have no shared duration to speak of
            durationBucket: stage === 'arranged-considering' ? null : s.context.durationBucket,
            /* Suggest the shape of help their situation usually calls for. They are asked
               directly a few screens later and whatever they choose wins — this only means
               nobody starts from a blank. */
            help: suggestedHelp(stage),
          },
        })),

      setHelp: (help) => set((s) => ({ context: { ...s.context, help: help.length ? help : ['understand'] } })),
      setContextField: (k, v) => set((s) => ({ context: { ...s.context, [k]: v } })),

      answer: (itemId, value, dwellMs) =>
        set((s) => {
          const prev = s.answers[itemId]
          const changed = prev !== undefined && prev.value !== value
          const next: Answer = {
            itemId,
            value,
            revisions: (prev?.revisions ?? 0) + (changed ? 1 : 0),
            // keep the FIRST commit's dwell: how long they took before deciding the first time
            dwellMs: prev?.dwellMs ?? dwellMs,
            order: prev?.order ?? Object.keys(s.answers).length,
          }
          return {
            answers: { ...s.answers, [itemId]: next },
            skipped: s.skipped.filter((x) => x !== itemId),
            startedAt: s.startedAt || Date.now(),
          }
        }),

      skip: (itemId) =>
        set((s) => (s.skipped.includes(itemId) ? s : { skipped: [...s.skipped, itemId] })),
      unskip: (itemId) => set((s) => ({ skipped: s.skipped.filter((x) => x !== itemId) })),

      completeChapter: (c) =>
        set((s) => ({
          chapterDone: s.chapterDone.includes(c) ? s.chapterDone : [...s.chapterDone, c],
          jhalakDone: c === 'jhalak' ? true : s.jhalakDone,
        })),

      finish: () => set({ finishedAt: Date.now() }),
      setUnderstood: (v) => set({ understood: v }),

      eraseEverything: () => {
        try {
          window.localStorage.removeItem('aaina-v3')
        } catch { /* nothing to erase */ }
        set({
          context: EMPTY_CONTEXT,
          answers: {},
          skipped: [],
          startedAt: 0,
          finishedAt: 0,
          chapterDone: [],
          jhalakDone: false,
        })
      },

      hydrate: (answers, context) =>
        set({ answers, context, startedAt: Date.now(), jhalakDone: true }),
    }),
    {
      name: 'aaina-v3',
      version: 3,
      storage: safeStorage(),
      // `storageWorks` is a runtime fact about this browser, never a persisted one.
      partialize: (s) => ({
        context: s.context,
        answers: s.answers,
        skipped: s.skipped,
        startedAt: s.startedAt,
        finishedAt: s.finishedAt,
        chapterDone: s.chapterDone,
        jhalakDone: s.jhalakDone,
        understood: s.understood,
      }),
    },
  ),
)

/** How much of the bank they have answered. Used for chapter dots — never a global progress bar. */
export function answeredCount(): number {
  return Object.keys(useAnswers.getState().answers).length
}
