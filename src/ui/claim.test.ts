import { describe, it, expect } from 'vitest'
import { paragraphise } from './Claim'
import { derive } from '../engine/derive'
import { rohit, arjun } from '../engine/fixtures'
import { vikram } from '../engine/fixtures-cases'
import { sunita, kabir } from '../engine/fixtures-hard'

/**
 * The engine's computed statements are built by concatenation and some run to three hundred words.
 * Rendered as one <p> they are a wall, and on a bad free-tier day the computed text IS the report.
 *
 * Splitting them is a typographic change and must never be anything else. These tests exist to
 * make sure it cannot quietly become an editing step.
 */
describe('paragraphise', () => {
  const findings = [rohit, arjun, vikram, sunita, kabir].flatMap((f) => derive(f()).findings)

  /** Whitespace is the only thing splitting is allowed to touch. */
  const words = (s: string) => s.replace(/\s+/g, ' ').trim()

  it('never changes a single word of what the engine wrote', () => {
    for (const f of findings) {
      expect(words(paragraphise(f.statement).join(' ')), f.id).toBe(words(f.statement))
    }
  })

  it('keeps the paragraph breaks the engine put in deliberately', () => {
    const authored = findings.filter((f) => f.statement.includes(String.fromCharCode(10)))
    expect(authored.length, 'no multi-paragraph statements to check').toBeGreaterThan(0)
    for (const f of authored) {
      const wanted = f.statement.split(String.fromCharCode(10)).map((t) => t.trim()).filter(Boolean).length
      expect(paragraphise(f.statement).length, f.id).toBeGreaterThanOrEqual(wanted)
    }
  })

  it('leaves short claims alone entirely', () => {
    const short = 'You trust them at 85%. You feel understood at 40%.'
    expect(paragraphise(short)).toEqual([short])
  })

  it('actually breaks up the long ones', () => {
    const long = findings.filter((f) => f.statement.length > 900)
    expect(long.length, 'no long statements to check').toBeGreaterThan(0)
    for (const f of long) {
      expect(paragraphise(f.statement).length, `${f.id} is ${f.statement.length} chars`).toBeGreaterThan(1)
    }
  })

  it('never splits mid-sentence', () => {
    for (const f of findings) {
      for (const block of paragraphise(f.statement)) {
        expect(block.trim().length, `${f.id} produced an empty block`).toBeGreaterThan(0)
        // A block that does not end a sentence means the split landed inside one.
        expect(['.', '!', '?', '…', '"', '”'], `${f.id}: "${block.slice(-60)}"`).toContain(
          block.trim().slice(-1),
        )
      }
    }
  })

  it('never leaves an orphan line at the end', () => {
    for (const f of findings) {
      const blocks = paragraphise(f.statement)
      if (blocks.length < 2) continue
      expect(blocks[blocks.length - 1]!.length, f.id).toBeGreaterThanOrEqual(120)
    }
  })
})
