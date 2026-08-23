import { Link } from "react-router-dom";
import { CHAPTERS } from "../engine/items";
import { derivePosition, useAnswersStore } from "../store/answers";

/** Screen 0 — honest expectation setting (lane-4 rule 3): real total, framed in
 *  chapters, autosave promise, privacy promise. */

export function AssessmentIntro() {
  const answers = useAnswersStore((s) => s.answers);
  const skippedIds = useAnswersStore((s) => s.skippedIds);
  const pos = derivePosition(answers, skippedIds);
  const started = Object.keys(answers).length > 0;
  const complete = pos.chapterIndex >= CHAPTERS.length;
  const totalMinutes = CHAPTERS.reduce((a, c) => a + c.minutes, 0);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="reveal font-devanagari text-2xl text-brass-deep">आईना</p>
      <h1 className="reveal mt-2 font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
        Poora Aaina — {CHAPTERS.length} chapters, apni raftaar se.
      </h1>
      <p className="reveal-late mt-5 max-w-prose leading-relaxed text-ink-soft">
        Kul {CHAPTERS.length} chapters hain, har ek ~{Math.round(totalMinutes / CHAPTERS.length)}–12
        minute ka — total lagbhag {totalMinutes} minute. Ek saath karna zaroori nahi:
        har jawaab apne aap save hota hai, aap kabhi bhi ruk kar wahi se shuru kar
        sakte hain. Sab kuch aapke apne phone/browser mein rehta hai — koi account
        nahi, koi server nahi.
      </p>

      <ol className="reveal-late mt-8 space-y-3">
        {CHAPTERS.map((c, i) => {
          const done = c.items.every(
            (it) => answers[it.id] || skippedIds.includes(it.id),
          );
          return (
            <li key={c.id} className="flex items-baseline gap-3">
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  done ? "bg-sindoor text-paper" : "border border-paper-edge text-ink-faint"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span>
                <span className="font-medium text-ink">{c.title}</span>{" "}
                <span className="font-devanagari text-ink-faint">{c.hindi}</span>
                <span className="text-sm text-ink-faint"> · ~{c.minutes} min</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="reveal-late mt-10 flex flex-wrap items-center gap-4">
        <Link
          to={complete ? "/report" : "/aaina/sawaal"}
          className="rounded-full bg-sindoor px-7 py-3.5 font-medium text-paper shadow-soft transition-transform hover:scale-[1.02] hover:bg-sindoor-deep"
        >
          {complete
            ? "Apna aaina dekhein"
            : started
              ? "Wahin se aage badhein"
              : "Shuru karein"}
        </Link>
        <span className="text-sm text-ink-faint">
          Koi sahi-galat jawaab nahi hai — aaina utna hi saaf, jitne aap.
        </span>
      </div>
    </main>
  );
}
