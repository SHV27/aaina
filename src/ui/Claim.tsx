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

  /* Break a long claim into paragraphs at sentence boundaries.
   *
   * The writer paragraphs its own prose. The engine's computed statements do not — they are built
   * by concatenation, and the longest of them (the Big Assumption, the competing commitment, the
   * family findings) run to three hundred words. Rendered as a single <p> that is a wall, and the
   * outage path IS the report on a bad free-tier day.
   *
   * Nothing here changes a word, adds one, or moves one. Same text, same receipts, same claim. */
  const blocks = paragraphise(text)

  return (
    <div className="claim" style={{ marginBottom: '1.35rem' }}>
      {blocks.slice(0, -1).map((b, i) => (
        <p key={i} style={{ marginBottom: '0.9rem' }}>{b}</p>
      ))}
      <p>
        {blocks[blocks.length - 1]}
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

/**
 * Split at sentence boundaries into blocks of roughly one screen-paragraph each.
 *
 * Deliberately conservative: below the threshold nothing is touched at all, and a sentence is
 * never split. An abbreviation that ends in a full stop would at worst produce one short
 * paragraph, which is a cosmetic outcome rather than a wrong one.
 */
const PARAGRAPH_AT = 430
const SENTENCE = /(?<=[.!?\u2026])\s+(?=[A-Z"\u201c])/

export function paragraphise(text: string): string[] {
  if (text.length <= PARAGRAPH_AT * 1.4) return [text]

  const sentences = text.split(SENTENCE)
  if (sentences.length < 3) return [text]

  const out: string[] = []
  let current = ''
  for (const s of sentences) {
    current = current ? `${current} ${s}` : s
    if (current.length >= PARAGRAPH_AT) {
      out.push(current)
      current = ''
    }
  }
  if (current) {
    // Never leave a one-line orphan at the end; fold it back into the paragraph above.
    if (current.length < 120 && out.length) out[out.length - 1] += ` ${current}`
    else out.push(current)
  }
  return out.length ? out : [text]
}
