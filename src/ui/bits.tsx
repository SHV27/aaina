import { useEffect, useRef, useState } from 'react'
import { PLATE_BY_SLUG, plateSrc, attribution } from '../plates'
import { Logo } from './Logo'
import { AMBIENT_SUPPORT } from '../items'
import { DIM_BY_ID, bandLabel } from '../engine/dimensions'
import type { DimensionId, Scored } from '../engine/types'

/* ────────────────────────────  plates  ──────────────────────────── */

/**
 * A cropped museum painting. Never the full folio, never a framing border, never a human face —
 * someone arriving at 2am after a fight should not be met by a painted couple. Birds, animals,
 * botanicals, skies only.
 *
 * The attribution is not a legal chore. It is evidence, and evidence is this product's entire
 * value proposition — the same reason every claim in the report opens.
 */
export function Plate({
  slug,
  height = 200,
  focus = 'center',
  vivid = false,
  showAttribution = true,
}: {
  slug: string
  height?: number | string
  focus?: string
  vivid?: boolean
  showAttribution?: boolean
}) {
  const plate = PLATE_BY_SLUG[slug]
  if (!plate) return null
  return (
    <figure style={{ margin: 0 }}>
      <div className={`plate${vivid ? ' plate--vivid' : ''}`} style={{ height }}>
        <img src={plateSrc(slug)} alt="" aria-hidden="true" style={{ objectPosition: focus }} loading="lazy" />
      </div>
      {showAttribution && (
        <figcaption className="attrib" style={{ marginTop: '0.5rem' }}>
          {attribution(plate)}
        </figcaption>
      )}
    </figure>
  )
}

/* ────────────────────────────  meters  ──────────────────────────── */

/**
 * The numeral is ALWAYS rendered. No paper-like tint reaches 3:1 against the ground, so the bar
 * alone would be an indicator that some readers cannot see — a hairline defines the track and the
 * number carries the meaning. The bar is the ornament; the number is the fact.
 *
 * Fill duration scales with the value, so a high score is *felt* as taking longer to arrive.
 */
export function Meter({
  value,
  label,
  meaning,
  muted = false,
  animate = true,
}: {
  value: number
  label: string
  meaning?: string
  muted?: boolean
  animate?: boolean
}) {
  const [w, setW] = useState(animate ? 0 : value)
  useEffect(() => {
    if (!animate) { setW(value); return }
    const t = setTimeout(() => setW(value), 60)
    return () => clearTimeout(t)
  }, [value, animate])

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: 'var(--text-small)' }}>{label}</span>
        <span className="num" style={{ fontSize: 'var(--text-small)' }}>{value}%</span>
      </div>
      <div className="meter-track">
        <div
          className={`meter-fill${muted ? ' meter-fill--muted' : ''}`}
          style={{ width: `${w}%`, transitionDuration: `${420 + value * 6}ms` }}
        />
      </div>
      {meaning && (
        <div className="attrib" style={{ marginTop: '0.35rem' }}>{meaning}</div>
      )}
    </div>
  )
}

export function DimensionMeter({ scored, animate = true }: { scored: Scored; animate?: boolean }) {
  const d = DIM_BY_ID[scored.id]
  return (
    <Meter
      value={scored.pomp}
      label={d.label}
      meaning={`${bandLabel(scored.id, scored.pomp)} · ${d.meaning}`}
      animate={animate}
    />
  )
}

/**
 * Two people, compared. Never two colours — sindoor and neel collapse to 1.21:1 under protanopia
 * and no lighter teal separates them. So the gap is a LENGTH with both ends labelled inline, which
 * is both more accessible and a better chart: the distance between the two is the actual insight.
 */
export function Dumbbell({
  label,
  a,
  b,
  aName = 'You',
  bName = 'Them',
}: {
  label: string
  a: number
  b: number
  aName?: string
  bName?: string
}) {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return (
    <div style={{ marginBottom: '1.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: 'var(--text-small)' }}>{label}</span>
        <span className="num" style={{ fontSize: 'var(--text-micro)', color: 'var(--color-kajal-soft)' }}>
          gap {Math.abs(a - b)}
        </span>
      </div>
      <div style={{ position: 'relative', height: 26 }}>
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 1, background: 'var(--color-kagaz-edge)' }} />
        <div style={{ position: 'absolute', top: 11, left: `${lo}%`, width: `${hi - lo}%`, height: 3, background: 'var(--color-sindoor)' }} />
        {[{ v: a, n: aName }, { v: b, n: bName }].map((p) => (
          <div key={p.n} style={{ position: 'absolute', left: `${p.v}%`, top: 6, transform: 'translateX(-50%)' }}>
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: 'var(--color-kagaz)', border: '2px solid var(--color-kajal)' }} />
            <div className="num" style={{ fontSize: '0.7rem', marginTop: 3, transform: 'translateX(-50%)', marginLeft: 6, whiteSpace: 'nowrap', color: 'var(--color-kajal-soft)' }}>
              {p.n} {p.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────  chrome  ──────────────────────────── */

export function Wordmark({ size = 'var(--text-h3)', mark = 30 }: { size?: string; mark?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
      <Logo size={mark} />
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.45rem' }}>
        <span className="deva" style={{ fontSize: size, color: 'var(--color-sindoor)', lineHeight: 1 }}>आईना</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: `calc(${size} * 0.82)`, letterSpacing: '0.01em', fontVariationSettings: "'SOFT' 40, 'WONK' 1" }}>
          Aaina
        </span>
      </span>
    </span>
  )
}

/**
 * Ambient support — LAW 5 in its clearest form.
 *
 * This renders for EVERY user on EVERY page, from the first screen, regardless of what anyone
 * answers. It is never surfaced in response to a disclosure, because a resource that appears the
 * moment you admit something is a door closing rather than a door opening. That pattern has a
 * name in the literature — screen-and-refer — and it is the one now documented as failing.
 */
export function AmbientSupport() {
  return (
    <div className="attrib" style={{ borderTop: '1px solid var(--color-kagaz-edge)', paddingTop: '1rem', marginTop: '2rem' }}>
      <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>{AMBIENT_SUPPORT.label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1.5rem', marginBottom: '0.6rem' }}>
        {AMBIENT_SUPPORT.lines.map((l) => (
          <span key={l.name}>
            <strong style={{ fontWeight: 500 }}>{l.name}</strong> — {l.detail}
          </span>
        ))}
      </div>
      <div style={{ maxWidth: '58ch' }}>{AMBIENT_SUPPORT.honesty}</div>
    </div>
  )
}

/** LAW 7 — a fallback always declares itself. */
export function DegradedBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="degraded settle" style={{ marginBottom: '1.75rem' }} role="status">
      <strong style={{ fontWeight: 500 }}>Reduced mode.</strong> {message}
    </div>
  )
}

/** Chapter dots. Never a global progress bar: 22% abandonment vs 12.7% without one. */
export function ChapterDots({ total, done, current }: { total: number; done: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} aria-label={`Chapter ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            width: i === current ? 22 : 7,
            height: 7,
            borderRadius: 4,
            background: i === current ? 'var(--color-sindoor)' : i < done ? 'var(--color-kajal-soft)' : 'var(--color-kagaz-edge)',
            transition: 'width 260ms var(--ease-out-expo), background-color 260ms',
          }}
        />
      ))}
    </div>
  )
}

/** Records how long someone sat with a question before committing. Evidence, not analytics. */
export function useDwell(key: string) {
  const start = useRef(Date.now())
  useEffect(() => { start.current = Date.now() }, [key])
  return () => Date.now() - start.current
}

export { DIM_BY_ID }
export type { DimensionId }
