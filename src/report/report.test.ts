import { describe, it, expect } from 'vitest'
import { derive } from '../engine/derive'
import { arjun, priya, aarti, meera, rohit } from '../engine/fixtures'
import { nisha, vikram } from '../engine/fixtures-cases'
import { sunita, kabir } from '../engine/fixtures-hard'
import { fallbackReport } from './fallback'

/**
 * The deterministic report is what a reader gets on a bad free-tier day, so it has to survive
 * being read rather than merely being correct. These check the two things that were actually
 * wrong on the page: the same quote printed twice in consecutive paragraphs, and sections that
 * rendered as a heading with nothing underneath it.
 */
const PEOPLE = { arjun, priya, aarti, meera, rohit, nisha, vikram, sunita, kabir }

/**
 * Long verbatim runs of the person's OWN WRITING, as they appear inside a paragraph.
 *
 * Deliberately not every quoted run. A question's wording legitimately appears in two sections
 * when two different findings rest on the same answer, and that reads fine. What does not read
 * fine is the same thing the person typed appearing twice — that is a stutter, and it looked
 * exactly like one on the page when the opening prose and the concern finding both quoted it.
 */
function ownWords(text: string, written: string[]): string[] {
  const out: string[] = []
  const re = /"([^"]{60,})"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const run = m[1]!.trim().replace(/…$/, '')
    if (written.some((w) => w.includes(run.slice(0, 60)))) out.push(run)
  }
  return out
}

describe('the deterministic report reads', () => {
  for (const [name, make] of Object.entries(PEOPLE)) {
    const packet = derive(make())
    const report = fallbackReport(packet)

    it(`${name}: no section is a heading with nothing under it`, () => {
      for (const s of report) {
        expect(s.paragraphs.length, `"${s.title}" rendered empty`).toBeGreaterThan(0)
      }
    })

    it(`${name}: never quotes their own words back twice`, () => {
      const written = Object.values(make().answers)
        .map((a) => a.value)
        .filter((v): v is string => typeof v === 'string')
      const seen = new Map<string, string>()
      for (const s of report) {
        for (const p of s.paragraphs) {
          for (const q of ownWords(p.text, written)) {
            const key = q.slice(0, 80)
            const first = seen.get(key)
            expect(first, `"${key.slice(0, 50)}…" is quoted in both "${first}" and "${s.title}"`).toBeUndefined()
            seen.set(key, s.title)
          }
        }
      }
    })

    it(`${name}: every paragraph carries at least one receipt`, () => {
      for (const s of report) {
        for (const p of s.paragraphs) {
          expect(p.evidenceIds.length, `a paragraph in "${s.title}" has no evidence`).toBeGreaterThan(0)
        }
      }
    })

    it(`${name}: says enough to be worth reading`, () => {
      const words = report.reduce((n, s) => n + s.paragraphs.reduce((m, p) => m + p.text.split(/\s+/).length, 0), 0)
      expect(words, 'the outage report is too thin to be the report').toBeGreaterThan(900)
    })
  }

  it('an ended relationship is never described in the present tense', () => {
    const report = fallbackReport(derive(kabir()))
    const body = report.flatMap((s) => s.paragraphs.map((p) => p.text)).join(' ')
    for (const phrase of [
      'you are committed to this lasting',
      'how it currently feels',
      'currently feels good',
      'as you are living it',
    ]) {
      expect(body.toLowerCase(), `the aftermath report says "${phrase}"`).not.toContain(phrase)
    }
  })

  it('somebody who asked to repair is never handed a stay-or-leave verdict', () => {
    const ids = derive(nisha()).plan.map((s) => s.id)
    expect(ids).not.toContain('paths')
    expect(ids).not.toContain('read')
    expect(ids).toContain('mechanism')
  })

  it('somebody deciding is given the options AND the decision back', () => {
    const ids = derive(sunita()).plan.map((s) => s.id)
    expect(ids).toContain('paths')
    expect(ids).toContain('read')
    expect(ids).toContain('holding')
  })
})
