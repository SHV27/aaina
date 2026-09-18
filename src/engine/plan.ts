import type { Finding, SectionPlan, Context, FourAxes, Scored, AnswerMap } from './types'
import { DIM_BY_ID } from './dimensions'
import { slotsFor, type Slot } from './slots'
import { familyGapLive } from './family'
import { aftermathLimits } from './aftermath'

/**
 * SECTION PLANNING — computed, never prompted.
 *
 * The skeleton is the IBCT feedback session (Christensen et al. 2004), whose self-guided web
 * adaptation produced satisfaction gains of d≈0.69 in distressed couples (Doss et al. 2016),
 * fused with SPIKES (Baile et al. 2000) for the warning shot and the reaction check.
 *
 * Two laws govern the ordering, and neither is negotiable:
 *   • **Strengths before hard news, always.** With receipts, so it is not a compliment sandwich.
 *   • **Finn's levels ascend.** Level 1 (confirms what they already believe) comes first and is
 *     capped, because L1 findings are the most transplantable — they are where genericness hides.
 *     Level 3 (genuinely discrepant) comes last, after the ground has been laid.
 *
 * Each finding **primary-anchors exactly one section**. That is the mechanism that stops a long
 * document repeating itself, which is the #1 failure mode of LLM long-form.
 */

const L1_WORD_CAP = 0.3

/** Findings a slot is eligible to anchor. */
function eligible(slot: Slot, f: Finding, axes: FourAxes): boolean {
  /* The family findings are reserved for the family section.
     They are Level-3 contradictions and configurals, so without this the "aha" slot and the DEEP
     formulation claimed them first and the section actually titled "You, them, and everyone else
     in the room" was left with whatever was spare. The filial-piety split in particular is the
     most useful sentence available to somebody caught between a family and a partner, and it
     belongs where they will look for it. */
  if (f.id.startsWith('f:fam:') && slot.wants !== 'family' && slot.wants !== 'rest') return false
  // Same for the past-tense aftermath findings: the "aha" slot took them and printed them where
  // somebody looking for "where you actually are" would never find them.
  if (f.id.startsWith('f:aft:') && slot.wants !== 'aftermath' && slot.wants !== 'rest') return false
  // And the two-account findings belong in the two-account section.
  if (f.kind === 'partnerGap' && slot.wants !== 'partner' && slot.wants !== 'rest') return false
  // The cycle finding IS the cycle section; without this the theme slot took it every time.
  if (f.id.startsWith('f:cyc:') && slot.wants !== 'cycle' && slot.wants !== 'rest') return false

  switch (slot.wants) {
    case 'none': return false
    case 'strengths': return f.finnLevel === 1 || (f.kind === 'extreme' && f.notability > 0.4)
    case 'theme': return f.finnLevel === 3 && (f.kind === 'contradiction' || f.kind === 'quote' || f.kind === 'predictionGap')
    case 'cycle': return f.id.startsWith('f:cyc:') || f.dimensions.includes('conflict') || f.dimensions.includes('responsiveness') || f.kind === 'predictionGap'
    case 'deep': return f.finnLevel >= 2 && (f.kind === 'contradiction' || f.kind === 'configural')
    case 'hold': return f.dimensions.some((d) => d === 'constraint' || d === 'alternatives' || d === 'familyApproval') || axes.shape === 'held-by-cost'
    case 'exclusion': return f.kind === 'exclusion'
    case 'exception': return f.kind === 'exception'
    case 'concern': return f.id.startsWith('f:con:')
    case 'future': return f.kind !== 'assumption' && (f.dimensions.includes('futureSelfContinuity') || f.dimensions.includes('valuesLived'))
    case 'family': return f.id.startsWith('f:fam:') || f.dimensions.includes('familyApproval')
    case 'aftermath': return f.id.startsWith('f:aft:')
    case 'partner': return f.kind === 'partnerGap'
    case 'assumption': return f.kind === 'assumption'
    case 'rest': return f.kind !== 'assumption' && !f.id.startsWith('f:con:')
  }
}

/**
 * Is the gap between what this person wants and what their family expects actually live?
 * Evidence-gated, so the section appears for the person who is living it and not for the person
 * who is not — regardless of which problem either of them arrived with.
 */
function hasFamilyGap(findings: Finding[], scored: Scored[], ctx: Context, answers: AnswerMap): boolean {
  if (!ctx.familyInPlay) return false

  /* Expectation, not approval. This used to key on the familyApproval score, which meant a man
     whose delighted parents want the couple to move into their ground floor was reported as
     having no family problem, in a situation that is nothing but a family problem. Approval and
     obligation are different things and the gate now asks about the second. */
  if (familyGapLive(answers, ctx)) return true
  if (findings.some((f) => f.accepted && f.id.startsWith('f:fam:'))) return true

  const fam = scored.find((s) => s.id === 'familyApproval' && !s.thin)
  if (fam && fam.pomp <= 45) return true
  return findings.some((f) => f.accepted && f.dimensions.includes('familyApproval'))
}

export function planSections(
  ctx: Context,
  findings: Finding[],
  axes: FourAxes,
  _scored: Scored[],
  answers: AnswerMap = {},
  hasPartner = false,
): SectionPlan[] {
  /* Which sections exist at all depends on the help they asked for, and on whether the evidence
     earns the family section. See slots.ts — this is the structural answer to "Aaina is not a
     compatibility checker". */
  const familyGap = hasFamilyGap(findings, _scored, ctx, answers)
  const slots = slotsFor(ctx.lens, ctx.help, familyGap, hasPartner)
  const pool = [...findings].filter((f) => f.accepted).sort((a, b) => b.notability - a.notability)
  const used = new Set<string>()
  const out: SectionPlan[] = []

  /* Claim order, which is not document order.
   *
   * The theme slot gets first refusal on the single most notable Level-3 finding, because the
   * "aha" must be the best thing we have and not whatever was left over.
   *
   * Then every slot that wants something SPECIFIC, in document order. Then the greedy ones last.
   * That ordering is load-bearing: `rest` matches every finding, so a `rest` slot sitting earlier
   * in the document silently eats the material a later specific slot was built for — which is
   * exactly what happened to the self lens, where "Your profile, read out" swallowed the future-self
   * finding and "The person you described" was then dropped for having no evidence. */
  const priority = (w: Slot['wants']) => (w === 'theme' ? 0 : w === 'none' ? 3 : w === 'rest' ? 2 : 1)
  const ordered = [...slots]
    .map((s, i) => ({ s, i }))
    .sort((a, b) => priority(a.s.wants) - priority(b.s.wants) || a.i - b.i)
    .map((x) => x.s)
  const assignments = new Map<string, string[]>()

  for (const slot of ordered) {
    if (slot.wants === 'none') { assignments.set(slot.id, []); continue }
    // The family section carries three: the paired distance, the filial split, and what they
    // believe disagreeing would cost. All three are one argument and splitting them loses it.
    const take = slot.wants === 'theme' ? 1 : slot.wants === 'rest' || slot.wants === 'family' || slot.wants === 'aftermath' ? 3 : slot.wants === 'partner' ? 5 : 2
    const picked = pool
      .filter((f) => !used.has(f.id) && eligible(slot, f, axes))
      .slice(0, take)
    for (const f of picked) used.add(f.id)
    assignments.set(slot.id, picked.map((f) => f.id))
  }

  // Anything still unassigned goes to the standing section rather than being silently dropped —
  // a computed finding that never reaches the page is evidence we threw away.
  const leftovers = pool.filter((f) => !used.has(f.id)).map((f) => f.id)
  if (leftovers.length) {
    assignments.set('standing', [...(assignments.get('standing') ?? []), ...leftovers])
  }

  let index = 0
  for (const slot of slots) {
    const findingIds = assignments.get(slot.id) ?? []
    if (slot.minFindings && findingIds.length < slot.minFindings && slot.wants !== 'none') {
      // Not enough evidence to carry this section honestly — drop it rather than pad it.
      continue
    }
    out.push({
      id: slot.id,
      title: slot.title,
      intent: slot.intent,
      findingIds,
      words: slot.words,
      index: index++,
      lens: ctx.lens,
    })
  }

  return out
}

/** Enforces Finn's Level-1 cap: at most 30% of the report's words may be L1 material. */
export function l1WordShare(plan: SectionPlan[], findings: Finding[]): number {
  const byId = new Map(findings.map((f) => [f.id, f]))
  const total = plan.reduce((a, s) => a + s.words, 0)
  if (total === 0) return 0
  const l1 = plan
    .filter((s) => s.findingIds.length > 0 && s.findingIds.every((id) => byId.get(id)?.finnLevel === 1))
    .reduce((a, s) => a + s.words, 0)
  return Number((l1 / total).toFixed(3))
}

export const L1_CAP = L1_WORD_CAP

/**
 * The honest limits. These RENDER — they are not a disclaimer buried at the bottom.
 * Brief §13: where reality does not cooperate, say so inside the product.
 */
export function limitsFor(ctx: Context, axes: FourAxes, scored: Scored[]): string[] {
  const out: string[] = []

  out.push(
    'This is built entirely on what you told us. No self-report assessment is fake-proof, and ' +
    'nobody can tell from answers alone whether someone was answering the way they wish they were.',
  )

  /* The aftermath owes a different honesty, and none of the limits below it are true for somebody
     whose relationship has ended — "it describes your relationship as you are living it" is not a
     sentence you write to a man who has been putting out two cups since April. */
  const aftermath = aftermathLimits(ctx)
  if (aftermath.length) {
    out.push(...aftermath)
    return out
  }

  if (ctx.voice === 'solo' && ctx.lens === 'relationship') {
    out.push(
      'This is one person\'s account. That is a real limit and we are not going to dress it up — ' +
      'though it is less of one than it sounds: across 11,196 couples, what a partner reported ' +
      'added almost nothing beyond what the person themselves reported. What this cannot do is ' +
      'describe your partner\'s inner life. It describes your relationship as you are living it.',
    )
  }

  if (axes.confidence < 0.7) {
    const thin = scored.filter((s) => s.thin).map((s) => DIM_BY_ID[s.id].label)
    out.push(
      `Some sections were left thin${thin.length ? ` — particularly ${thin.slice(0, 3).join(', ')}` : ''}. ` +
      'Those are reported but kept out of the overall number rather than guessed at.',
    )
  }

  /* The self lens gets its own limits. A person who came to understand themselves has no business
     being told what this cannot say about a relationship they did not mention — and the honest
     limits of a self-knowledge assessment are genuinely different ones. */
  if (ctx.lens === 'self') {
    out.push(
      'This describes you as you are at the moment you answered. A mood, a bad fortnight, or the ' +
      'particular thing that made you open this can all tilt an hour of questions. If you answered ' +
      'on an unusually hard day, read the numbers as that day rather than as your life.',
    )
    out.push(
      'Nothing here is a diagnosis and nothing here predicts what you will do. These are dimensions, ' +
      'not types — there is no category being assigned to you, and the point of a dimension is that ' +
      'you can be somewhere on it and then be somewhere else.',
    )
    out.push(
      'What this cannot see is your history. It can tell you a pattern runs and what it appears to be ' +
      'protecting; it cannot tell you when it started or what happened. That part is genuinely not ' +
      'available from an assessment, and anyone who tells you otherwise from eighty answers is guessing.',
    )
    return out
  }

  out.push(
    'Nothing here predicts the future. Equations that claimed to predict whether relationships ' +
    'end lost roughly half their accuracy the moment they were tested on people they had not ' +
    'been built from. Everything above is present tense on purpose.',
  )

  if (axes.shape === 'too-early' || axes.shape === 'unclear') {
    out.push(
      'Some situations genuinely exceed what any assessment can responsibly resolve, and yours ' +
      'is closer to that line than most. We would rather leave you better oriented than pretend ' +
      'to a conclusion.',
    )
  }

  return out
}
