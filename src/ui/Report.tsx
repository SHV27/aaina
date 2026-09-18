import { Fragment, useEffect, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useReport } from '../state/report'
import { useAnswers } from '../state/answers'
import { useSafety } from '../state/safety'
import { compositeOf } from '../engine/derive'
import { SHAPE_COPY, SELF_SHAPE_COPY, selfShapeOf } from '../engine/axes'
import { DIM_BY_ID } from '../engine/dimensions'
import type { EvidencePacket, Finding, ReportSection } from '../engine/types'
import { Claim } from './Claim'
import { Plan } from './Plan'
import { Takeaway } from './Takeaway'
import { Meter, DimensionMeter, Plate, Wordmark, AmbientSupport, DegradedBanner } from './bits'

const SECTION_PLATE: Record<string, string> = {
  opening: 'utka',
  working: 'parrot',
  theme: 'falcon',
  holding: 'horse',
  standing: 'shri-raga',
  future: 'stork',
  pattern: 'dyer',
}

export function Report() {
  const [, navigate] = useLocation()
  const report = useReport()
  const answered = useAnswers((s) => Object.keys(s.answers).length)

  useEffect(() => {
    if (answered === 0) { navigate('/'); return }
    if (!report.packet && !report.running) void report.build()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const packet = report.packet
  if (!packet) return <Building done={0} total={0} />

  return (
    <main>
      <div className="wrap no-print" style={{ paddingBlock: '1.5rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}><Wordmark size="1rem" mark={26} /></Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <PrintControls />
          </div>
        </header>
      </div>

      <Verdict packet={packet} />

      <div className="read" style={{ paddingBlock: 'clamp(2rem, 6vh, 3.5rem)' }}>
        <DegradedBanner message={report.degraded} />

        {report.running && (
          <div className="card no-print settle" style={{ marginBottom: '2rem' }} role="status">
            <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>
              Writing — section {Math.min(report.done + 1, report.total)} of {report.total}
            </div>
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-kajal-soft)', margin: 0 }}>
              This takes about three minutes, and that is an honest number rather than a spinner:
              Aaina runs on free infrastructure that writes roughly five sections a minute. Sections
              appear as they are finished, so there is already something below to read.
            </p>
          </div>
        )}

        {report.sections.map((section) => (
          <Fragment key={section.id}>
            <Section
              section={section}
              packet={packet}
              rederiving={report.rederiving.includes(section.id)}
            />
            {/* The staged plan renders from the engine, not from prose: named interventions
                chosen for this person and filtered against their safety disclosures.

                It sits directly under the plan section because the writer is given these exact
                practices and writes that section about them. Rendered at the end of the document
                instead, the prose introducing the steps and the steps themselves were separated
                by every remaining section, and read as two different plans. */}
            {section.id === 'plan' && <Plan packet={packet} />}
          </Fragment>
        ))}

        {/* If the plan section was dropped for want of evidence, the work still has to appear. */}
        {!report.running && report.sections.length > 0 && !report.sections.some((s) => s.id === 'plan') && (
          <Plan packet={packet} />
        )}

        {/* One page. Clarity is less to think about, not more — a ten-thousand-word report can
            leave an overthinker with more to churn on than they arrived with. */}
        {!report.running && report.sections.length > 0 && <Takeaway packet={packet} />}

        {!report.running && report.sections.length > 0 && (
          <Closing packet={packet} limitsAlreadyShown={report.sections.some((s) => s.id === 'limits')} />
        )}
      </div>

      <div className="wrap" style={{ paddingBottom: '3rem' }}><AmbientSupport /></div>
    </main>
  )
}

/* ────────────────────────────  the verdict  ──────────────────────────── */

/**
 * The only place brass appears in the entire product, and it is a fill, never text — brass on
 * paper is 2.14:1, which fails every contrast standard there is. The seal carries ink at 6.70:1.
 *
 * The four axes are shown apart because that separation IS the insight. Rusbult & Martz (1995)
 * found that among women in abusive relationships, what predicted staying was investment and poor
 * alternatives — not satisfaction. Quality and Hold have to be readable as different numbers or
 * the most important thing this product can tell someone becomes invisible.
 */
function Verdict({ packet }: { packet: EvidencePacket }) {
  const isRelationship = packet.context.lens === 'relationship'
  /* A self-knowledge report has no verdict to give. It has a shape — how clearly somebody sees
     themselves, and how kindly they treat what they see — and those are separable. Rendering the
     relationship verdict here put "we do not have enough to give you a reading" at the top of a
     perfectly complete self report. */
  const shape = isRelationship
    ? SHAPE_COPY[packet.axes.shape]
    : SELF_SHAPE_COPY[selfShapeOf(packet.dimensions)]
  const comp = compositeOf(packet)

  return (
    <section className="wrap" style={{ paddingBottom: '2rem' }}>
      <div className="verdict" style={{ padding: 'clamp(1.75rem, 5vw, 3rem)' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div className="verdict-seal" aria-hidden="true">आ</div>
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.4rem' }}>
              {isRelationship ? 'Where this stands today' : 'What your answers say'}
            </div>
            <h1 style={{ fontSize: 'var(--text-h1)', maxWidth: '24ch' }}>{shape.title}</h1>
          </div>
        </div>

        <p style={{ maxWidth: '62ch', marginBottom: '2rem', color: '#e8dfce' }}>{shape.lead}</p>

        {isRelationship && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Axis label="Quality" value={packet.axes.quality} hint="how it is actually going" />
            <Axis label="Pull" value={packet.axes.pull} hint="what draws you here" />
            <Axis label="Hold" value={packet.axes.hold} hint="what makes leaving hard" />
            <Axis label="Confidence" value={Math.round(packet.axes.confidence * 100)} hint="how much we measured" />
          </div>
        )}

        <p style={{ fontSize: 'var(--text-small)', color: '#bfae92', maxWidth: '60ch' }}>
          {isRelationship
            ? `Every percentage here is how far up its scale you answered, not a comparison against strangers and not a prediction. The overall figure weights ${comp.contributions.length} dimensions by published effect sizes — open any bar below and you have opened the maths.`
            : 'Every percentage here is how far up its scale you answered — a restatement of what you did, which you can check by opening it.'}
        </p>
      </div>
    </section>
  )
}

function Axis({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div>
      <div className="num" style={{ fontSize: '2.4rem', color: 'var(--color-peetal)', lineHeight: 1 }}>{value}%</div>
      <div style={{ fontSize: 'var(--text-small)', marginTop: '0.35rem', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-micro)', color: '#bfae92' }}>{hint}</div>
    </div>
  )
}

/* ────────────────────────────  sections  ──────────────────────────── */

function Section({ section, packet, rederiving }: { section: ReportSection; packet: EvidencePacket; rederiving: boolean }) {
  const plate = SECTION_PLATE[section.id]
  const findings = packet.findings.filter((f) => section.paragraphs.some((p) => p.findingId === f.id))

  return (
    <section style={{ marginBottom: '3.5rem', opacity: rederiving ? 0.45 : 1, transition: 'opacity 240ms' }} className="settle">
      {plate && <Plate slug={plate} height={110} showAttribution={false} />}

      <h2 style={{ fontSize: 'var(--text-h2)', margin: plate ? '1.5rem 0 1.25rem' : '0 0 1.25rem' }}>
        {section.title}
      </h2>

      {rederiving && (
        <div className="attrib no-print" style={{ marginBottom: '1rem' }} role="status">
          Rewriting this section without the claim you rejected…
        </div>
      )}

      {section.paragraphs.map((p) => (
        <Claim key={p.id} text={p.text} evidenceIds={p.evidenceIds} packet={packet} />
      ))}

      {section.id === 'standing' && <DimensionTable packet={packet} />}

      {findings.map((f) => (
        <ReactionControl key={f.id} finding={f} />
      ))}

      {section.status === 'deterministic' && (
        <div className="attrib" style={{ marginTop: '1rem' }}>
          {section.fallbackReason}
        </div>
      )}
      {section.writtenBy && section.fallbackReason && (
        <div className="attrib" style={{ marginTop: '1rem' }}>{section.fallbackReason}</div>
      )}
    </section>
  )
}

/**
 * THE INNOVATION — the report argues back.
 *
 * Every reference product in this category delivers a static verdict: you read it, it does not
 * read you. A ✗ here is not a thumbs-down that files a ticket. It is new evidence — the finding
 * is dropped, the plan is recomputed, and every section leaning on it is rewritten in front of
 * the reader. A claim you have rejected must not still be holding up a verdict three sections on.
 */
function ReactionControl({ finding }: { finding: Finding }) {
  const react = useReport((s) => s.react)
  const current = useReport((s) => s.reactions[finding.id] ?? null)

  return (
    <div className="reaction no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '-0.35rem', marginBottom: '1.75rem' }}>
      <span className="attrib">Kya yeh sach lagta hai?</span>
      <button
        className="btn btn-quiet"
        style={{ padding: '0.35rem 0.85rem', fontSize: 'var(--text-small)', ...(current === 'yes' ? { borderColor: 'var(--color-sindoor)', background: 'var(--color-sindoor-wash)' } : {}) }}
        onClick={() => void react(finding.id, current === 'yes' ? null : 'yes')}
      >
        Yes, that is true
      </button>
      <button
        className="btn btn-quiet"
        style={{ padding: '0.35rem 0.85rem', fontSize: 'var(--text-small)', ...(current === 'no' ? { borderColor: 'var(--color-sindoor)', background: 'var(--color-sindoor-wash)' } : {}) }}
        onClick={() => void react(finding.id, current === 'no' ? null : 'no')}
      >
        No, that is not me
      </button>
      {current === 'no' && <span className="attrib">Dropped. Anything resting on it is being rewritten.</span>}
    </div>
  )
}

function DimensionTable({ packet }: { packet: EvidencePacket }) {
  const comp = compositeOf(packet)
  const scored = [...packet.dimensions].sort((a, b) => b.pomp - a.pomp)

  return (
    <div style={{ marginBlock: '2rem' }}>
      <div className="eyebrow" style={{ marginBottom: '1rem' }}>Every dimension, measured</div>
      {scored.map((s) => (
        <DimensionMeter key={s.id} scored={s} />
      ))}

      {comp.contributions.length > 0 && (
        <details style={{ marginTop: '1.5rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: 'var(--text-small)', color: 'var(--color-sindoor)' }}>
            How the overall figure is built
          </summary>
          <div className="card" style={{ marginTop: '0.85rem' }}>
            <p style={{ fontSize: 'var(--text-small)', marginBottom: '1rem', color: 'var(--color-kajal-soft)' }}>
              Weights come from published effect sizes — Joel et al. (2020) across 11,196 couples,
              and Le et al. (2010) across 137 studies. They are derived, not chosen by us. The bars
              below sum to the number at the top of this report.
            </p>
            {comp.contributions.map((c) => (
              <Meter
                key={c.id}
                value={c.oriented}
                label={`${DIM_BY_ID[c.id].label} — ${c.share}% of the total`}
                muted
              />
            ))}
            {comp.excluded.length > 0 && (
              <p className="attrib" style={{ marginTop: '1rem' }}>
                Left out because too few questions were answered:{' '}
                {comp.excluded.map((id) => DIM_BY_ID[id].label).join(', ')}. Excluded rather than guessed at.
              </p>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

function Closing({ packet, limitsAlreadyShown }: { packet: EvidencePacket; limitsAlreadyShown: boolean }) {
  return (
    <section style={{ marginTop: '1rem' }}>
      <hr className="rule" style={{ marginBottom: '2rem' }} />
      {!limitsAlreadyShown && (
        <>
          <h2 style={{ fontSize: 'var(--text-h3)', marginBottom: '1rem' }}>What this cannot tell you</h2>
          {packet.limits.map((l) => (
            <p key={l} style={{ marginBottom: '0.85rem', color: 'var(--color-kajal-soft)', fontSize: 'var(--text-small)' }}>{l}</p>
          ))}
        </>
      )}
      <div className="no-print" style={{ marginTop: '2rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
        <Link href="/science" className="btn btn-quiet">How this was measured</Link>
        <Link href="/privacy" className="btn btn-quiet">What happens to your answers</Link>
      </div>
    </section>
  )
}

/**
 * The print boundary — the one place where the safety chapter's content can leave as a file.
 * Defaults OFF, with one line explaining why. Not suppression, and not a trap: a person may print
 * this on a shared machine, or leave it in a drawer someone else opens.
 */
function PrintControls() {
  const safety = useSafety()
  const flagged = Object.keys(safety.answers).length > 0
  const [open, setOpen] = useState(false)

  if (!flagged) {
    return <button className="btn btn-quiet" onClick={() => window.print()}>Save as PDF</button>
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-quiet" onClick={() => setOpen((o) => !o)}>Save as PDF</button>
      {open && (
        <div className="card settle" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', width: 320, zIndex: 20, background: 'var(--color-kagaz)' }}>
          <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: 'var(--text-small)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={safety.includeInPrint}
              onChange={(e) => safety.setIncludeInPrint(e.target.checked)}
              style={{ marginTop: '0.25rem', accentColor: 'var(--color-sindoor)' }}
            />
            <span>
              Include the safety chapter in the file.
              <span style={{ display: 'block', color: 'var(--color-kajal-soft)', marginTop: '0.3rem' }}>
                Off by default, because a printed file can be found. Nothing about that chapter is
                removed from this screen either way.
              </span>
            </span>
          </label>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => { setOpen(false); window.print() }}>
            Print
          </button>
        </div>
      )}
    </div>
  )
}

function Building({ done, total }: { done: number; total: number }) {
  return (
    <main className="read" style={{ paddingBlock: '5rem', textAlign: 'center' }}>
      <Plate slug="hoopoe" height={180} showAttribution={false} />
      <h1 style={{ fontSize: 'var(--text-h2)', margin: '2rem 0 0.75rem' }}>Reading your answers back.</h1>
      <p style={{ color: 'var(--color-kajal-soft)' }}>
        {total > 0 ? `Section ${done + 1} of ${total}.` : 'This takes about a minute.'}
      </p>
    </main>
  )
}
