import { bundleToPrompt, evidenceIdsOf, type SectionBundle } from "./bundle";
import { verifyClaims, type RawClaim, type VerifiedClaim } from "./contract";
import { findVoiceViolations, looksGeneric } from "./voice";

/** The client half of the composer. Generation is chunked by section because
 *  the free tier's ceiling is per-minute, so the report streams in rather than
 *  arriving at once. Capacity limits produce a wait with a real countdown —
 *  never a quietly worse report. */

export type SectionStatus =
  | { state: "pending" }
  | { state: "writing" }
  | { state: "waiting"; retryAfterSec: number; reason: string }
  | { state: "done"; claims: VerifiedClaim[]; dropped: number }
  | { state: "failed"; message: string };

export interface ComposeOptions {
  signal?: AbortSignal;
  onStatus?: (status: SectionStatus) => void;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  maxAttempts?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function composeSection(
  bundle: SectionBundle,
  opts: ComposeOptions = {},
): Promise<SectionStatus> {
  const doFetch = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? defaultSleep;
  const maxAttempts = opts.maxAttempts ?? 4;
  const validIds = evidenceIdsOf(bundle);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (opts.signal?.aborted) return { state: "failed", message: "cancelled" };
    opts.onStatus?.({ state: "writing" });

    let res: Response;
    try {
      res = await doFetch("/api/compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: opts.signal,
        body: JSON.stringify({
          prompt: bundleToPrompt(bundle),
          evidenceIds: [...validIds],
          section: bundle.section,
        }),
      });
    } catch {
      if (attempt === maxAttempts) {
        return { state: "failed", message: "Could not reach the writing service." };
      }
      await sleep(1200 * attempt);
      continue;
    }

    if (res.status === 429) {
      const body = (await res.json().catch(() => ({}))) as {
        retryAfterSec?: number;
        message?: string;
      };
      const wait = Math.min(90, Math.max(3, body.retryAfterSec ?? 30));
      const status: SectionStatus = {
        state: "waiting",
        retryAfterSec: wait,
        reason:
          body.message ??
          "Aaina is writing someone else's report right now. Yours continues in a moment.",
      };
      opts.onStatus?.(status);
      if (attempt === maxAttempts) return status;
      await sleep(wait * 1000);
      continue;
    }

    if (!res.ok) {
      if (attempt === maxAttempts) {
        return {
          state: "failed",
          message: "The writing service is unavailable. Your answers are safe.",
        };
      }
      await sleep(1500 * attempt);
      continue;
    }

    const data = (await res.json().catch(() => null)) as {
      result?: { claims?: RawClaim[] };
    } | null;
    const claims = data?.result?.claims ?? [];
    const { kept, dropped } = verifyClaims(claims, validIds, {
      findVoiceViolations,
      looksGeneric,
    });

    // If everything was rejected, one retry may produce usable prose; after that
    // the section renders from its deterministic evidence instead.
    if (kept.length === 0 && attempt < maxAttempts) {
      await sleep(800);
      continue;
    }

    const status: SectionStatus = { state: "done", claims: kept, dropped: dropped.length };
    opts.onStatus?.(status);
    return status;
  }

  return { state: "failed", message: "Could not compose this section." };
}
