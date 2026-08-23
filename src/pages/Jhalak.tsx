import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Claim } from "../components/Claim";
import { QuestionScreen } from "../components/QuestionScreen";
import { JHALAK_ITEMS } from "../engine/items";
import { scoreMicroRead } from "../engine/score";
import { useAnswersStore } from "../store/answers";

/** The Jhalak: 8 validated items → one honest, evidenced micro-read in ~2 min.
 *  Answers carry into the full Mirror (same items, never re-asked). */

const BAND_COPY: Record<string, { line: string; body: string }> = {
  warm: {
    line: "In aath jawaabon mein warmth dikhti hai.",
    body: "Satisfaction, commitment aur baat-cheet ke in shuruaati signals par aap upper range mein hain. Yeh ek jhalak hai — aath sawaal ek rishte ka faisla nahi hote. Poora Aaina paanch chapters mein pattern, jadein aur dono taraf ke palde dikhayega.",
  },
  mixed: {
    line: "In aath jawaabon mein warmth bhi hai, thakaan bhi.",
    body: "Aapke jawaab mid-range mein hain — theek wahi jagah jahan clarity sabse zyada kaam aati hai. Yeh sirf jhalak hai; poora Aaina dikhayega ki kaunsa palda kis wazan se jhuka hai, aur kyun.",
  },
  strained: {
    line: "In aath jawaabon mein strain saaf dikhta hai.",
    body: "Aapne jo bataya, woh lower range mein hai. Ghabraiye mat — kisi cheez ko naam dena hi pehla kadam hota hai. Poora Aaina pattern ko naam dega, aur har raaste ki keemat samet aage ke teen raaste bhi dikhayega.",
  },
};

export function Jhalak() {
  const record = useAnswersStore((s) => s.record);
  const answers = useAnswersStore((s) => s.answers);
  const [idx, setIdx] = useState(() =>
    JHALAK_ITEMS.findIndex((i) => !useAnswersStore.getState().answers[i.id]) === -1
      ? JHALAK_ITEMS.length
      : JHALAK_ITEMS.findIndex((i) => !useAnswersStore.getState().answers[i.id]),
  );

  const done = idx >= JHALAK_ITEMS.length;
  const read = useMemo(
    () => (done ? scoreMicroRead(Object.values(answers), JHALAK_ITEMS) : null),
    [done, answers],
  );

  if (done && read) {
    const copy = BAND_COPY[read.band];
    const shown = read.answerIds.map((id) => {
      const it = JHALAK_ITEMS.find((i) => i.id === id)!;
      const a = answers[id];
      const label = it.scale.find((s) => s.value === a.value)?.label ?? "";
      return `"${label}"`;
    });
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <div className="mirror-sheen reveal rounded-(--radius-card) p-8 shadow-lift">
          <p className="font-devanagari text-lg text-brass-deep">पहली झलक</p>
          <h1 className="mt-2 font-display text-3xl font-light text-ink">{copy.line}</h1>
          <p className="mt-4 leading-relaxed text-ink-soft">
            <Claim
              evidence={{ answerIds: read.answerIds, source: "funk-rogge-2007" }}
              answersShown={shown}
            >
              {copy.body}
            </Claim>
          </p>
          <p className="mt-6 text-sm text-ink-faint">
            8 sawaal, published instruments se — yeh verdict nahi, jhalak hai. Aapke
            yeh jawaab poore Aaina mein gine jaayenge; dobara nahi poochhe jaayenge.
          </p>
        </div>

        <div className="reveal-late mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/aaina"
            className="rounded-full bg-sindoor px-7 py-3.5 font-medium text-paper shadow-soft transition-transform hover:scale-[1.02] hover:bg-sindoor-deep"
          >
            Poora Aaina dekhein
          </Link>
          <Link to="/" className="text-sindoor underline underline-offset-4">
            Wapas
          </Link>
        </div>
      </main>
    );
  }

  const item = JHALAK_ITEMS[idx];
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 pb-10">
      <div className="pt-6">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-ink">Jhalak</span>
          <span className="text-ink-faint"> · sawaal {idx + 1} / {JHALAK_ITEMS.length}</span>
        </p>
        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-paper-edge"
          role="progressbar"
          aria-valuenow={idx}
          aria-valuemin={0}
          aria-valuemax={JHALAK_ITEMS.length}
        >
          <div
            className="h-full bg-sindoor transition-all duration-500"
            style={{ width: `${(idx / JHALAK_ITEMS.length) * 100}%` }}
          />
        </div>
      </div>

      <QuestionScreen
        item={item}
        onAnswer={(value, tMs) => {
          record({ itemId: item.id, value, tMs });
          setIdx((i) => i + 1);
        }}
      />
    </main>
  );
}
