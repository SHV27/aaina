import type { VercelRequest, VercelResponse } from '@vercel/node'
import { WriteRequestZ, MODELS, MAX_OUTPUT_TOKENS, violations, type ModelId, type WriteResponse } from './_contract'
import { stripEvidenceIds } from './_sanitize'
import { buildMessages } from './_prompt'

/**
 * THE CHOKE POINT.
 *
 * The only holder of GROQ_API_KEY, and the only thing in Aaina that ever leaves the browser.
 *
 * Provider policy, verified at source and not negotiable:
 *   Groq Services Agreement §4.2 — "Groq is not permitted to use Inputs or Outputs for training or
 *   fine-tuning any AI Model Services or other models". No free-tier carve-out; §8.1 leaves all
 *   rights in Inputs and Outputs with the customer.
 *   Google's Gemini unpaid terms say the opposite — "Do not submit sensitive, confidential, or
 *   personal information to the Unpaid Services", human reviewers may read inputs, and it is
 *   "not for consumer use". Every payload here is sensitive personal information from a consumer.
 *   So: Groq, and only Groq, for anything a user wrote.
 *
 * This function NEVER logs a request or response body. The most it will ever say about a request
 * is its section id and which model answered.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

/* ── per-IP throttle. In-memory is correct here: there is no database, and a cold start losing
      the counter is a smaller problem than a database holding anything about anybody. ── */
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 40
const hits = new Map<string, number[]>()

function throttled(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for']
  const raw = Array.isArray(fwd) ? fwd[0] : fwd
  return (raw?.split(',')[0] ?? 'unknown').trim()
}

/* ── the ladder ── */

interface Attempt {
  model: ModelId
  ok: boolean
  status?: number
  reason?: string
}

async function callGroq(
  model: ModelId,
  messages: { role: string; content: string }[],
  key: string,
  strictJson: boolean,
) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 55_000)
  try {
    const r = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.75,
        max_tokens: MAX_OUTPUT_TOKENS,
        top_p: 0.92,
        ...(strictJson ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    })
    const text = await r.text()
    return { status: r.status, text }
  } finally {
    clearTimeout(timer)
  }
}

interface Parsed {
  paragraphs: { text: string; evidenceIds: string[] }[]
}

function parseParagraphs(raw: string): Parsed | null {
  let body = raw.trim()
  // Models occasionally wrap JSON in a fence despite json_object mode.
  const fence = body.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence?.[1]) body = fence[1].trim()
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    const j = JSON.parse(body.slice(start, end + 1))
    if (!Array.isArray(j.paragraphs)) return null
    const paragraphs = j.paragraphs
      .filter((p: unknown): p is { text: string; evidenceIds?: unknown } =>
        !!p && typeof (p as { text?: unknown }).text === 'string')
      .map((p: { text: string; evidenceIds?: unknown }) => ({
        text: p.text.trim(),
        evidenceIds: Array.isArray(p.evidenceIds) ? p.evidenceIds.filter((x): x is string => typeof x === 'string') : [],
      }))
      .filter((p: { text: string }) => p.text.length > 40)
    return paragraphs.length ? { paragraphs } : null
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const key = process.env.GROQ_API_KEY
  if (!key) {
    // LAW 7 — observable degradation. The client renders the deterministic report and says so.
    return res.status(503).json({ error: 'writer_unconfigured', degraded: 'No writer is configured on this deployment.' })
  }

  if (throttled(clientIp(req))) {
    return res.status(429).json({ error: 'rate_limited', degraded: 'Too many sections at once. Give it a minute.' })
  }

  const parsedBody = WriteRequestZ.safeParse(req.body)
  if (!parsedBody.success) {
    // Deliberately does not echo the body back. The allowlist rejecting something is the point.
    return res.status(400).json({ error: 'bad_request', issues: parsedBody.error.issues.map((i) => i.path.join('.')) })
  }
  const request = parsedBody.data

  const allowedIds = new Set<string>([
    ...request.findings.flatMap((f) => f.evidence.map((e) => e.id)),
    ...request.quotes.map((q) => q.id),
    ...request.dimensions.map((d) => "ev:dim:" + d.id),
  ])

  const messages = buildMessages(request)
  const attempts: Attempt[] = []

  /* Start where the client asked, then walk the whole ladder from there, wrapping around. This is
     the point of having measured that Groq's buckets are per-model: spreading the start rung turns
     three 8k/min buckets into one ~24k/min budget instead of hammering rung 0 until it 429s. */
  const start = request.startRung ?? 0
  const ladder = [...MODELS.slice(start), ...MODELS.slice(0, start)]

  for (const model of ladder) {
    let out: { status: number; text: string }
    try {
      out = await callGroq(model, messages, key, true)
      /* Groq answers 400 (json_validate_failed) when a model emits malformed JSON under strict
         json mode. That is a rung-local hiccup, not a dead model — so retry the SAME model once
         without the constraint, since the prompt already demands JSON and the parser is tolerant.
         Dropping straight down the ladder here would silently demote most requests to a weaker
         model, which is precisely the invisible degradation LAW 7 exists to prevent. Caught by a
         live run: the top two rungs 400'd and the report was quietly being written by rung three. */
      if (out.status === 400) {
        out = await callGroq(model, messages, key, false)
      }
    } catch (e) {
      attempts.push({ model, ok: false, reason: e instanceof Error ? e.name : 'network' })
      continue
    }

    if (out.status !== 200) {
      attempts.push({ model, ok: false, status: out.status })
      continue
    }

    let content = ''
    try {
      content = JSON.parse(out.text)?.choices?.[0]?.message?.content ?? ''
    } catch {
      attempts.push({ model, ok: false, reason: 'unparseable_envelope' })
      continue
    }

    const parsed = parseParagraphs(content)
    if (!parsed) {
      attempts.push({ model, ok: false, reason: 'no_json' })
      continue
    }

    /* LAW 1 — receipts or it doesn't render. Enforced HERE as well as in the renderer, because a
       guard that exists in one place is a guard that will be bypassed by the second call site. */
    const kept = parsed.paragraphs
      .map((p) => ({
        text: stripEvidenceIds(p.text),
        evidenceIds: [...new Set(p.evidenceIds.filter((id) => allowedIds.has(id)))],
      }))
      .filter((p) => p.evidenceIds.length > 0 && p.text.length > 40)

    /* Drop the paragraphs that break the voice, keep the ones that do not — and only reject the
       whole section when too little survives. Binning an entire good section over one "walking on
       eggshells" burned a rung of a rate-limited ladder and cost the reader four sound paragraphs.
       Measured: models reach for these phrases occasionally, not pervasively. */
    const clean = kept.filter((p) => violations(p.text).length === 0)
    const dropped = kept.length - clean.length
    if (clean.length < 2) {
      const firstBad = kept.flatMap((p) => violations(p.text))[0]
      attempts.push({ model, ok: false, reason: kept.length === 0 ? 'no_cited_paragraphs' : `voice:${firstBad}` })
      continue
    }

    const degraded = model === ladder[0] ? null : `Written by ${model} — the first writer was busy.`
    const body: WriteResponse = { paragraphs: clean, model, degraded }
    // Never logs content. Section id and ladder position only.
    console.log(`write ok section=${request.section.id} model=${model} rung=${attempts.length} kept=${clean.length}${dropped ? ` dropped=${dropped}` : ''}`)
    return res.status(200).json(body)
  }

  console.log(`write exhausted section=${request.section.id} attempts=${attempts.map((a) => `${a.model}:${a.status ?? a.reason}`).join(',')}`)
  return res.status(503).json({
    error: 'writer_unavailable',
    degraded: 'Every writer is at capacity right now.',
    attempts: attempts.map((a) => ({ model: a.model, status: a.status ?? null, reason: a.reason ?? null })),
  })
}
