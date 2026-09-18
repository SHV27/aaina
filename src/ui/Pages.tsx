import { Link } from 'wouter'
import { SOURCES } from '../engine/sources'
import { DIMENSIONS, weightProvenance } from '../engine/dimensions'
import { ALL_ITEMS, SAFETY_ITEMS } from '../items'
import { PLATES, attribution } from '../plates'
import { Wordmark, AmbientSupport, Plate } from './bits'

function Shell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <main>
      <div className="wrap" style={{ paddingBlock: '1.5rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}><Wordmark size="1rem" mark={26} /></Link>
          <nav style={{ display: 'flex', gap: '1.25rem', fontSize: 'var(--text-small)' }}>
            <Link href="/science" className="btn-ghost">The science</Link>
            <Link href="/privacy" className="btn-ghost">Privacy</Link>
          </nav>
        </header>
      </div>
      <div className="read" style={{ paddingBlock: 'clamp(1.5rem, 5vh, 3rem)' }}>
        <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-kajal-soft)', marginBottom: '2.5rem' }}>{lead}</p>
        {children}
      </div>
      <div className="wrap" style={{ paddingBottom: '3rem' }}><AmbientSupport /></div>
    </main>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */

export function Science() {
  const itemCount = ALL_ITEMS.length + SAFETY_ITEMS.length

  return (
    <Shell
      title="How this was measured"
      lead="Everything Aaina says about you traces to published work you can go and read. Where it cannot, it says so."
    >
      <Block title="Why there is no compatibility percentage">
        <p>
          This is the number everyone else sells, and it is the one thing we will not give you —
          not out of caution, but because the research says it does not exist.
        </p>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-kajal-soft)' }}>
          <li style={{ marginBottom: '0.6rem' }}>
            Joel, Eastwick and Finkel (2017) threw over a hundred measures at the problem and
            predicted <strong>0%</strong> of the dyad-specific variance — the part that is actually
            about <em>these two people together</em>.
          </li>
          <li style={{ marginBottom: '0.6rem' }}>
            Montoya and colleagues (2008), across 313 studies: similarity predicts attraction when
            you first meet someone, and has <strong>no significant effect</strong> once you are in a
            relationship.
          </li>
          <li style={{ marginBottom: '0.6rem' }}>
            Joel and colleagues (2020), across 11,196 couples: “ideal standards” ranked{' '}
            <strong>dead last of 35 predictors</strong>.
          </li>
        </ul>
        <p>
          So a match score would be astrology with a regression coefficient. What we give you
          instead is more numbers, not fewer — sixteen of them, plus one overall figure, and every
          single one is checkable.
        </p>
      </Block>

      <Block title="Why being asked good questions helps at all">
        <p>
          It is reasonable to wonder whether answering questions can do anything by itself. The
          closest thing to a direct test: Larson and Sbarra (2015) followed 210 recently separated
          people who repeatedly answered structured questions about their breakup, and gave them{' '}
          <strong>no advice at any point</strong>. They recovered better than controls, and the
          effect ran through gains in <em>self-concept clarity</em> — how clearly they could see
          themselves.
        </p>
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          That is the mechanism Aaina is built on. Being asked careful questions about your own
          situation, and then shown what your answers actually say, is not a preamble to the help.
          A good part of it is the help.
        </p>
      </Block>

      <Block title="What the percentages actually are">
        <p>
          Every percentage in Aaina is a <strong>POMP score</strong> — Percentage of Maximum
          Possible (Cohen et al., 1999). It means, literally: how far up the scale you answered.
          If you scored 68% on trust, you answered 68% of the way toward the top of the trust
          questions.
        </p>
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          That is not a percentile, not a norm, and not a prediction. It needs no comparison group
          to be true, which matters because there is no Indian normative sample for most of these
          constructs and we are not going to invent one. And you can open any claim in your report
          and check the arithmetic against your own answers.
        </p>
      </Block>

      <Block title="Where the weights come from">
        <p>
          The overall figure weights each dimension by how strongly published research ties it to
          relationship outcomes. Those weights are <strong>derived</strong> from two sources —
          success rates in Joel et al. (2020) and effect sizes in Le et al. (2010) — not chosen by
          us. If you disagree with a weight, you disagree with the research, not with our taste.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-small)', marginTop: '1rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-kagaz-edge)' }}>
              <th style={{ padding: '0.5rem 0' }}>Dimension</th>
              <th>Joel 2020</th>
              <th>Le 2010 |d|</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.filter((d) => d.compositeWeight > 0).sort((a, b) => b.compositeWeight - a.compositeWeight).map((d) => {
              const p = weightProvenance(d.id)
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--color-kagaz-edge)' }}>
                  <td style={{ padding: '0.5rem 0' }}>{d.label}</td>
                  <td className="num">{p?.joel !== undefined ? `${Math.round(p.joel * 100)}%` : '—'}</td>
                  <td className="num">{p?.absD !== undefined ? p.absD.toFixed(2) : '—'}</td>
                  <td className="num">{d.compositeWeight.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="attrib" style={{ marginTop: '0.85rem' }}>
          “What would make leaving hard” and “whether you feel you have options” carry a weight of
          zero on purpose. They explain the verdict; they do not score it.
        </p>
      </Block>

      <Block title="Where the questions come from — stated plainly">
        <p>
          All {itemCount} questions in Aaina are <strong>written by us</strong>, against published
          constructs that we name. We do not reproduce the item wording of any copyrighted
          instrument, because almost every well-known scale is licensed for academic research only
          and Aaina is a consumer product.
        </p>
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          This means two honest things at once. We do <em>not</em> claim the published reliability
          figures of any named scale, because these are not those items. And the questions are
          better suited to India than imported ones would be — no Western instrument asks whether
          your parents have refused the relationship, or whether in-laws take part in how you are
          treated, and in India neither of those is a footnote.
        </p>
      </Block>

      <Block title="What we will never do">
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-kajal-soft)' }}>
          <li style={{ marginBottom: '0.5rem' }}>Predict whether a relationship will end. Equations that claimed to lost roughly half their accuracy the moment they met people they were not built from (Heyman &amp; Slep, 2001).</li>
          <li style={{ marginBottom: '0.5rem' }}>Give a probability of anything.</li>
          <li style={{ marginBottom: '0.5rem' }}>Diagnose you or your partner. “Narcissist” is a banned word in this product, enforced by a test.</li>
          <li style={{ marginBottom: '0.5rem' }}>Use MBTI, Enneagram, DISC or love languages. Popularity is not validity (Pittenger, 2005; Hook et al., 2021; Impett et al., 2024).</li>
          <li style={{ marginBottom: '0.5rem' }}>Tell you to leave, to stay, or to forgive. We name what the pattern is and hand the decision back.</li>
        </ul>
      </Block>

      <Block title="Every source, in full">
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.values(SOURCES).sort((a, b) => a.authors.localeCompare(b.authors)).map((s) => (
            <div key={s.key} style={{ fontSize: 'var(--text-small)', borderLeft: '2px solid var(--color-kagaz-edge)', paddingLeft: '0.9rem' }}>
              <div style={{ fontWeight: 500 }}>{s.authors} ({s.year}). {s.title}.</div>
              <div style={{ color: 'var(--color-kajal-soft)' }}>{s.venue}</div>
              <div style={{ marginTop: '0.35rem' }}>{s.claim}</div>
              {s.url && <a href={s.url} className="btn-ghost" style={{ fontSize: 'var(--text-micro)' }} target="_blank" rel="noreferrer">{s.url}</a>}
            </div>
          ))}
        </div>
      </Block>

      <Block title="The paintings">
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          Every image in Aaina is a cropped detail of a real Indian painting, in the public domain
          under CC0, from a museum that has waived copyright in writing. No stock photography, no
          generated images, no human faces.
        </p>
        <div className="attrib" style={{ display: 'grid', gap: '0.4rem', marginTop: '1rem' }}>
          {PLATES.map((p) => <div key={p.slug}>{attribution(p)}</div>)}
        </div>
      </Block>
    </Shell>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */

export function Privacy() {
  return (
    <Shell
      title="What happens to your answers"
      lead="The short version: we keep nothing, and something is still transmitted. Both halves of that matter, so here is all of it."
    >
      <Block title="We store nothing, because there is nowhere to store it">
        <p>
          Aaina has no accounts, no login, no database, and no server that receives your answers
          for keeping. There is nothing for us to sell, leak, subpoena, or lose.
        </p>
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          Your answers live in <strong>this browser</strong>, so you can close the tab and come
          back. You can erase them completely at any time from the home screen, and clearing your
          browser data erases them too.
        </p>
      </Block>

      <Block title="But something does leave your device, and we are not going to hide it">
        <p>
          To write your report, the analysis has to be sent to a language model. We send a
          <strong> structured summary</strong> — your scores, the contradictions found between your
          answers, and the things you wrote in your own words — to <strong>Groq</strong>, who run
          the model.
        </p>
        <p>
          We chose Groq for one specific reason. Their Services Agreement §4.2 says, in their own
          words:
        </p>
        <blockquote style={{ margin: '1rem 0', paddingLeft: '1.1rem', borderLeft: '2px solid var(--color-sindoor)', fontStyle: 'italic', color: 'var(--color-kajal-soft)' }}>
          “Groq is not permitted to use Inputs or Outputs for training or fine-tuning any AI Model
          Services or other models, unless explicitly granted permission or instructed by Customer.”
        </blockquote>
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          There is no free-tier exception to that clause. We also considered Google’s free Gemini
          tier and rejected it, because its own terms say “do not submit sensitive, confidential,
          or personal information”, that “human reviewers may read, annotate, and process your API
          input and output”, and that it is “not for consumer use”. Everything you tell Aaina is
          sensitive personal information. That made the decision for us.
        </p>
      </Block>

      <Block title="The safety chapter is handled differently">
        <p>
          Answers to the safety questions are held in memory only. They are never written to your
          browser’s storage, never included in a shared link, and never printed unless you
          explicitly tick the box. Closing the tab erases them completely.
        </p>
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          That is a storage decision, not a service decision. Those answers still make your report
          deeper — never shorter. There is no path through this product where telling us something
          difficult gets you less.
        </p>
      </Block>

      <Block title="No analytics on anything personal">
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          No tracking pixels, no advertising identifiers, no third-party scripts, no fonts loaded
          from someone else’s server. The server log records that a section was written and which
          model wrote it. It never records what was in it.
        </p>
      </Block>

      <Block title="Aaina is free">
        <p style={{ color: 'var(--color-kajal-soft)' }}>
          There is no paid tier, no upsell, and nothing is being collected to sell later. It is a
          public good, and it is meant to stay one.
        </p>
      </Block>
    </Shell>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */

export function NotFound() {
  return (
    <main className="read" style={{ paddingBlock: '5rem' }}>
      <Plate slug="stork" height={160} showAttribution={false} />
      <h1 style={{ fontSize: 'var(--text-h1)', margin: '2rem 0 1rem' }}>There is nothing here.</h1>
      <p style={{ color: 'var(--color-kajal-soft)', marginBottom: '2rem' }}>
        Which is its own kind of answer, but probably not the one you came for.
      </p>
      <Link href="/" className="btn btn-primary">Back to the start</Link>
    </main>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: '1rem' }}>{title}</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>{children}</div>
    </section>
  )
}
