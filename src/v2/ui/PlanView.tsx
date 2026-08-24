import { useEffect, useState } from "react";
import { DIMENSION_BY_ID } from "../engine/dimensions";
import { SOURCES } from "../engine/sources";
import type { PlanStep } from "../engine/types";

/** THE WORK — the plan, as things to actually do.
 *
 *  Each item says why it was chosen for this person, how it works, what the
 *  evidence behind it is, and the steps. Ticks persist locally so the report
 *  becomes a document you come back to. */

const TICK_KEY = "aaina-v2-plan-ticks";

function useTicks() {
  const [ticks, setTicks] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(TICK_KEY) ?? "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(TICK_KEY, JSON.stringify(ticks));
    } catch {
      /* storage blocked; ticks stay in memory for this session */
    }
  }, [ticks]);
  return [ticks, setTicks] as const;
}

const EVIDENCE_LABEL: Record<string, string> = {
  A: "Strongest evidence — repeatedly tested in controlled trials",
  B: "Good evidence — tested in at least one controlled trial",
  C: "Established clinical practice, less directly tested",
};

export function PlanView({
  plan,
  riskPositive,
}: {
  plan: PlanStep[];
  riskPositive: boolean;
}) {
  const [ticks, setTicks] = useTicks();

  if (plan.length === 0) {
    return (
      <p className="rounded-lg border border-line bg-paper-2 px-4 py-3 text-sm text-ink-2">
        There is not enough in your answers yet to build a plan worth following.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {riskPositive && (
        <p className="rounded-lg border border-signal bg-signal-wash px-4 py-3 text-sm text-ink">
          Because of what you described in the safety section, this plan contains only
          things you can do alone. Exercises that involve doing something together are left
          out on purpose: where there is fear or harm, joint exercises can increase risk,
          and every major couples-therapy protocol excludes them for exactly that reason.
        </p>
      )}

      {plan.map((step) => {
        const done = ticks[step.activity.id] ?? false;
        const dim = step.becauseDimension
          ? DIMENSION_BY_ID.get(step.becauseDimension)
          : undefined;
        const why = dim
          ? `Chosen because “${dim.label}” came out near the ${dim.lowLabel.toLowerCase()} end for you.`
          : step.becauseContradiction
            ? "Chosen because of one of the tensions in your answers, above."
            : "Chosen as core work for the road you picked.";

        return (
          <article
            key={step.activity.id}
            className={`rounded-(--radius-card) border p-6 transition-colors ${
              done ? "border-line bg-paper-2/60" : "border-line bg-paper-2"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-3">
                  Step {step.order} · {step.activity.minutes} min
                  {step.activity.soloOk ? " · you can do this alone" : " · needs both of you"}
                </p>
                <h3
                  className={`mt-1 font-display text-xl ${done ? "text-ink-3 line-through" : "text-ink"}`}
                >
                  {step.activity.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTicks((t) => ({ ...t, [step.activity.id]: !t[step.activity.id] }))
                }
                aria-pressed={done}
                className={`no-print shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  done
                    ? "border-brass bg-brass-wash text-brass-deep"
                    : "border-line text-ink-3 hover:border-signal hover:text-ink"
                }`}
              >
                {done ? "Done" : "Mark done"}
              </button>
            </div>

            <p className="mt-3 text-sm font-medium text-brass-deep">{why}</p>
            <p className="mt-2 leading-relaxed text-ink-2">{step.activity.mechanism}</p>

            <ol className="mt-4 space-y-2">
              {step.activity.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-ink-2">
                  <span className="mt-0.5 shrink-0 text-sm tabular-nums text-ink-3">
                    {i + 1}.
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>

            <p className="mt-4 border-t border-line pt-3 text-xs text-ink-3">
              {EVIDENCE_LABEL[step.activity.evidence]} · {SOURCES[step.activity.citation].short}
            </p>
          </article>
        );
      })}

      <p className="text-sm text-ink-3">
        Ticks are saved on this device only. Nothing about your plan leaves your browser.
      </p>
    </div>
  );
}
