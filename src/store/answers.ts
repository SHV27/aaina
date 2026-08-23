import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Answer } from "../engine/types";

/** THE single source of responses (persisted). Safety answers NEVER live here —
 *  they belong to safetyStore (memory only, ./safety.ts). */

interface AnswersState {
  answers: Record<string, Answer>;
  storageBlocked: boolean;
  record: (answer: Answer) => void;
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
      storageBlocked: memoryFallbackUsed,
      record: (answer) =>
        set((s) => ({ answers: { ...s.answers, [answer.itemId]: answer } })),
      clearAll: () => set({ answers: {} }),
    }),
    { name: "aaina-answers", storage, version: 1 },
  ),
);
