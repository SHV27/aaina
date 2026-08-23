import { useState, type ReactNode } from "react";
import { CITATIONS } from "../engine/citations";
import type { Evidence } from "../engine/types";

/** THE RECEIPTS LAW, enforced at the renderer.
 *  A claim cannot render without bound evidence: the user's own answers plus a
 *  named published source. Dev: throws. Prod: refuses to render (returns null).
 *  Warmth stays on the surface; science sits one tap deep ("Yeh kaise pata?"). */

export function Claim({
  evidence,
  answersShown,
  children,
}: {
  evidence: Evidence;
  /** Human-readable echo of the answers this claim rests on. */
  answersShown?: string[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const valid =
    evidence &&
    Array.isArray(evidence.answerIds) &&
    evidence.answerIds.length > 0 &&
    evidence.source in CITATIONS;

  if (!valid) {
    if (import.meta.env.DEV) {
      throw new Error(
        `Claim rendered without valid evidence: ${JSON.stringify(evidence)}`,
      );
    }
    return null;
  }

  const citation = CITATIONS[evidence.source];

  return (
    <span className="inline">
      {children}{" "}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="align-baseline text-sm text-sindoor underline decoration-dotted underline-offset-4 hover:text-sindoor-deep no-print"
      >
        Yeh kaise pata?
      </button>
      {open && (
        <span className="mt-2 block rounded-lg border border-paper-edge bg-paper-deep px-4 py-3 text-sm text-ink-soft reveal">
          {answersShown && answersShown.length > 0 && (
            <span className="block">
              <strong className="text-ink">Aapke apne jawaab:</strong>{" "}
              {answersShown.join(" · ")}
            </span>
          )}
          <span className="mt-1 block">
            <strong className="text-ink">Source:</strong> {citation.full}
          </span>
          <span className="mt-1 block text-ink-faint">
            Measures: {citation.measures}
          </span>
        </span>
      )}
    </span>
  );
}
