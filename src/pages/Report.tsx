import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Claim } from "../components/Claim";
import { Narrator } from "../components/Narrator";
import { SafetyResources } from "../components/SafetyResources";
import { Palda, ScaleMeter } from "../components/charts";
import { generateReport, type Sentence } from "../engine/report";
import { analyzeCouple } from "../engine/couple";
import { useAnswersStore } from "../store/answers";
import { useSafetyStore } from "../store/safety";
import { usePartnerStore } from "../store/partner";

/** The Verdict Report — R1–R20 sequence rendered with receipts everywhere.
 *  The verdict sits behind an invitation gate (SPIKES-I): the reader chooses
 *  when to see it. Printable via print CSS (no-print on interactive chrome). */

const LEVEL_COPY = {
  high: "Aaina ki roshni saaf hai — aapke jawaab dhyaan se, apni raftaar se diye gaye.",
  moderate: "Aaina ki roshni theek hai, par kuch dhundlapan hai — neeche imaandaari se likha hai kyun.",
  tentative: "Aaina is baar dhundhla hai — jo dikha woh neeche hai, par use halke haath se pakadiye.",
} as const;

function SentenceBlock({ sentence }: { sentence: Sentence }) {
  return (
    <p className="mt-3 max-w-prose leading-relaxed text-ink-soft">
      <Claim evidence={sentence.evidence} answersShown={sentence.answersShown}>
        {sentence.text}
      </Claim>
    </p>
  );
}

export function Report() {
  const answers = useAnswersStore((s) => s.answers);
  const safetyAnswers = useSafetyStore((s) => s.answers);
  const [verdictOpen, setVerdictOpen] = useState(false);

  const partnerAnswers = usePartnerStore((s) => s.answers);
  const partnerFrom = usePartnerStore((s) => s.from);

  const answerList = useMemo(() => Object.values(answers), [answers]);
  const safetyList = useMemo(() => Object.values(safetyAnswers), [safetyAnswers]);
  const report = useMemo(
    () => (answerList.length > 0 ? generateReport(answerList, safetyList) : null),
    [answerList, safetyList],
  );
  const couple = useMemo(
    () =>
      partnerAnswers && answerList.length >= 60
        ? analyzeCouple(answers, partnerAnswers)
        : null,
    [partnerAnswers, answers, answerList.length],
  );

  if (!report) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl font-light text-ink">Aaina abhi khaali hai.</h1>
        <p className="mt-3 text-ink-soft">
          Pehle kuch sawaalon ke jawaab chahiye — tabhi kuch dikh payega.
        </p>
        <Link
          to="/jhalak"
          className="mt-6 self-start rounded-full bg-sindoor px-7 py-3.5 font-medium text-paper shadow-soft hover:bg-sindoor-deep"
        >
          2 minute ki jhalak se shuru karein
        </Link>
      </main>
    );
  }

  const sc = report.scores;

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="reveal font-devanagari text-2xl text-brass-deep">आईना</p>
          <h1 className="reveal mt-2 font-display text-4xl font-light text-ink">Aapka aaina</h1>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print mt-2 rounded-full border border-paper-edge px-4 py-2 text-sm text-ink-soft hover:border-sindoor hover:text-ink"
        >
          Print / PDF
        </button>
      </div>

      {report.danger && (
        <div className="reveal mt-8 no-print">
          <SafetyResources />
        </div>
      )}

      <Narrator report={report} />

      {/* R10 — affirmation first */}
      <section className="reveal-late mt-8">
        <SentenceBlock sentence={report.affirmation} />
      </section>

      {/* Honest-confidence meter */}
      <section className="reveal-late mt-6 rounded-(--radius-card) border border-paper-edge bg-paper-deep p-6">
        <h2 className="font-display text-xl text-ink">Roshni kitni saaf hai</h2>
        <p className="mt-2 text-ink-soft">{LEVEL_COPY[report.confidence.level]}</p>
        <ul className="mt-3 space-y-1.5">
          {report.confidence.reasons.map((r) => (
            <li key={r} className="text-sm leading-relaxed text-ink-soft">· {r}</li>
          ))}
        </ul>
      </section>

      {/* R9/R4 — Level-1 confirmations, their own words */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-light text-ink">Jo aap pehle se jaante the</h2>
        {report.confirmations.map((c) => (
          <SentenceBlock key={c.text.slice(0, 40)} sentence={c} />
        ))}
      </section>

      {/* Scale profile — each scale on its own published range */}
      <section className="mt-8 rounded-(--radius-card) border border-paper-edge p-6">
        <h2 className="font-display text-xl text-ink">Aapke jawaabon ka naksha</h2>
        {sc.csi16 !== null && (
          <ScaleMeter
            label="Sukoon (satisfaction)"
            hint="Couples Satisfaction Index, 16 sawaal (Funk & Rogge, 2007), 0–81"
            value={sc.csi16}
            min={0}
            max={81}
            cutoff={51.5}
            cutoffLabel="51.5 — published distress-cutoff"
            valueText={`${Math.round(sc.csi16)} / 81`}
          />
        )}
        {sc.imsCommitment !== null && (
          <ScaleMeter
            label="Commitment"
            hint="Investment Model Scale (Rusbult et al., 1998), 0–8"
            value={sc.imsCommitment}
            min={0}
            max={8}
            valueText={`${sc.imsCommitment.toFixed(1)} / 8`}
          />
        )}
        {sc.cpqConstructive !== null && (
          <ScaleMeter
            label="Sulajhaane waali baat-cheet"
            hint="CPQ constructive communication (Christensen; Crenshaw et al., 2017), 4–36"
            value={sc.cpqConstructive}
            min={4}
            max={36}
            valueText={`${Math.round(sc.cpqConstructive)} / 36`}
          />
        )}
        {sc.cpqDemandWithdraw !== null && (
          <ScaleMeter
            label="Zor–chuppi ka chakkar"
            hint="CPQ demand/withdraw, 6–54 — kam behtar hai"
            value={sc.cpqDemandWithdraw}
            min={6}
            max={54}
            valueText={`${Math.round(sc.cpqDemandWithdraw)} / 54`}
          />
        )}
        {sc.ecrAnxiety !== null && (
          <ScaleMeter
            label="Kho dene ka dar (attachment anxiety)"
            hint="ECR-Short Form (Wei et al., 2007), 1–7"
            value={sc.ecrAnxiety}
            min={1}
            max={7}
            valueText={`${sc.ecrAnxiety.toFixed(1)} / 7`}
          />
        )}
        {sc.ecrAvoidance !== null && (
          <ScaleMeter
            label="Doori ka aaram (attachment avoidance)"
            hint="ECR-Short Form (Wei et al., 2007), 1–7"
            value={sc.ecrAvoidance}
            min={1}
            max={7}
            valueText={`${sc.ecrAvoidance.toFixed(1)} / 7`}
          />
        )}
        {sc.stayStrength !== null && sc.leaveStrength !== null && (
          <div className="mt-4 border-t border-paper-edge pt-4">
            <h3 className="text-sm font-medium text-ink">Dono taraf ke palde</h3>
            <Palda stay={sc.stayStrength} leave={sc.leaveStrength} />
          </div>
        )}
      </section>

      {/* Do Aaine — perception gaps (couple mode) */}
      {couple && (
        <section className="mt-8 rounded-(--radius-card) border border-brass p-6">
          <p className="font-devanagari text-lg text-brass-deep">दो आईने</p>
          <h2 className="mt-1 font-display text-2xl font-light text-ink">
            Do nazrein, ek rishta{partnerFrom ? ` — aap aur ${partnerFrom}` : ""}
          </h2>
          <p className="mt-3 max-w-prose leading-relaxed text-ink-soft">
            <Claim evidence={couple.framing.evidence}>{couple.framing.text}</Claim>
          </p>
          <div className="mt-4 space-y-4">
            {couple.scaleGaps.map((g) => (
              <div key={g.key}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-ink">{g.label}</p>
                  <p className="text-xs tabular-nums text-ink-faint">
                    farak {(g.gap * 100).toFixed(0)}%
                  </p>
                </div>
                {[
                  { who: "Aap", v: g.mine },
                  { who: partnerFrom || "Saathi", v: g.theirs },
                ].map((row) => (
                  <div key={row.who} className="mt-1 flex items-center gap-2">
                    <span className="w-14 shrink-0 text-xs text-ink-faint">{row.who}</span>
                    <div className="relative h-2 flex-1 rounded-full bg-paper-edge">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-ink-soft"
                        style={{ width: `${Math.max(2, row.v * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {couple.agreementNote && (
            <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">
              <Claim evidence={couple.agreementNote.evidence}>
                {couple.agreementNote.text}
              </Claim>
            </p>
          )}
          {couple.topGaps.length > 0 && (
            <div className="mt-5 border-t border-paper-edge pt-4">
              <h3 className="text-sm font-medium text-ink">
                Jahan nazrein sabse alag thi
              </h3>
              <ul className="mt-2 space-y-3">
                {couple.topGaps.map((g) => (
                  <li key={g.itemId} className="text-sm leading-relaxed text-ink-soft">
                    <Claim evidence={g.evidence}>
                      {`"${g.itemText}" — aapne kaha ${g.mineLabel ? `"${g.mineLabel}"` : "—"}, ${partnerFrom || "saathi"} ne kaha ${g.theirsLabel ? `"${g.theirsLabel}"` : "—"}.`}
                    </Claim>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* R12 — the cycle, named */}
      {report.cycle && (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-light text-ink">Pattern ka naam</h2>
          <SentenceBlock sentence={report.cycle} />
        </section>
      )}

      {/* R5/R6 — warning shot + invitation gate */}
      <section className="mt-10">
        {!verdictOpen ? (
          <div className="mirror-sheen rounded-(--radius-card) p-8 text-center shadow-lift">
            <p className="mx-auto max-w-prose leading-relaxed text-ink">{report.warningShot}</p>
            <button
              type="button"
              onClick={() => setVerdictOpen(true)}
              className="no-print mt-6 rounded-full bg-sindoor px-8 py-3.5 font-medium text-paper shadow-soft hover:bg-sindoor-deep"
            >
              Main taiyaar hoon — dikhaiye
            </button>
            <p className="mt-3 text-xs text-ink-faint no-print">
              Print mein yeh hissa apne aap khul jaata hai.
            </p>
          </div>
        ) : (
          <div className="mirror-sheen reveal rounded-(--radius-card) p-8 shadow-lift">
            <p className="font-devanagari text-lg text-brass-deep">सच</p>
            {report.verdict.map((v) => (
              <SentenceBlock key={v.text.slice(0, 40)} sentence={v} />
            ))}
            <p className="mt-5 border-t border-brass/30 pt-4 text-ink-soft">{report.empathy}</p>
          </div>
        )}
        {/* Print always shows the verdict (invitation gate is screen-only). */}
        {!verdictOpen && (
          <div className="hidden print:block">
            {report.verdict.map((v) => (
              <SentenceBlock key={v.text.slice(0, 40)} sentence={v} />
            ))}
          </div>
        )}
      </section>

      <div className={verdictOpen || report.danger ? undefined : "hidden print:block"}>
        <>
          {/* R15 — three paths, each with a cost */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-light text-ink">
              Teen raaste — har ek ki apni keemat
            </h2>
            <div className="mt-4 space-y-4">
              {report.paths.map((p) => (
                <div key={p.title} className="rounded-(--radius-card) border border-paper-edge p-6">
                  <h3 className="font-display text-lg text-ink">{p.title}</h3>
                  <SentenceBlock sentence={p.body} />
                  <SentenceBlock sentence={p.cost} />
                </div>
              ))}
            </div>
          </section>

          {/* R16 — time-boxed experiment */}
          {report.experiment && (
            <section className="mt-8 rounded-(--radius-card) border border-brass bg-brass-tint p-6">
              <h2 className="font-display text-xl text-ink">Agar aazmaana ho, toh aise</h2>
              <SentenceBlock sentence={report.experiment} />
            </section>
          )}

          {/* R17 — own contribution */}
          {report.ownContribution && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-light text-ink">Aaina dono taraf dekhta hai</h2>
              <SentenceBlock sentence={report.ownContribution} />
            </section>
          )}

          {/* R1 — autonomy */}
          <section className="mt-10 border-t border-paper-edge pt-6">
            <p className="max-w-prose leading-relaxed text-ink">{report.autonomy}</p>
          </section>
        </>
      </div>

      <div className="no-print mt-12 flex flex-wrap items-center gap-4">
        <Link to="/" className="text-sindoor underline underline-offset-4">← Ghar wapas</Link>
        <Link to="/aaina" className="text-sm text-ink-faint underline decoration-dotted underline-offset-4">
          Chapters dekhein
        </Link>
      </div>
      <p className="mt-6 max-w-prose text-xs leading-relaxed text-ink-faint">
        Aaina ek self-report padhai hai — koi bhavishyavaani nahi, koi diagnosis
        nahi. Jo insaan jhooth likhna chahe, use koi questionnaire nahi pakad
        sakta; isliye aaina sirf utna kehta hai jitna aapke jawaab kehte hain.
        Poori science: SCIENCE.md (GitHub par) mein har source listed hai.
      </p>
    </main>
  );
}
