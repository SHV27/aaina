import { describe, it, expect } from 'vitest'
import { derive } from './derive'
import { arjun, aarti, ans, CTX } from './fixtures'
import {
  PARTNER_ITEM_IDS, PARTNER_NOTE_ID, mayTravel, buildPartnerPayload,
  parsePartnerPayload, payloadToAnswers, partnerItems,
} from './couple'
import { encodeReply, decodeReply, encodeInvite, decodeInvite, extractCode } from './couple-link'
import { ITEM_BY_ID } from '../items'
import type { AnswerMap, AssessmentInput } from './types'

/** A second person who answered honestly, and differently. */
function partnerAnswers(overrides: Record<string, number> = {}): AnswerMap {
  const a: AnswerMap = {}
  for (const id of PARTNER_ITEM_IDS) a[id] = ans(id, 3)
  for (const [id, v] of Object.entries(overrides)) a[id] = ans(id, v)
  return a
}

function withPartner(base: AssessmentInput, p: AnswerMap): AssessmentInput {
  return { ...base, context: { ...base.context, voice: 'couple-a' }, partnerAnswers: p }
}

describe('couple mode — the codec', () => {
  it('asks the second person a set they will actually finish', () => {
    const items = partnerItems()
    expect(items.length).toBe(PARTNER_ITEM_IDS.length)
    expect(items.length).toBeLessThanOrEqual(24)
    for (const i of items) expect(i.format, `${i.id} is not a scale`).toMatch(/likert/)
  })

  it('includes both items the first person was asked to predict', () => {
    const predicted = Object.values(ITEM_BY_ID)
      .filter((i) => i.format === 'predict' && i.predicts)
      .map((i) => i.predicts!)
    for (const id of predicted) {
      expect(PARTNER_ITEM_IDS as readonly string[], `nothing marks the guess at ${id}`).toContain(id)
    }
  })

  it('round-trips through a link', () => {
    const p = partnerAnswers({ resp_1: 2, sat_1: 4 })
    const code = encodeReply(p, CTX, 'I did not know you felt like that.')
    const back = decodeReply(code)
    expect(back).toBeTruthy()
    expect(back!.answers['resp_1']!.value).toBe(2)
    expect(back!.answers['sat_1']!.value).toBe(4)
    expect(back!.answers[PARTNER_NOTE_ID]!.value).toBe('I did not know you felt like that.')
  })

  it('stays short enough to send in a message', () => {
    const code = encodeReply(partnerAnswers(), CTX, 'x'.repeat(400))
    expect(code.length, `${code.length} characters is too long to paste`).toBeLessThan(1200)
  })

  it('accepts a whole pasted URL, not only a bare code', () => {
    const p = partnerAnswers({ amb_1: 5 })
    const code = encodeReply(p, CTX, '')
    for (const pasted of [code, `https://aaina-two.vercel.app/together#r=${code}`, `  #r=${code}  `]) {
      expect(decodeReply(pasted)?.answers['amb_1']?.value, pasted.slice(0, 40)).toBe(5)
    }
  })

  it('refuses rubbish instead of half-trusting it', () => {
    for (const bad of ['', '   ', 'hello', 'r=nonsense', 'x'.repeat(50)]) {
      expect(decodeReply(bad), bad).toBeNull()
    }
  })

  it('refuses a payload with too little in it to be a real second account', () => {
    expect(parsePartnerPayload({ v: 2, a: { sat_1: 3 }, c: {} })).toBeNull()
  })

  it('refuses a payload from a newer codec rather than guessing at it', () => {
    expect(parsePartnerPayload({ v: 99, a: { sat_1: 3, sat_3: 3, con_1: 3, tru_1: 3, app_1: 3 }, c: {} })).toBeNull()
  })

  it('drops out-of-range values rather than scoring them', () => {
    const decoded = payloadToAnswers({ v: 2, a: { sat_1: 99, sat_3: -4, con_1: 3, tru_1: 3, app_1: 3 }, c: { stage: 'dating', duration: null, family: false } })
    expect(decoded['sat_1']).toBeUndefined()
    expect(decoded['sat_3']).toBeUndefined()
    expect(decoded['con_1']!.value).toBe(3)
  })

  it('the invite carries no answers at all', () => {
    const code = encodeInvite({ ...CTX, stage: 'married' })
    const raw = JSON.stringify(decodeInvite(code))
    expect(decodeInvite(code)!.stage).toBe('married')
    for (const id of PARTNER_ITEM_IDS) expect(raw).not.toContain(id)
  })

  it('extractCode will not accept something too short to be a payload', () => {
    expect(extractCode('#r=abc')).toBeNull()
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   THE FENCE AROUND THE SAFETY CHAPTER.

   LAW 9 — every guard is tested for accepting the false AND rejecting the true.
   ══════════════════════════════════════════════════════════════════════════ */
describe('couple mode — a safety answer can never travel', () => {
  it('mayTravel rejects every safety item and accepts the ordinary ones', () => {
    const safety = Object.values(ITEM_BY_ID).filter((i) => i.chapter === 'safety' || i.id.startsWith('saf_'))
    expect(safety.length, 'no safety items found to test against').toBeGreaterThan(5)
    for (const i of safety) expect(mayTravel(i.id), `${i.id} was allowed to travel`).toBe(false)
    for (const id of PARTNER_ITEM_IDS) expect(mayTravel(id), `${id} was blocked`).toBe(true)
  })

  it('a disclosure pushed into the payload does not come out of it', () => {
    const poisoned: AnswerMap = { ...partnerAnswers() }
    for (const i of Object.values(ITEM_BY_ID)) {
      if (i.chapter === 'safety' || i.id.startsWith('saf_')) poisoned[i.id] = ans(i.id, 5)
    }
    const payload = buildPartnerPayload(poisoned, CTX, 'a note')
    const serialised = JSON.stringify(payload)
    for (const id of Object.keys(poisoned)) {
      if (id.startsWith('saf_')) expect(serialised, `${id} is in the payload`).not.toContain(id)
    }
    const decoded = decodeReply(encodeReply(poisoned, CTX, 'a note'))!
    for (const id of Object.keys(decoded.answers)) expect(id.startsWith('saf_')).toBe(false)
  })

  it('a hand-edited link claiming a safety answer is stripped on the way in', () => {
    const decoded = payloadToAnswers({
      v: 2,
      a: { saf_phys: 5, saf_monitor: 5, sat_1: 3, sat_3: 3, con_1: 3, tru_1: 3, app_1: 3 },
      c: { stage: 'dating', duration: null, family: false },
    })
    expect(decoded['saf_phys']).toBeUndefined()
    expect(decoded['saf_monitor']).toBeUndefined()
    expect(decoded['sat_1']).toBeTruthy()
  })

  it('no free text other than the one note ever travels', () => {
    const chatty: AnswerMap = { ...partnerAnswers() }
    chatty['txt_why'] = ans('txt_why', 'something private I typed in my own assessment')
    chatty['con_story'] = ans('con_story', 'the whole story of my marriage')
    const serialised = JSON.stringify(buildPartnerPayload(chatty, CTX, 'only this'))
    expect(serialised).not.toContain('something private')
    expect(serialised).not.toContain('whole story')
    expect(serialised).toContain('only this')
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   WHAT TWO ACCOUNTS PRODUCE.
   ══════════════════════════════════════════════════════════════════════════ */
describe('couple mode — the findings', () => {
  it('does nothing at all without a second account', () => {
    expect(derive(arjun()).findings.some((f) => f.kind === 'partnerGap')).toBe(false)
    expect(derive(arjun()).plan.some((s) => s.id === 'together')).toBe(false)
  })

  it('marks the prediction the first person was asked to make', () => {
    // arjun guessed his partner feels understood at "mostly true"; she says "not at all".
    const packet = derive(withPartner(arjun(), partnerAnswers({ resp_1: 1 })))
    const marked = packet.findings.filter((f) => f.kind === 'partnerGap' && f.statement.includes('guess'))
    expect(marked.length, 'the prediction was never marked').toBeGreaterThan(0)
    expect(marked[0]!.evidence.some((e) => e.id.startsWith('ev:partner:'))).toBe(true)
  })

  it('gives the section to the couple findings and nobody else', () => {
    const packet = derive(withPartner(arjun(), partnerAnswers({ resp_1: 1, sat_1: 5, con_2: 1 })))
    const together = packet.plan.find((s) => s.id === 'together')
    expect(together, 'no together section').toBeTruthy()
    for (const id of together!.findingIds) {
      expect(packet.findings.find((f) => f.id === id)!.kind).toBe('partnerGap')
    }
    // and no other section may claim one
    for (const s of packet.plan.filter((x) => x.id !== 'together' && x.id !== 'standing')) {
      for (const id of s.findingIds) {
        expect(packet.findings.find((f) => f.id === id)!.kind, `${s.id} took a partnerGap`).not.toBe('partnerGap')
      }
    }
  })

  it('says where they agree, not only where they do not', () => {
    // a partner who answers close to arjun on most things
    const packet = derive(withPartner(arjun(), partnerAnswers()))
    const agreement = packet.findings.filter(
      (f) => f.kind === 'partnerGap' && /the same answer or one next to it/.test(f.statement),
    )
    expect(agreement.length, 'agreement is never reported').toBe(1)
  })

  it('never declares either person correct', () => {
    for (const base of [arjun, aarti]) {
      const packet = derive(withPartner(base(), partnerAnswers({ resp_1: 1, sat_1: 5, amb_1: 5, con_3: 5 })))
      for (const f of packet.findings.filter((x) => x.kind === 'partnerGap')) {
        const t = f.statement.toLowerCase()
        for (const banned of [
          'you were right', 'they were right', 'you are right', 'they are right',
          'you were wrong', 'they were wrong', 'more accurate than', 'proves',
          'your partner is the problem', 'the truth is closer to',
        ]) {
          expect(t, `"${banned}" in: ${f.statement.slice(0, 90)}`).not.toContain(banned)
        }
      }
    }
  })

  it('quotes the note exactly, and does not interpret it', () => {
    const note = 'I have been trying to say this for two years and I do not know how.'
    const p = partnerAnswers()
    p[PARTNER_NOTE_ID] = ans(PARTNER_NOTE_ID, note)
    const packet = derive(withPartner(arjun(), p))
    const f = packet.findings.find((x) => x.statement.includes(note))
    expect(f, 'the note was not quoted').toBeTruthy()
    expect(f!.evidence[0]!.detail).toContain(note)
  })

  it('is honest that a second account does not make the reading more accurate', () => {
    const packet = derive(withPartner(arjun(), partnerAnswers()))
    const body = packet.findings.filter((f) => f.kind === 'partnerGap').map((f) => f.statement).join(' ')
    expect(body).toContain('does not make the reading more accurate')
  })

  it('a second account changes the fingerprint, so a cached report cannot outlive it', () => {
    const solo = derive(arjun()).fingerprint
    const one = derive(withPartner(arjun(), partnerAnswers())).fingerprint
    const two = derive(withPartner(arjun(), partnerAnswers({ sat_1: 5 }))).fingerprint
    expect(new Set([solo, one, two]).size).toBe(3)
  })

  it('every couple claim carries both people as receipts', () => {
    const packet = derive(withPartner(arjun(), partnerAnswers({ resp_1: 1, con_2: 1 })))
    for (const f of packet.findings.filter((x) => x.kind === 'partnerGap')) {
      expect(f.evidence.length, `${f.id} has no receipts`).toBeGreaterThan(0)
    }
  })
})
