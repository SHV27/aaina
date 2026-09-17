import { useEffect, useRef, useState } from 'react'
import type { Item } from '../engine/types'
import { scaleFor } from '../engine/score'
import { STAGE_OPTIONS, VALUE_OPTIONS } from '../items'
import { useDwell } from './bits'

/**
 * One question.
 *
 * Every label on every scale is a thing a person would actually say. "Somewhat agree" is survey
 * language, and survey language makes people answer like respondents instead of like themselves —
 * which flattens exactly the variance the contradiction engine feeds on.
 *
 * Skipping is always offered and never penalised. A skipped dimension is reported as thin and
 * excluded from the composite rather than guessed at, and the skip itself becomes evidence: "you
 * skipped four questions, and all four were about the same thing."
 */
export function Question({
  item,
  value,
  onAnswer,
  onSkip,
  skipped,
  index,
  total,
}: {
  item: Item
  value: number | string | undefined
  onAnswer: (v: number | string, dwellMs: number) => void
  onSkip: () => void
  skipped: boolean
  index: number
  total: number
}) {
  const dwell = useDwell(item.id)
  const box = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState(typeof value === 'string' ? value : '')

  useEffect(() => {
    setDraft(typeof value === 'string' ? value : '')
  }, [item.id, value])

  const commit = (v: number | string) => onAnswer(v, dwell())

  /** Reads the DOM, not React state — see the note on the button. Empty means "skip". */
  const saveText = () => {
    const text = (box.current?.value ?? draft).trim()
    if (text.length >= 2) commit(text)
    else onSkip()
  }

  return (
    <div className="settle" key={item.id}>
      <div className="eyebrow" style={{ marginBottom: '0.9rem' }}>
        {index + 1} of {total}
      </div>

      <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: '1.6rem', maxWidth: '32ch' }}>
        {item.text}
      </h2>

      {(item.format === 'likert5' || item.format === 'likert7') && (
        <Likert item={item} value={typeof value === 'number' ? value : undefined} onPick={commit} />
      )}

      {item.format === 'choice' && (
        <Choice item={item} value={typeof value === 'string' ? value : undefined} onPick={commit} />
      )}

      {item.format === 'predict' && (
        <Likert item={item} value={typeof value === 'number' ? value : undefined} onPick={commit} />
      )}

      {item.format === 'allocate' && (
        <Allocate value={typeof value === 'number' ? value : 25} onPick={commit} />
      )}

      {item.format === 'freetext' && (
        <div>
          <textarea
            ref={box}
            className="field"
            rows={6}
            placeholder={item.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', gap: '1rem' }}>
            <span className="attrib">
              {draft.trim().length > 0
                ? `${draft.trim().split(/\s+/).length} words`
                : 'Your words get quoted back to you, exactly as you wrote them.'}
            </span>
            {/*
              Never disabled, and the value is read from the DOM rather than from React state.
              Caught by driving the real browser: a value set by autofill, by a password manager,
              or by some Android keyboards lands in the textarea without firing the event React
              listens for — and a disabled button then traps the person on the question with
              their answer visibly on screen. A button that cannot be pressed is not a validation;
              it is a dead end.
            */}
            <button className="btn btn-primary" onClick={saveText}>
              Save and continue
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="btn-ghost" onClick={onSkip} style={{ fontSize: 'var(--text-small)', background: 'none', border: 0, cursor: 'pointer' }}>
          {skipped ? 'Skipped — click to answer instead' : 'Skip this one'}
        </button>
        {skipped && <span className="attrib">Left out of your scores rather than guessed at.</span>}
      </div>
    </div>
  )
}

function Likert({ item, value, onPick }: { item: Item; value?: number; onPick: (v: number) => void }) {
  const scale = scaleFor(item)
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {scale.labels.map((label, i) => {
        const v = scale.min + i
        return (
          <button
            key={v}
            type="button"
            className="opt"
            aria-pressed={value === v}
            onClick={() => onPick(v)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function Choice({ item, value, onPick }: { item: Item; value?: string; onPick: (v: string) => void }) {
  // The stage and values pickers carry a gloss line; generic choices do not.
  const glossFor = (v: string): string | undefined => {
    const stage = STAGE_OPTIONS.find((s) => s.value === v)
    if (stage) return stage.gloss
    const val = VALUE_OPTIONS.find((s) => s.value === v)
    return val?.gloss
  }

  // val_pick asks for exactly three; everything else is single-select.
  const multi = item.id === 'val_pick'
  const picked = multi ? (value ?? '').split(',').filter(Boolean) : []

  const toggle = (v: string) => {
    if (!multi) return onPick(v)
    const next = picked.includes(v) ? picked.filter((x) => x !== v) : [...picked, v].slice(0, 3)
    onPick(next.join(','))
  }

  return (
    <div>
      {multi && (
        <div className="attrib" style={{ marginBottom: '0.9rem' }}>
          {picked.length} of 3 chosen{picked.length === 3 ? ' — you can swap one out' : ''}
        </div>
      )}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {(item.options ?? []).map((o) => {
          const on = multi ? picked.includes(o.value) : value === o.value
          const gloss = glossFor(o.value)
          return (
            <button key={o.value} type="button" className="opt" aria-pressed={on} onClick={() => toggle(o.value)}>
              <span style={{ fontWeight: on ? 500 : 400 }}>{o.label}</span>
              {gloss && <span style={{ display: 'block', fontSize: 'var(--text-small)', color: 'var(--color-kajal-soft)', marginTop: '0.2rem' }}>{gloss}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Allocate({ value, onPick }: { value: number; onPick: (v: number) => void }) {
  const [v, setV] = useState(value)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
        <span className="num" style={{ fontSize: 'var(--text-display)', color: 'var(--color-sindoor)' }}>{v}%</span>
        <span style={{ color: 'var(--color-kajal-soft)' }}>of a normal week</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        onMouseUp={() => onPick(v)}
        onTouchEnd={() => onPick(v)}
        onKeyUp={() => onPick(v)}
        style={{ width: '100%', accentColor: 'var(--color-sindoor)' }}
        aria-label="Share of a normal week"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }} className="attrib">
        <span>None of it</span><span>All of it</span>
      </div>
      <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => onPick(v)}>
        That is about right
      </button>
    </div>
  )
}
