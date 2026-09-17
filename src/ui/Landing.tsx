import { Link } from 'wouter'
import { Plate, Wordmark, AmbientSupport } from './bits'
import { useAnswers } from '../state/answers'

/**
 * FIRST CONTACT.
 *
 * People arrive here stressed — often at night, often after a fight, often having already read
 * twenty listicles. The brief is explicit and in this order: calm first, then joy. So this screen
 * is deliberately slow. One sentence. A lot of air. A parrot painted in Calcutta in 1820 breathing
 * almost imperceptibly behind it.
 *
 * What is NOT here: a hero gradient, a testimonial, a feature grid, a statistic about how many
 * people use this, a countdown, a "get started free" badge. Nothing that raises a pulse.
 */
export function Landing() {
  const jhalakDone = useAnswers((s) => s.jhalakDone)
  const answered = useAnswers((s) => Object.keys(s.answers).length)

  return (
    <main>
      <div className="wrap" style={{ paddingTop: 'clamp(2rem, 6vh, 4rem)', paddingBottom: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <Wordmark />
          <nav style={{ display: 'flex', gap: '1.25rem', fontSize: 'var(--text-small)' }}>
            <Link href="/science" className="btn-ghost">The science</Link>
            <Link href="/privacy" className="btn-ghost">Privacy</Link>
          </nav>
        </header>
      </div>

      <section className="wrap" style={{ paddingBlock: 'clamp(2rem, 8vh, 5rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center' }} className="landing-grid">
          <div className="settle">
            <h1 style={{ fontSize: 'var(--text-mega)', marginBottom: '1.5rem' }}>
              You already know<br />more than you think.
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-kajal-soft)', maxWidth: '40ch', marginBottom: '2rem', lineHeight: 1.6 }}>
              Aaina reads back what your own answers say — about your relationship, or about you —
              and shows you the receipts for every word of it.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.75rem' }}>
              <Link href="/begin" className="btn btn-primary">
                {jhalakDone && answered > 0 ? 'Pick up where you left off' : 'Start — two minutes'}
              </Link>
              {jhalakDone && answered > 0 && (
                <button className="btn btn-quiet" onClick={() => useAnswers.getState().eraseEverything()}>
                  Start fresh instead
                </button>
              )}
            </div>

            <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-kajal-soft)', maxWidth: '46ch' }}>
              No sign-up, no email, nothing saved to any server of ours. Free, and it will stay free.
            </p>
          </div>

          <div className="settle" style={{ animationDelay: '120ms' }}>
            <Plate slug="parrot" height={380} focus="52% 38%" vivid />
          </div>
        </div>
      </section>

      {/* The two doors. One engine, two lenses — and a bridge if you walk through both. */}
      <section className="wrap" style={{ paddingBlock: 'clamp(2rem, 6vh, 4rem)' }}>
        <hr className="rule" style={{ marginBottom: '2.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Door
            to="/begin?lens=relationship"
            eyebrow="If this is about the two of you"
            title="Where this actually stands"
            body="Sixteen measured dimensions, the contradictions between your own answers, and a verdict that can say stay, can say this should end, and is built so it can honestly say neither."
            plate="hoopoe"
            focus="60% 42%"
          />
          <Door
            to="/begin?lens=self"
            eyebrow="If this is about you"
            title="Know thyself"
            body="The beliefs underneath the behaviour, where they came from, the person you said you want to become — and the specific distance between here and there."
            plate="fruit-bat"
            focus="50% 30%"
          />
        </div>
      </section>

      {/* The one claim we make, and the reason it is not the claim everyone else makes. */}
      <section className="wrap" style={{ paddingBlock: 'clamp(2rem, 6vh, 4rem)' }}>
        <div className="card" style={{ maxWidth: '72ch' }}>
          <div className="eyebrow" style={{ marginBottom: '0.85rem' }}>What makes this different</div>
          <p style={{ marginBottom: '1rem' }}>
            Every sentence Aaina writes about you can be opened. Click it and you see the exact
            question you were asked and the exact answer you gave. Nothing is allowed to render
            without that.
          </p>
          <p style={{ color: 'var(--color-kajal-soft)', fontSize: 'var(--text-small)' }}>
            That rule exists because of a finding from 1972: people rate identical, completely
            generic feedback as <em>more</em> accurate when it is merely labelled “written
            specifically for you.” The label is the trick. Openable evidence is the only thing that
            beats it — which is also why we will not give you a compatibility percentage.{' '}
            <Link href="/science" className="btn-ghost">Here is why that number is not real.</Link>
          </p>
        </div>
      </section>

      <footer className="wrap" style={{ paddingBottom: '3rem' }}>
        <AmbientSupport />
        <p className="attrib" style={{ marginTop: '1.5rem' }}>
          Aaina is free and always will be. Images are cropped details of CC0 Indian paintings held
          by the Cleveland Museum of Art and the Metropolitan Museum of Art.
        </p>
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .landing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}

function Door({ to, eyebrow, title, body, plate, focus }: { to: string; eyebrow: string; title: string; body: string; plate: string; focus: string }) {
  return (
    <Link href={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="card door" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Plate slug={plate} height={190} focus={focus} vivid showAttribution={false} />
        <div className="eyebrow">{eyebrow}</div>
        <h2 style={{ fontSize: 'var(--text-h2)' }}>{title}</h2>
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-kajal-soft)', flex: 1 }}>{body}</p>
        <span style={{ color: 'var(--color-sindoor)', fontSize: 'var(--text-small)', fontWeight: 500 }}>Begin →</span>
      </article>
      <style>{`
        .door { transition: border-color 200ms, transform 200ms var(--ease-settle); }
        .door:hover { border-color: var(--color-sindoor); transform: translateY(-2px); }
      `}</style>
    </Link>
  )
}
