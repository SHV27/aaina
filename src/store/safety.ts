import { create } from "zustand";
import type { Answer } from "../engine/types";

/** SAFETY DATA IS RADIOACTIVE.
 *  Memory only — deliberately NO persist middleware, NO codec wiring, NO narrator
 *  payload path. This store must never gain a serialization surface; the Referee
 *  suite asserts localStorage never contains these item ids. */

interface SafetyState {
  answers: Record<string, Answer>;
  record: (answer: Answer) => void;
  wipe: () => void;
}

export const useSafetyStore = create<SafetyState>()((set) => ({
  answers: {},
  record: (answer) =>
    set((s) => ({ answers: { ...s.answers, [answer.itemId]: answer } })),
  wipe: () => set({ answers: {} }),
}));
