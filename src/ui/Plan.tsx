import { useState } from 'react'
import type { EvidencePacket } from '../engine/types'
import { PRACTICE_BY_ID, type Practice } from '../engine/practices'
import { cite } from '../engine/sources'
import { resolveEvidence } from './Claim'

/**
 * THE PLAN — the part that makes this therapy rather than an article about therapy.
 *
 * An article explains. A therapist hands you a specific thing to do, in an order, and tells you
 * what it will feel like the first time and what to do when it goes wrong. All three of those are
 * rendered here, for every practice, because the last two are what people actually need and what
 * advice almost never includes.
 *
 * Nothing on this screen was written by a language model. Each practice is a named published
 * intervention, selected in TypeScript against this person's lowest dimensions and filtered
 * against their safety disclosures before it was ever shown.
 */

const STAGE_LABEL: Record<Practice['stage'], { title: string; when: string }> = {
  now: { title: 'Start with this', when: 'This week' },
  week: { title: 'Once that is running', when: 'Week two onward' },
  month: { title: 'When you have the ground for it', when: 'Within a month' },
}

export function Plan({ packet }: { packet: EvidencePacket }) {
  if (packet.practices.length === 0) return null

  const stages: Practice['stage'][] = ['now', 'week', 'month']
  const total = packet.practices.reduce((a, s) => a + (PRACTICE_BY_ID[s.practiceId]?.minutes ?? 0), 0)

  return (
    <section style={{ marginBottom: '3.5rem' }} className="settle">
      <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: '0.75rem' }}>What to actually do, in order</h2>
      <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '0.5rem' }}>
        {packet.practices.length} things, chosen for what your own answers say — not a list of tips.
        Each one is a published intervention with a protocol, and each says what to do when it goes
        badly, because the first attempt usually does.
      </p>
      <p className="attrib" style={{ marginBottom: '2rem' }}>
        About {total} minutes of actual work, spread over a month.
      </p>

      {stages.map((stage) => {
        const inStage = packet.practices.filter((s) => PRACTICE_BY_ID[s.practiceId]?.stage === stage)
        if (inStage.length === 0) return null
        return (
          <div key={stage} style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: 'var(--text-h3)' }}>{STAGE_LABEL[stage].title}</h3>
              <span className="eyebrow">{STAGE_LABEL[stage].when}</span>
            </div>
            {inStage.map((sel) => (
              <PracticeCard key={sel.practiceId} sel={sel} packet={packet} />
            ))}
          </div>
        )
      })}
    </section>
  )
}

function PracticeCard({
  sel,
  packet,
}: {
  sel: EvidencePacket['practices'][number]
  packet: EvidencePacket
}) {
  const p = PRACTICE_BY_ID[sel.practiceId]
  const [open, setOpen] = useState(false)
  if (!p) return null

  const evidence = resolveEvidence(packet, sel.evidenceIds)
  const source = p.sources[0] ? (() => { try { return cite(p.sources[0]!) } catch { return null } })() : null

  return (
    <article className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
          {p.title}
        </h4>
        <span className="eyebrow" style={{ whiteSpace: 'nowrap' }}>
          {p.minutes} min{p.needsPartner ? ' · with them' : ' · on your own'}
        </span>
      </div>

      <p style={{ marginTop: '0.75rem', color: 'var(--color-kajal-soft)', fontSize: 'var(--text-small)' }}>
        {sel.because}
      </p>

      <ol style={{ margin: '1.25rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: '0.7rem' }}>
        {p.steps.map((step, i) => (
          <li key={i} style={{ paddingLeft: '0.25rem' }}>{step}</li>
        ))}
      </ol>

      <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.8rem' }}>
        <Aside label="The first time">{p.firstTime}</Aside>
        <Aside label="If it goes badly">{p.ifItGoesBadly}</Aside>
        <Aside label="How you will know it worked">{p.marker}</Aside>
        {Object.values(p.suppressedBy ?? {}).length > 0 && (
          <Aside label="When this is the wrong tool">{Object.values(p.suppressedBy!)[0]!.why}</Aside>
        )}
      </div>

      <div style={{ marginTop: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span className="attrib">
          {p.tradition}
          {source ? ` · ${source.authors.split(',')[0]} et al., ${source.year}` : ''}
        </span>
        {evidence.length > 0 && (
          <button className="claim-open no-print" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'hide' : `${evidence.length} receipt${evidence.length === 1 ? '' : 's'}`}
          </button>
        )}
      </div>

      {open && (
        <div className="receipt settle">
          <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>Why you, specifically</div>
          {evidence.map((e) => (
            <div key={e.id} style={{ marginBottom: '0.6rem' }}>
              {e.itemText && <div style={{ fontStyle: 'italic', color: 'var(--color-kajal-soft)' }}>“{e.itemText}”</div>}
              <div style={{ fontWeight: 500 }}>{e.detail}</div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

function Aside({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderLeft: '2px solid var(--color-kagaz-edge)', paddingLeft: '0.9rem' }}>
      <div className="eyebrow" style={{ marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: 'var(--text-small)' }}>{children}</div>
    </div>
  )
}
