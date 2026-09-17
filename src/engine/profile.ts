import type { AnswerMap, Finding, Scored, DimensionId, Context } from './types'
import { DIM_BY_ID } from './dimensions'
import { profileShape } from './score'
import { dimensionEvidence, itemEvidence, renderAnswer } from './contradictions'
import { ITEM_BY_ID } from '../items'
import { itemPomp } from './score'

/** An item's POMP, or null when it was skipped. */
function itemPompSafe(id: string, answers: AnswerMap): number | null {
  const a = answers[id]
  if (!a || typeof a.value !== 'number') return null
  return itemPomp(id, a.value)
}

/** The single most extreme answer at each end of the profile, quoted with what they chose. */
function endpoints(hi: Scored, lo: Scored, answers: AnswerMap): string {
  const pick = (s: Scored, wantHigh: boolean) => {
    const rows = s.itemIds
      .map((id) => ({ id, p: itemPompSafe(id, answers) }))
      .filter((r): r is { id: string; p: number } => r.p !== null)
      .sort((a, b) => (wantHigh ? b.p - a.p : a.p - b.p))
    const top = rows[0]
    if (!top) return null
    const item = ITEM_BY_ID[top.id]
    if (!item) return null
    return `"${item.text}" — ${renderAnswer(item, answers[top.id]!.value).replace('You chose: ', '').toLowerCase()}`
  }
  const a = pick(hi, true)
  const b = pick(lo, false)
  if (!a || !b) return ''
  return ` At the top of that range: ${a}. At the bottom: ${b}.`
}

/**
 * Profile-shaped findings: what stands out, what is absent, and what is unusual in combination.
 *
 * All of it is IPSATIVE — measured against the person's own profile, never against a norm. We
 * have no Indian normative sample for these constructs and we are not going to invent one, so
 * "your largest gap anywhere in this profile" is both the most honest claim available and,
 * conveniently, untransplantable: it is a fact about the shape of one person's answers.
 */

let seq = 0
const fid = (k: string) => `f:${k}:${(seq += 1)}`
export function resetProfileIds() { seq = 0 }

/* ────────────────────────────  standouts and the largest gap  ──────────────────────────── */

export function profileFindings(scored: Scored[], answers: AnswerMap): Finding[] {
  const out: Finding[] = []
  const shape = profileShape(scored)
  if (!shape.highest || !shape.lowest) return out

  const hi = shape.highest
  const lo = shape.lowest
  const dHi = DIM_BY_ID[hi.id]
  const dLo = DIM_BY_ID[lo.id]

  /* the largest gap anywhere in the profile — rare by construction */
  const hiOriented = dHi.higherIsBetter ? hi.pomp : 100 - hi.pomp
  const loOriented = dLo.higherIsBetter ? lo.pomp : 100 - lo.pomp
  if (hiOriented - loOriented >= 35) {
    out.push({
      id: fid('gap'),
      kind: 'gap',
      /* The two ends are named by the ACTUAL ANSWERS at each end, not only by the dimension
         labels and percentages. Two different people can coincide on two scores — two fixtures
         here do — and then this paragraph was 86% identical between them, which the gate caught.
         The answers that produced the scores cannot coincide the same way. */
      statement: `The furthest apart any two things are in your whole profile is ${dHi.label.toLowerCase()} at ${hi.pomp}% and ${dLo.label.toLowerCase()} at ${lo.pomp}% — ${Math.round(hiOriented - loOriented)} points between them, against an average spread of ${shape.spread} across everything else you answered.${endpoints(hi, lo, answers)} These are not a strength and a weakness sitting near each other; they are the two ends of your entire profile. Whatever is going on with you, it is happening in that distance.`,
      notability: Math.min(1, (hiOriented - loOriented) / 70),
      baseRate: 0.1,
      finnLevel: 2,
      evidence: [dimensionEvidence(hi), dimensionEvidence(lo)],
      sources: [...dHi.sources, ...dLo.sources],
      dimensions: [hi.id, lo.id],
      accepted: true,
    })
  }

  /* Strengths — Level 1, delivered first, with receipts so they are not compliments.
     The statement names the ITEM that drove it and the answer they gave, and states the distance
     above their own average. Without that it read "Trust is one of the strongest things in your
     profile — 81%" and was byte-identical for any two people who happened to score 81 on trust —
     which the anti-generic gate caught at 100% overlap between two unrelated personas. A strength
     with no receipt attached is a compliment, and a compliment is Barnum with better manners. */
  const ranked = [...scored]
    .filter((s) => !s.thin)
    .sort((a, b) => {
      const av = DIM_BY_ID[a.id].higherIsBetter ? a.pomp : 100 - a.pomp
      const bv = DIM_BY_ID[b.id].higherIsBetter ? b.pomp : 100 - b.pomp
      return bv - av
    })
  const ORDINAL = ['strongest', 'second strongest', 'third strongest', 'fourth strongest']

  for (const s of scored) {
    const d = DIM_BY_ID[s.id]
    const oriented = d.higherIsBetter ? s.pomp : 100 - s.pomp
    if (oriented < 72 || s.thin) continue
    const z = shape.standouts.find((x) => x.id === s.id)?.z ?? 0
    if (z < 0.6) continue
    const rank = ranked.findIndex((r) => r.id === s.id)
    const ordinal = ORDINAL[rank] ?? 'among the strongest'

    const drivers = s.itemIds
      .map((i) => ({ id: i, p: itemPompSafe(i, answers) }))
      .filter((x) => x.p !== null)
      .sort((a, b) => (b.p ?? 0) - (a.p ?? 0))
    const top = drivers[0]
    const topItem = top ? ITEM_BY_ID[top.id] : undefined
    const topAnswer = top ? renderAnswer(ITEM_BY_ID[top.id]!, answers[top.id]!.value).replace('You chose: ', '') : ''
    const above = Math.round(oriented - shape.mean)

    const ev = [
      dimensionEvidence(s),
      ...s.itemIds.slice(0, 2).map((i) => itemEvidence(i, answers)),
    ].filter(Boolean)

    out.push({
      id: fid('strength'),
      kind: 'extreme',
      statement: topItem
        ? `${d.label} is the ${ordinal} thing in your whole profile — ${s.pomp}%, ${above} points above your own average across the other ${ranked.length - 1} dimensions. The single answer carrying it: to "${topItem.text}" you said ${topAnswer.toLowerCase()}. ${d.meaning}`
        : `${d.label} is the ${ordinal} thing in your whole profile — ${s.pomp}%, ${above} points above your own average across the other ${ranked.length - 1} dimensions. ${d.meaning}`,
      notability: Math.min(0.75, oriented / 100),
      baseRate: 0.45,
      finnLevel: 1,
      evidence: ev as Finding['evidence'],
      sources: d.sources,
      dimensions: [s.id],
      accepted: true,
    })
    if (out.filter((f) => f.kind === 'extreme').length >= 3) break
  }

  return out
}

/* ────────────────────────────  exclusion claims  ──────────────────────────── */

/**
 * "What you are NOT."
 *
 * Exclusion claims are costly and falsifiable, which is exactly why they read as real
 * discrimination rather than flattery — a Barnum statement never rules anything out, because
 * ruling something out is how you get caught being wrong.
 *
 * Each rule names the COMMON EXPLANATION it is eliminating, not a statistic we do not have.
 */
const EXCLUSIONS: {
  id: string
  when: (get: (d: DimensionId) => Scored | undefined, ctx: Context) => boolean
  write: (get: (d: DimensionId) => Scored | undefined) => string
  dims: DimensionId[]
  sources: string[]
}[] = [
  {
    id: 'not-anxious-attachment',
    when: (g) => (g('attachAnxiety')?.pomp ?? 100) <= 30 && !g('attachAnxiety')?.thin,
    write: (g) => `The usual explanation for what you are describing is fear of being left — and your answers rule it out. You scored ${g('attachAnxiety')!.pomp}% on it, which is low. Whatever is keeping you awake, it is not abandonment anxiety, and any advice built on that assumption will miss you entirely.`,
    dims: ['attachAnxiety'],
    sources: ['wei2007', 'joel2020'],
  },
  {
    id: 'not-avoidant',
    when: (g) => (g('attachAvoidance')?.pomp ?? 100) <= 30 && !g('attachAvoidance')?.thin,
    write: (g) => `You are not someone who pulls away when things get close — ${g('attachAvoidance')!.pomp}% on distance-under-closeness, which is genuinely low. The "you have commitment issues" reading does not apply to you, and it is worth knowing so you can stop testing yourself against it.`,
    dims: ['attachAvoidance'],
    sources: ['wei2007'],
  },
  {
    id: 'not-communication',
    when: (g) => (g('conflict')?.pomp ?? 100) <= 32 && (g('satisfaction')?.pomp ?? 100) <= 45 && !g('conflict')?.thin,
    write: (g) => `The default diagnosis for an unhappy relationship is "you need to communicate better". Your answers say that is not your problem: conflict scored ${g('conflict')!.pomp}%, meaning fights are not where this is going wrong. Something is wrong while the communication is working, which is a different and more serious finding.`,
    dims: ['conflict', 'satisfaction'],
    sources: ['christensen1990', 'joel2020'],
  },
  {
    id: 'not-trust-broken',
    when: (g) => (g('trust')?.pomp ?? 0) >= 70 && (g('satisfaction')?.pomp ?? 100) <= 45 && !g('trust')?.thin,
    write: (g) => `Trust is not the issue here — ${g('trust')!.pomp}%, which is high. That eliminates the single most common story people tell about a relationship that has stopped feeling good. You are not dealing with betrayal. You are dealing with something that has kept its honesty and lost something else.`,
    dims: ['trust', 'satisfaction'],
    sources: ['rempel1985'],
  },
  {
    id: 'not-not-loved',
    when: (g) => (g('partnerCommitment')?.pomp ?? 0) >= 68 && (g('ambivalence')?.pomp ?? 0) >= 55,
    write: (g) => `You are in two minds about this, and it is not because they are not committed — you put their commitment at ${g('partnerCommitment')!.pomp}%. So the doubt you are carrying is not "do they want me". Whatever it is, it is not that, and that narrows it considerably.`,
    dims: ['partnerCommitment', 'ambivalence'],
    sources: ['joel2020', 'joel2018'],
  },
  {
    id: 'not-depressed-generally',
    when: (g) => (g('lifeSatisfaction')?.pomp ?? 0) >= 62 && (g('satisfaction')?.pomp ?? 100) <= 42,
    write: (g) => `Life overall is going reasonably for you — ${g('lifeSatisfaction')!.pomp}%. That matters, because it eliminates the reading where a low mood is colouring everything. It is not that things look bad to you in general. It is this, specifically.`,
    dims: ['lifeSatisfaction', 'satisfaction'],
    sources: ['diener1985', 'joel2020'],
  },
  {
    id: 'not-self-critical',
    when: (g) => (g('selfCompassion')?.pomp ?? 0) >= 68 && (g('rumination')?.pomp ?? 0) >= 60,
    write: (g) => `You overthink, but you are not cruel to yourself about it — self-compassion at ${g('selfCompassion')!.pomp}%. That combination is less common than either on its own, and it means the standard "be kinder to yourself" advice has nothing to offer you. You are already doing that. The overthinking is doing a different job.`,
    dims: ['selfCompassion', 'rumination'],
    sources: ['neff2003', 'treynor2003'],
  },
  {
    id: 'not-family-problem',
    when: (g, ctx) => ctx.familyInPlay && (g('familyApproval')?.pomp ?? 0) >= 65 && (g('satisfaction')?.pomp ?? 100) <= 45,
    write: (g) => `Your families are not the problem — approval scored ${g('familyApproval')!.pomp}%. In a country where most relationship difficulty routes through family somewhere, you have the version where it does not. That removes the explanation most people around you will reach for first.`,
    dims: ['familyApproval', 'satisfaction'],
    sources: ['sprecher1992'],
  },
]

export function exclusionFindings(scored: Scored[], ctx: Context): Finding[] {
  const by = new Map(scored.map((s) => [s.id, s]))
  const get = (d: DimensionId) => by.get(d)
  const out: Finding[] = []

  for (const rule of EXCLUSIONS) {
    if (rule.dims.some((d) => !by.has(d) || by.get(d)!.thin)) continue
    if (!rule.when(get, ctx)) continue
    out.push({
      id: fid('excl'),
      kind: 'exclusion',
      statement: rule.write(get),
      notability: 0.7,
      baseRate: 0.15,
      finnLevel: 2,
      evidence: rule.dims.map((d) => dimensionEvidence(by.get(d)!)),
      sources: rule.sources,
      dimensions: rule.dims,
      accepted: true,
    })
  }
  return out
}

/* ────────────────────────────  configural rarity  ──────────────────────────── */

/**
 * Uncommon COMBINATIONS. Two dimensions that rarely sit at these values together.
 * We never multiply rarities — that is the arithmetic behind "you are 1 in 8,000", and it is a
 * lie, because the dimensions are correlated. We report the pair, and only the pair.
 */
const CONFIGURAL: { a: DimensionId; b: DimensionId; aHigh: boolean; bHigh: boolean; write: (av: number, bv: number) => string; sources: string[] }[] = [
  {
    a: 'ownDedication', b: 'alternatives', aHigh: true, bHigh: true,
    write: (av, bv) => `You are ${av}% committed to this AND you believe you would be alright without it (${bv}%). Those two usually trade off — most people who are sure they would survive leaving are already half gone, and most people who are fully in cannot picture the alternative. You are holding both. It means you are choosing this rather than needing it, and that is a genuinely different position from the one most people in your situation are in.`,
    sources: ['rusbult1998', 'rusbult1995'],
  },
  {
    a: 'attachAnxiety', b: 'attachAvoidance', aHigh: true, bHigh: true,
    write: (av, bv) => `Fear of being left is at ${av}% and pulling back when things get close is at ${bv}%. Both high at once is the harder configuration — you want closeness and flinch from it in the same moment, which means the thing you do to feel safer is the thing that makes you feel less safe.`,
    sources: ['wei2007'],
  },
  {
    a: 'selfConceptClarity', b: 'rumination', aHigh: false, bHigh: true,
    write: (av, bv) => `You see yourself unclearly (${av}%) and you think about it constantly (${bv}%). That pairing is worth naming, because it is the one where more thinking reliably produces less clarity. The volume of thought is not the solution to the lack of clarity; the research suggests it is part of what sustains it.`,
    sources: ['campbell1996', 'treynor2003'],
  },
  {
    a: 'constraint', b: 'satisfaction', aHigh: true, bHigh: false,
    write: (av, bv) => `What would make leaving hard is at ${av}%. How good this currently feels is at ${bv}%. When those two are this far apart, the thing keeping someone in place has stopped being the relationship and started being the exit cost.`,
    sources: ['rusbult1995', 'rusbult1998'],
  },
]

const CFG_HIGH = 65
const CFG_LOW = 38

export function configuralFindings(scored: Scored[]): Finding[] {
  const by = new Map(scored.map((s) => [s.id, s]))
  const out: Finding[] = []
  for (const c of CONFIGURAL) {
    const A = by.get(c.a)
    const B = by.get(c.b)
    if (!A || !B || A.thin || B.thin) continue
    const aOk = c.aHigh ? A.pomp >= CFG_HIGH : A.pomp <= CFG_LOW
    const bOk = c.bHigh ? B.pomp >= CFG_HIGH : B.pomp <= CFG_LOW
    if (!aOk || !bOk) continue
    out.push({
      id: fid('cfg'),
      kind: 'configural',
      statement: c.write(A.pomp, B.pomp),
      notability: 0.8,
      baseRate: 0.09,
      finnLevel: 3,
      evidence: [dimensionEvidence(A), dimensionEvidence(B)],
      sources: c.sources,
      dimensions: [c.a, c.b],
      accepted: true,
    })
  }
  return out
}
