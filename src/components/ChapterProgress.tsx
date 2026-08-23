import { CHAPTERS } from "../engine/items";

/** Chapter dots + fast-filling within-chapter bar (never one slow global bar —
 *  Villar et al. 2013). */

export function ChapterProgress({
  chapterIndex,
  done,
  total,
}: {
  chapterIndex: number;
  done: number;
  total: number;
}) {
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-ink">{CHAPTERS[chapterIndex]?.title}</span>
          <span className="text-ink-faint"> · chapter {chapterIndex + 1} of {CHAPTERS.length}</span>
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {CHAPTERS.map((c, i) => (
            <span
              key={c.id}
              className={`h-1.5 w-1.5 rounded-full ${
                i < chapterIndex
                  ? "bg-sindoor"
                  : i === chapterIndex
                    ? "bg-sindoor/60"
                    : "bg-paper-edge"
              }`}
            />
          ))}
        </div>
      </div>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-edge"
        role="progressbar"
        aria-label={`Chapter ${chapterIndex + 1} progress`}
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-sindoor transition-all duration-500"
          style={{ width: `${total === 0 ? 0 : (done / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
