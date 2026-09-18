import { useState } from 'react'
import { Link } from 'wouter'
import { jhalakFor, item as getItem } from '../items'
import { SelfPayout } from './JhalakSelf'
import { useAnswers } from '../state/answers'
import { Question } from './Question'
import { Plate, Wordmark, AmbientSupport } from './bits'
import { itemPomp } from '../engine/score'
import type { Stage } from '../engine/types'

/**
 * THE JHALAK (झलक — a glimpse).
 *
 * 67% of survey abandonment is front-loaded, and the drop-off cliff at roughly question 15 is a
 * COMMITMENT threshold rather than fatigue. So the first two minutes must pay out something true
 * before asking for anything more. These seven are therefore not warm-up questions — they are the
 * highest-information items in the bank, chosen to span PULL and HOLD so that seven answers can
 * already find the tension the whole product is built on.
 *
 * The payout is computed locally and instantly. No API, no spinner, no waiting. And it is
 * genuinely non-transplantable: it quotes them, and it names the specific gap between two of
 * their own answers.
 */
export function Jhalak({ onDone }: { onDone: () => void }) {
  const store = useAnswers()
  const [idx, setIdx] = useState(0)
  const [reveal, setReveal] = useState(false)

  const ids = [...jhalakFor(store.context.lens)]
  const item = ids[idx] ? getItem(ids[idx]!) : null

  if (reveal) return <Payout onContinue={onDone} />

  return (
    <main>
      <div className="wrap" style={{ paddingBlock: '1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}><Wordmark size="1rem" mark={26} /></Link>
      </div>

      <div className="read" style={{ paddingBlock: 'clamp(1rem, 5vh, 3rem)' }}>
        {idx === 0 && (
          <div className="settle" style={{ marginBottom: '2.5rem' }}>
            <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Seven questions</div>
            <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '0.75rem' }}>
              Start here <span className="deva" style={{ color: 'var(--color-sindoor)', fontSize: '0.8em' }}>झलक</span>
            </h1>
            <p style={{ color: 'var(--color-kajal-soft)' }}>
              Two minutes. Then you get something real back, and you decide whether to go further.
            </p>
            <hr className="rule" style={{ marginTop: '2rem' }} />
          </div>
        )}

        {item && (
          <Question
            item={item}
            value={store.answers[item.id]?.value}
            skipped={store.skipped.includes(item.id)}
            index={idx}
            total={ids.length}
            onAnswer={(v, dwellMs) => {
              store.answer(item.id, v, dwellMs)
              if (item.id === 'ctx_stage') store.setStage(v as Stage)
              if (idx + 1 < ids.length) setIdx(idx + 1)
              else setReveal(true)
            }}
            onSkip={() => {
              store.skip(item.id)
              if (idx + 1 < ids.length) setIdx(idx + 1)
              else setReveal(true)
            }}
          />
        )}

        {idx > 0 && (
          <button className="btn btn-quiet" style={{ marginTop: '2.5rem' }} onClick={() => setIdx(idx - 1)}>
            ← Back
          </button>
        )}
      </div>

      <div className="wrap" style={{ paddingBottom: '3rem' }}><AmbientSupport /></div>
    </main>
  )
}

/**
 * The payout. Computed from the seven answers, in the browser, instantly.
 *
 * Everything on this screen is a restatement of something they just did. There is not one sentence
 * here that would survive being moved to another person's screen.
 */
function Payout({ onContinue }: { onContinue: () => void }) {
  const store = useAnswers()
  const a = store.answers
  // The Know Thyself door gets its own reading; a relationship verdict there is nonsense.
  if (store.context.lens === 'self') return <SelfPayout onContinue={onContinue} />

  const p = (id: string): number | null => {
    const v = a[id]?.value
    return typeof v === 'number' ? Math.round(itemPomp(id, v)) : null
  }

  const sat = p('sat_1')          // pull: does it feel good
  const amb = p('amb_1')          // doubt (already reversed → high = low doubt)
  const villain = p('cons_3')     // hold: the villain belief (reversed → high = low hold)
  const okay = p('alt_1')         // hold: would you be okay
  const harder = p('pcom_2')      // asymmetry (reversed → high = balanced)
  const why = typeof a['txt_why']?.value === 'string' ? (a['txt_why'].value as string).trim() : ''

  const pull = avg([sat, harder])
  const hold = avg([villain === null ? null : 100 - villain, okay === null ? null : 100 - okay])

  const lines: { head: string; body: string }[] = []

  if (pull !== null && hold !== null && hold - pull >= 18) {
    lines.push({
      head: 'What is keeping you here is scoring higher than what is drawing you here.',
      body: `From seven answers: the pull toward this sits around ${pull}%, and what would make leaving hard sits around ${hold}%. Those are measured separately on purpose. Research on why people stay in relationships that are not working found that what predicted staying was investment and a lack of alternatives — not satisfaction.`,
    })
  } else if (pull !== null && hold !== null && pull - hold >= 18) {
    lines.push({
      head: 'You are here because you want to be, not because leaving would cost too much.',
      body: `The pull toward this sits around ${pull}%, and what would make leaving hard sits around ${hold}%. That combination is less common than it sounds, and it is worth knowing you have it before you read anything else.`,
    })
  } else if (pull !== null && hold !== null) {
    lines.push({
      head: 'What draws you and what holds you are running at almost the same strength.',
      body: `Pull is around ${pull}%, hold around ${hold}%. Neither one is deciding for you, which is usually why a situation like this stays unresolved for a long time rather than resolving badly.`,
    })
  }

  if (villain !== null && villain <= 40 && amb !== null && amb <= 45) {
    lines.push({
      head: 'You said two things that sit badly together.',
      body: 'You think about ending it, and you also believe that ending it would make you the one who broke something. Those two beliefs can be held at once, but they cannot both be acted on — and holding both is exhausting in a way that has nothing to do with the other person.',
    })
  }

  if (harder !== null && harder <= 35) {
    lines.push({
      head: 'You said you are the one holding on harder.',
      body: 'Your read on how the weight is distributed is the single most useful thing you have given us so far. Across 11,196 couples, how committed you believe your partner is turned out to be the strongest relationship-level predictor of how a relationship is actually going.',
    })
  }

  if (okay !== null && okay <= 35) {
    lines.push({
      head: 'You do not currently believe you would be alright without this.',
      body: 'That belief is doing more work in your situation than almost anything else you could tell us, and it is one of the few things here that is genuinely checkable against evidence rather than just felt.',
    })
  }

  if (lines.length === 0) {
    lines.push({
      head: 'Seven answers is not enough for a reading, and we are not going to invent one.',
      body: 'What you have given us so far is consistent and does not point anywhere sharp. That is a real result, not a failure — and the full assessment is where the actual detail lives.',
    })
  }

  return (
    <main>
      <div className="wrap" style={{ paddingBlock: '1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}><Wordmark size="1rem" mark={26} /></Link>
      </div>

      <div className="read" style={{ paddingBlock: 'clamp(1.5rem, 5vh, 3rem)' }}>
        <div className="settle">
          <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>From seven answers</div>
          <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '2rem' }}>
            Here is what you have already told us.
          </h1>
        </div>

        {why && (
          <blockquote className="settle" style={{ animationDelay: '80ms', margin: '0 0 2.25rem', paddingLeft: '1.1rem', borderLeft: '2px solid var(--color-sindoor)' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--color-kajal-soft)' }}>“{why}”</p>
            <div className="attrib" style={{ marginTop: '0.5rem' }}>Your words, quoted back exactly.</div>
          </blockquote>
        )}

        {lines.slice(0, 3).map((l, i) => (
          <div key={l.head} className="settle" style={{ animationDelay: `${140 + i * 90}ms`, marginBottom: '1.9rem' }}>
            <h2 style={{ fontSize: 'var(--text-h3)', marginBottom: '0.5rem' }}>{l.head}</h2>
            <p style={{ color: 'var(--color-kajal-soft)' }}>{l.body}</p>
          </div>
        ))}

        <hr className="rule" style={{ marginBlock: '2.5rem' }} />

        <div className="settle" style={{ animationDelay: '420ms' }}>
          <Plate slug="maru-ragini" height={150} showAttribution={false} />
          <h2 style={{ fontSize: 'var(--text-h2)', margin: '1.5rem 0 0.75rem' }}>
            That was seven questions. The real thing is about fifty.
          </h2>
          <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '1.75rem' }}>
            Sixteen measured dimensions, the contradictions between your own answers, a verdict, and
            a long report where every sentence opens to show the answers underneath it. Around
            forty minutes. You can stop after any chapter and keep what you have.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onContinue}>Keep going</button>
            <Link href="/" className="btn btn-quiet">Not right now</Link>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: '3rem' }}><AmbientSupport /></div>
    </main>
  )
}

function avg(xs: (number | null)[]): number | null {
  const v = xs.filter((x): x is number => x !== null)
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null
}
