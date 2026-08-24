import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Response } from "../engine/types";
import { ITEMS } from "../engine/items";

/** THE state authority for the assessment. One store, one source of answers.
 *  Risk-screen answers do NOT live here — see riskStore, which has no persistence
 *  and no path into the evidence bundle. */

export interface Context {
  /** Is there a specific person this is about? Solo users are first-class. */
  hasPartner: boolean;
  /** Would the partner realistically do the exercises? Gates conjoint activities. */
  partnerWilling: boolean;
  /** Age band — used only to choose examples, never scored. */
  ageBand: "under-22" | "22-29" | "30-39" | "40-plus" | "unsaid";
  /** Relationship stage, used for framing. */
  stage: "dating" | "situationship" | "committed" | "engaged-arranged" | "married" | "ending" | "unsaid";
}

interface SessionState {
  responses: Record<string, Response>;
  skipped: string[];
  context: Context;
  startedAt: number | null;
  storageBlocked: boolean;
  setContext: (patch: Partial<Context>) => void;
  answer: (r: Response) => void;
  skip: (itemId: string) => void;
  reset: () => void;
}

let memoryFallback = false;
const storage = (() => {
  try {
    const k = "__aaina2__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return createJSONStorage(() => localStorage);
  } catch {
    memoryFallback = true;
    const mem = new Map<string, string>();
    return createJSONStorage(() => ({
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    }));
  }
})();

const DEFAULT_CONTEXT: Context = {
  hasPartner: true,
  partnerWilling: false,
  ageBand: "unsaid",
  stage: "unsaid",
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      responses: {},
      skipped: [],
      context: DEFAULT_CONTEXT,
      startedAt: null,
      storageBlocked: memoryFallback,
      setContext: (patch) => set((s) => ({ context: { ...s.context, ...patch } })),
      answer: (r) =>
        set((s) => ({
          responses: { ...s.responses, [r.itemId]: r },
          skipped: s.skipped.filter((id) => id !== r.itemId),
          startedAt: s.startedAt ?? Date.now(),
        })),
      skip: (itemId) =>
        set((s) =>
          s.skipped.includes(itemId) || s.responses[itemId]
            ? s
            : { skipped: [...s.skipped, itemId] },
        ),
      reset: () => set({ responses: {}, skipped: [], startedAt: null, context: DEFAULT_CONTEXT }),
    }),
    { name: "aaina-v2-session", storage, version: 1 },
  ),
);

/* --------------------------- derived flow position ------------------------- */

/** Items that apply given the user's context. Someone with no specific partner
 *  in mind is not asked to rate that partner's phone habits. */
export function applicableItems(context: Context) {
  return ITEMS.filter((i) => (i.requiresPartner ? context.hasPartner : true));
}

export function nextItemId(
  responses: Record<string, Response>,
  skipped: string[],
  context: Context,
): string | null {
  const done = new Set([...Object.keys(responses), ...skipped]);
  const next = applicableItems(context).find((i) => !done.has(i.id));
  return next?.id ?? null;
}

export function progress(
  responses: Record<string, Response>,
  skipped: string[],
  context: Context,
) {
  const items = applicableItems(context);
  const done = new Set([...Object.keys(responses), ...skipped]);
  const answered = items.filter((i) => done.has(i.id)).length;
  return { answered, total: items.length, ratio: items.length ? answered / items.length : 0 };
}

export function responseList(responses: Record<string, Response>): Response[] {
  return Object.values(responses);
}
