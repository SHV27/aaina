import { Link } from "react-router-dom";
import { ESTIMATED_MINUTES, SCOREABLE_COUNT } from "../engine/items";
import { DIMENSIONS } from "../engine/dimensions";
import { progress, useSession } from "../store/session";

/** The first screen. It has one job: make a person in distress feel that this
 *  is serious, safe, and worth forty minutes — without a single word of hype. */

export function Landing() {
  const responses = useSession((s) => s.responses);
  const skipped = useSession((s) => s.skipped);
  const context = useSession((s) => s.context);
  const started = Object.keys(responses).length > 0;
  const p = progress(responses, skipped, context);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="rise font-deva text-2xl text-brass-deep">आईना</p>
      <h1 className="rise mt-3 max-w-2xl font-display text-4xl font-light leading-[1.12] tracking-tight text-ink sm:text-6xl">
        Dekhiye jo sach hai.
      </h1>
      <p className="rise-2 mt-5 max-w-xl font-display text-xl font-light italic text-ink-2 sm:text-2xl">
        An honest reading of your relationship — and what to actually do about it.
      </p>

      <div className="prose-aaina rise-2 mt-8">
        <p>
          Most relationship advice is written for nobody in particular. This is not that.
          You answer {SCOREABLE_COUNT} questions drawn from published psychological research.
          Aaina scores {DIMENSIONS.length} separate dimensions of your relationship, finds
          the specific tensions between your own answers, and writes you a report that
          could not have been written for anyone else.
        </p>
        <p>
          Then it does the second half of the job, the one most tools skip: a plan.
          Real exercises from real clinical research, chosen for your results, in the
          order the evidence says to do them.
        </p>
      </div>

      <div className="rise-3 mt-10 flex flex-wrap items-center gap-4">
        <Link
          to={started ? "/assessment" : "/start"}
          className="rounded-full bg-signal px-8 py-4 font-medium text-paper shadow-card transition-all hover:bg-signal-deep hover:shadow-lift"
        >
          {started ? `Continue — ${Math.round(p.ratio * 100)}% done` : "Begin"}
        </Link>
        <span className="text-sm text-ink-3">
          About {ESTIMATED_MINUTES} minutes · free · no account · saved as you go
        </span>
      </div>

      <div className="rise-3 mt-16 grid gap-6 border-t border-line pt-10 sm:grid-cols-3">
        <div>
          <h2 className="font-display text-lg text-ink">Everything is sourced</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Every question and every threshold comes from named, peer-reviewed research —
            Funk &amp; Rogge, Rusbult, Christensen, Reis, Spielmann and others. You can read
            the full list, and hand it to a professional.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg text-ink">Written for one person</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            The report is built from the contradictions inside your own answers, and quotes
            you back to yourself. Nothing in it is a paragraph that would fit a stranger.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg text-ink">Honest about limits</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            This is a self-report reading, not a diagnosis and not a prediction. It says
            what it can see, and it tells you what it cannot.
          </p>
        </div>
      </div>

      <p className="mt-12 text-sm text-ink-3">
        Made in India, for anyone deciding what to do next.{" "}
        <Link to="/privacy" className="underline underline-offset-4 hover:text-ink-2">
          How your answers are handled
        </Link>
        {" · "}
        <Link to="/science" className="underline underline-offset-4 hover:text-ink-2">
          The research behind it
        </Link>
      </p>
    </main>
  );
}
