import { useMemo, useState, useEffect } from 'react'
import { useLocation, useSearch, Link } from 'wouter'
import { runningOrder, CHAPTER_META, SAFETY_ITEMS, SAFETY_PREAMBLE, estimatedMinutes } from '../items'
import type { ChapterId, Lens, Stage } from '../engine/types'
import { useAnswers } from '../state/answers'
import { useSafety } from '../state/safety'
import { Question } from './Question'
import { Jhalak } from './Jhalak'
import { ChapterDots, Wordmark, Plate, AmbientSupport } from './bits'

const CHAPTER_PLATE: Partial<Record<ChapterId, string>> = {
  ground: 'shri-raga',
  story: 'utka',
  you: 'falcon',
  between: 'maru-ragini',
  holding: 'horse',
  patterns: 'dyer',
  future: 'stork',
  safety: 'hoopoe',
}

export function Assessment() {
  const search = useSearch()
  const [, navigate] = useLocation()
  const store = useAnswers()
  const safety = useSafety()
  const [chapterIdx, setChapterIdx] = useState(0)
  const [itemIdx, setItemIdx] = useState(0)

  // ?lens= picks the door on first entry; after that the store owns it.
  useEffect(() => {
    const lens = new URLSearchParams(search).get('lens') as Lens | null
    if (lens === 'self' || lens === 'relationship') store.setLens(lens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chapters = useMemo(() => runningOrder(store.context), [store.context])
  const chapter = chapters[chapterIdx]

  if (!store.jhalakDone) {
    return <Jhalak onDone={() => { store.completeChapter('jhalak'); setChapterIdx(1) }} />
  }

  if (!chapter) {
    return <Finished />
  }

  // The Jhalak is chapter 0 and already done; never show it again.
  if (chapter.chapter === 'jhalak') {
    setChapterIdx(chapterIdx + 1)
    return null
  }

  const isSafety = chapter.chapter === 'safety'
  const items = isSafety ? SAFETY_ITEMS : chapter.items
  const item = items[itemIdx]
  const meta = CHAPTER_META[chapter.chapter]

  const answerOf = (id: string) =>
    isSafety ? safety.answers[id]?.value : store.answers[id]?.value

  const advance = () => {
    if (itemIdx + 1 < items.length) {
      setItemIdx(itemIdx + 1)
    } else {
      store.completeChapter(chapter.chapter)
      if (chapterIdx + 1 < chapters.length) {
        setChapterIdx(chapterIdx + 1)
        setItemIdx(0)
      } else {
        store.finish()
        navigate('/report')
      }
    }
  }

  return (
    <main>
      <div className="wrap" style={{ paddingBlock: '1.5rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}><Wordmark size="1rem" mark={26} /></Link>
          <ChapterDots total={chapters.length - 1} done={chapterIdx - 1} current={chapterIdx - 1} />
        </header>
      </div>

      <div className="read" style={{ paddingBlock: 'clamp(1rem, 4vh, 2.5rem)' }}>
        {itemIdx === 0 && <ChapterOpener chapter={chapter.chapter} count={items.length} />}

        {isSafety && itemIdx === 0 && <SafetyPreamble />}

        {item && (
          <Question
            item={item}
            value={answerOf(item.id)}
            skipped={store.skipped.includes(item.id)}
            index={itemIdx}
            total={items.length}
            onAnswer={(v, dwellMs) => {
              if (isSafety) safety.answer(item.id, v, dwellMs)
              else store.answer(item.id, v, dwellMs)
              advance()
            }}
            onSkip={() => { store.skip(item.id); advance() }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', gap: '1rem' }}>
          <button
            className="btn btn-quiet"
            disabled={itemIdx === 0 && chapterIdx <= 1}
            onClick={() => {
              if (itemIdx > 0) setItemIdx(itemIdx - 1)
              else if (chapterIdx > 1) {
                const prev = chapters[chapterIdx - 1]!
                setChapterIdx(chapterIdx - 1)
                setItemIdx(Math.max(0, prev.items.length - 1))
              }
            }}
          >
            ← Back
          </button>
          <span className="attrib" style={{ alignSelf: 'center' }}>
            {meta.title} · about {meta.minutes} min
          </span>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: '3rem' }}>
        <AmbientSupport />
      </div>
    </main>
  )
}

function ChapterOpener({ chapter, count }: { chapter: ChapterId; count: number }) {
  const meta = CHAPTER_META[chapter]
  const plate = CHAPTER_PLATE[chapter]
  return (
    <div className="settle" style={{ marginBottom: '2.5rem' }}>
      {plate && <Plate slug={plate} height={130} showAttribution={false} />}
      <div className="eyebrow" style={{ marginTop: plate ? '1.25rem' : 0, marginBottom: '0.5rem' }}>
        {count} question{count === 1 ? '' : 's'}
      </div>
      <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '0.75rem' }}>
        {meta.title}
        {meta.hindi && <span className="deva" style={{ color: 'var(--color-sindoor)', marginLeft: '0.6rem', fontSize: '0.8em' }}>{meta.hindi}</span>}
      </h1>
      <p style={{ color: 'var(--color-kajal-soft)' }}>{meta.blurb}</p>
      <hr className="rule" style={{ marginTop: '2rem' }} />
    </div>
  )
}

/**
 * CUES — Confidentiality, Universal Education, Support.
 *
 * Every user sees this page. Because it is universal, an answer here can never single anyone out,
 * and support information can never read as a reaction to something someone just admitted. That
 * is the entire design: disclosure is explicitly not the goal.
 */
function SafetyPreamble() {
  return (
    <div className="card settle" style={{ marginBottom: '2.5rem' }}>
      <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>{SAFETY_PREAMBLE.title}</div>
      <p style={{ marginBottom: '0.9rem' }}>{SAFETY_PREAMBLE.body}</p>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-kajal-soft)', marginBottom: '0.6rem' }}>
        {SAFETY_PREAMBLE.privacy}
      </p>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-kajal-soft)' }}>
        {SAFETY_PREAMBLE.optOut}
      </p>
    </div>
  )
}

function Finished() {
  const [, navigate] = useLocation()
  const ctx = useAnswers((s) => s.context)
  return (
    <main className="read" style={{ paddingBlock: '4rem' }}>
      <h1 style={{ fontSize: 'var(--text-h1)', marginBottom: '1rem' }}>That is everything.</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--color-kajal-soft)' }}>
        About {estimatedMinutes(ctx)} minutes of answers. Now it gets read back to you.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/report')}>Read what it says</button>
    </main>
  )
}

export type { Stage }
