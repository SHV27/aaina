/** Observable degradation — every fallback declares its mode, always. */

export function ModeBadge({
  mode,
}: {
  mode: "template" | "ai" | "storage-blocked";
}) {
  const text =
    mode === "template"
      ? "Template mode — poora experience bina AI ke bhi complete hai"
      : mode === "ai"
        ? "AI narration on — aapke score-bands se, kabhi aapke jawaab nahi"
        : "Private-mode browser — progress tab band karne par nahi bachega";

  return (
    <p
      role="status"
      className="no-print inline-flex items-center gap-2 rounded-full border border-paper-edge bg-paper-deep px-3 py-1 text-xs text-ink-soft"
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full bg-ink-faint"
      />
      {text}
    </p>
  );
}
