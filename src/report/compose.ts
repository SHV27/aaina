import type { EvidencePacket, SectionPlan, ReportSection } from '../engine/types'
import type { WriteRequest, WriteResponse } from '../../api/_contract'
import { DIM_BY_ID } from '../engine/dimensions'
import { PRACTICE_BY_ID } from '../engine/practices'
import { SHAPE_COPY, SELF_SHAPE_COPY, selfShapeOf } from '../engine/axes'
import { short } from '../engine/sources'
import { fallbackSection, resetFallbackIds } from './fallback'

/**
 * THE CLIENT ORCHESTRATOR.
 *
 * Measured: a full report is 8,000–12,000 words across ~14 sections. Generated sequentially that
 * is minutes, which no serverless function survives and no reader tolerates as a spinner. So the
 * CLIENT fans sections out as independent function calls, in waves.
 *
 * Three things fall out of that, all of them good:
 *   · One section failing retries alone instead of killing the report.
 *   · Groq's rate-limit buckets are per-model (measured), so the ladder spreads load naturally.
 *   · The report assembles itself in front of the reader, section by section, which is a better
 *     experience than three minutes of nothing.
 */

/**
 * Concurrency and pacing, set by measurement rather than taste.
 *
 * Groq's free tier gives 8,000 tokens per minute PER MODEL, and each section costs roughly 4.5k
 * (≈3.5k in, ≈1k out). Firing three sections at rung 0 drains that bucket in one wave and every
 * later section 429s down the whole ladder — which is exactly what the first live run of the full
 * report did, in the server log, across all four models.
 *
 * MEASURED, not guessed: 4,664 charged tokens per section (≈3,064 in + 1,600 reserved out), which
 * at 8,000 TPM per model across three models is 5.15 requests per minute. A 15-section report
 * therefore cannot physically complete in less than ~175 seconds on the free tier.
 *
 * So: three concurrent sections — one per genuinely independent bucket, each STARTING on its own
 * rung — and a 35s pause between waves. That always finishes, slowly, instead of failing fast,
 * and because sections stream in the reader starts reading the first one after about six seconds.
 * Pretending otherwise just produces the 429 storm that the first live run actually produced.
 */
const WAVE = 3
const WAVE_GAP_MS = 35_000
const MAX_RETRY = 1

export interface ComposeEvents {
  onSection: (section: ReportSection) => void
  onProgress: (done: number, total: number) => void
  onDegraded: (message: string | null) => void
}

function toRequest(
  plan: SectionPlan,
  packet: EvidencePacket,
  alreadyCovered: string[],
  startRung = 0,
): WriteRequest {
  const findings = plan.findingIds
    .map((id) => packet.findings.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => !!f && f.accepted)

  const shape =
    packet.context.lens === 'relationship'
      ? SHAPE_COPY[packet.axes.shape]
      : SELF_SHAPE_COPY[selfShapeOf(packet.dimensions)]

  /* Send the dimensions this section can actually use, not all of them. The ones its findings
     touch, plus the handful that carry the most weight in the composite — a section about
     conflict has no business being handed the full table, and every token it does not need is a
     token out of a rate-limit bucket someone else's section needs. */
  const wanted = new Set(findings.flatMap((f) => f.dimensions))
  const scored = packet.dimensions.filter((d) => !d.thin)
  const headline = [...scored]
    .sort((a, b) => DIM_BY_ID[b.id].compositeWeight - DIM_BY_ID[a.id].compositeWeight)
    .slice(0, 6)
    .map((d) => d.id)
  const dimensions = scored.filter(
    (d) => wanted.has(d.id) || headline.includes(d.id) || plan.id === 'standing',
  )

  /* The plan section, and only it, is told what the engine prescribed. Every other section would
     pay ~400 tokens out of a rate-limit bucket for material it must not mention. */
  const practices =
    plan.id === 'plan'
      ? packet.practices
          .map((sp) => ({ sp, pr: PRACTICE_BY_ID[sp.practiceId] }))
          .filter((x): x is { sp: typeof x.sp; pr: NonNullable<typeof x.pr> } => !!x.pr)
          .map(({ sp, pr }) => ({
            id: pr.id,
            title: pr.title,
            purpose: pr.purpose,
            because: sp.because,
            stage: pr.stage,
            minutes: pr.minutes,
            needsPartner: pr.needsPartner,
            firstTime: pr.firstTime,
            ifItGoesBadly: pr.ifItGoesBadly,
            marker: pr.marker,
            evidenceIds: sp.evidenceIds,
          }))
      : undefined

  return {
    section: { id: plan.id, title: plan.title, intent: plan.intent, words: plan.words },
    context: {
      lens: packet.context.lens,
      voice: packet.context.voice,
      stage: packet.context.stage,
      durationBucket: packet.context.durationBucket,
      familyInPlay: packet.context.familyInPlay,
      ageBand: packet.context.ageBand,
    },
    axes: {
      quality: packet.axes.quality,
      pull: packet.axes.pull,
      hold: packet.axes.hold,
      confidence: packet.axes.confidence,
      shape: packet.axes.shape,
      shapeTitle: shape.title,
      shapeLead: shape.lead,
      safety: {
        flagged: packet.axes.safety.flagged,
        physical: packet.axes.safety.physical,
        coercive: packet.axes.safety.coercive,
        selfRisk: packet.axes.safety.selfRisk,
        perpetration: packet.axes.safety.perpetration,
        elevated: packet.axes.safety.elevated,
      },
    },
    findings: findings.map((f) => ({
      id: f.id,
      kind: f.kind,
      statement: f.statement,
      notability: f.notability,
      finnLevel: f.finnLevel,
      evidence: f.evidence.map((e) => ({
        id: e.id,
        label: e.label,
        detail: e.detail,
        ...(e.itemText ? { itemText: e.itemText } : {}),
      })),
      citations: f.sources.map(short),
    })),
    quotes: packet.quotes.slice(0, 8).map((q) => ({ id: q.id, label: q.label, detail: q.detail })),
    dimensions: dimensions.map((d) => ({ id: d.id, label: DIM_BY_ID[d.id].label, pomp: d.pomp, band: d.band, meaning: DIM_BY_ID[d.id].meaning })),
    alreadyCovered,
    ...(practices && practices.length ? { practices } : {}),
    rejected: packet.findings.filter((f) => !f.accepted).map((f) => f.statement),
    fingerprint: packet.fingerprint,
    startRung,
  }
}

/** LAW 1, enforced a second time at the client boundary. */
function validate(res: WriteResponse, req: WriteRequest): ReportSection['paragraphs'] {
  const allowed = new Set<string>([
    ...req.findings.flatMap((f) => f.evidence.map((e) => e.id)),
    ...req.quotes.map((q) => q.id),
    ...req.dimensions.map((d) => "ev:dim:" + d.id),
    ...(req.practices ?? []).flatMap((p) => p.evidenceIds),
  ])
  return res.paragraphs
    .map((p, i) => ({
      id: `p:${req.section.id}:${i}`,
      text: p.text,
      evidenceIds: p.evidenceIds.filter((id) => allowed.has(id)),
      findingId: req.findings[0]?.id ?? null,
    }))
    .filter((p) => p.evidenceIds.length > 0 && p.text.length > 40)
}

/**
 * Written sections, cached against the packet fingerprint for this tab only.
 *
 * `derive()` is deterministic, so the same answers always produce the same request — which means
 * regenerating a section the reader has already been shown is pure waste of a rate-limit bucket
 * that is the binding constraint on the whole product. A reload, a back-navigation, or a reaction
 * that only rebuilds two sections all get the rest for free.
 *
 * sessionStorage, not localStorage: this is the report, and the report is not something we keep.
 * Closing the tab disposes of it, exactly like every other derived artefact here.
 */
function cacheKey(fingerprint: string, sectionId: string) {
  return `aaina:sec:${fingerprint}:${sectionId}`
}

function readCache(fingerprint: string, plan: SectionPlan): ReportSection | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(fingerprint, plan.id))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ReportSection
    return parsed.paragraphs?.length ? parsed : null
  } catch {
    return null
  }
}

function writeCache(fingerprint: string, section: ReportSection) {
  try {
    if (section.status !== 'written') return
    sessionStorage.setItem(cacheKey(fingerprint, section.id), JSON.stringify(section))
  } catch { /* storage full or blocked; the cache is an optimisation, never a requirement */ }
}

async function writeOne(
  plan: SectionPlan,
  packet: EvidencePacket,
  covered: string[],
  signal: AbortSignal,
  startRung: number,
): Promise<ReportSection> {
  const cached = readCache(packet.fingerprint, plan)
  if (cached) return cached

  const req = toRequest(plan, packet, covered, startRung)

  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const r = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal,
      })
      if (!r.ok) {
        if (attempt < MAX_RETRY && (r.status === 429 || r.status >= 500)) {
          await sleep(1200 * (attempt + 1))
          continue
        }
        break
      }
      const body = (await r.json()) as WriteResponse
      const paragraphs = validate(body, req)
      if (paragraphs.length === 0) {
        if (attempt < MAX_RETRY) continue
        break
      }
      const section: ReportSection = {
        id: plan.id,
        title: plan.title,
        status: 'written',
        paragraphs,
        writtenBy: body.model,
        ...(body.degraded ? { fallbackReason: body.degraded } : {}),
      }
      writeCache(packet.fingerprint, section)
      return section
    } catch {
      if (signal.aborted) break
      if (attempt < MAX_RETRY) { await sleep(900); continue }
    }
  }

  // LAW 7 — the fallback declares itself. It is never silent.
  return fallbackSection(plan, packet)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function composeReport(
  packet: EvidencePacket,
  events: ComposeEvents,
  signal: AbortSignal,
): Promise<ReportSection[]> {
  resetFallbackIds()
  const plans = packet.plan
  const out: ReportSection[] = []
  const covered: string[] = []
  let done = 0
  let anyDegraded: string | null = null
  const fromCache = new Set(
    plans.filter((p) => readCache(packet.fingerprint, p)).map((p) => p.id),
  )

  for (let i = 0; i < plans.length; i += WAVE) {
    if (signal.aborted) break
    const wave = plans.slice(i, i + WAVE)
    // each section in a wave starts on its own rung, so the four token buckets drain evenly
    const results = await Promise.all(
      wave.map((p, k) => writeOne(p, packet, [...covered], signal, (i + k) % WAVE)),
    )
    for (const section of results) {
      out.push(section)
      covered.push(section.title)
      done += 1
      events.onSection(section)
      events.onProgress(done, plans.length)
      if (section.status === 'deterministic' && !anyDegraded) {
        anyDegraded = 'Aaina\'s writer is at capacity right now. The sections below are written directly from your own answers — every number, every contradiction and the verdict are yours and unchanged. Only the connective prose is missing.'
        events.onDegraded(anyDegraded)
      }
    }
    /* Only pace if this wave actually spent tokens. A fully cached wave costs nothing, so making
       the reader wait 35s for it would be theatre. */
    const spent = results.some((r) => r.status === 'written' && !fromCache.has(r.id))
    if (spent && i + WAVE < plans.length && !signal.aborted) await sleep(WAVE_GAP_MS)
  }

  return out
}

/** Used by the eval harness and by tests: compose with a caller-supplied transport. */
export async function composeWith(
  packet: EvidencePacket,
  send: (req: WriteRequest) => Promise<WriteResponse | null>,
): Promise<ReportSection[]> {
  resetFallbackIds()
  const out: ReportSection[] = []
  const covered: string[] = []
  for (const plan of packet.plan) {
    const req = toRequest(plan, packet, [...covered])
    let section: ReportSection
    try {
      const res = await send(req)
      const paragraphs = res ? validate(res, req) : []
      section = paragraphs.length
        ? { id: plan.id, title: plan.title, status: 'written', paragraphs, writtenBy: res!.model }
        : fallbackSection(plan, packet)
    } catch {
      section = fallbackSection(plan, packet)
    }
    out.push(section)
    covered.push(section.title)
  }
  return out
}

export { toRequest }
