import { useEffect, useRef } from "react";
import type { Item } from "../engine/types";

/** One question per screen. Options as tappable chips in the thumb zone,
 *  tap-to-advance, response time recorded for the quality meter. */

export function QuestionScreen({
  item,
  sectionLabel,
  onAnswer,
  onSkip,
  skipLabel = "Is sawaal ko chhodein",
}: {
  item: Item;
  sectionLabel?: string;
  onAnswer: (value: number, tMs: number) => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  const shownAt = useRef(performance.now());
  useEffect(() => {
    shownAt.current = performance.now();
  }, [item.id]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {sectionLabel && (
        <p className="mt-6 text-sm italic text-ink-faint">{sectionLabel}</p>
      )}
      <h1
        key={item.id}
        className="reveal mt-4 font-display text-2xl font-light leading-snug text-ink sm:text-3xl"
      >
        {item.text}
      </h1>

      <div className="mt-auto flex flex-col gap-2.5 pt-8">
        {item.scale.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onAnswer(opt.value, performance.now() - shownAt.current)}
            className="rounded-xl border border-paper-edge bg-paper-deep px-5 py-3 text-left text-ink transition-colors hover:border-sindoor hover:bg-sindoor-tint focus-visible:border-sindoor"
          >
            {opt.label}
          </button>
        ))}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-1 self-center text-sm text-ink-faint underline decoration-dotted underline-offset-4 hover:text-ink-soft"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
