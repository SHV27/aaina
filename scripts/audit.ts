/**
 * THE FIVE FAILURE TESTS, MEASURED.
 *
 * The founder's standard names five ways this product fails, and every one of them is a thing
 * about the finished text rather than about the code. Asserting they are not happening is worth
 * nothing; this counts them and prints the offending sentences.
 *
 *   npx tsx scripts/audit.ts
 *
 * Deterministic by default, so it runs without a key and measures the outage text — which is the
 * hardest case, because that is the version nobody got to rewrite.
 */
import { derive } from '../src/engine/derive'
import { arjun, priya, aarti, meera, rohit } from '../src/engine/fixtures'
import { nisha, vikram } from '../src/engine/fixtures-cases'
import { sunita, kabir } from '../src/engine/fixtures-hard'
import { fallbackReport } from '../src/report/fallback'
import { PRACTICE_BY_ID } from '../src/engine/practices'
import type { AssessmentInput } from '../src/engine/types'

const PEOPLE: Record<string, () => AssessmentInput> = {
  arjun, priya, aarti, meera, rohit, nisha, vikram, sunita, kabir,
}

interface Para { section: string; id: string; text: string; claim: boolean }
interface Doc { name: string; paragraphs: Para[]; packet: ReturnType<typeof derive> }

/**
 * A paragraph anchored to a finding is a CLAIM about this person and may never be reusable.
 * Everything else is METHOD — how POMP works, what the instrument can and cannot do — and is
 * shared on purpose, because rewording the explanation of a percentage for every reader would be
 * variation for its own sake. This is the same split `eval-generic` uses.
 *
 * ARGUMENT sections are the exception inside method: they carry no finding but they are about
 * this person's situation, so they are held to the claim standard.
 */
/**
 * The warning shot is deliberately NOT in this set, and the reason is worth writing down rather
 * than quietly dropping it from the list. Its job is procedural — SPIKES puts it there so a reader
 * is not ambushed — and two people about to read the same kind of hard thing should be warned the
 * same way. It names the section coming and the kind of finding in it, so it is not constant; where
 * it does coincide, that is two people genuinely in the same position at the same point.
 */
const ARGUMENT = new Set(['paths', 'read', 'markers'])

/**
 * The plan is judged separately and by a different rule.
 *
 * Most of a plan paragraph is the published exercise's own description — what it is, what to do
 * the first time, what to do when it goes badly — and two people prescribed the same intervention
 * SHOULD read the same words about it, exactly as two people get the same explanation of what a
 * percentage means. What must be theirs is the reason it was chosen, so that is what gets checked,
 * below, on its own.
 */
const INSTRUMENT = new Set(['plan'])

const docs: Doc[] = Object.entries(PEOPLE).map(([name, make]) => {
  const packet = derive(make())
  const paragraphs = fallbackReport(packet).flatMap((s) =>
    s.paragraphs.map((p) => ({
      section: s.title,
      id: s.id,
      text: p.text,
      claim: (!!p.findingId || ARGUMENT.has(s.id)) && !INSTRUMENT.has(s.id),
    })),
  )
  return { name, paragraphs, packet }
})

const line = (s = '') => console.log(s)
const head = (n: number, t: string) => { line(); line(`── ${n} · ${t} ` + '─'.repeat(Math.max(0, 58 - t.length))); line() }

let failures = 0
const fail = (msg: string) => { failures += 1; console.log(`  FAIL  ${msg}`) }
const pass = (msg: string) => console.log(`  pass  ${msg}`)

/* ══════════════════════════════════════════════════════════════════════════
   1 · "I already knew this."
   ══════════════════════════════════════════════════════════════════════════ */
head(1, 'Does it land as insight, or only describe?')

/**
 * Finn's levels are the engine's own measure of this: Level 1 confirms what the reader already
 * believes, Level 3 is genuinely discrepant with their self-story. A report made mostly of Level 1
 * is a well-evidenced way of telling somebody what they told you.
 */
for (const d of docs) {
  const accepted = d.packet.findings.filter((f) => f.accepted)
  const l3 = accepted.filter((f) => f.finnLevel === 3).length
  const share = accepted.length ? l3 / accepted.length : 0
  const msg = `${d.name.padEnd(8)} ${l3}/${accepted.length} findings are Level 3 (${(share * 100).toFixed(0)}%)`
  if (l3 < 3) fail(`${msg} — fewer than three things they did not already know`)
  else pass(msg)
}

/* ══════════════════════════════════════════════════════════════════════════
   2 · Two similar people, two near-identical reports.
   ══════════════════════════════════════════════════════════════════════════ */
head(2, 'Could this report have been written for someone else?')

function shingles(text: string): Set<string> {
  const w = text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean)
  const out = new Set<string>()
  for (let i = 0; i + 7 <= w.length; i++) out.add(w.slice(i, i + 7).join(' '))
  return out
}

/**
 * Two measures, because "near-identical reports" is a claim about two different things.
 *
 * VERBATIM — the same sentence, numbers and all, in two people's reports. There is no defence for
 * that in a claim: it means the sentence was not about either of them.
 *
 * FRAME — the same sentence with different numbers in it. That is not automatically a failure. "You
 * are 100% committed and 40% satisfied" and "69% and 30%" are different claims about different
 * people, and the engine computing both from one template is what makes it an engine rather than a
 * pile of special cases. It becomes a failure by VOLUME, so it is counted rather than banned.
 */
const verbatim = new Map<string, { who: string; section: string; text: string }>()
const framed = new Map<string, string[]>()
const shared: { a: string; b: string; section: string; text: string }[] = []
let framesShared = 0
let claimsChecked = 0

for (const d of docs) {
  for (const p of d.paragraphs) {
    if (!p.claim) continue
    claimsChecked += 1

    const exact = p.text.replace(/\s+/g, ' ').trim()
    const prev = verbatim.get(exact)
    if (prev && prev.who !== d.name) shared.push({ a: prev.who, b: d.name, section: p.section, text: p.text })
    else verbatim.set(exact, { who: d.name, section: p.section, text: p.text })

    const frame = exact.toLowerCase().replace(/[0-9]+/g, '#').replace(/[^a-z# ]+/g, '')
    const who = framed.get(frame) ?? []
    if (!who.includes(d.name)) who.push(d.name)
    framed.set(frame, who)
  }
}
for (const who of framed.values()) if (who.length > 1) framesShared += who.length - 1

const methodCount = docs.reduce((n, d) => n + d.paragraphs.filter((p) => !p.claim).length, 0)
line(`  (${claimsChecked} claims and argument paragraphs checked; ${methodCount} method paragraphs excluded)`)
line()

if (shared.length === 0) {
  pass(`no claim appears word for word in two people's reports`)
} else {
  for (const s of shared) {
    fail(`"${s.section}" is word-for-word the same for ${s.a} and ${s.b}`)
    line(`        ${s.text.slice(0, 150)}…`)
  }
}

const frameShare = claimsChecked ? framesShared / claimsChecked : 0
const FRAME_GATE = 0.2
if (frameShare > FRAME_GATE) {
  fail(`${(frameShare * 100).toFixed(1)}% of claims share a frame with another person's (gate ${FRAME_GATE * 100}%)`)
} else {
  pass(`${(frameShare * 100).toFixed(1)}% of claims share a frame with another person's, numbers aside (gate ${FRAME_GATE * 100}%)`)
}

/**
 * Every prescribed step has to say why it is THIS person's, in words no one else would get.
 * This is the plan's version of the duplicate test, and a stricter one: not "is the paragraph
 * shared" but "is the reason shared".
 */
const reasons = new Map<string, string[]>()
for (const d of docs) {
  for (const sp of d.packet.practices) {
    const key = sp.because.replace(/\s+/g, ' ').trim()
    const who = reasons.get(key) ?? []
    if (!who.includes(d.name)) who.push(d.name)
    reasons.set(key, who)
  }
}
const sharedReasons = [...reasons.entries()].filter(([, who]) => who.length > 1)
if (sharedReasons.length === 0) {
  pass('every prescribed step gives a reason that belongs to one person only')
} else {
  for (const [why, who] of sharedReasons) {
    fail(`the same reason is given to ${who.join(' and ')}: "${why.slice(0, 110)}…"`)
  }
}

/**
 * The real question behind "near-identical reports": would a reader recognise theirs, early?
 *
 * Not "does it start with different words". Real writing uses stems — "asked what you would tell
 * your closest friend, you wrote:" is a stem, and what follows it is the whole point. A first
 * version of this measure counted the first fourteen words and reported 71%, which was a fact
 * about stems rather than about reports.
 *
 * So: inside the OPENING of every claim, is there a run of eight words that appears in nobody
 * else's report? That is the thing that makes a paragraph unmistakably one person's, and it is
 * what a reader is actually reacting to when they think "this is about me".
 */
function runs(text: string, n = 8): string[] {
  const w = text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean)
  const out: string[] = []
  for (let i = 0; i + n <= w.length; i++) out.push(w.slice(i, i + n).join(' '))
  return out
}

const runsBy = new Map<string, Set<string>>()
for (const d of docs) {
  const set = new Set<string>()
  for (const para of d.paragraphs) if (para.claim) for (const r of runs(para.text)) set.add(r)
  runsBy.set(d.name, set)
}

let openings = 0
let recognisable = 0
const anonymous: string[] = []
for (const d of docs) {
  const others = [...runsBy.entries()].filter(([who]) => who !== d.name).map(([, set]) => set)
  for (const para of d.paragraphs) {
    if (!para.claim) continue
    openings += 1
    const opening = para.text.replace(/\s+/g, ' ').trim().split(' ').slice(0, 45).join(' ')
    const unique = runs(opening).some((r) => !others.some((set) => set.has(r)))
    if (unique) recognisable += 1
    else anonymous.push(`${d.name} — ${para.section}: ${opening.slice(0, 110)}…`)
  }
}

const openShare = openings ? recognisable / openings : 0

/**
 * Ninety per cent, not a hundred, and the difference is deliberate.
 *
 * The fixture set contains two pairs of people built to be almost the same person — aarti and
 * meera differ by one point on most dimensions, and the remaining misses are both of that kind:
 * the same sentence about the same item, differing only in which scale word each one chose.
 * Pushing those apart would mean writing two versions of a true sentence so that a counter goes
 * green, which is variation for its own sake and reads worse than the repetition it replaces.
 *
 * The number to watch is movement. If it falls, something templated got added.
 */
const OPENING_GATE = 0.9
if (openShare < OPENING_GATE) {
  fail(`only ${(openShare * 100).toFixed(0)}% of claims say something in their first 45 words that no other reader is told`)
  for (const c of anonymous.slice(0, 6)) line(`        ${c}`)
} else {
  pass(`${(openShare * 100).toFixed(0)}% of claims say something in their first 45 words that no other reader is told`)
}

// and the hard pair specifically: aarti and meera were built to be similar
const a = docs.find((d) => d.name === 'aarti')!
const m = docs.find((d) => d.name === 'meera')!
// Claims only. The method text is identical for everybody on purpose, and counting it here would
// have measured the explanation of POMP rather than the reading.
const sa = new Set([...a.paragraphs.filter((p) => p.claim).flatMap((p) => [...shingles(p.text)])])
const sm = new Set([...m.paragraphs.filter((p) => p.claim).flatMap((p) => [...shingles(p.text)])])
const shareA = [...sa].filter((x) => !sm.has(x)).length / Math.max(1, sa.size)
const shareM = [...sm].filter((x) => !sa.has(x)).length / Math.max(1, sm.size)
const own = Math.min(shareA, shareM)
if (own < 0.25) {
  fail(`aarti and meera: only ${(own * 100).toFixed(0)}% of the thinner report is phrasing the other one never sees`)
} else {
  pass(`aarti and meera — near-identical scores — and ${(shareA * 100).toFixed(0)}% / ${(shareM * 100).toFixed(0)}% of each report is phrasing the other never sees`)
}

/* And for the pair specifically, the same recognisability question as above rather than a
   character-prefix comparison — which counted shared stems and told us nothing. */
const mRuns = new Set(m.paragraphs.filter((p) => p.claim).flatMap((p) => runs(p.text)))
const aClaims = a.paragraphs.filter((p) => p.claim)
const aRecognisable = aClaims.filter((p) => {
  const opening = p.text.replace(/\s+/g, ' ').trim().split(' ').slice(0, 45).join(' ')
  return runs(opening).some((r) => !mRuns.has(r))
}).length
const pairShare = aClaims.length ? aRecognisable / aClaims.length : 0
if (pairShare < OPENING_GATE) {
  fail(`only ${(pairShare * 100).toFixed(0)}% of aarti's claims open with something meera is not also told`)
  for (const p of aClaims) {
    const opening = p.text.replace(/\s+/g, ' ').trim().split(' ').slice(0, 45).join(' ')
    if (!runs(opening).some((r) => !mRuns.has(r))) line(`        ${p.section}: ${opening.slice(0, 130)}…`)
  }
} else {
  pass(`${(pairShare * 100).toFixed(0)}% of aarti's claims open with something meera is not also told`)
}

/* ══════════════════════════════════════════════════════════════════════════
   3 · Advice that sounds like therapy instead of doing what therapy does.
   ══════════════════════════════════════════════════════════════════════════ */
head(3, 'Does it hand over something to do, or only something to think?')

for (const d of docs) {
  const practices = d.packet.practices.map((sp) => PRACTICE_BY_ID[sp.practiceId]).filter(Boolean)
  const staged = new Set(practices.map((p) => p!.stage)).size
  const complete = practices.filter((p) => p!.steps.length >= 4 && p!.ifItGoesBadly && p!.marker).length
  const msg = `${d.name.padEnd(8)} ${practices.length} named practices, ${staged} stages, ${complete} with steps + a recovery + a marker`
  if (practices.length < 3) fail(`${msg} — too few to be a plan`)
  else if (complete < practices.length) fail(`${msg} — some are advice rather than exercises`)
  else pass(msg)
}

/** The phrases that sound like help and are not. */
const SOUNDS_LIKE = [
  'communicate better', 'communicate more', 'work on yourself', 'be more present',
  'open up to each other', 'make time for each other', 'seek professional help',
  'set aside quality time', 'be honest with each other', 'listen actively',
  'practice self-care', 'take it one day at a time', 'you deserve better',
]
let vague = 0
for (const d of docs) {
  for (const p of d.paragraphs) {
    for (const phrase of SOUNDS_LIKE) {
      if (p.text.toLowerCase().includes(phrase)) {
        fail(`${d.name}: "${phrase}" in "${p.section}"`)
        vague += 1
      }
    }
  }
}
if (vague === 0) pass('no sentence in any report is advice-shaped filler')

/* ══════════════════════════════════════════════════════════════════════════
   4 · A reader who finishes with more questions than they started with.
   ══════════════════════════════════════════════════════════════════════════ */
head(4, 'Does it converge?')

for (const d of docs) {
  const hasTakeaway = d.packet.practices.length > 0
  const first = d.packet.practices[0] ? PRACTICE_BY_ID[d.packet.practices[0]!.practiceId] : null
  const marker = first?.marker
  const limits = d.packet.limits.length
  const ok = hasTakeaway && !!marker && limits >= 2
  const msg = `${d.name.padEnd(8)} first action: ${first ? first.title : 'NONE'} · marker: ${marker ? 'yes' : 'NO'} · ${limits} stated limits`
  if (ok) pass(msg)
  else fail(msg)
}

/* ══════════════════════════════════════════════════════════════════════════
   5 · Anything that reads as AI output.
   ══════════════════════════════════════════════════════════════════════════ */
head(5, 'Does it read as a person who knows their work?')

const TELLS = [
  'it is important to', "it's important to", 'it is worth noting', 'it is essential',
  'remember that', 'keep in mind', 'as an ai', 'i hope this helps', 'in conclusion',
  'moreover', 'furthermore', 'delve', 'navigate the complexities', 'tapestry',
  'it is crucial', 'plays a vital role', 'in today', 'a journey', 'unlock',
  'empower you', 'holistic approach', 'multifaceted',
]
let tells = 0
for (const d of docs) {
  for (const p of d.paragraphs) {
    for (const t of TELLS) {
      if (p.text.toLowerCase().includes(t)) { fail(`${d.name}: "${t}" in "${p.section}"`); tells += 1 }
    }
  }
}
if (tells === 0) pass(`no model tells across ${docs.reduce((n, d) => n + d.paragraphs.length, 0)} paragraphs`)

/** Nobody's own words missing from their own report. */
for (const d of docs) {
  const written = Object.values(PEOPLE[d.name]!().answers)
    .map((x) => x.value)
    .filter((v): v is string => typeof v === 'string' && v.length > 40)
  const body = d.paragraphs.map((p) => p.text).join(' ')
  const quoted = written.filter((w) => body.includes(w.slice(0, 50))).length
  if (quoted === 0 && written.length > 0) fail(`${d.name}: not one of their own sentences appears in their report`)
  else pass(`${d.name.padEnd(8)} ${quoted} of their own passages quoted back`)
}

/* ══════════════════════════════════════════════════════════════════════════ */
line()
line('═'.repeat(66))
if (failures === 0) {
  line('  ALL FIVE FAILURE TESTS PASS')
} else {
  line(`  ${failures} FAILURE${failures === 1 ? '' : 'S'}`)
}
line('═'.repeat(66))
line()
process.exit(failures === 0 ? 0 : 1)
