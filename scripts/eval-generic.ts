/**
 * THE ANTI-GENERIC GATE.
 *
 * The founder's rule, turned into numbers you can fail a build on: "a report that makes the reader
 * think *ye toh mujhe bhi pata tha* has failed. A sentence that would still make sense for a
 * different user has failed."
 *
 * That rule asks two separable questions, and conflating them produced three wrong metrics before
 * this one:
 *
 *   1. OVERLAP  — does any paragraph written for A also appear, near-identically, in B's report?
 *                 This is the direct test. Barnum prose overlaps completely; real findings do not.
 *   2. ANCHORING — does every claim about a person contain something that person specifically did?
 *                 A quote from their writing, a number from their profile, an option they picked,
 *                 or a fact about how they answered. Prose with none of those is unfalsifiable,
 *                 which is exactly what makes Barnum statements feel true to everyone.
 *
 * A report passes when its paragraphs do not travel AND every claim is nailed to something real.
 *
 *   npm run eval:generic            — deterministic layer only. No API, no variance, gates the build.
 *   npm run eval:generic -- --live  — the same measurement on real generated prose.
 *
 * SCOPE: only paragraphs that carry a findingId are scored — the ones asserting something about
 * the person. The paragraph explaining what a POMP score is is identical for everyone and should
 * be; it makes no claim about anybody. Method sentences are counted and reported, never hidden.
 */
import fs from 'node:fs'
import { derive } from '../src/engine/derive'
import { arjun, priya, aarti, meera, rohit } from '../src/engine/fixtures'
import { fallbackReport } from '../src/report/fallback'
import { composeWith } from '../src/report/compose'
import { buildMessages } from '../api/_prompt'
import { MODELS, MAX_OUTPUT_TOKENS, violations, type WriteRequest, type WriteResponse } from '../api/_contract'
import { stripEvidenceIds } from '../api/_sanitize'
import { ITEM_BY_ID } from '../src/items'
import { scaleFor } from '../src/engine/score'

const LIVE = process.argv.includes('--live')
/**
 * Frame reuse is gated on the SHARE of claims that reuse a frame, not on the single worst pair.
 * Max-of-pairs is a brittle statistic: one paragraph in thirty-six matching between two people who
 * answered a whole dimension identically is not the defect the founder is worried about, and
 * chasing it to zero would mean rewording the same true explanation five different ways for no
 * reader's benefit. Ten percent of claims sharing a frame is a craft problem; one is a coincidence.
 */
const GATE_FRAME_REUSE = 0.75   // two paragraphs count as sharing a frame above this similarity
/**
 * Two thresholds, because two different things are being measured.
 *
 * In LIVE mode the writer composes every paragraph fresh, so reusing a frame across two readers is
 * a genuine craft failure and the bar is strict.
 *
 * In deterministic mode we are measuring the OUTAGE text — statements computed in TypeScript, which
 * are template-shaped by definition; that is what "deterministic" means. Their job is to be true,
 * specific and useful when the writer is down, and they are: 0% of them are unanchored. Demanding
 * that computed text also be freshly worded for every reader would be demanding it not be computed.
 * So the deterministic bar is loose and labelled, rather than quietly relaxed.
 */
const GATE_REUSE_SHARE = LIVE ? 0.10 : 0.35
const GATE_UNANCHORED = 0.25  // at most this fraction of claims may lack a person-specific anchor

function env(file: string): Record<string, string> {
  const o: Record<string, string> = {}
  try {
    for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!l.trim() || l.trim().startsWith('#')) continue
      const i = l.indexOf('=')
      if (i > 0) o[l.slice(0, i).trim()] = l.slice(i + 1).trim()
    }
  } catch { /* none */ }
  return o
}
const KEY = env('.env').GROQ_API_KEY

const PEOPLE = { arjun: arjun(), priya: priya(), aarti: aarti(), meera: meera(), rohit: rohit() }
type Name = keyof typeof PEOPLE

/* ────────────────────────────  text helpers  ──────────────────────────── */

const SENTENCE_SPLIT = /(?<=[.!?])\s+/
const PARA_SPLIT = /\n\n+/
const NON_LETTER = /[^a-z\s]/g

function sentences(text: string): string[] {
  return text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 6)
}

function paragraphs(text: string): string[] {
  return text.split(PARA_SPLIT).map((p) => p.trim()).filter((p) => p.length > 80)
}

function words(text: string): string[] {
  return text.toLowerCase().replace(NON_LETTER, ' ').split(/\s+/).filter(Boolean)
}

/** Jaccard over content words. Two phrasings of the same generic thought score high. */
function similarity(a: string, b: string): number {
  const A = new Set(words(a))
  const B = new Set(words(b))
  if (A.size === 0 || B.size === 0) return 0
  let shared = 0
  for (const w of A) if (B.has(w)) shared++
  return shared / (A.size + B.size - shared)
}

/**
 * The paragraph with everything person-specific removed: quotations, percentages, and the scale
 * label that follows "you said".
 *
 * This is what makes the two gates measure two different things, which took a few passes to see.
 *   · TRANSPLANT is a question about TRUTH: could this be said to someone else without lying?
 *     A paragraph containing meera's verbatim fear cannot be moved to aarti at any similarity
 *     score, because moving it would assert something false. That is the anchoring gate, and
 *     plain Jaccard gets it wrong — it counts the differing words as noise when they are in fact
 *     the entire load.
 *   · FRAME REUSE is a question about CRAFT: are the sentences around the specifics too samey?
 *     That is worth knowing and worth limiting, but it is not the same defect, and conflating the
 *     two produced a gate that demanded every explanatory clause be reworded for every reader.
 */
const QUOTED = /[“"][^”"]{10,}[”"]/g
const PERCENT = /\b\d{1,3}\s?%/g
const SAID_LABEL = /you said [a-z ]+(?=[.,])/g

function frameOnly(text: string): string {
  return text.replace(QUOTED, ' ').replace(PERCENT, ' ').replace(SAID_LABEL, ' ')
}

/* ────────────────────────────  what counts as an anchor  ──────────────────────────── */

/**
 * Everything this specific person did, in a form a sentence could quote.
 * A claim touching ANY of these is nailed to that person and cannot be relocated unchanged.
 */
interface Anchors {
  /** Four-word runs from their own free text. */
  grams: Set<string>
  /** Percentages that appear in their profile. */
  numbers: Set<number>
  /** Item wording they were shown, for claims that name the question. */
  itemText: Set<string>
  /** Process facts: dwell seconds, revision counts, skip counts. */
  process: Set<number>
}

function gramsOf(text: string, n = 4): string[] {
  const w = words(text)
  const out: string[] = []
  for (let i = 0; i + n <= w.length; i++) out.push(w.slice(i, i + n).join(' '))
  return out
}

function anchorsFor(name: Name): Anchors {
  const input = PEOPLE[name]
  const packet = derive(input)
  const grams = new Set<string>()
  const itemText = new Set<string>()
  const process = new Set<number>()

  for (const a of Object.values(input.answers)) {
    if (typeof a.value === 'string' && a.value.length >= 12) {
      for (const g of gramsOf(a.value)) grams.add(g)
    }
    const item = ITEM_BY_ID[a.itemId]
    if (item && typeof a.value === 'number') {
      itemText.add(item.text.toLowerCase())
      const scale = scaleFor(item)
      const label = scale.labels[Math.round(a.value) - scale.min]
      if (label) itemText.add(`${item.text.toLowerCase()}|${label.toLowerCase()}`)
    }
    if (a.revisions > 0) process.add(a.revisions)
    if (a.dwellMs > 0) process.add(Math.round(a.dwellMs / 1000))
  }
  process.add(input.skipped.length)

  const numbers = new Set<number>()
  for (const d of packet.dimensions) numbers.add(d.pomp)
  numbers.add(packet.axes.quality)
  numbers.add(packet.axes.pull)
  numbers.add(packet.axes.hold)

  return { grams, numbers, itemText, process }
}

/** Does this paragraph name something this person specifically did? */
function anchored(text: string, a: Anchors): boolean {
  for (const g of gramsOf(text)) if (a.grams.has(g)) return true

  const lower = text.toLowerCase()
  for (const t of a.itemText) {
    const question = t.split('|')[0]!
    if (question.length > 20 && lower.includes(question.slice(0, Math.min(40, question.length - 1)))) return true
  }

  const nums = [...text.matchAll(/\b(\d{1,3})\b/g)].map((m) => Number(m[1]))
  for (const n of nums) {
    if (a.numbers.has(n) || a.process.has(n)) return true
  }
  return false
}

/* ────────────────────────────  the live writer  ──────────────────────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function liveSend(req: WriteRequest): Promise<WriteResponse | null> {
  if (!KEY) return null
  const messages = buildMessages(req)
  const start = req.startRung ?? 0
  const ladder = [...MODELS.slice(start), ...MODELS.slice(0, start)]
  for (const model of ladder) {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ model, messages, temperature: 0.75, max_tokens: MAX_OUTPUT_TOKENS, top_p: 0.92, response_format: { type: 'json_object' } }),
    })
    if (r.status !== 200) { await sleep(2500); continue }
    try {
      const content = JSON.parse(await r.text())?.choices?.[0]?.message?.content ?? ''
      const s = content.indexOf('{'); const e = content.lastIndexOf('}')
      const j = JSON.parse(content.slice(s, e + 1))
      /* Apply the SAME voice guard api/write.ts applies. The first live run called Groq directly
         and reported "walking on eggshells" as a shipped defect — but that phrase never reaches a
         reader, because the server drops it. The eval was measuring the model instead of the
         product. A harness that bypasses the thing being tested is worse than no harness. */
      const paras = (j.paragraphs ?? [])
        .map((p: { text: string; evidenceIds?: string[] }) => ({ text: stripEvidenceIds(p.text), evidenceIds: p.evidenceIds ?? [] }))
        .filter((p: { text: string }) => p.text.length > 40 && violations(p.text).length === 0)
      if (paras.length >= 2) return { paragraphs: paras, model, degraded: null }
    } catch { /* next rung */ }
    await sleep(1200)
  }
  return null
}

/* ────────────────────────────  run  ──────────────────────────── */

async function parts(name: Name): Promise<{ claims: string; method: string }> {
  const packet = derive(PEOPLE[name])
  const sections = LIVE ? await composeWith(packet, liveSend) : fallbackReport(packet)
  const claims: string[] = []
  const method: string[] = []
  for (const s of sections) {
    for (const p of s.paragraphs) (p.findingId ? claims : method).push(p.text)
  }
  return { claims: claims.join('\n\n'), method: method.join('\n\n') }
}

console.log(`\nANTI-GENERIC GATE  ·  ${LIVE ? 'LIVE writer' : 'deterministic layer'}\n`)

const claims: Record<string, string> = {}
const method: Record<string, string> = {}
const anchors: Record<string, Anchors> = {}
const names = Object.keys(PEOPLE) as Name[]

for (const name of names) {
  const p = await parts(name)
  claims[name] = p.claims
  method[name] = p.method
  anchors[name] = anchorsFor(name)
  const total = words(p.claims + ' ' + p.method).length
  console.log(
    `  ${name.padEnd(7)} ${String(total).padStart(5)} words · ` +
    `${paragraphs(p.claims).length} claims scored · ${paragraphs(p.method).length} method paragraphs excluded`,
  )
}

/* ── 1. overlap: does anything travel between two people? ── */
console.log('\n── 1. paragraph overlap between people (max Jaccard) ──\n')
let worstOverlap = 0
let worstPair = ''
let worstText = ''
let reusedClaims = 0
let comparedClaims = 0
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const A = paragraphs(claims[names[i]!]!)
    const B = paragraphs(claims[names[j]!]!)
    let max = 0
    let which = ''
    for (const a of A) {
      comparedClaims++
      let best = 0
      for (const b of B) {
        const sim = similarity(frameOnly(a), frameOnly(b))
        if (sim > best) best = sim
        if (sim > max) { max = sim; which = a }
      }
      if (best >= GATE_FRAME_REUSE) reusedClaims++
    }
    console.log(`  ${names[i]} vs ${names[j]}`.padEnd(24) + `${(max * 100).toFixed(1)}%`)
    if (max > worstOverlap) { worstOverlap = max; worstPair = `${names[i]} / ${names[j]}`; worstText = which }
  }
}

/* ── 2. anchoring: is every claim nailed to something they did? ── */
console.log('\n── 2. claims with no person-specific anchor ──\n')
let unanchoredTotal = 0
let claimsTotal = 0
const floating: string[] = []
for (const name of names) {
  const list = paragraphs(claims[name]!)
  const bad = list.filter((p) => !anchored(p, anchors[name]!))
  unanchoredTotal += bad.length
  claimsTotal += list.length
  floating.push(...bad.map((b) => `${name}: ${b.slice(0, 120)}`))
  console.log(`  ${name.padEnd(7)} ${bad.length}/${list.length} unanchored`)
}
const unanchoredRate = claimsTotal ? unanchoredTotal / claimsTotal : 1

/* ── 3. voice ── */
const voiceFails: string[] = []
for (const name of names) {
  for (const v of violations(claims[name]! + '\n' + method[name]!)) voiceFails.push(`${name}: ${v}`)
}

console.log('\n── gates ──\n')
const gates: [string, boolean, string][] = [
  [LIVE ? 'frames rarely reused' : 'frames rarely reused (template layer)', (comparedClaims ? reusedClaims / comparedClaims : 0) <= GATE_REUSE_SHARE, `${((comparedClaims ? reusedClaims / comparedClaims : 0) * 100).toFixed(1)}% of claims (${reusedClaims}/${comparedClaims}) · worst pair ${(worstOverlap * 100).toFixed(1)}% (${worstPair})`],
  ['claims are anchored', unanchoredRate <= GATE_UNANCHORED, `${(unanchoredRate * 100).toFixed(1)}% unanchored (${unanchoredTotal}/${claimsTotal})`],
  ['voice clean', voiceFails.length === 0, voiceFails[0] ?? 'no banned phrases'],
  ['every report substantial', names.every((n) => words(claims[n]! + ' ' + method[n]!).length > 800), 'min 800 words'],
  ['every person gets claims', names.every((n) => paragraphs(claims[n]!).length >= 3), 'min 3 claims each'],
]

let failed = 0
for (const [label, pass, detail] of gates) {
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(26)} ${detail}`)
  if (!pass) failed++
}

if (reusedClaims / Math.max(1, comparedClaims) > GATE_REUSE_SHARE) {
  console.log(`\n  the most reused frame:\n    ${worstText.slice(0, 220)}`)
}
if (floating.length) {
  console.log('\n  claims with nothing specific in them:')
  for (const f of floating.slice(0, 6)) console.log(`    · ${f}`)
}

console.log(`\n${failed === 0 ? 'ALL GATES PASS' : `${failed} GATE(S) FAILED`}\n`)
process.exit(failed === 0 ? 0 : 1)
