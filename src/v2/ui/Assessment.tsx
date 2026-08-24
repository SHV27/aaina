import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ITEM_BY_ID, SECTIONS, itemsForSection } from "../engine/items";
import type { SectionId } from "../engine/types";
import {
  applicableItems,
  nextItemId,
  progress,
  useSession,
} from "../store/session";

/** The assessment. One question per screen, tap to advance, saved on every
 *  answer. Progress is shown per section — a single bar crawling across 122
 *  questions is the fastest way to lose someone. */

export function Assessment() {
  const navigate = useNavigate();
  const responses = useSession((s) => s.responses);
  const skipped = useSession((s) => s.skipped);
  const context = useSession((s) => s.context);
  const storageBlocked = useSession((s) => s.storageBlocked);
  const answer = useSession((s) => s.answer);
  const skip = useSession((s) => s.skip);

  const [sectionDone, setSectionDone] = useState<SectionId | null>(null);
  const shownAt = useRef(performance.now());

  const currentId = useMemo(
    () => nextItemId(responses, skipped, context),
    [responses, skipped, context],
  );
  const item = currentId ? ITEM_BY_ID.get(currentId) : null;

  useEffect(() => {
    shownAt.current = performance.now();
  }, [currentId]);

  useEffect(() => {
    if (!currentId && sectionDone === null) navigate("/safety", { replace: true });
  }, [currentId, sectionDone, navigate]);

  if (sectionDone) {
    const idx = SECTIONS.findIndex((s) => s.id === sectionDone);
    const next = SECTIONS[idx + 1];
    const p = progress(responses, skipped, context);
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <p className="rise text-sm uppercase tracking-widest text-ink-3">
          Section {idx + 1} of {SECTIONS.length} complete
        </p>
        <h1 className="rise mt-3 font-display text-3xl font-light text-ink">
          {SECTIONS[idx].title} — done.
        </h1>
        <p className="rise-2 mt-4 max-w-prose leading-relaxed text-ink-2">
          {Math.round(p.ratio * 100)}% of the way through. Everything so far is saved.
          {next ? ` Next: ${next.title}.` : " One short section left."}
        </p>
        <div className="rise-2 mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setSectionDone(null)}
            className="rounded-full bg-signal px-7 py-3.5 font-medium text-paper shadow-card hover:bg-signal-deep"
          >
            Keep going
          </button>
          <Link to="/" className="text-sm text-ink-3 underline underline-offset-4 hover:text-ink-2">
            Take a break — your answers are saved
          </Link>
        </div>
      </main>
    );
  }

  if (!item) return null;

  const section = SECTIONS.find((s) => s.id === item.section)!;
  const sectionIdx = SECTIONS.findIndex((s) => s.id === item.section);
  const applicable = applicableItems(context);
  const sectionItems = itemsForSection(item.section).filter((i) => applicable.includes(i));
  const done = new Set([...Object.keys(responses), ...skipped]);
  const sectionAnswered = sectionItems.filter((i) => done.has(i.id)).length;
  const isFirstOfSection = sectionAnswered === 0;

  const advance = () => {
    const s = useSession.getState();
    const nid = nextItemId(s.responses, s.skipped, s.context);
    if (!nid) {
      navigate("/safety");
      return;
    }
    const nextItem = ITEM_BY_ID.get(nid);
    if (nextItem && nextItem.section !== item.section) setSectionDone(item.section);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 pb-12">
      <div className="pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium text-ink">{section.title}</p>
          <p className="text-sm tabular-nums text-ink-3">
            {sectionAnswered + 1} / {sectionItems.length}
          </p>
        </div>
        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-3"
          role="progressbar"
          aria-valuenow={sectionAnswered}
          aria-valuemin={0}
          aria-valuemax={sectionItems.length}
          aria-label={`${section.title} progress`}
        >
          <div
            className="h-full rounded-full bg-signal transition-all duration-500"
            style={{ width: `${(sectionAnswered / Math.max(1, sectionItems.length)) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {SECTIONS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 flex-1 rounded-full ${
                i < sectionIdx ? "bg-brass" : i === sectionIdx ? "bg-signal/40" : "bg-paper-3"
              }`}
            />
          ))}
        </div>
      </div>

      {storageBlocked && (
        <p className="mt-4 rounded-lg border border-line bg-paper-2 px-4 py-2 text-sm text-ink-2">
          Your browser is blocking storage, so progress will not survive closing this tab.
        </p>
      )}

      {isFirstOfSection && (
        <p className="rise mt-6 rounded-lg border border-line bg-paper-2 px-4 py-3 text-sm italic leading-relaxed text-ink-2">
          {section.intro}
        </p>
      )}

      <div className="flex flex-1 flex-col justify-center py-8">
        <h1
          key={item.id}
          className="rise font-display text-2xl font-light leading-snug text-ink sm:text-3xl"
        >
          {item.text}
        </h1>

        <div className="mt-8 flex flex-col gap-2">
          {item.scale.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                answer({
                  itemId: item.id,
                  value: opt.value,
                  tMs: performance.now() - shownAt.current,
                });
                advance();
              }}
              className="rounded-xl border border-line bg-paper-2 px-5 py-3 text-left text-ink transition-colors hover:border-signal hover:bg-signal-wash"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            skip(item.id);
            advance();
          }}
          className="mt-5 self-center text-sm text-ink-3 underline decoration-dotted underline-offset-4 hover:text-ink-2"
        >
          Skip this one
        </button>
      </div>
    </main>
  );
}
