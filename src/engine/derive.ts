import type { AssessmentInput, EvidencePacket, Evidence, Finding } from './types'
import { scoreAll, composite } from './score'
import { findContradictions, resetFindingIds } from './contradictions'
import { profileFindings, exclusionFindings, configuralFindings, resetProfileIds } from './profile'
import { computeAxes } from './axes'
import { planSections, limitsFor } from './plan'
import { ITEM_BY_ID } from '../items'
import { choosePractices } from './prescribe'
import { selfWorkFindings, resetSelfWorkIds, assumptionTest } from './selfwork'
import { concernFindings, resetConcernIds } from './concern'
import { familyFindings, resetFamilyIds } from './family'

export const PACKET_VERSION = '3.0.0'

/**
 * THE STATE AUTHORITY.
 *
 * Exactly one function derives everything Aaina knows about a person. No component re-derives.
 * No prompt receives raw answers. The second copy of a scoring rule is a fork of its future bugs,
 * so there is exactly one copy and `derive.test.ts` asserts the UI imports nothing else.
 *
 * Deterministic: the same input produces a byte-identical packet, which is what makes the prose
 * cacheable and the whole thing testable.
 */
export function derive(input: AssessmentInput): EvidencePacket {
  resetFindingIds()
  resetProfileIds()
  resetSelfWorkIds()
  resetConcernIds()
  resetFamilyIds()

  const { context, answers, safetyAnswers, skipped } = input

  const dimensions = scoreAll(answers, context.lens)
  const axes = computeAxes(context, dimensions, safetyAnswers)

  const findings: Finding[] = [
    /* What they actually walked in with, in their own words. First, because a report that has
       not shown it read the problem has not earned anything it says afterwards. */
    ...concernFindings(answers, context),
    /* The collision between what they want and what their family expects: the paired distance,
       the two halves of filial piety kept apart, and what they believe disagreeing would cost.
       See family.ts — and the rule that no side is ever taken against anybody's family. */
    ...familyFindings(answers, context),
    ...findContradictions(answers, dimensions, skipped, context),
    ...configuralFindings(dimensions),
    ...exclusionFindings(dimensions, context),
    ...profileFindings(dimensions, answers),
    /* The self lens has work the contradiction engine does not do: the competing commitment, the
       Big Assumption and its test, the place the pattern did not hold, and the measured distance
       to the person they described. See selfwork.ts — and LAW 2, which is why it is computed here
       rather than asked for in a prompt. */
    ...(context.lens === 'self' ? selfWorkFindings(dimensions, answers) : []),
  ].sort((a, b) => b.notability - a.notability)

  const quotes = collectQuotes(input)
  const plan = planSections(context, findings, axes, dimensions, answers)
  const limits = limitsFor(context, axes, dimensions)
  const practices = choosePractices(context, dimensions, findings, axes, answers)
  const assumption = context.lens === 'self' ? assumptionTest(answers) : null

  return {
    version: PACKET_VERSION,
    context,
    dimensions,
    findings,
    axes,
    plan,
    quotes,
    limits,
    practices,
    ...(assumption ? { assumption: { assumption: assumption.assumption, test: assumption.test } } : {}),
    fingerprint: fingerprint(input),
  }
}

/**
 * Verbatim things the person wrote. LAW: no report Aaina produces may be without the user's own
 * words in it — identical generic feedback is rated MORE accurate when merely labelled "written
 * for you" (Snyder & Larson 1972), so the label is the manipulation. Their words are the defence.
 */
function collectQuotes(input: AssessmentInput): Evidence[] {
  const out: Evidence[] = []
  for (const [id, a] of Object.entries(input.answers)) {
    if (typeof a.value !== 'string') continue
    const text = a.value.trim()
    if (text.length < 8) continue
    const i = ITEM_BY_ID[id]
    if (!i) continue
    out.push({
      id: `ev:quote:${id}`,
      kind: 'quote',
      label: i.text,
      detail: `"${text}"`,
      itemText: i.text,
      sources: i.sources,
    })
  }
  return out
}

/** Stable, order-independent hash of everything that can change the output. */
export function fingerprint(input: AssessmentInput): string {
  const parts: string[] = [
    PACKET_VERSION,
    input.context.lens,
    input.context.voice,
    input.context.stage,
    String(input.context.durationBucket),
    String(input.context.familyInPlay),
    String(input.context.ageBand),
  ]
  for (const id of Object.keys(input.answers).sort()) {
    const a = input.answers[id]!
    parts.push(`${id}=${a.value}`)
  }
  for (const id of [...input.skipped].sort()) parts.push(`skip:${id}`)
  // Safety answers change the report, so they change the fingerprint — but only via a coarse
  // digest, never their content, because a fingerprint can end up in a cache key.
  const safetyCount = Object.keys(input.safetyAnswers).length
  parts.push(`saf:${safetyCount}`)

  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  const s = parts.join('|')
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i)
    h1 = Math.imul(h1, 0x01000193) >>> 0
    h2 = (Math.imul(h2 ^ s.charCodeAt(i), 0x85ebca6b) + i) >>> 0
  }
  return (h1.toString(36) + h2.toString(36)).slice(0, 16)
}

/** Everything the UI needs to show the composite as a decomposed chart (LAW 3). */
export function compositeOf(packet: EvidencePacket) {
  return composite(packet.dimensions)
}

/**
 * Applying a user's ✗ to a finding. THE INNOVATION: a rejected claim is not a thumbs-down that
 * files a ticket — it is new evidence. The finding stops being accepted, the plan is recomputed,
 * and anything that was leaning on it is rebuilt. A claim the reader has rejected must not still
 * be holding up a verdict three sections later.
 */
export function withReaction(packet: EvidencePacket, findingId: string, accepted: boolean): EvidencePacket {
  const findings = packet.findings.map((f) => (f.id === findingId ? { ...f, accepted } : f))
  const plan = planSections(packet.context, findings, packet.axes, packet.dimensions)
  return { ...packet, findings, plan }
}
