import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A shell heredoc has now three times eaten a backslash on its way into a source file: once turning
 * the whitespace class in a quote-trimmer into the letter "s", which deleted that letter from the
 * reader's own quoted words; once turning a word boundary into a literal backspace character that
 * shipped inside a regex; and once breaking the string literal in this very test. None was visible
 * in a diff, none failed a typecheck, and the first reached a live report.
 *
 * A control character has no business in this codebase. This is the cheapest possible test for a
 * failure mode that is expensive to find any other way.
 */
const ROOTS = ['src', 'api', 'scripts', 'e2e']
const CODE = /\.(ts|tsx|css|json|html)$/

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'tmp' || entry.endsWith('.tsbuildinfo')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (CODE.test(entry)) out.push(full)
  }
  return out
}

const TAB = 9
const LF = 10
const CR = 13

describe('source hygiene', () => {
  const files = ROOTS.flatMap((r) => {
    try {
      return walk(r)
    } catch {
      return []
    }
  })

  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it('contains no stray control characters', () => {
    const offenders: string[] = []
    for (const f of files) {
      const text = readFileSync(f, 'utf8')
      for (let i = 0; i < text.length; i++) {
        const c = text.charCodeAt(i)
        if (c < 32 && c !== TAB && c !== LF && c !== CR) {
          offenders.push(`${f}: U+${c.toString(16).padStart(4, '0')} at offset ${i}`)
          break
        }
      }
    }
    expect(offenders, offenders.join(' | ')).toEqual([])
  })
})
