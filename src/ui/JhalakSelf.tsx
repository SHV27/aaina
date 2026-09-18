import { Link } from 'wouter'
import { useAnswers } from '../state/answers'
import { itemPomp } from '../engine/score'
import { Plate, Wordmark, AmbientSupport } from './bits'

/**
 * The glimpse, for the Know Thyself door.
 *
 * Same job as the relationship one: find a real tension in seven answers and say it back in the
 * person's own words. The tension here is the one that defines self-knowledge work — the distance
 * between how clearly somebody sees themselves and how they treat what they see.
 *
 * Those two are separable, and keeping them apart is the whole point. Somebody precise and cruel
 * needs a completely different report from somebody vague and gentle, and a single "self-awareness
 * score" would collapse the only interesting thing about either of them.
 *
 * This exists because walking the app found the self door leading into relationship questions —
 * "Where is this, right now?" asked of a person who came to understand themselves.
 */
export function SelfPayout({ onContinue }: { onContinue: () => void }) {
  const store = useAnswers()
  const a = store.answers

  const p = (id: string): number | null => {
    const v = a[id]?.value
    return typeof v === 'number' ? Math.round(itemPomp(id, v)) : null
  }

  const knows = avg([p('scc_1'), p('scc_2')]) // how clearly they see themselves
  const kind = avg([p('sco_2')]) // how they treat what they see
  const earns = p('cbs_2') // whether love has to be earned
  const stuck = p('rum_3') // whether they can put it down
  const own = p('aut_2') // whose life this is
  const why = typeof a['txt_why']?.value === 'string' ? (a['txt_why'].value as string).trim() : ''

  const lines: { head: string; body: string }[] = []

  if (knows !== null && kind !== null && knows >= 55 && kind <= 40) {
    lines.push({
      head: 'You see yourself clearly, and you hold it against yourself.',
      body: `Seeing yourself sits around ${knows}%. The kindness you extend to what you see sits around ${kind}%. Those are separable, and the combination is the finding — any advice built on "get to know yourself better" will miss you entirely, because you already have the description. What you do not have is a way of holding it that leaves you able to move.`,
    })
  } else if (knows !== null && kind !== null && knows <= 45 && kind <= 45) {
    lines.push({
      head: 'You are hard on a version of yourself you have never seen clearly.',
      body: `Seeing yourself sits around ${knows}%, and self-kindness around ${kind}%. The judging is not waiting for the evidence, which means the person being convicted is a sketch rather than you. That is the most common shape there is, and also the most workable.`,
    })
  } else if (knows !== null && kind !== null) {
    lines.push({
      head: 'How clearly you see yourself and how you treat what you see are not the same number.',
      body: `Seeing sits around ${knows}%, kindness around ${kind}%. Most things that measure self-awareness collapse those into one score and lose the only interesting thing about them.`,
    })
  }

  if (earns !== null && earns <= 40) {
    lines.push({
      head: 'You answered that being loved is something you have to earn.',
      body: 'That is a belief rather than a fact, and it is the kind that quietly writes decisions — who you say yes to, what you put up with, how long you stay. It is also testable, which beliefs of this kind almost never get to be.',
    })
  }

  if (stuck !== null && stuck <= 35 && own !== null && own <= 40) {
    lines.push({
      head: 'You cannot put things down, and you are living a life somebody else designed.',
      body: 'Those two answers usually arrive together and they feed each other: a life you did not choose gives you more to replay, and the replaying leaves less room to choose. Which one to start with is not obvious, and getting it the wrong way round wastes months.',
    })
  }

  if (lines.length === 0) {
    lines.push({
      head: 'Seven answers is not enough for a reading, and we are not going to invent one.',
      body: 'What you have given us is consistent and does not point anywhere sharp yet. That is a real result rather than a failure, and the full assessment is where the detail actually lives.',
    })
  }

  return (
    <main>
      <div className="wrap" style={{ paddingBlock: '1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Wordmark size="1rem" mark={26} />
        </Link>
      </div>

      <div className="read" style={{ paddingBlock: 'clamp(1.5rem, 5vh, 3rem)' }}>
        <div className="settle">
          <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>From seven answers</div>
          <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '2rem' }}>
            Here is what you have already told us.
          </h1>
        </div>

        {why && (
          <blockquote
            className="settle"
            style={{ animationDelay: '80ms', margin: '0 0 2.25rem', paddingLeft: '1.1rem', borderLeft: '2px solid var(--color-sindoor)' }}
          >
            <p style={{ fontStyle: 'italic', color: 'var(--color-kajal-soft)' }}>&ldquo;{why}&rdquo;</p>
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
          <Plate slug="fruit-bat" height={150} focus="50% 30%" showAttribution={false} />
          <h2 style={{ fontSize: 'var(--text-h2)', margin: '1.5rem 0 0.75rem' }}>
            That was seven questions. The real thing is about eighty.
          </h2>
          <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '1.75rem' }}>
            The beliefs underneath the behaviour, where they came from, the person you said you want
            to become, and the specific distance between here and there — ending in a staged plan of
            published exercises rather than a list of advice. Around forty-five minutes. You can stop
            after any chapter and keep what you have.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onContinue}>Keep going</button>
            <Link href="/" className="btn btn-quiet">Not right now</Link>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: '3rem' }}>
        <AmbientSupport />
      </div>
    </main>
  )
}

function avg(xs: (number | null)[]): number | null {
  const v = xs.filter((x): x is number => x !== null)
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null
}
