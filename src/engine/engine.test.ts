import { describe, it, expect } from 'vitest'
import { derive, withReaction, fingerprint } from './derive'
import { itemPomp, scoreDimension, composite, scoreAll } from './score'
import { DIMENSIONS, DIM_BY_ID, deriveWeight, weightProvenance, bandOf } from './dimensions'
import { SOURCES, cite } from './sources'
import { readSafety } from './axes'
import { l1WordShare, L1_CAP } from './plan'
import { PRACTICES, PRACTICE_BY_ID } from './practices'
import { ALL_ITEMS, SAFETY_ITEMS, ITEM_BY_ID, runningOrder, totalItems } from '../items'
import { arjun, priya, aarti, meera, rohit, withSafetyDisclosure, withoutSafetyDisclosure, ans, CTX } from './fixtures'
import type { AnswerMap, AssessmentInput } from './types'

/* ══════════════════════════════════════════════════════════════════════════
   LAW 2 — direction is encoded in exactly ONE place.

   A previous build encoded direction on both the item and the dimension; the two
   cancelled and a badly-answered profile scored 82/100. A self-consistent test cannot
   catch that, so this test asserts direction from the MEANING of named items — read the
   item text, decide what a high answer should mean, assert it.
   ══════════════════════════════════════════════════════════════════════════ */
describe('LAW 2 — score direction comes from the meaning of the item', () => {
  const MEANING: { id: string; answer: 5 | 1; expect: 'good' | 'bad' }[] = [
    { id: 'sat_1', answer: 5, expect: 'good' },   // "being in this relationship feels good"
    { id: 'sat_3', answer: 5, expect: 'bad' },    // "harder than it should be"
    { id: 'amb_1', answer: 5, expect: 'bad' },    // "I think about ending it"
    { id: 'amb_3', answer: 5, expect: 'good' },   // "I am clear that I want to be in this"
    { id: 'tru_2', answer: 5, expect: 'bad' },    // "I check up on them"
    { id: 'tru_3', answer: 5, expect: 'good' },   // "they would choose me"
    { id: 'con_1', answer: 5, expect: 'good' },   // "arguments end with something settled"
    { id: 'con_2', answer: 5, expect: 'bad' },    // "same fight keeps coming back"
    { id: 'cons_3', answer: 5, expect: 'bad' },   // "ending it would make me the villain"
    { id: 'alt_1', answer: 5, expect: 'good' },   // "I would be okay eventually"
    { id: 'alt_2', answer: 5, expect: 'bad' },    // "no one else would have me"
    { id: 'gro_1', answer: 5, expect: 'good' },   // "become more of who I want to be"
    { id: 'gro_2', answer: 5, expect: 'bad' },    // "cost me things I was building"
    { id: 'anx_1', answer: 5, expect: 'bad' },    // "worry people will stop wanting me"
    { id: 'anx_4', answer: 5, expect: 'good' },   // "can be apart without tightening"
    { id: 'avo_1', answer: 5, expect: 'bad' },    // "looking for the exit"
    { id: 'avo_3', answer: 5, expect: 'good' },   // "easy to let people see me at my worst"
    { id: 'scc_1', answer: 5, expect: 'good' },   // "I know what I am like"
    { id: 'scc_2', answer: 5, expect: 'bad' },    // "who I am changes depending on who I am with"
    { id: 'cbs_2', answer: 5, expect: 'bad' },    // "I have to earn being loved"
    { id: 'cbs_4', answer: 5, expect: 'good' },   // "I am allowed to take up space"
    { id: 'sco_2', answer: 5, expect: 'bad' },    // "harder on myself than anyone else"
    { id: 'rum_3', answer: 5, expect: 'bad' },    // "cannot put it down"
    { id: 'aut_1', answer: 5, expect: 'good' },   // "genuinely my choice"
    { id: 'aut_2', answer: 5, expect: 'bad' },    // "a life someone else designed"
    { id: 'fut_1', answer: 5, expect: 'good' },   // "future me feels like me"
    { id: 'fut_2', answer: 5, expect: 'bad' },    // "think about future self like a stranger"
  ]

  for (const m of MEANING) {
    it(`"${ITEM_BY_ID[m.id]?.text}" answered ${m.answer} reads as ${m.expect}`, () => {
      const item = ITEM_BY_ID[m.id]
      expect(item, `item ${m.id} must exist`).toBeTruthy()
      const p = itemPomp(m.id, m.answer)
      // itemPomp already applies item.reverse, so it always points "up the dimension".
      // Then the dimension says whether up is good.
      const dim = DIM_BY_ID[item!.dimension!]
      const isGood = dim.higherIsBetter ? p >= 50 : p < 50
      // For a reversed item the pomp is flipped, so "up the dimension" means the construct,
      // and higherIsBetter decides whether the construct itself is desirable.
      const reads = isGood ? 'good' : 'bad'
      expect(reads, `${m.id} (pomp ${p}, dimension ${dim.id}, higherIsBetter=${dim.higherIsBetter})`).toBe(m.expect)
    })
  }

  it('no dimension carries its own inversion flag — direction lives on the item only', () => {
    // The structural guarantee: Dimension has no `invert` field. If someone adds one, this fails.
    for (const d of DIMENSIONS) {
      expect(Object.keys(d)).not.toContain('invert')
      expect(Object.keys(d)).not.toContain('reverse')
    }
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   LAW 3 — the form is the promise. Weights are derived, never typed.
   ══════════════════════════════════════════════════════════════════════════ */
describe('LAW 3 — composite weights derive from published numbers', () => {
  it('every weighted dimension has published provenance', () => {
    for (const d of DIMENSIONS) {
      if (d.compositeWeight > 0) {
        const p = weightProvenance(d.id)
        expect(p, `${d.id} carries weight ${d.compositeWeight} but has no published numbers`).toBeTruthy()
        expect(p!.joel !== undefined || p!.absD !== undefined, `${d.id} has an empty provenance record`).toBe(true)
      }
    }
  })

  it('the weight equals the derivation, recomputed independently', () => {
    for (const d of DIMENSIONS) {
      expect(d.compositeWeight).toBe(deriveWeight(d.id))
    }
  })

  it('life satisfaction outweighs conflict, as the published ranking requires', () => {
    // Joel 2020 put individual life satisfaction at 88% and conflict at 69%; Le 2010 put
    // conflict's dissolution effect at only d=.16. If this ever inverts, the derivation broke.
    expect(DIM_BY_ID.lifeSatisfaction.compositeWeight).toBeGreaterThan(DIM_BY_ID.conflict.compositeWeight)
  })

  it('constraint and alternatives carry ZERO weight — they explain the verdict, they do not score it', () => {
    expect(DIM_BY_ID.constraint.compositeWeight).toBe(0)
    expect(DIM_BY_ID.alternatives.compositeWeight).toBe(0)
  })

  it('the composite is fully decomposable — shares sum to 100%', () => {
    const p = derive(arjun())
    const c = composite(p.dimensions)
    const sum = c.contributions.reduce((a, r) => a + r.share, 0)
    expect(Math.abs(sum - 100)).toBeLessThan(0.5)
  })

  it('the composite equals the weighted mean of its own contributions', () => {
    const p = derive(priya())
    const c = composite(p.dimensions)
    const recomputed = Math.round(
      c.contributions.reduce((a, r) => a + r.oriented * r.weight, 0) /
      c.contributions.reduce((a, r) => a + r.weight, 0),
    )
    expect(c.value).toBe(recomputed)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   POMP behaves at both extremes.
   ══════════════════════════════════════════════════════════════════════════ */
describe('POMP scoring', () => {
  it('all-minimum and all-maximum answers produce 0 and 100 on a non-reversed dimension', () => {
    const lowAll: AnswerMap = {}
    const highAll: AnswerMap = {}
    for (const i of ALL_ITEMS) {
      if (i.dimension !== 'satisfaction') continue
      lowAll[i.id] = ans(i.id, i.reverse ? 5 : 1)
      highAll[i.id] = ans(i.id, i.reverse ? 1 : 5)
    }
    expect(scoreDimension('satisfaction', lowAll)!.pomp).toBe(0)
    expect(scoreDimension('satisfaction', highAll)!.pomp).toBe(100)
  })

  it('a thin dimension is reported but excluded from the composite', () => {
    const a: AnswerMap = { sat_1: ans('sat_1', 5), trust_placeholder: ans('tru_1', 4) }
    a['tru_1'] = ans('tru_1', 4)
    const scored = scoreAll(a, 'relationship')
    const sat = scored.find((s) => s.id === 'satisfaction')!
    expect(sat.thin).toBe(true)
    const c = composite(scored)
    expect(c.contributions.find((r) => r.id === 'satisfaction')).toBeUndefined()
    expect(c.excluded).toContain('satisfaction')
  })

  it('bands map monotonically', () => {
    expect(bandOf(0)).toBe('very-low')
    expect(bandOf(39)).toBe('low')
    expect(bandOf(50)).toBe('mixed')
    expect(bandOf(79)).toBe('high')
    expect(bandOf(100)).toBe('very-high')
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   Item bank integrity.
   ══════════════════════════════════════════════════════════════════════════ */
describe('item bank', () => {
  const all = [...ALL_ITEMS, ...SAFETY_ITEMS]

  it('every item id is unique', () => {
    const seen = new Set<string>()
    for (const i of all) {
      expect(seen.has(i.id), `duplicate item id: ${i.id}`).toBe(false)
      seen.add(i.id)
    }
  })

  it('every item cites at least one source, and every cited source resolves', () => {
    for (const i of all) {
      expect(i.sources.length, `${i.id} has no sources`).toBeGreaterThan(0)
      for (const s of i.sources) expect(() => cite(s), `${i.id} cites unknown source "${s}"`).not.toThrow()
    }
  })

  it('every dimension cites sources that resolve', () => {
    for (const d of DIMENSIONS) {
      expect(d.sources.length, `${d.id} has no sources`).toBeGreaterThan(0)
      for (const s of d.sources) expect(() => cite(s), `${d.id} cites unknown source "${s}"`).not.toThrow()
    }
  })

  it('no source in the registry is orphaned', () => {
    const used = new Set<string>()
    for (const i of all) i.sources.forEach((s) => used.add(s))
    for (const d of DIMENSIONS) d.sources.forEach((s) => used.add(s))
    // Sources cited only in prose constants (axes/plan/profile) are legitimate too.
    const proseOnly = new Set([
      'forer1949', 'snyder1972', 'baillargeon1984', 'finkel2012', 'montoya2008', 'joel2017',
      'heyman2001', 'wampold2015', 'finn1997', 'baile2000', 'neki1973', 'schleider2018',
      'gollwitzer2006', 'oettingen2014', 'doherty2016', 'doss2016', 'christensen2004',
      'ipip', 'campbell2003', 'cues', 'hendrick1988', 'topp2015', 'sabri2024', 'who2013',
      'stark2007', 'dazzi2014', 'cohen1999', 'funk2007', 'le2010',
      'singelis1994', 'pillemer2020', 'allendorf2013',
    ])
    const orphans = Object.keys(SOURCES).filter((k) => !used.has(k) && !proseOnly.has(k))
    expect(orphans, `orphaned sources: ${orphans.join(', ')}`).toEqual([])
  })

  it('every scored dimension has enough items to be scorable', () => {
    for (const d of DIMENSIONS) {
      const n = all.filter((i) => i.dimension === d.id).length
      expect(n, `dimension ${d.id} has only ${n} items`).toBeGreaterThanOrEqual(2)
    }
  })

  it('every item referencing a dimension references a real one', () => {
    for (const i of all) {
      if (!i.dimension) continue
      expect(DIM_BY_ID[i.dimension], `${i.id} → unknown dimension ${i.dimension}`).toBeTruthy()
    }
  })

  it('safety items are flagged and live only in the safety chapter', () => {
    for (const i of SAFETY_ITEMS) {
      expect(i.safety, `${i.id} is in SAFETY_ITEMS but not flagged safety:true`).toBe(true)
      expect(i.chapter).toBe('safety')
    }
    for (const i of ALL_ITEMS) {
      expect(i.safety, `${i.id} is flagged safety but is in the general bank`).toBeUndefined()
    }
  })

  it('the relationship assessment is long enough to be worth the claim, and short enough to finish', () => {
    const n = totalItems(CTX)
    expect(n).toBeGreaterThanOrEqual(90)
    expect(n).toBeLessThanOrEqual(190)
  })

  it('every chapter in the running order has items', () => {
    for (const c of runningOrder(CTX)) expect(c.items.length).toBeGreaterThan(0)
    for (const c of runningOrder({ ...CTX, lens: 'self' })) expect(c.items.length).toBeGreaterThan(0)
  })

  it('the Jhalak is seven items and pays out before asking for more', () => {
    const jhalak = runningOrder(CTX).find((c) => c.chapter === 'jhalak')!
    expect(jhalak.items.length).toBe(7)
    // It must span both PULL and HOLD, or it cannot find the tension that is the whole thesis.
    const dims = jhalak.items.map((i) => i.dimension)
    expect(dims).toContain('satisfaction')
    expect(dims).toContain('constraint')
    expect(dims).toContain('alternatives')
    expect(jhalak.items.some((i) => i.format === 'freetext')).toBe(true)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   The contradiction engine — the thesis. It has to actually fire.
   ══════════════════════════════════════════════════════════════════════════ */
describe('the contradiction engine', () => {
  it("finds Arjun's defining contradiction: fully committed, and thinking about ending it", () => {
    const p = derive(arjun())
    const c = p.findings.filter((f) => f.kind === 'contradiction')
    expect(c.length).toBeGreaterThanOrEqual(3)
    const joined = c.map((f) => f.statement).join(' ')
    expect(joined.toLowerCase()).toMatch(/commit|last|loyal/)
  })

  it('every finding carries at least one openable piece of evidence', () => {
    for (const persona of [arjun(), priya(), aarti(), meera(), rohit()]) {
      const p = derive(persona)
      for (const f of p.findings) {
        expect(f.evidence.length, `finding ${f.id} (${f.kind}) has no evidence`).toBeGreaterThan(0)
        for (const e of f.evidence) {
          expect(e.id).toBeTruthy()
          expect(e.detail, `evidence ${e.id} has no detail to open`).toBeTruthy()
        }
      }
    }
  })

  it('every finding cites a resolvable source', () => {
    const p = derive(arjun())
    for (const f of p.findings) {
      for (const s of f.sources) expect(() => cite(s), `finding ${f.id} cites unknown "${s}"`).not.toThrow()
    }
  })

  it('process telemetry becomes evidence — the revised answer and the long pause', () => {
    const p = derive(arjun())
    const tel = p.findings.filter((f) => f.kind === 'telemetry')
    expect(tel.length).toBeGreaterThanOrEqual(1)
    expect(tel.map((f) => f.statement).join(' ')).toMatch(/changed|seconds|skipped/i)
  })

  it('the self-distanced friend answer is found and rated highly notable', () => {
    const p = derive(arjun())
    const f = p.findings.find((x) => x.id.startsWith('f:selfdistance'))
    expect(f).toBeTruthy()
    expect(f!.notability).toBeGreaterThan(0.8)
    expect(f!.evidence.some((e) => e.detail.includes('paying interest'))).toBe(true)
  })

  it('findings are non-transplantable: no two personas share a finding statement', () => {
    const sets = [arjun(), priya(), aarti(), meera()].map((x) => derive(x).findings.map((f) => f.statement))
    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        const shared = sets[i]!.filter((s) => sets[j]!.includes(s))
        expect(shared, `personas ${i} and ${j} share findings: ${shared.slice(0, 1)}`).toEqual([])
      }
    }
  })

  it('a bland, middle-of-the-road profile produces FEWER findings than a conflicted one', () => {
    // Two-sided honesty: the engine must not manufacture drama where there is none.
    const bland = derive(aarti()).findings.length
    const sharp = derive(arjun()).findings.length
    expect(sharp).toBeGreaterThan(bland)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   LAW 6 — four orthogonal axes, and the verdict can genuinely go either way.
   ══════════════════════════════════════════════════════════════════════════ */
describe('LAW 6 — the four axes', () => {
  it('reaches "held by cost" for the acceptance scene — the founder, second year', () => {
    const p = derive(arjun())
    expect(p.axes.shape).toBe('held-by-cost')
    expect(p.axes.hold).toBeGreaterThan(p.axes.pull)
  })

  it('reaches "not between you two" when the dyad is sound and the family is the drag', () => {
    const p = derive(priya())
    expect(p.axes.shape).toBe('not-between-you')
  })

  it('can reach a positive verdict — it is not tuned toward doom', () => {
    const good = { ...priya() }
    const a: AnswerMap = { ...good.answers }
    for (const id of ['fam_1', 'fam_2', 'fam_6']) a[id] = ans(id, 5)
    for (const id of ['fam_3', 'fam_4', 'fam_5']) a[id] = ans(id, 1)
    const p = derive({ ...good, answers: a })
    expect(['working', 'strained-repairable']).toContain(p.axes.shape)
  })

  it('says "unclear" rather than bluffing when there is not enough to go on', () => {
    const thin: AnswerMap = { sat_1: ans('sat_1', 4), amb_1: ans('amb_1', 2) }
    const p = derive({ context: CTX, answers: thin, safetyAnswers: {}, skipped: [], startedAt: 0, finishedAt: 1000 })
    expect(p.axes.shape).toBe('unclear')
  })

  it('SAFETY NEVER MOVES QUALITY — the axes are orthogonal', () => {
    const base = withoutSafetyDisclosure(arjun())
    const flagged = withSafetyDisclosure(arjun())
    const a = derive(base)
    const b = derive(flagged)
    expect(b.axes.safety.flagged).toBe(true)
    expect(a.axes.safety.flagged).toBe(false)
    expect(b.axes.quality).toBe(a.axes.quality)
    expect(b.axes.pull).toBe(a.axes.pull)
    expect(b.axes.hold).toBe(a.axes.hold)
  })

  it('reads coercive control even with no physical violence — absence of a hit never downgrades it', () => {
    const s: AnswerMap = {}
    for (const id of ['saf_monitor', 'saf_isolate', 'saf_money']) s[id] = ans(id, 5)
    const read = readSafety(s)
    expect(read.physical).toBe(false)
    expect(read.coercive).toBe(true)
    expect(read.flagged).toBe(true)
  })

  it('does not flag anyone who disclosed nothing — the guard is tested in both directions', () => {
    const s: AnswerMap = {}
    for (const i of SAFETY_ITEMS) if (i.format === 'likert5') s[i.id] = ans(i.id, 1)
    const read = readSafety(s)
    expect(read.flagged).toBe(false)
    expect(read.elevated).toBe(false)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   LAW 5 — a safety flag may only ADD. This is the founder's instruction as a failing test.
   ══════════════════════════════════════════════════════════════════════════ */
describe('LAW 5 — disclosure can only ever add', () => {
  const withFlag = derive(withSafetyDisclosure(arjun()))
  const without = derive(withoutSafetyDisclosure(arjun()))

  it('does not reduce the number of report sections', () => {
    expect(withFlag.plan.length).toBeGreaterThanOrEqual(without.plan.length)
  })

  it('does not reduce the number of findings', () => {
    expect(withFlag.findings.length).toBeGreaterThanOrEqual(without.findings.length)
  })

  it('does not reduce the number of scored dimensions', () => {
    expect(withFlag.dimensions.length).toBeGreaterThanOrEqual(without.dimensions.length)
  })

  it('does not reduce total evidence available to the report', () => {
    const count = (p: typeof withFlag) => p.findings.reduce((a, f) => a + f.evidence.length, 0)
    expect(count(withFlag)).toBeGreaterThanOrEqual(count(without))
  })

  it('keeps every section that existed before the disclosure', () => {
    for (const s of without.plan) {
      expect(withFlag.plan.some((x) => x.id === s.id), `section "${s.id}" disappeared after disclosure`).toBe(true)
    }
  })

  it('adds safety evidence rather than replacing anything', () => {
    expect(withFlag.axes.safety.evidence.length).toBeGreaterThan(0)
    expect(without.axes.safety.evidence.length).toBe(0)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   Report planning — strengths first, Finn levels ascend, L1 capped.
   ══════════════════════════════════════════════════════════════════════════ */
describe('report planning', () => {
  it('puts strengths before the hard news, for every persona', () => {
    for (const persona of [arjun(), priya(), aarti(), meera(), rohit()]) {
      const p = derive(persona)
      const ids = p.plan.map((s) => s.id)
      const strengthIdx = Math.min(
        ...['working', 'ground'].map((k) => (ids.indexOf(k) === -1 ? 999 : ids.indexOf(k))),
      )
      const hardIdx = Math.min(
        ...['theme', 'pattern'].map((k) => (ids.indexOf(k) === -1 ? 999 : ids.indexOf(k))),
      )
      if (strengthIdx !== 999 && hardIdx !== 999) {
        expect(strengthIdx, `hard news before strengths for plan ${ids.join(',')}`).toBeLessThan(hardIdx)
      }
    }
  })

  it('caps Level-1 (confirmatory) material at 30% of the report', () => {
    for (const persona of [arjun(), priya(), rohit()]) {
      const p = derive(persona)
      expect(l1WordShare(p.plan, p.findings)).toBeLessThanOrEqual(L1_CAP)
    }
  })

  it('each finding primary-anchors at most one section — the anti-repetition mechanism', () => {
    const p = derive(arjun())
    const seen = new Set<string>()
    for (const s of p.plan) {
      for (const f of s.findingIds) {
        expect(seen.has(f), `finding ${f} anchors more than one section`).toBe(false)
        seen.add(f)
      }
    }
  })

  it('no computed finding is silently discarded', () => {
    const p = derive(arjun())
    const planned = new Set(p.plan.flatMap((s) => s.findingIds))
    for (const f of p.findings.filter((x) => x.accepted)) {
      expect(planned.has(f.id), `finding ${f.id} was computed and then thrown away`).toBe(true)
    }
  })

  it('the report is long — the founder asked for A to Z and that is the deliverable', () => {
    const p = derive(arjun())
    const words = p.plan.reduce((a, s) => a + s.words, 0)
    expect(words).toBeGreaterThan(8000)
  })

  it('renders honest limits rather than hiding them', () => {
    const p = derive(arjun())
    expect(p.limits.length).toBeGreaterThanOrEqual(3)
    expect(p.limits.join(' ')).toMatch(/one person's account/i)
    expect(p.limits.join(' ')).toMatch(/predict/i)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   THE INNOVATION — the report argues back. A ✗ is new evidence, not a thumbs-down.
   ══════════════════════════════════════════════════════════════════════════ */
describe('the reaction control re-derives the report', () => {
  it('rejecting a finding removes it from the plan and re-plans around it', () => {
    const p = derive(arjun())
    const anchored = p.plan.find((s) => s.findingIds.length > 0)!
    const target = anchored.findingIds[0]!
    const after = withReaction(p, target, false)
    expect(after.findings.find((f) => f.id === target)!.accepted).toBe(false)
    const stillPlanned = after.plan.flatMap((s) => s.findingIds)
    expect(stillPlanned).not.toContain(target)
  })

  it('a rejected claim cannot still be holding up a later section', () => {
    const p = derive(arjun())
    const target = p.findings[0]!.id
    const after = withReaction(p, target, false)
    for (const s of after.plan) expect(s.findingIds).not.toContain(target)
  })

  it('accepting it again restores it', () => {
    const p = derive(arjun())
    const target = p.findings[0]!.id
    const off = withReaction(p, target, false)
    const on = withReaction(off, target, true)
    expect(on.plan.flatMap((s) => s.findingIds)).toContain(target)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   Determinism — the packet is cacheable and testable.
   ══════════════════════════════════════════════════════════════════════════ */
describe('determinism', () => {
  it('the same input produces an identical packet', () => {
    expect(JSON.stringify(derive(arjun()))).toBe(JSON.stringify(derive(arjun())))
  })

  it('different people produce different fingerprints', () => {
    const f = [arjun(), priya(), aarti(), meera(), rohit()].map(fingerprint)
    expect(new Set(f).size).toBe(f.length)
  })

  it('two very similar people still produce different fingerprints and different findings', () => {
    expect(fingerprint(aarti())).not.toBe(fingerprint(meera()))
    const a = derive(aarti()).findings.map((f) => f.statement)
    const m = derive(meera()).findings.map((f) => f.statement)
    expect(a.filter((s) => m.includes(s))).toEqual([])
  })

  it('a safety disclosure changes the fingerprint without leaking its content into it', () => {
    const fp = fingerprint(withSafetyDisclosure(arjun()))
    expect(fp).not.toBe(fingerprint(withoutSafetyDisclosure(arjun())))
    expect(fp).not.toMatch(/mother|room/i)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   The self lens stands on its own.
   ══════════════════════════════════════════════════════════════════════════ */
describe('the self lens', () => {
  it('produces a full profile and a plan without any relationship data', () => {
    const p = derive(rohit())
    expect(p.dimensions.length).toBeGreaterThanOrEqual(8)
    expect(p.plan.length).toBeGreaterThanOrEqual(8)
    expect(p.findings.length).toBeGreaterThanOrEqual(3)
  })

  it('scores no relationship-only dimension', () => {
    const p = derive(rohit())
    for (const s of p.dimensions) {
      expect(DIM_BY_ID[s.id].lens).not.toBe('relationship')
    }
  })

  it('uses their own words about their future self', () => {
    const p = derive(rohit())
    expect(p.quotes.some((q) => q.detail.includes('light in the morning'))).toBe(true)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   SCOPE — Aaina is a relationship HELP system, not a compatibility checker.

   Somebody who came because they cannot talk about money since the baby should not
   be handed a stay-or-leave verdict, and somebody deciding about a rishta should not
   be handed a six-week repair plan. Giving repair work to a person who is still
   deciding fails, and so does the reverse.
   ══════════════════════════════════════════════════════════════════════════ */
describe('the report changes shape with the help that was asked for', () => {
  const shapeOf = (help: AssessmentInput['context']['help']) => {
    const base = arjun()
    return derive({ ...base, context: { ...base.context, help } }).plan.map((s) => s.id)
  }

  it('someone who came to REPAIR is not handed a stay-or-leave verdict', () => {
    const ids = shapeOf(['repair'])
    expect(ids).toContain('mechanism')
    expect(ids).toContain('plan')
    expect(ids).not.toContain('paths')
    expect(ids).not.toContain('read')
  })

  it('someone who came to DECIDE gets the paths and the named read', () => {
    const ids = shapeOf(['decide'])
    expect(ids).toContain('paths')
    expect(ids).toContain('read')
    expect(ids).toContain('holding')
  })

  it('someone carrying external pressure gets the load separated from the relationship', () => {
    const ids = shapeOf(['endure'])
    expect(ids).toContain('pressure')
    expect(ids).not.toContain('paths')
  })

  it('someone recovering is not offered a decision they have already made', () => {
    const ids = shapeOf(['recover'])
    expect(ids).toContain('aftermath')
    expect(ids).not.toContain('paths')
    expect(ids).not.toContain('holding')
  })

  it('asking for two kinds of help gets both, without duplicating a section', () => {
    const ids = shapeOf(['decide', 'repair'])
    expect(ids).toContain('paths')
    expect(ids).toContain('mechanism')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every shape still opens with strengths and closes with limits', () => {
    for (const help of [['understand'], ['decide'], ['repair'], ['endure'], ['recover']] as const) {
      const ids = shapeOf([...help])
      expect(ids[0]).toBe('opening')
      expect(ids).toContain('working')
      expect(ids[ids.length - 1]).toBe('limits')
    }
  })

  it('every shape is still a long, dense report', () => {
    for (const help of [['understand'], ['decide'], ['repair'], ['endure'], ['recover']] as const) {
      const base = arjun()
      const p = derive({ ...base, context: { ...base.context, help: [...help] } })
      const words = p.plan.reduce((a, s) => a + s.words, 0)
      expect(words, `help=${help}`).toBeGreaterThan(5000)
    }
  })
})

describe('the family collision is earned by evidence, not by category', () => {
  it('appears for the person whose family is actually the drag', () => {
    expect(derive(priya()).plan.map((s) => s.id)).toContain('family')
  })

  it('does not appear when families are not in play at all', () => {
    const base = priya()
    const p = derive({ ...base, context: { ...base.context, familyInPlay: false } })
    expect(p.plan.map((s) => s.id)).not.toContain('family')
  })

  it('appears regardless of which kind of help was asked for', () => {
    const base = priya()
    for (const help of [['repair'], ['endure'], ['understand']] as const) {
      const p = derive({ ...base, context: { ...base.context, help: [...help] } })
      expect(p.plan.map((s) => s.id), `help=${help}`).toContain('family')
    }
  })

  it('is briefed never to make the family the villain', () => {
    // The founder's own words on this: parents acting on tradition are trying to do right by
    // their child. Advice that casts them as an antagonist is both wrong and useless, because
    // the reader still has to live with them.
    const family = derive(priya()).plan.find((s) => s.id === 'family')!
    const intent = family.intent.toLowerCase()
    expect(intent).toContain('do not cast the family as an antagonist')
    expect(intent).toContain('do not suggest cutting anyone off')
    expect(intent).toContain('it is your life, not theirs')  // named as a sentence NOT to use
    expect(intent).toContain('separate being your own person from rejecting your people')
  })

  it('the shared formulation section is also briefed to blame nobody', () => {
    const why = derive(priya()).plan.find((s) => s.id === 'why')!
    expect(why.intent.toLowerCase()).toContain("without making anyone the villain, including anyone's family")
  })
})

describe('the concern chapter takes the problem in their own words', () => {
  it('asks for the story with real room, and what kind of help would help', () => {
    const ids = runningOrder(CTX).find((c) => c.chapter === 'concern')!.items.map((i) => i.id)
    expect(ids).toContain('con_story')
    expect(ids).toContain('con_help')
    expect(ids).toContain('con_tried')
  })

  it('offers no menu of problems anywhere in the bank', () => {
    // A fixed list of relationship problems would fail the first person not on it.
    const help = ITEM_BY_ID['con_help']!
    expect(help.options!.length).toBe(5)
    for (const o of help.options!) {
      expect(['understand', 'decide', 'repair', 'endure', 'recover']).toContain(o.value)
    }
  })

  it('asks about the family gap only when families are in play', () => {
    const withFamily = runningOrder(CTX).find((c) => c.chapter === 'concern')!.items.map((i) => i.id)
    const without = runningOrder({ ...CTX, familyInPlay: false }).find((c) => c.chapter === 'concern')!.items.map((i) => i.id)
    expect(withFamily).toContain('gap_self')
    expect(without).not.toContain('gap_self')
  })

  it('never scores anyone on a modern-to-traditional axis — it measures a DISTANCE', () => {
    // Independent and interdependent self-construal are separable dimensions, not two ends of one
    // line (Singelis 1994), so a "how traditional are you" score measures something that does not
    // exist. Aaina asks what the person holds AND what they believe their family holds, and takes
    // the gap — neither end of which is the wrong answer.
    expect(ITEM_BY_ID['gap_self']!.text).toMatch(/I should be the one who decides/)
    expect(ITEM_BY_ID['gap_family']!.text).toMatch(/my family believes/)
  })

  it('separates the two halves of filial piety, so loving your parents is never a symptom', () => {
    // Yeh & Bedford (2003): reciprocal filial piety tracks BETTER wellbeing, authoritarian tracks
    // worse, and they coexist in the same person. Collapsing them would make care look like a
    // problem — which is both false and the fastest way to lose an Indian reader.
    const recip = ITEM_BY_ID['fil_recip']!
    const auth = ITEM_BY_ID['fil_auth']!
    expect(recip.sources).toContain('yeh2003')
    expect(auth.sources).toContain('yeh2003')
    expect(recip.reverse).toBe(false)   // wanting to care for them is not scored as a deficit
    expect(auth.reverse).toBe(true)     // obeying against your own judgement is
    expect(recip.dimension).not.toBe(auth.dimension)
  })
})

/* ══════════════════════════════════════════════════════════════════════════
   THE PLAN — therapy does things, it does not explain things.

   "Through activities they actually do, staged, with what to do if it goes one way
   and what to do if it goes another." A named published intervention with a protocol,
   chosen deterministically, contraindication-checked — never a model inventing tips.
   ══════════════════════════════════════════════════════════════════════════ */
describe('the practice library prescribes real interventions', () => {
  it('every practice is a named tradition with sources that resolve', () => {
    for (const p of PRACTICES) {
      expect(p.tradition.length, `${p.id} has no named tradition`).toBeGreaterThan(4)
      expect(p.sources.length, `${p.id} cites nothing`).toBeGreaterThan(0)
      for (const s of p.sources) expect(() => cite(s), `${p.id} cites unknown "${s}"`).not.toThrow()
    }
  })

  it('every practice is executable: steps, a first-time warning, a failure branch, a marker', () => {
    for (const p of PRACTICES) {
      expect(p.steps.length, `${p.id} has too few steps`).toBeGreaterThanOrEqual(4)
      for (const s of p.steps) expect(s.length, `${p.id} has a vague step`).toBeGreaterThan(40)
      expect(p.firstTime.length, `${p.id} does not say what the first attempt feels like`).toBeGreaterThan(30)
      expect(p.ifItGoesBadly.length, `${p.id} has no failure branch`).toBeGreaterThan(30)
      expect(p.marker.length, `${p.id} has no observable marker`).toBeGreaterThan(20)
    }
  })

  it('markers are observable and time-boxed, not feelings', () => {
    for (const p of PRACTICES) {
      expect(p.marker.toLowerCase(), `${p.id} marker is not time-boxed`).toMatch(/week|day|immediate|next/)
    }
  })

  it('everyone gets a staged plan, ordered now → week → month', () => {
    for (const persona of [arjun(), priya(), aarti(), meera(), rohit()]) {
      const p = derive(persona)
      expect(p.practices.length, 'no practices prescribed').toBeGreaterThanOrEqual(3)
      const order = { now: 0, week: 1, month: 2 }
      const stages = p.practices.map((s) => order[PRACTICE_BY_ID[s.practiceId]!.stage])
      expect(stages).toEqual([...stages].sort((a, b) => a - b))
    }
  })

  it('every prescription says why THIS person is getting it', () => {
    const p = derive(arjun())
    for (const s of p.practices) {
      expect(s.because.length).toBeGreaterThan(40)
      expect(s.evidenceIds.length, `${s.practiceId} has no evidence behind it`).toBeGreaterThan(0)
    }
  })

  it('two different people are not handed the same plan', () => {
    const a = derive(arjun()).practices.map((p) => p.practiceId)
    const r = derive(rohit()).practices.map((p) => p.practiceId)
    expect(a.join(',')).not.toBe(r.join(','))
  })

  /* ── contraindications are absolute, and this is where a product like this does harm ── */
  it('never prescribes a communication exercise where there is violence or control', () => {
    const p = derive(withSafetyDisclosure(arjun()))
    const ids = p.practices.map((s) => s.practiceId)
    for (const banned of ['softened-start', 'cycle-naming', 'stress-conversation', 'timeout', 'self-expansion']) {
      expect(ids, `${banned} was prescribed despite a violence/control disclosure`).not.toContain(banned)
    }
  })

  it('still prescribes SOMETHING after a disclosure — LAW 5, a flag may only ever add', () => {
    const withFlag = derive(withSafetyDisclosure(arjun()))
    expect(withFlag.practices.length).toBeGreaterThan(0)
  })

  it('never hands the shared-cycle frame to someone who disclosed hurting a partner', () => {
    const base = arjun()
    const perp = { ...base, safetyAnswers: { saf_perp: ans('saf_perp', 5) } }
    const ids = derive(perp).practices.map((s) => s.practiceId)
    expect(ids).not.toContain('cycle-naming')
    expect(ids).not.toContain('appreciation')
  })

  it('does not hand repair work to someone who is still deciding', () => {
    const base = arjun()
    const deciding = derive({ ...base, context: { ...base.context, help: ['decide'] } })
    expect(deciding.practices.map((s) => s.practiceId)).not.toContain('self-expansion')
  })

  it('does not hand couple work to someone whose relationship has ended', () => {
    const base = arjun()
    const over = derive({ ...base, context: { ...base.context, stage: 'ended', help: ['recover'] } })
    const ids = over.practices.map((s) => s.practiceId)
    for (const banned of ['softened-start', 'appreciation', 'self-expansion', 'decisional-balance']) {
      expect(ids, `${banned} prescribed after the relationship ended`).not.toContain(banned)
    }
    expect(ids).toContain('grief-structure')
  })

  it('a solo user is never blocked from their whole plan by needing a partner', () => {
    const p = derive(arjun())
    const solo = p.practices.filter((s) => !PRACTICE_BY_ID[s.practiceId]!.needsPartner)
    expect(solo.length, 'every prescribed practice required the partner').toBeGreaterThan(0)
  })

  it('a contraindicated practice names why, so the caution is legible', () => {
    for (const p of PRACTICES) {
      const blocks = Object.keys(p.contraindications).length
      if (blocks > 0 && (p.contraindications.physicalViolence || p.contraindications.coerciveControl)) {
        expect(p.cautionNote, `${p.id} blocks on violence but does not say why`).toBeTruthy()
      }
    }
  })
})
