import type { EvidencePacket } from '../engine/types'
import { SHAPE_COPY, SELF_SHAPE_COPY, selfShapeOf } from '../engine/axes'
import { PRACTICE_BY_ID, markerSentence } from '../engine/practices'
import { DIM_BY_ID } from '../engine/dimensions'
import { Plate } from './bits'

/**
 * THE ONE PAGE.
 *
 * "Clarity. Not more to think about — less. The spiral has to stop, not speed up."
 *
 * A ten-thousand-word report is the right deliverable and also a real risk: somebody who arrived
 * already overthinking can finish it with more to churn on than they started with, which is the
 * opposite of the point. So the report ends with a single page holding only what survives —
 * the reading, the one contradiction that matters most, the first thing to do, and the thing that
 * would tell them in six weeks whether any of it was right.
 *
 * Short enough to screenshot. Everything on it appears above, in full, with receipts; nothing here
 * is new information, which is what makes it safe to compress.
 */
export function Takeaway({ packet }: { packet: EvidencePacket }) {
  const isRelationship = packet.context.lens === 'relationship'
  const shape = isRelationship
    ? SHAPE_COPY[packet.axes.shape]
    : SELF_SHAPE_COPY[selfShapeOf(packet.dimensions)]
  const sharpest = packet.findings.filter((f) => f.accepted).slice(0, 2)
  const first = packet.practices[0]
  const firstPractice = first ? PRACTICE_BY_ID[first.practiceId] : undefined
  const test = packet.assumption
  const weakest = [...packet.dimensions]
    .filter((d) => !d.thin)
    .map((d) => ({ d, oriented: DIM_BY_ID[d.id].higherIsBetter ? d.pomp : 100 - d.pomp }))
    .sort((a, b) => a.oriented - b.oriented)[0]

  return (
    <section className="settle" style={{ marginBottom: '3rem' }}>
      <div
        style={{
          border: '1px solid var(--color-kagaz-edge)',
          borderTop: '3px solid var(--color-sindoor)',
          background: 'var(--color-kagaz-deep)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          borderRadius: '3px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 20rem' }}>
            <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>If you remember one page</div>
            <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: '1rem' }}>{shape.title}</h2>
          </div>
          <div style={{ width: 110, flexShrink: 0 }} className="no-print">
            <Plate slug="hoopoe" height={110} showAttribution={false} />
          </div>
        </div>

        {isRelationship && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <Figure n={packet.axes.quality} label="Quality" />
            <Figure n={packet.axes.pull} label="Pull" />
            <Figure n={packet.axes.hold} label="Hold" />
            {weakest && <Figure n={weakest.d.pomp} label={DIM_BY_ID[weakest.d.id].label} small />}
          </div>
        )}

        <Row label="What is most true">
          {sharpest[0]?.statement ?? shape.lead}
        </Row>

        {sharpest[1] && <Row label="And alongside it">{sharpest[1].statement}</Row>}

        {/* For a self reader this is the whole point of the page. Everything above describes them;
            this is the only line that asks them to go and find something out. */}
        {test && (
          <Row label="The belief worth testing, and the test">
            <span style={{ color: 'var(--color-kajal-soft)' }}>You have been living as though </span>
            {test.assumption}
            <span style={{ color: 'var(--color-kajal-soft)' }}>. You would find out by doing this: </span>
            {test.test}
            <span style={{ color: 'var(--color-kajal-soft)' }}>.</span>
          </Row>
        )}

        {firstPractice && (
          <Row label="The first thing to do">
            <strong style={{ fontWeight: 500 }}>{firstPractice.title}</strong> — {firstPractice.purpose}{' '}
            <span style={{ color: 'var(--color-kajal-soft)' }}>({firstPractice.minutes} minutes, {firstPractice.needsPartner ? 'with them' : 'on your own'}.)</span>
          </Row>
        )}

        {firstPractice && (
          <Row label="How you will know it is working">{markerSentence(firstPractice.marker)}</Row>
        )}

        <Row label="What this cannot tell you">
          {packet.limits[0]}
        </Row>

        <p className="attrib" style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-kagaz-edge)' }}>
          Everything on this page appears in full above, with the answers behind it. Nothing here is
          new — it is the same reading, with the thinking already done.
        </p>
      </div>
    </section>
  )
}

function Figure({ n, label, small = false }: { n: number; label: string; small?: boolean }) {
  return (
    <div>
      <div className="num" style={{ fontSize: small ? '1.5rem' : '2rem', color: 'var(--color-sindoor)', lineHeight: 1.1 }}>
        {n}%
      </div>
      <div className="attrib">{label}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div className="eyebrow" style={{ marginBottom: '0.3rem' }}>{label}</div>
      <div>{children}</div>
    </div>
  )
}
