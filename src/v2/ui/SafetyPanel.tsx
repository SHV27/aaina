import type { RiskResult } from "../engine/risk";

/** Shown first when the safety screen is positive. The analysis is still
 *  delivered in full below it — but this comes before anything else, and the
 *  language follows WHO first-line support: listen, validate, never judge,
 *  never ask why they have not left. */

const HELPLINES = [
  { number: "112", name: "Emergency — police and medical", note: "24 hours, all of India" },
  { number: "181", name: "Women's Helpline", note: "24 hours · police, shelter, legal aid, One Stop Centres" },
  { number: "14416", name: "Tele-MANAS", note: "24 hours · free counselling, 20 languages" },
  { number: "9999666555", name: "Vandrevala Foundation", note: "24 hours · call or WhatsApp" },
  { number: "9152987821", name: "iCall, TISS", note: "Mon–Sat, 10am–8pm · professional counsellors" },
  { number: "+919820466726", name: "AASRA", note: "24 hours · emotional distress" },
  { number: "01124373737", name: "Shakti Shalini, Delhi", note: "10am–6pm · all genders" },
  { number: "14490", name: "National Commission for Women", note: "Formal complaints" },
  { number: "8882498498", name: "SIF-One", note: "Volunteer-run support line for men" },
];

export function SafetyPanel({ result }: { result: RiskResult }) {
  return (
    <section
      aria-label="Safety information"
      className="rounded-(--radius-card) border-2 border-signal bg-signal-wash p-7"
    >
      <h2 className="font-display text-2xl font-normal text-signal-deep">
        Before the rest of the report
      </h2>
      <div className="prose-aaina mt-3 text-ink">
        <p>
          Some of what you described in the last section —{" "}
          {result.physicalOrSexual
            ? "physical or sexual harm"
            : result.frightened
              ? "being frightened by what your partner says or does"
              : "the level of tension and difficulty"}{" "}
          — is the kind of thing that changes what good advice looks like.{" "}
          <strong>None of this is your fault.</strong> You are not being judged here, and
          nothing you answered has been saved.
        </p>
        <p>
          Your full reading is below, exactly as it would be otherwise. The one thing that
          changed is your plan: it now contains only things you can do on your own, because
          exercises done together can raise the risk when someone is being hurt.
        </p>
      </div>

      <ul className="mt-5 space-y-2">
        {HELPLINES.map((h) => (
          <li key={h.number} className="flex flex-wrap items-baseline gap-x-3">
            <a
              href={`tel:${h.number}`}
              className="font-medium text-signal-deep underline underline-offset-4"
            >
              {h.number}
            </a>
            <span className="text-ink">{h.name}</span>
            <span className="text-sm text-ink-2">{h.note}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 max-w-prose text-sm leading-relaxed text-ink-2">
        In law, the Protection of Women from Domestic Violence Act (2005) covers physical,
        sexual, verbal, emotional and economic abuse, including in live-in relationships,
        and offers protection orders, the right to remain in the shared household, and
        monetary relief — through a Protection Officer, a magistrate, or an NGO, without
        needing to file a criminal case. This is context, not legal advice; the numbers
        above can point you to someone who gives that properly.
      </p>
      <p className="mt-3 text-sm text-ink-2">
        If the device you are reading this on is shared or watched, it is safer to memorise
        one number than to keep this page open.
      </p>
    </section>
  );
}
