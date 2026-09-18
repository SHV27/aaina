import { useMemo, useState } from 'react'
import { Link, useLocation } from 'wouter'
import type { AnswerMap } from '../engine/types'
import { useAnswers } from '../state/answers'
import { usePartner } from '../state/partner'
import { partnerItems, PARTNER_NOTE_ID, PARTNER_ITEM_IDS } from '../engine/couple'
import { inviteLink, replyLink, decodeReply, decodeInvite, codeFromLocation } from '../engine/couple-link'
import { ITEM_BY_ID } from '../items'
import { Question } from './Question'
import { Plate, Wordmark, AmbientSupport, ChapterDots } from './bits'

/**
 * COUPLE MODE, THE TWO SCREENS.
 *
 * `/together` — the first person invites, and later pastes back what came in.
 * `/answer`   — the second person answers, and gets something to send back.
 *
 * Nothing in either direction touches a server. Both payloads ride in the URL fragment, which is
 * never transmitted in an HTTP request, and the exchange happens over whatever the couple already
 * use. That is a real exposure and it is theirs to make, so it is said in plain words on the
 * screen where the link is generated — before it exists, not after.
 */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <div className="wrap" style={{ paddingBlock: '1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Wordmark size="1rem" mark={26} />
        </Link>
      </div>
      <div className="read" style={{ paddingBlock: 'clamp(1rem, 4vh, 2.5rem)' }}>{children}</div>
      <div className="wrap" style={{ paddingBottom: '3rem' }}><AmbientSupport /></div>
    </main>
  )
}

/** A copy control that tells the truth about whether it worked. */
function CopyBox({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
    } catch {
      // Clipboard access is blocked in plenty of in-app browsers. Say so rather than lie.
      setState('failed')
    }
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>{label}</div>
      <textarea
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        rows={3}
        style={{
          width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
          padding: '0.75rem', border: '1px solid var(--color-kagaz-edge)',
          background: 'var(--color-kagaz-deep)', color: 'var(--color-kajal-soft)',
          borderRadius: '3px', resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.6rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => void copy()}>
          {state === 'copied' ? 'Copied' : 'Copy'}
        </button>
        <span className="attrib">
          {state === 'failed'
            ? 'Copying is blocked in this browser — select the text above and copy it by hand.'
            : 'Send it however you already talk to each other.'}
        </span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   /together — the first person
   ══════════════════════════════════════════════════════════════════════════ */

export function Together() {
  const store = useAnswers()
  const partner = usePartner()
  const [, navigate] = useLocation()
  const [paste, setPaste] = useState('')
  const [error, setError] = useState<string | null>(null)

  /* If they arrived by opening the link their partner sent back, take it straight from the URL
     rather than making them paste something they have already clicked. */
  const fromUrl = useMemo(() => {
    const code = codeFromLocation('r')
    return code ? decodeReply(code) : null
  }, [])

  const link = useMemo(() => inviteLink(store.context), [store.context])
  const already = partner.answers && Object.keys(partner.answers).length > 0

  function accept(answers: AnswerMap) {
    partner.set(answers)
    navigate('/report')
  }

  if (fromUrl && !already) {
    return (
      <Shell>
        <div className="settle">
          <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>They answered</div>
          <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '1.25rem' }}>
            Their answers are here.
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            {Object.keys(fromUrl.answers).length} answers, given on their own, without seeing any
            of yours. That last part is not a detail — if they had seen yours first you would be
            reading an echo rather than a second account.
          </p>
          <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '1.75rem' }}>
            Adding them does not change your own numbers. It adds one section: where the two
            accounts agree, where they do not, and how close you were when you guessed.
          </p>
          <button className="btn btn-primary" onClick={() => accept(fromUrl.answers)}>
            Add them to my report
          </button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="settle">
        <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>If you want to</div>
        <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '1.25rem' }}>
          Ask them to answer too.
        </h1>
        <p style={{ marginBottom: '1rem' }}>
          Twenty questions, about six minutes. They answer on their own, without seeing anything
          you said — which is the whole point, because a second account that has read the first
          one is not a second account.
        </p>
        <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '1.5rem' }}>
          This will not make your reading more accurate. Across 11,196 couples, what a partner
          reported added almost nothing to what the person themselves reported. What it gives you
          is the one thing your own answers cannot: the size of the distance between two versions
          of the same relationship, and whether you read them correctly when you guessed.
        </p>
      </div>

      <div
        className="settle"
        style={{
          animationDelay: '90ms',
          border: '1px solid var(--color-kagaz-edge)',
          borderLeft: '3px solid var(--color-sindoor)',
          padding: '1.1rem 1.25rem',
          marginBottom: '2rem',
          background: 'var(--color-kagaz-deep)',
          borderRadius: '3px',
        }}
      >
        <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Before you send it</div>
        <p style={{ fontSize: 'var(--text-small)', margin: 0, color: 'var(--color-kajal-soft)' }}>
          The link carries no answers of yours — none, not a summary and not a score. What comes
          back <em>does</em> carry theirs, and it travels through whatever app you send it in, not
          through us. Nothing reaches a server of ours in either direction. Your safety-chapter
          answers cannot be put into a link at all; that is enforced in the code, not promised
          here.
        </p>
      </div>

      <div className="settle" style={{ animationDelay: '150ms' }}>
        <CopyBox value={link} label="Send them this" />
      </div>

      <hr className="rule" style={{ marginBlock: '2.5rem' }} />

      <div className="settle" style={{ animationDelay: '210ms' }}>
        <h2 style={{ fontSize: 'var(--text-h3)', marginBottom: '0.6rem' }}>
          When they send something back
        </h2>
        <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '1rem' }}>
          Paste it here. A whole link is fine — you do not have to pick the code out of it.
        </p>
        <textarea
          value={paste}
          onChange={(e) => { setPaste(e.target.value); setError(null) }}
          rows={4}
          placeholder="Paste what they sent you"
          style={{
            width: '100%', padding: '0.85rem', fontSize: 'var(--text-small)',
            border: '1px solid var(--color-kagaz-edge)', background: 'var(--color-kagaz)',
            borderRadius: '3px', fontFamily: 'var(--font-mono)', resize: 'vertical',
          }}
        />
        {error && (
          <p style={{ color: 'var(--color-sindoor)', fontSize: 'var(--text-small)', marginTop: '0.6rem' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              const got = decodeReply(paste)
              if (!got) {
                setError(
                  'That does not look like an answer from Aaina. Check nothing was cut off in the middle — messaging apps sometimes break a long link across two messages.',
                )
                return
              }
              accept(got.answers)
            }}
          >
            Add their answers
          </button>
          <Link href="/report" className="btn btn-quiet">Back to my report</Link>
        </div>
      </div>

      {already && (
        <p className="attrib" style={{ marginTop: '2rem' }}>
          You have already added a set of their answers. Pasting a new one replaces it.
        </p>
      )}
    </Shell>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   /answer — the second person
   ══════════════════════════════════════════════════════════════════════════ */

export function Answer() {
  const invite = useMemo(() => {
    const code = codeFromLocation('i')
    return code ? decodeInvite(code) : null
  }, [])

  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [skipped, setSkipped] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)

  const items = useMemo(() => partnerItems(), [])
  const total = items.length + 1 // the questions, plus the note

  const ctx = useMemo(
    () => ({
      lens: 'relationship' as const,
      voice: 'couple-b' as const,
      stage: (invite?.stage ?? 'dating') as never,
      help: ['understand' as const],
      durationBucket: (invite?.duration ?? null) as never,
      familyInPlay: invite?.family ?? false,
      ageBand: null,
    }),
    [invite],
  )

  if (!started) {
    return (
      <Shell>
        <div className="settle">
          <Plate slug="hoopoe" height={160} focus="60% 42%" showAttribution={false} />
          <div className="eyebrow" style={{ margin: '1.5rem 0 0.6rem' }}>Somebody asked you to do this</div>
          <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '1.25rem' }}>
            Twenty questions, about six minutes.
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            Somebody you are with has been going through Aaina, and it asked them to guess how you
            would answer a couple of things. This is where those guesses get marked.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ fontWeight: 500 }}>You are not seeing any of their answers, and that
            is deliberate.</strong> If you saw them first you would be agreeing or disagreeing with
            them instead of answering for yourself, and the whole thing would be worth nothing.
          </p>
          <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '1.5rem' }}>
            What you answer here goes back to them — all of it. Answer honestly anyway. The
            distance between two honest accounts is the only thing this can show either of you,
            and a polite version of your answers produces a polite version of nothing.
          </p>

          <div
            style={{
              border: '1px solid var(--color-kagaz-edge)',
              borderLeft: '3px solid var(--color-sindoor)',
              padding: '1rem 1.15rem',
              marginBottom: '1.75rem',
              background: 'var(--color-kagaz-deep)',
              borderRadius: '3px',
            }}
          >
            <p style={{ fontSize: 'var(--text-small)', margin: 0, color: 'var(--color-kajal-soft)' }}>
              Nothing you type reaches a server of ours. At the end you get something to send back
              to them, and you can read exactly what is in it before you send anything. If you
              would rather not do this at all, closing this page is a complete answer and we will
              not have recorded that you were here.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setStarted(true)}>Start</button>
            <Link href="/" className="btn btn-quiet">What is Aaina?</Link>
          </div>
        </div>
      </Shell>
    )
  }

  if (done) {
    const link = replyLink(answers, ctx, note)
    const answered = Object.keys(answers).filter((k) => PARTNER_ITEM_IDS.includes(k as never)).length
    return (
      <Shell>
        <div className="settle">
          <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>Done — {answered} answers</div>
          <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '1.25rem' }}>
            Send this back to them.
          </h1>
          <p style={{ marginBottom: '1.5rem' }}>
            This carries the {answered} answers you gave{note.trim() ? ' and the note you wrote' : ''},
            and nothing else. It does not identify you and it does not go anywhere until you send it.
          </p>
          <CopyBox value={link} label="Send them this" />

          {note.trim() && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="eyebrow" style={{ marginBottom: '0.4rem' }}>They will read this, exactly as you wrote it</div>
              <blockquote style={{ margin: 0, paddingLeft: '1.1rem', borderLeft: '2px solid var(--color-sindoor)' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--color-kajal-soft)', margin: 0 }}>
                  &ldquo;{note.trim()}&rdquo;
                </p>
              </blockquote>
            </div>
          )}

          <hr className="rule" style={{ marginBlock: '2rem' }} />
          <p style={{ color: 'var(--color-kajal-soft)' }}>
            You can also do the whole thing yourself, for yourself. It is free and it always will
            be, and your answers would be nobody's business but yours.
          </p>
          <Link href="/" className="btn btn-quiet" style={{ marginTop: '0.75rem' }}>
            See what this is
          </Link>
        </div>
      </Shell>
    )
  }

  /* the note, last */
  if (index >= items.length) {
    const item = ITEM_BY_ID[PARTNER_NOTE_ID]
    return (
      <Shell>
        <ChapterDots total={total} done={items.length} current={items.length} />
        <div className="settle" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: '0.75rem' }}>
            {item?.text ?? 'Is there one thing you want them to know?'}
          </h2>
          <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '1.25rem' }}>
            Optional. They will read it exactly as you write it — nothing here is summarised or
            softened, and nothing is added to it. Skip it and nothing else changes.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            placeholder="Or leave this empty."
            style={{
              width: '100%', padding: '0.9rem', fontSize: '1rem',
              border: '1px solid var(--color-kagaz-edge)', background: 'var(--color-kagaz)',
              borderRadius: '3px', fontFamily: 'var(--font-body)', resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setDone(true)}>Finish</button>
            <button className="btn btn-quiet" onClick={() => setIndex(items.length - 1)}>Back</button>
          </div>
        </div>
      </Shell>
    )
  }

  const item = items[index]!
  return (
    <Shell>
      <ChapterDots total={total} done={index} current={index} />
      <Question
        item={item}
        value={answers[item.id]?.value}
        skipped={skipped.includes(item.id)}
        index={index}
        total={total}
        onAnswer={(v, dwellMs) => {
          setAnswers((prev) => ({
            ...prev,
            [item.id]: {
              itemId: item.id,
              value: v,
              revisions: prev[item.id] ? prev[item.id]!.revisions + 1 : 0,
              dwellMs,
              order: index,
            },
          }))
          setSkipped((s) => s.filter((x) => x !== item.id))
          setIndex((i) => i + 1)
        }}
        onSkip={() => {
          setSkipped((s) => (s.includes(item.id) ? s : [...s, item.id]))
          setIndex((i) => i + 1)
        }}
      />
      {index > 0 && (
        <div className="wrap" style={{ paddingTop: '0.5rem' }}>
          <button className="btn btn-quiet" onClick={() => setIndex((i) => i - 1)}>Back</button>
        </div>
      )}
    </Shell>
  )
}
