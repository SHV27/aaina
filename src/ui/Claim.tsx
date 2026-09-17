import { useState } from 'react'
import type { Evidence, EvidencePacket } from '../engine/types'
import { cite } from '../engine/sources'

/**
 * THE CLAIM RENDERER — LAW 1 made physical.
 *
 * `evidenceIds` is not optional. A paragraph that cannot name the answers behind it does not
 * render at all; it is replaced by the deterministic text for its slot. This is enforced three
 * times — in the serverless function, in the client orchestrator, and here — because a guard that
 * exists in one place is a guard the second call site will bypass.
 *
 * And the evidence OPENS. Not a footnote marker, not a citation number: the actual question they
 * were asked and the actual answer they gave. That distinction is the whole product. Snyder &
 * Larson (1972) showed identical generic feedback is rated MORE accurate when merely labelled
 * "written for you" — so the label is the manipulation, and only openable evidence defeats it.
 */

export function resolveEvidence(packet: EvidencePacket, ids: string[]): Evidence[] {
  const pool = new Map<string, Evidence>()
  for (const f of packet.findings) for (const e of f.evidence) pool.set(e.id, e)
  for (const q of packet.quotes) pool.set(q.id, q)
  for (const d of packet.dimensions) {
    pool.set(`ev:dim:${d.id}`, {
      id: `ev:dim:${d.id}`,
      kind: 'dimension',
      label: d.id,
      detail: `${d.pomp}% — from ${d.answered} answer${d.answered === 1 ? '' : 's'}`,
      sources: [],
    })
  }
  return ids.map((id) => pool.get(id)).filter((e): e is Evidence => !!e)
}

interface Props {
  text: string
  evidenceIds: string[]
  packet: EvidencePacket
  /** The receipts drawer is suppressed in print unless the reader asked for it. */
  printReceipts?: boolean
}

export function Claim({ text, evidenceIds, packet, printReceipts = false }: Props) {
  const [open, setOpen] = useState(false)
  const evidence = resolveEvidence(packet, evidenceIds)

  // LAW 1: unresolvable evidence means the paragraph does not render.
  if (evidence.length === 0) return null

  const sources = [...new Set(evidence.flatMap((e) => e.sources))]

  return (
    <div className="claim" style={{ marginBottom: '1.35rem' }}>
      <p>
        {text}
        <button
          type="button"
          className="claim-open no-print"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          title={`${evidence.length} answer${evidence.length === 1 ? '' : 's'} behind this`}
        >
          {open ? 'hide' : `${evidence.length} receipt${evidence.length === 1 ? '' : 's'}`}
        </button>
      </p>

      {(open || printReceipts) && (
        <div className={`receipt settle${printReceipts && !open ? ' print-only' : ''}`}>
          <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>
            What this is built on
          </div>
          {evidence.map((e) => (
            <div key={e.id} style={{ marginBottom: '0.7rem' }}>
              {e.itemText ? (
                <div style={{ color: 'var(--color-kajal-soft)', fontStyle: 'italic' }}>
                  “{e.itemText}”
                </div>
              ) : (
                <div className="eyebrow">{e.label}</div>
              )}
              <div style={{ fontWeight: 500 }}>{e.detail}</div>
            </div>
          ))}
          {sources.length > 0 && (
            <div className="attrib" style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid var(--color-kagaz-edge)' }}>
              {sources.map((s) => {
                try {
                  const src = cite(s)
                  return `${src.authors.split(',')[0]} et al. (${src.year}), ${src.title}`
                } catch {
                  return null
                }
              }).filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
