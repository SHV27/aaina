import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RISK_ITEMS } from "../engine/risk";
import { useRisk } from "../store/risk";
import { useSession } from "../store/session";

/** The last section, and the only one that is never stored.
 *
 *  Presented behind a privacy check because the person may be sitting next to
 *  the person the questions are about. A quick exit is available throughout,
 *  with an honest note about what it does and does not do. */

export function quickExit() {
  try {
    window.location.replace("https://www.google.com/search?q=weather+today");
  } catch {
    window.location.href = "https://www.google.com";
  }
}

function QuickExitButton() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") quickExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <button
      type="button"
      onClick={quickExit}
      className="no-print fixed right-4 top-4 z-50 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper shadow-lift hover:bg-ink-2"
    >
      Leave now (Esc)
    </button>
  );
}

export function Safety() {
  const navigate = useNavigate();
  const hasPartner = useSession((s) => s.context.hasPartner);
  const responses = useRisk((s) => s.responses);
  const answer = useRisk((s) => s.answer);
  const markCompleted = useRisk((s) => s.markCompleted);
  const decline = useRisk((s) => s.decline);
  const [phase, setPhase] = useState<"intro" | "questions">("intro");
  const shownAt = useRef(performance.now());

  // Someone with no specific partner has nothing to answer here.
  useEffect(() => {
    if (!hasPartner) navigate("/report", { replace: true });
  }, [hasPartner, navigate]);

  const next = RISK_ITEMS.find((i) => !responses[i.id]);

  useEffect(() => {
    shownAt.current = performance.now();
  }, [next?.id]);

  if (phase === "intro") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <h1 className="rise font-display text-3xl font-light text-ink">
          One last section, and it stays with you.
        </h1>
        <div className="prose-aaina rise-2 mt-5">
          <p>
            These eight questions are about safety — tension, fear, and harm. They matter
            because the right advice for a relationship changes completely when someone is
            being hurt in it.
          </p>
          <p>
            <strong>These answers are never saved.</strong> Not to your device, not to any
            server, not into your report, and not into anything you print or share. They
            exist only while this page is open, and they are used once, to decide what your
            plan should and should not contain.
          </p>
          <p>
            If someone is nearby, you can do this part later. A{" "}
            <strong>Leave now</strong> button sits in the corner from here on — one click,
            or the Escape key, and this becomes a weather page. It is honest to say that it
            does not erase your browser history.
          </p>
        </div>
        <div className="rise-3 mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPhase("questions")}
            className="rounded-full bg-signal px-7 py-3.5 font-medium text-paper shadow-card hover:bg-signal-deep"
          >
            I have privacy — continue
          </button>
          <button
            type="button"
            onClick={() => {
              decline();
              navigate("/report");
            }}
            className="rounded-full border border-line px-7 py-3.5 text-ink-2 hover:border-signal hover:text-ink"
          >
            Skip this section
          </button>
        </div>
      </main>
    );
  }

  if (!next) {
    markCompleted();
    navigate("/report", { replace: true });
    return null;
  }

  const answered = RISK_ITEMS.length - RISK_ITEMS.filter((i) => !responses[i.id]).length;

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 pb-12">
      <QuickExitButton />
      <div className="pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium text-ink">Safety</p>
          <p className="text-sm tabular-nums text-ink-3">
            {answered + 1} / {RISK_ITEMS.length} · not saved
          </p>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-3">
          <div
            className="h-full rounded-full bg-brass transition-all duration-500"
            style={{ width: `${(answered / RISK_ITEMS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <h1
          key={next.id}
          className="rise font-display text-2xl font-light leading-snug text-ink sm:text-3xl"
        >
          {next.text}
        </h1>
        <div className="mt-8 flex flex-col gap-2">
          {next.scale.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                answer({
                  itemId: next.id,
                  value: opt.value,
                  tMs: performance.now() - shownAt.current,
                })
              }
              className="rounded-xl border border-line bg-paper-2 px-5 py-3 text-left text-ink transition-colors hover:border-signal hover:bg-signal-wash"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            decline();
            navigate("/report");
          }}
          className="mt-5 self-center text-sm text-ink-3 underline decoration-dotted underline-offset-4 hover:text-ink-2"
        >
          Stop this section and go to my report
        </button>
      </div>
    </main>
  );
}
