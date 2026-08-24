import { useNavigate } from "react-router-dom";
import { useSession, type Context } from "../store/session";
import { SECTIONS } from "../engine/items";

/** Context first. Four quick questions that decide which items are asked and
 *  how the report is framed. Nothing here is scored. */

const STAGES: { id: Context["stage"]; label: string; hint: string }[] = [
  { id: "dating", label: "Dating", hint: "Seeing each other, early or established" },
  { id: "situationship", label: "Undefined", hint: "Something is happening, but neither of you has named it" },
  { id: "committed", label: "Committed", hint: "Together properly, no wedding involved" },
  { id: "engaged-arranged", label: "Deciding to marry", hint: "Engaged, or considering a match" },
  { id: "married", label: "Married", hint: "Any length of time" },
  { id: "ending", label: "Ending or ended", hint: "It is over, or nearly" },
];

const AGES: { id: Context["ageBand"]; label: string }[] = [
  { id: "under-22", label: "Under 22" },
  { id: "22-29", label: "22–29" },
  { id: "30-39", label: "30–39" },
  { id: "40-plus", label: "40 or older" },
];

function Choice({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border px-5 py-3 text-left transition-colors ${
        selected
          ? "border-signal bg-signal-wash text-ink"
          : "border-line bg-paper-2 text-ink-2 hover:border-signal hover:text-ink"
      }`}
    >
      <span className="block font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-sm text-ink-3">{hint}</span>}
    </button>
  );
}

export function Start() {
  const navigate = useNavigate();
  const context = useSession((s) => s.context);
  const setContext = useSession((s) => s.setContext);
  const totalMinutes = SECTIONS.reduce((a, s) => a + s.minutes, 0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="rise font-display text-3xl font-light text-ink sm:text-4xl">
        Before the questions, four quick things.
      </h1>
      <p className="rise mt-3 text-ink-2">
        None of this is scored. It decides which questions are worth your time.
      </p>

      <section className="rise-2 mt-10">
        <h2 className="font-display text-xl text-ink">
          Is there a specific person this is about?
        </h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <Choice
            selected={context.hasPartner}
            onClick={() => setContext({ hasPartner: true })}
            label="Yes"
            hint="Someone particular, whether or not you are together"
          />
          <Choice
            selected={!context.hasPartner}
            onClick={() => setContext({ hasPartner: false, partnerWilling: false })}
            label="No — this is about me"
            hint="Patterns across relationships, not one person"
          />
        </div>
      </section>

      {context.hasPartner && (
        <>
          <section className="rise-2 mt-10">
            <h2 className="font-display text-xl text-ink">Where are you with them?</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {STAGES.map((s) => (
                <Choice
                  key={s.id}
                  selected={context.stage === s.id}
                  onClick={() => setContext({ stage: s.id })}
                  label={s.label}
                  hint={s.hint}
                />
              ))}
            </div>
          </section>

          <section className="rise-2 mt-10">
            <h2 className="font-display text-xl text-ink">
              Realistically, would they do exercises with you?
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              This changes your plan. Most people answer no, and the plan works either way.
            </p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <Choice
                selected={context.partnerWilling}
                onClick={() => setContext({ partnerWilling: true })}
                label="Yes, probably"
                hint="You could ask and they would try"
              />
              <Choice
                selected={!context.partnerWilling}
                onClick={() => setContext({ partnerWilling: false })}
                label="No, or I would rather not ask"
                hint="Everything you get will be yours to do alone"
              />
            </div>
          </section>
        </>
      )}

      <section className="rise-3 mt-10">
        <h2 className="font-display text-xl text-ink">Your age</h2>
        <p className="mt-1 text-sm text-ink-3">Used only to pick relevant examples.</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {AGES.map((a) => (
            <Choice
              key={a.id}
              selected={context.ageBand === a.id}
              onClick={() => setContext({ ageBand: a.id })}
              label={a.label}
            />
          ))}
        </div>
      </section>

      <div className="rise-3 mt-12 rounded-(--radius-card) border border-line bg-paper-2 p-6">
        <h2 className="font-display text-lg text-ink">What happens next</h2>
        <ol className="mt-3 space-y-1.5 text-sm text-ink-2">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <span className="text-ink-3">{i + 1}.</span> {s.title}{" "}
              <span className="text-ink-3">· about {s.minutes} min</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink-3">
          About {totalMinutes} minutes in total. Every answer saves as you go, so you can
          stop and come back. You can skip any question you would rather not answer.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/assessment")}
        className="mt-8 rounded-full bg-signal px-8 py-4 font-medium text-paper shadow-card transition-all hover:bg-signal-deep hover:shadow-lift"
      >
        Start the questions
      </button>
    </main>
  );
}
