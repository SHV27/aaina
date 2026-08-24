import { Link } from "react-router-dom";
import { DIMENSIONS } from "../engine/dimensions";
import { SOURCES, type CitationId } from "../engine/sources";
import { ITEMS, SCOREABLE_COUNT } from "../engine/items";
import { ACTIVITIES } from "../engine/activities";

/** The page that answers "iska base kya hai?" — every dimension, every source,
 *  and an honest list of what is adapted rather than validated. */

export function Science() {
  const used = new Set<CitationId>([
    ...ITEMS.map((i) => i.citation),
    ...ACTIVITIES.map((a) => a.citation),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="rise font-display text-4xl font-light text-ink">
        The research behind this
      </h1>
      <p className="rise-2 mt-4 max-w-prose text-ink-2">
        Aaina measures {DIMENSIONS.length} dimensions using {SCOREABLE_COUNT} questions, and
        prescribes work from {ACTIVITIES.length} interventions. Every one traces to published,
        peer-reviewed research. This page exists so you can check that, or hand it to
        someone qualified and ask them to.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-light text-ink">What is measured</h2>
        <div className="mt-4 space-y-3">
          {DIMENSIONS.map((d) => {
            const n = ITEMS.filter(
              (i) => i.dimension === d.id && i.instructedValue === undefined,
            ).length;
            return (
              <div key={d.id} className="border-b border-line pb-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-medium text-ink">{d.label}</h3>
                  <span className="text-xs uppercase tracking-wide text-ink-3">
                    {n} questions · {d.group}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-2">{d.measures}</p>
                <p className="mt-1 text-sm text-ink-3">{SOURCES[d.citation].full}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-light text-ink">
          The work it prescribes
        </h2>
        <p className="mt-2 text-ink-2">
          Each activity carries the study behind it and how strong that evidence is.
        </p>
        <div className="mt-4 space-y-3">
          {ACTIVITIES.map((a) => (
            <div key={a.id} className="border-b border-line pb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium text-ink">{a.title}</h3>
                <span className="text-xs uppercase tracking-wide text-ink-3">
                  evidence {a.evidence}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-2">{a.mechanism}</p>
              <p className="mt-1 text-sm text-ink-3">{SOURCES[a.citation].short}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-light text-ink">Honest about the edges</h2>
        <div className="prose-aaina mt-3">
          <p>
            <strong>Two dimensions are bespoke.</strong> Family acceptance and life-direction
            agreement have no free validated instrument, and Western scales largely assume a
            couple decides alone. Indian youth research shows otherwise — roughly six percent
            of young Indians fully chose their own spouse while about three quarters believe
            they should be able to (Lokniti-CSDS, 2017). Those questions were therefore
            written for this product, anchored to the finding that the surrounding network's
            view predicts whether relationships last (Sprecher and Felmlee, 1992). They are
            read descriptively and are not claimed to be validated scales.
          </p>
          <p>
            <strong>Some scales are used in part.</strong> Where a published instrument is
            behind a paywall and only part of it could be verified word for word, Aaina uses
            only the verified questions rather than reconstructions found on the internet.
            That applies to the electronic-surveillance and social-media jealousy items, and
            to the relational uncertainty items.
          </p>
          <p>
            <strong>No test can detect deliberate dishonesty.</strong> Careless answering is
            measurable — speed, repetition, missed attention checks — and it is reported to
            you. Someone determined to misrepresent their relationship can do so, in this
            and in every self-report instrument ever written.
          </p>
          <p>
            <strong>This is not prediction.</strong> Claims that an assessment can forecast
            whether a relationship will end have collapsed under proper cross-validation
            (Heyman and Slep, 2001). Aaina describes the present.
          </p>
          <p>
            <strong>Deliberately not used:</strong> personality-type systems, which do not
            hold up on retest; the five love languages, whose core claims are unsupported
            (Impett, Park and Muise, 2024); and any single compatibility percentage offered
            as a verdict.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-light text-ink">Full source list</h2>
        <ol className="mt-4 space-y-3">
          {[...used].sort().map((id) => (
            <li key={id} className="text-sm leading-relaxed text-ink-2">
              {SOURCES[id].full}
              <span className="block text-ink-3">Used for: {SOURCES[id].measures}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-sm text-ink-3">
        <Link to="/" className="underline underline-offset-4 hover:text-ink-2">
          Back
        </Link>
      </p>
    </main>
  );
}
