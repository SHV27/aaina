import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Answer } from "../engine/types";
import { CHAPTERS } from "../engine/items";

/** THE single source of responses (persisted). Safety answers NEVER live here —
 *  they belong to safetyStore (memory only, ./safety.ts). */

interface AnswersState {
  answers: Record<string, Answer>;
  /** Items deliberately skipped (counted in the quality meter, never hidden). */
  skippedIds: string[];
  storageBlocked: boolean;
  record: (answer: Answer) => void;
  skip: (itemId: string) => void;
  clearAll: () => void;
}

let memoryFallbackUsed = false;

const storage = (() => {
  try {
    const t = "__aaina_probe__";
    localStorage.setItem(t, "1");
    localStorage.removeItem(t);
    return createJSONStorage(() => localStorage);
  } catch {
    memoryFallbackUsed = true;
    const mem = new Map<string, string>();
    return createJSONStorage(() => ({
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    }));
  }
})();

export const useAnswersStore = create<AnswersState>()(
  persist(
    (set) => ({
      answers: {},
      skippedIds: [],
      storageBlocked: memoryFallbackUsed,
      record: (answer) =>
        set((s) => ({
          answers: { ...s.answers, [answer.itemId]: answer },
          skippedIds: s.skippedIds.filter((id) => id !== answer.itemId),
        })),
      skip: (itemId) =>
        set((s) =>
          s.skippedIds.includes(itemId) || s.answers[itemId]
            ? s
            : { skippedIds: [...s.skippedIds, itemId] },
        ),
      clearAll: () => set({ answers: {}, skippedIds: [] }),
    }),
    { name: "aaina-answers", storage, version: 1 },
  ),
);

/* ---------------- Flow selectors (derived, single authority) ---------------- */

export interface FlowPosition {
  /** Index into CHAPTERS of the first incomplete chapter, or CHAPTERS.length when all done. */
  chapterIndex: number;
  /** The next unanswered, unskipped item id in that chapter (null when chapter done). */
  itemId: string | null;
}

export function derivePosition(
  answers: Record<string, Answer>,
  skippedIds: string[],
): FlowPosition {
  const skipped = new Set(skippedIds);
  for (let c = 0; c < CHAPTERS.length; c++) {
    for (const item of CHAPTERS[c].items) {
      if (!answers[item.id] && !skipped.has(item.id)) {
        return { chapterIndex: c, itemId: item.id };
      }
    }
  }
  return { chapterIndex: CHAPTERS.length, itemId: null };
}

export function chapterProgress(
  chapterIndex: number,
  answers: Record<string, Answer>,
  skippedIds: string[],
): { done: number; total: number } {
  const ch = CHAPTERS[chapterIndex];
  const skipped = new Set(skippedIds);
  const done = ch.items.filter((i) => answers[i.id] || skipped.has(i.id)).length;
  return { done, total: ch.items.length };
}
