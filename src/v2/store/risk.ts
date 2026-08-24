import { create } from "zustand";
import type { Response } from "../engine/types";

/** RISK SCREEN — memory only, by construction.
 *
 *  No persist middleware. No path into the evidence bundle. No serialization
 *  anywhere in the codebase. Closing the tab erases it. This is enforced by the
 *  absence of code rather than by a rule someone has to remember, and the
 *  Referee suite asserts these ids never appear in storage or in any payload. */

interface RiskState {
  responses: Record<string, Response>;
  completed: boolean;
  declined: boolean;
  answer: (r: Response) => void;
  markCompleted: () => void;
  decline: () => void;
  wipe: () => void;
}

export const useRisk = create<RiskState>()((set) => ({
  responses: {},
  completed: false,
  declined: false,
  answer: (r) => set((s) => ({ responses: { ...s.responses, [r.itemId]: r } })),
  markCompleted: () => set({ completed: true }),
  decline: () => set({ declined: true, responses: {} }),
  wipe: () => set({ responses: {}, completed: false, declined: false }),
}));
