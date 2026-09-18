import LZString from 'lz-string'
import type { AnswerMap, Context } from './types'
import { buildPartnerPayload, parsePartnerPayload, payloadToAnswers, type PartnerPayload } from './couple'

/**
 * THE LINK — and there is no server anywhere in it.
 *
 * Both halves of couple mode travel in the URL **fragment**, after the `#`. That is not a
 * stylistic choice: a fragment is never sent to the server in an HTTP request. It does not appear
 * in access logs, in a CDN cache, or in a referrer header. Aaina's promise is "nothing stored by
 * us; something transmitted by us", and this feature has to keep the first half of that sentence
 * exactly as true as it was before the feature existed.
 *
 * What DOES travel is the second person's answers, through whatever channel the couple choose —
 * WhatsApp, usually. That is a real exposure and it is theirs to make, so the UI says it in those
 * words before either link is generated rather than after. What never travels, under any
 * circumstance, is the safety chapter: see `mayTravel`, and the test that pushes a disclosure at
 * it and asserts it comes out the other side missing.
 *
 * Compression is lz-string's URI-safe variant, which is why it is a dependency. Twenty likert
 * answers plus a short note comes to roughly 300–500 characters — inside every messaging app's
 * limit, and short enough that a person can see it is not a tracking link.
 */

/** The route the second person opens. */
export const ANSWER_PATH = '/answer'
/** The route the first person opens to read the merged report. */
export const TOGETHER_PATH = '/together'

/* ── the invite: first person → second person ───────────────────────────── */

export interface InvitePayload {
  v: 1
  /** Only what is needed to ask the right questions. Never an answer. */
  stage: string
  duration: string | null
  family: boolean
}

/**
 * The invite carries NO answers. Not a summary of them, not a score, not a band.
 *
 * The second person must answer for themselves without having seen any of it. That is a
 * measurement requirement before it is a privacy one — showing somebody their partner's answers
 * and then asking for theirs does not produce a second account, it produces an echo, and every
 * gap the feature exists to find would be an artefact of what they were shown.
 */
export function encodeInvite(ctx: Context): string {
  const payload: InvitePayload = {
    v: 1,
    stage: ctx.stage,
    duration: ctx.durationBucket,
    family: ctx.familyInPlay,
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeInvite(code: string): InvitePayload | null {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(code.trim())
    if (!raw) return null
    const p = JSON.parse(raw) as Record<string, unknown>
    if (p.v !== 1) return null
    return {
      v: 1,
      stage: typeof p.stage === 'string' ? p.stage : 'dating',
      duration: typeof p.duration === 'string' ? p.duration : null,
      family: p.family === true,
    }
  } catch {
    return null
  }
}

/* ── the reply: second person → first person ────────────────────────────── */

export function encodeReply(answers: AnswerMap, ctx: Context, note: string): string {
  const payload = buildPartnerPayload(answers, ctx, note)
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeReply(code: string): { payload: PartnerPayload; answers: AnswerMap } | null {
  try {
    /* Accept a whole pasted URL as readily as a bare code. People paste what they were sent, and
       refusing a link because it has a domain on the front of it is a dead end of our own making. */
    const cleaned = extractCode(code)
    if (!cleaned) return null
    const raw = LZString.decompressFromEncodedURIComponent(cleaned)
    if (!raw) return null
    const payload = parsePartnerPayload(JSON.parse(raw))
    if (!payload) return null
    return { payload, answers: payloadToAnswers(payload) }
  } catch {
    return null
  }
}

/** Pull the code out of whatever the person pasted. */
export function extractCode(input: string): string | null {
  const t = input.trim()
  if (!t) return null
  const hash = t.lastIndexOf('#')
  const candidate = hash >= 0 ? t.slice(hash + 1) : t
  // A fragment may carry a route before the payload, as in `#/together?r=CODE`.
  const q = candidate.indexOf('=')
  const tail = q >= 0 ? candidate.slice(q + 1) : candidate
  const stripped = tail.replace(/\s+/g, '')
  return stripped.length >= 12 ? stripped : null
}

/* ── full links ─────────────────────────────────────────────────────────── */

function origin(): string {
  try {
    return window.location.origin
  } catch {
    return 'https://aaina-two.vercel.app'
  }
}

export function inviteLink(ctx: Context): string {
  return `${origin()}${ANSWER_PATH}#i=${encodeInvite(ctx)}`
}

export function replyLink(answers: AnswerMap, ctx: Context, note: string): string {
  return `${origin()}${TOGETHER_PATH}#r=${encodeReply(answers, ctx, note)}`
}

/** Read whichever code is in the current URL fragment. Never throws. */
export function codeFromLocation(kind: 'i' | 'r'): string | null {
  try {
    const frag = window.location.hash.replace(/^#/, '')
    if (!frag) return null
    const direct = new URLSearchParams(frag).get(kind)
    if (direct) return direct
    return extractCode(frag)
  } catch {
    return null
  }
}
