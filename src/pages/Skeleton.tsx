import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Claim } from "../components/Claim";
import { SKELETON_ITEMS } from "../engine/items";
import { scoreMicroRead } from "../engine/score";
import { useAnswersStore } from "../store/answers";

/** Walking-skeleton slice: 3 real CSI-16 items → engine → receipts-rendered
 *  micro-read. Arc 3 replaces this with the full Jhalak. */

const BAND_COPY: Record<string, { line: string; whatItMeans: string }> = {
  warm: {
    line: "In teen jawaabon mein aapke rishte ki taraf warmth dikhti hai.",
    whatItMeans:
      "Satisfaction ke in shuruaati signals par aap upper range mein hain. Yeh ek jhalak hai — poora aaina abhi baaki hai.",
  },
  mixed: {
    line: "In teen jawaabon mein kuch warmth hai, aur kuch thakaan bhi.",
    whatItMeans:
      "Aapke answers mid-range mein hain — jahan clarity sabse zyada kaam aati hai. Yeh sirf jhalak hai; poora aaina zyada dikhayega.",
  },
  strained: {
    line: "In teen jawaabon mein strain saaf dikhta hai.",
    whatItMeans:
      "Aapne jo bataya, woh lower range mein hai. Ghabraiye mat — naam dena pehla kadam hai. Poora aaina pattern aur raaste dono dikhayega.",
  },
};

export function Skeleton() {
  const record = useAnswersStore((s) => s.record);
  const answers = useAnswersStore((s) => s.answers);
  const [idx, setIdx] = useState(0);
  const shownAt = useRef(performance.now());

  const item = SKELETON_ITEMS[idx];
  const done = idx >= SKELETON_ITEMS.length;

  const read = useMemo(() => {
    if (!done) return null;
    return scoreMicroRead(Object.values(answers), SKELETON_ITEMS);
  }, [done, answers]);

  function answer(value: number) {
    record({ itemId: item.id, value, tMs: performance.now() - shownAt.current });
    shownAt.current = performance.now();
    setIdx((i) => i + 1);
  }

  if (done && read) {
    const copy = BAND_COPY[read.band];
    const shown = read.answerIds.map((id) => {
      const it = SKELETON_ITEMS.find((i) => i.id === id)!;
      const a = answers[id];
      const label = it.scale.find((s) => s.value === a.value)?.label ?? "";
      return `"${label}"`;
    });
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <div className="mirror-sheen reveal rounded-(--radius-card) p-8 shadow-lift">
          <p className="font-devanagari text-lg text-brass-deep">पहली झलक</p>
          <h1 className="mt-2 font-display text-3xl font-light text-ink">
            {copy.line}
          </h1>
          <p className="mt-4 leading-relaxed text-ink-soft">
            <Claim
              evidence={{ answerIds: read.answerIds, source: "funk-rogge-2007" }}
              answersShown={shown}
            >
              {copy.whatItMeans}
            </Claim>
          </p>
          <p className="mt-6 text-sm text-ink-faint">
            Score {read.raw}/{read.max} in 3 sawaalon par — yeh verdict nahi,
            jhalak hai. Poora Aaina 5 chapters ka hai.
          </p>
        </div>
        <Link to="/" className="mt-8 text-sindoor underline underline-offset-4">
          ← Wapas
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-sm text-ink-faint">
        Sawaal {idx + 1} / {SKELETON_ITEMS.length}
      </p>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-edge"
        role="progressbar"
        aria-valuenow={idx}
        aria-valuemin={0}
        aria-valuemax={SKELETON_ITEMS.length}
      >
        <div
          className="h-full bg-sindoor transition-all duration-500"
          style={{ width: `${(idx / SKELETON_ITEMS.length) * 100}%` }}
        />
      </div>

      <h1 key={item.id} className="reveal mt-10 font-display text-2xl font-light leading-snug text-ink sm:text-3xl">
        {item.text}
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {item.scale.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => answer(opt.value)}
            className="rounded-xl border border-paper-edge bg-paper-deep px-5 py-3.5 text-left text-ink transition-colors hover:border-sindoor hover:bg-sindoor-tint focus-visible:border-sindoor"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </main>
  );
}
