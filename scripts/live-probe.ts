/**
 * Live writer probe. Runs the REAL prompt against the REAL Groq ladder using a fixture persona,
 * and prints what a reader would actually get. Synthetic people only — see fixtures.ts.
 *
 * Usage: npx tsx scripts/live-probe.ts [sectionId]
 */
import fs from 'node:fs'
import { derive } from '../src/engine/derive'
import { arjun, priya } from '../src/engine/fixtures'
import { toRequest } from '../src/report/compose'
import { buildMessages } from '../api/_prompt'
import { MODELS, violations, type WriteRequest } from '../api/_contract'

function env(file: string): Record<string, string> {
  const o: Record<string, string> = {}
  try {
    for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!l.trim() || l.trim().startsWith('#')) continue
      const i = l.indexOf('=')
      if (i < 0) continue
      o[l.slice(0, i).trim()] = l.slice(i + 1).trim()
    }
  } catch { /* no env file */ }
  return o
}

const KEY = env('.env').GROQ_API_KEY
if (!KEY) { console.error('No GROQ_API_KEY'); process.exit(1) }

async function call(model: string, messages: { role: string; content: string }[]) {
  const t0 = Date.now()
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model, messages, temperature: 0.75, max_tokens: 3000, top_p: 0.92, response_format: { type: 'json_object' } }),
  })
  const text = await r.text()
  return { status: r.status, text, ms: Date.now() - t0 }
}

function parse(raw: string) {
  try {
    const content = JSON.parse(raw)?.choices?.[0]?.message?.content ?? ''
    const s = content.indexOf('{'); const e = content.lastIndexOf('}')
    if (s === -1) return null
    const j = JSON.parse(content.slice(s, e + 1))
    return Array.isArray(j.paragraphs) ? j.paragraphs : null
  } catch { return null }
}

async function runSection(req: WriteRequest, label: string) {
  const allowed = new Set<string>([
    ...req.findings.flatMap((f) => f.evidence.map((e) => e.id)),
    ...req.quotes.map((q) => q.id),
  ])
  const messages = buildMessages(req)
  for (const model of MODELS) {
    const out = await call(model, messages)
    if (out.status !== 200) { console.log(`   ${model} → ${out.status}`); continue }
    const paras = parse(out.text)
    if (!paras) { console.log(`   ${model} → unparseable`); continue }
    const kept = paras.filter((p: { evidenceIds?: string[] }) => (p.evidenceIds ?? []).some((id) => allowed.has(id)))
    const words = paras.reduce((a: number, p: { text: string }) => a + p.text.split(/\s+/).length, 0)
    const bad = paras.flatMap((p: { text: string }) => violations(p.text))
    console.log(`\n━━━ ${label} · ${model} · ${out.ms}ms · ${words} words · ${kept.length}/${paras.length} cited · ${bad.length ? 'VOICE FAIL: ' + bad.join(', ') : 'voice clean'}`)
    for (const p of paras) {
      console.log(`\n${p.text}`)
      console.log(`   └ cites: ${(p.evidenceIds ?? []).join(', ') || '(NONE — would be dropped)'}`)
    }
    return { words, kept: kept.length, total: paras.length, bad, model, ms: out.ms, paras }
  }
  console.log(`   ${label}: ladder exhausted`)
  return null
}

const which = process.argv[2]
const packet = derive(arjun())
console.log(`Arjun · shape=${packet.axes.shape} quality=${packet.axes.quality} pull=${packet.axes.pull} hold=${packet.axes.hold} findings=${packet.findings.length} sections=${packet.plan.length}`)
console.log(`Plan: ${packet.plan.map((p) => `${p.id}(${p.findingIds.length})`).join(' · ')}`)

const targets = which ? packet.plan.filter((p) => p.id === which) : packet.plan.filter((p) => ['theme', 'working', 'holding'].includes(p.id))
const covered: string[] = []
for (const plan of targets) {
  const req = toRequest(plan, packet, [...covered])
  await runSection(req, `${plan.id} — ${plan.title}`)
  covered.push(plan.title)
}

// cross-persona spot check for transplantability
if (!which) {
  const p2 = derive(priya())
  const theme2 = p2.plan.find((p) => p.id === 'theme')
  if (theme2) {
    console.log('\n\n════════ SAME SECTION, DIFFERENT PERSON (Priya) ════════')
    await runSection(toRequest(theme2, p2, []), 'theme — Priya')
  }
}
