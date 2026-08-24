import { useEffect } from "react";
import { Link } from "react-router-dom";
import { DIMENSION_BY_ID } from "../engine/dimensions";
import { SOURCES } from "../engine/sources";
import type { Road } from "../engine/types";
import { useSession } from "../store/session";
import { useReport } from "./useReport";
import { ComponentTable, DimensionBar, OverallDial } from "./meters";
import { SafetyPanel } from "./SafetyPanel";
import { PlanView } from "./PlanView";
import type { SectionStatus } from "../ai/client";

/** THE DOSSIER — the deep read, then the work.
 *
 *  Deterministic content (scores, tensions, plan) renders immediately and is
 *  never lost. The written commentary arrives section by section; where it
 *  cannot be produced, the section says so and keeps its numbers. */

function Prose({ status, fallback }: { status?: SectionStatus; fallback: React.ReactNode }) {
  if (!status || status.state === "pending" || status.state === "writing") {
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-ink-3">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
        Writing this part…
      </p>
    );
  }
  if (status.state === "waiting") {
    return (
      <p className="mt-3 rounded-lg border border-line bg-paper-2 px-4 py-3 text-sm text-ink-2">
        {status.reason} Continuing in about {status.retryAfterSec} seconds — nothing is lost.
      </p>
    );
  }
  if (status.state === "failed") {
    return (
      <div className="mt-3">
        <p className="rounded-lg border border-line bg-paper-2 px-4 py-3 text-sm text-ink-2">
          The written commentary for this part could not be produced. Your measurements are
          below and are unaffected.
        </p>
        <div className="mt-3">{fallback}</div>
      </div>
    );
  }
  if (status.claims.length === 0) return <div className="mt-3">{fallback}</div>;
  return (
    <div className="prose-aaina mt-4">
      {status.claims.map((c, i) => (
        <p key={i}>{c.text}</p>
      ))}
    </div>
  );
}

const ROADS: { id: Road; label: string; blurb: string }[] = [
  { id: "repair", label: "Work on it", blurb: "You intend to stay and want it to be better." },
  { id: "decide", label: "Decide", blurb: "You genuinely do not know yet, and want to find out." },
  { id: "leave", label: "Leave well", blurb: "You are ending it, or you already have." },
];

export function Report() {
  const r = useReport();
  const context = useSession((s) => s.context);
  const answered = r.assessment.quality.answered;

  useEffect(() => {
    if (answered > 0) r.start();
  }, [answered, r]);

  if (answered === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-light text-ink">
          There is nothing to read yet.
        </h1>
        <p className="mt-3 text-ink-2">The report is built from your answers, so it needs some first.</p>
        <Link
          to="/start"
          className="mt-6 self-start rounded-full bg-signal px-7 py-3.5 font-medium text-paper shadow-card hover:bg-signal-deep"
        >
          Begin the assessment
        </Link>
      </main>
    );
  }

  const top = r.assessment.contradictions.slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      {/* ---------------- Header ---------------- */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="rise font-deva text-xl text-brass-deep">आईना</p>
          <h1 className="rise mt-2 font-display text-4xl font-light text-ink sm:text-5xl">
            Your reading
          </h1>
          <p className="rise-2 mt-2 text-ink-3">
            Built from {answered} answers across {r.assessment.scores.length} dimensions
            {r.assessment.quality.skipped > 0 ? `, ${r.assessment.quality.skipped} skipped` : ""}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print mt-2 shrink-0 rounded-full border border-line px-4 py-2 text-sm text-ink-2 hover:border-signal hover:text-ink"
        >
          Print
        </button>
      </div>

      {r.writing && (
        <p className="no-print mt-6 rounded-lg border border-line bg-paper-2 px-4 py-2 text-sm text-ink-2">
          Writing your report — {r.progress.done} of {r.progress.total} parts done. You can
          start reading; the rest appears as it is written.
        </p>
      )}

      {r.risk.positive && (
        <div className="mt-8">
          <SafetyPanel result={r.risk} />
        </div>
      )}

      {/* ---------------- Overall ---------------- */}
      <section className="mt-10 rounded-(--radius-card) border border-line bg-paper-2 p-7">
        <h2 className="font-display text-2xl font-light text-ink">Overall</h2>
        <div className="mt-5">
          <OverallDial value={r.assessment.overall} />
        </div>
        <Prose
          status={r.sections["opening"]}
          fallback={
            <ul className="space-y-1.5 text-sm text-ink-2">
              {top.map((c) => (
                <li key={c.id}>{c.headline}</li>
              ))}
            </ul>
          }
        />
        <details className="mt-5 text-sm">
          <summary className="cursor-pointer text-signal underline decoration-dotted underline-offset-4">
            How this number is calculated
          </summary>
          <div className="mt-3">
            <p className="text-ink-2">
              A weighted average of every dimension you answered. Dimensions the research
              finds most predictive of relationship quality carry more weight — perceived
              commitment, appreciation and responsiveness, conflict, and satisfaction
              (Joel and colleagues, 2020; Le and colleagues, 2010). Nothing is hidden: the
              exact numbers are here.
            </p>
            <div className="mt-4">
              <ComponentTable components={r.assessment.overallComponents} />
            </div>
          </div>
        </details>
      </section>

      {/* ---------------- Tensions ---------------- */}
      {top.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-light text-ink">
            What your answers disagree about
          </h2>
          <p className="mt-2 max-w-prose text-ink-2">
            These are the places where two things you said pull in opposite directions.
            They are the most useful part of this report, because they only exist in your
            data.
          </p>
          <div className="mt-5 space-y-4">
            {top.map((c) => (
              <article
                key={c.id}
                className="rounded-(--radius-card) border border-line bg-paper-2 p-6"
              >
                <h3 className="font-display text-lg text-ink">{c.headline}</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-paper p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-3">
                      {DIMENSION_BY_ID.get(c.aSide.label as never)?.label ?? c.aSide.label}
                    </p>
                    <p className="mt-1 font-display text-2xl tabular-nums text-ink">
                      {Math.round(c.aSide.value)}
                      <span className="text-sm text-ink-3"> / 100</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-paper p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-3">
                      {DIMENSION_BY_ID.get(c.bSide.label as never)?.label ?? c.bSide.label}
                    </p>
                    <p className="mt-1 font-display text-2xl tabular-nums text-ink">
                      {Math.round(c.bSide.value)}
                      <span className="text-sm text-ink-3"> / 100</span>
                    </p>
                  </div>
                </div>
                {[...c.aSide.echoes, ...c.bSide.echoes].slice(0, 2).map((e) => (
                  <p key={e} className="mt-3 border-l-2 border-brass pl-3 text-sm italic text-ink-2">
                    You answered {e}
                  </p>
                ))}
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{c.significance}</p>
                <p className="mt-2 text-xs text-ink-3">{SOURCES[c.citation].short}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Dimension chapters ---------------- */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-light text-ink">
          Dimension by dimension
        </h2>
        <p className="mt-2 max-w-prose text-ink-2">
          Every part of the reading, strongest signal first.
        </p>

        <div className="mt-6 space-y-8">
          {r.chapters.map((score, i) => {
            const dim = DIMENSION_BY_ID.get(score.dimension)!;
            const key = `dimension:${score.dimension}`;
            const hasProse = i < 6;
            return (
              <article key={score.dimension} className="border-t border-line pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl text-ink">{dim.label}</h3>
                  <span className="text-xs uppercase tracking-wide text-ink-3">
                    {dim.group === "modern" ? "modern" : dim.group === "context" ? "context" : "core"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-3">{dim.measures}</p>
                <div className="mt-3">
                  <DimensionBar score={score} />
                </div>
                {hasProse ? (
                  <Prose
                    status={r.sections[key]}
                    fallback={
                      <p className="text-sm text-ink-2">
                        You scored {Math.round(score.normalized)} out of 100 here, across{" "}
                        {score.answered} answers.
                      </p>
                    }
                  />
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">
                    {Math.round(score.normalized)} out of 100, from {score.answered} answers.
                    Between “{dim.lowLabel.toLowerCase()}” and “{dim.highLabel.toLowerCase()}”,
                    this sits {score.normalized >= 50 ? "on the stronger side" : "on the harder side"}.
                  </p>
                )}
                <p className="mt-2 text-xs text-ink-3">{SOURCES[score.citation].short}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------------- The Work ---------------- */}
      <section className="page-break mt-14">
        <h2 className="font-display text-3xl font-light text-ink">Now the work</h2>
        <p className="mt-2 max-w-prose text-ink-2">
          A reading is only half of what a counsellor does. This is the other half: what to
          actually do, chosen for what your answers said, in the order the research says to
          do it.
        </p>

        {!r.risk.positive && (
          <div className="no-print mt-6">
            <p className="text-sm font-medium text-ink">
              Which of these is closest to where you are?
            </p>
            <p className="mt-1 text-sm text-ink-3">
              The plan changes with your answer. Nothing here tells you which to pick.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {ROADS.map((road) => (
                <button
                  key={road.id}
                  type="button"
                  onClick={() => r.setRoad(road.id)}
                  aria-pressed={r.road === road.id}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    r.road === road.id
                      ? "border-signal bg-signal-wash"
                      : "border-line bg-paper-2 hover:border-signal"
                  }`}
                >
                  <span className="block font-medium text-ink">{road.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-3">{road.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Prose
          status={r.sections["plan-intro"]}
          fallback={
            <p className="mt-4 text-ink-2">
              These {r.plan.length} pieces of work were chosen from your lowest-scoring
              dimensions and the tensions above.
            </p>
          }
        />

        <div className="mt-6">
          <PlanView plan={r.plan} riskPositive={r.risk.positive} />
        </div>
      </section>

      {/* ---------------- Honest limits ---------------- */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-xl text-ink">What this reading cannot see</h2>
        <div className="prose-aaina mt-3">
          <p>
            This is a self-report reading. It knows what you told it and nothing else.
            {context.hasPartner
              ? " It has one side of a two-sided story, which is the best available single source — your own perception is the strongest self-report predictor of relationship quality in the research (Joel and colleagues, 2020) — but it is still one side."
              : " You answered about yourself rather than about a specific relationship, so this reads as a pattern across your relationships."}
          </p>
          <p>
            It is not a diagnosis and it is not a prediction. Claims that a test can forecast
            whether a relationship survives have not held up when properly cross-validated
            (Heyman and Slep, 2001), so this report describes what is true now rather than
            what happens next.
          </p>
          <p>
            No questionnaire can tell whether someone answered honestly. Careless answering
            is detectable; deliberate misreporting largely is not.
            {r.assessment.quality.attentionFailed >= 2 &&
              " Two or more attention checks were missed in your responses, so read the numbers with that in mind."}
            {r.assessment.quality.speeding > answered * 0.3 &&
              " A large share of your answers came very quickly, which usually widens the margin of error."}
          </p>
        </div>
        <p className="mt-4 text-sm text-ink-3">
          <Link to="/science" className="underline underline-offset-4 hover:text-ink-2">
            Every source used in this report
          </Link>
          {" · "}
          <Link to="/privacy" className="underline underline-offset-4 hover:text-ink-2">
            How your answers were handled
          </Link>
        </p>
      </section>
    </main>
  );
}
