import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Answer } from "../engine/types";

/** Partner's sealed exchange, decoded and held for the gap report.
 *  Contains ONLY assessment answers (safety items are unencodable — codec.ts).
 *  Sealed-commit rule lives in the UI: partner content is never shown before
 *  the reader completes their own mirror. */

interface PartnerState {
  answers: Record<string, Answer> | null;
  from: string | null;
  receivedAt: number | null;
  setPartner: (answers: Record<string, Answer>, from?: string) => void;
  clearPartner: () => void;
}

export const usePartnerStore = create<PartnerState>()(
  persist(
    (set) => ({
      answers: null,
      from: null,
      receivedAt: null,
      setPartner: (answers, from) =>
        set({ answers, from: from ?? null, receivedAt: Date.now() }),
      clearPartner: () => set({ answers: null, from: null, receivedAt: null }),
    }),
    { name: "aaina-partner", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
