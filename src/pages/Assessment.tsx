import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Claim } from "../components/Claim";
import { ChapterProgress } from "../components/ChapterProgress";
import { QuestionScreen } from "../components/QuestionScreen";
import { QuickExit } from "../components/QuickExit";
import { chapterInsight } from "../engine/insights";
import { CHAPTERS, WAST_ITEMS, itemById } from "../engine/items";
import {
  chapterProgress,
  derivePosition,
  useAnswersStore,
} from "../store/answers";
import { useSafetyStore } from "../store/safety";

/** The Mirror flow controller: 5 chapters → boundary screens with evidenced
 *  micro-insights → privacy interstitial → safety chapter (memory-only,
 *  quick-exit) → report. One question per screen throughout.
 *  Priority order matters: boundary screen ALWAYS renders before the safety
 *  phase — finishing chapter 5 must never skip the interstitial. */

type SafetyStep = "interstitial" | "questions";

export function Assessment() {
  const navigate = useNavigate();
  const answers = useAnswersStore((s) => s.answers);
  const skippedIds = useAnswersStore((s) => s.skippedIds);
  const record = useAnswersStore((s) => s.record);
  const skip = useAnswersStore((s) => s.skip);

  const safetyAnswers = useSafetyStore((s) => s.answers);
  const recordSafety = useSafetyStore((s) => s.record);

  const [boundary, setBoundary] = useState<number | null>(null);
  const [safetyStep, setSafetyStep] = useState<SafetyStep | null>(null);
  const [safetySkipped, setSafetySkipped] = useState<string[]>([]);

  const pos = derivePosition(answers, skippedIds);
  const chaptersDone = pos.chapterIndex >= CHAPTERS.length;
  const nextWast = WAST_ITEMS.find(
    (i) => !safetyAnswers[i.id] && !safetySkipped.includes(i.id),
  );

  // Phase transitions live in effects, never in render.
  useEffect(() => {
    if (chaptersDone && boundary === null && safetyStep === null) {
      if (nextWast) setSafetyStep("interstitial");
      else navigate("/report", { replace: true });
    }
  }, [chaptersDone, boundary, safetyStep, nextWast, navigate]);

  useEffect(() => {
    if (safetyStep === "questions" && !nextWast) navigate("/report");
  }, [safetyStep, nextWast, navigate]);

  /* ---------- Chapter-boundary screen (highest priority) ---------- */
  if (boundary !== null) {
    const finished = CHAPTERS[boundary];
    const insight = chapterInsight(finished.id, Object.values(answers));
    const isLast = boundary === CHAPTERS.length - 1;
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <p className="reveal font-devanagari text-lg text-brass-deep">{finished.hindi}</p>
        <h1 className="reveal mt-2 font-display text-3xl font-light text-ink">
          Chapter poora — {finished.title}.
        </h1>
        {insight && (
          <p className="reveal-late mt-5 max-w-prose leading-relaxed text-ink-soft">
            <Claim evidence={insight.evidence}>{insight.text}</Claim>
          </p>
        )}
        <div className="reveal-late mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setBoundary(null);
              if (isLast) setSafetyStep("interstitial");
            }}
            className="rounded-full bg-sindoor px-7 py-3.5 font-medium text-paper shadow-soft hover:bg-sindoor-deep"
          >
            {isLast ? "Aakhri chhota section" : "Agla chapter"}
          </button>
          <Link to="/" className="text-sm text-ink-faint underline decoration-dotted underline-offset-4">
            Break lena hai? Sab saved hai — aaram se wapas aaiye.
          </Link>
        </div>
      </main>
    );
  }

  /* ---------- Safety phase ---------- */
  if (safetyStep === "interstitial") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <h1 className="reveal font-display text-3xl font-light text-ink">
          Aakhri section — aur yeh sirf aapke liye hai.
        </h1>
        <p className="reveal-late mt-4 max-w-prose leading-relaxed text-ink-soft">
          Agle 8 sawaal rishte mein <strong className="text-ink">mehsoos hone waali
          suraksha</strong> ke baare mein hain. Yeh section kahin save nahi hota —
          na aapke phone mein, na kisi server par, na report ke print mein. Screen
          band karte hi yeh jawaab mit jaate hain.
        </p>
        <p className="reveal-late mt-3 max-w-prose leading-relaxed text-ink-soft">
          Kya aap abhi kisi private jagah par hain? Agar koi paas ho, toh yeh
          section baad mein bhi ho sakta hai. Upar right mein{" "}
          <strong className="text-ink">"Turant niklein"</strong> ka button har waqt
          rahega — ek click ya Esc, aur yeh page mausam ki website ban jayega.
          (Sach yeh hai: woh button browser history nahi mitaata.)
        </p>
        <div className="reveal-late mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setSafetyStep("questions")}
            className="rounded-full bg-sindoor px-7 py-3.5 font-medium text-paper shadow-soft hover:bg-sindoor-deep"
          >
            Main private jagah par hoon — poochhiye
          </button>
          <button
            type="button"
            onClick={() => {
              setSafetySkipped(WAST_ITEMS.map((i) => i.id));
              navigate("/report");
            }}
            className="rounded-full border border-paper-edge px-7 py-3.5 text-ink-soft hover:border-sindoor hover:text-ink"
          >
            Is section ko chhodein
          </button>
        </div>
      </main>
    );
  }

  if (safetyStep === "questions") {
    if (!nextWast) return null; // effect navigates to /report
    const remaining = WAST_ITEMS.filter(
      (i) => !safetyAnswers[i.id] && !safetySkipped.includes(i.id),
    ).length;
    const done = WAST_ITEMS.length - remaining;
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 pb-10">
        <QuickExit />
        <div className="pt-6">
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">Suraksha</span>
            <span className="text-ink-faint"> · {done + 1} / {WAST_ITEMS.length} · save nahi hota</span>
          </p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-edge">
            <div
              className="h-full bg-brass transition-all duration-500"
              style={{ width: `${(done / WAST_ITEMS.length) * 100}%` }}
            />
          </div>
        </div>
        <QuestionScreen
          item={nextWast}
          onAnswer={(value, tMs) => recordSafety({ itemId: nextWast.id, value, tMs })}
          onSkip={() => setSafetySkipped((s) => [...s, nextWast.id])}
        />
      </main>
    );
  }

  if (chaptersDone) return null; // effect stages the safety phase

  /* ---------- Question screen ---------- */
  const item = itemById(pos.itemId!)!;
  const { done, total } = chapterProgress(pos.chapterIndex, answers, skippedIds);
  const chapter = CHAPTERS[pos.chapterIndex];
  const isFirstOfChapter = done === 0;

  const afterAnswer = () => {
    const s = useAnswersStore.getState();
    const next = derivePosition(s.answers, s.skippedIds);
    if (next.chapterIndex > pos.chapterIndex) setBoundary(pos.chapterIndex);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 pb-10">
      <ChapterProgress chapterIndex={pos.chapterIndex} done={done} total={total} />
      {isFirstOfChapter && (
        <p className="reveal mt-6 rounded-lg border border-paper-edge bg-paper-deep px-4 py-3 text-sm italic text-ink-soft">
          {chapter.intro}
        </p>
      )}
      <QuestionScreen
        item={item}
        onAnswer={(value, tMs) => {
          record({ itemId: item.id, value, tMs });
          afterAnswer();
        }}
        onSkip={() => {
          skip(item.id);
          afterAnswer();
        }}
      />
    </main>
  );
}
