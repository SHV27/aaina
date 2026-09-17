import type { Context, Scored, Finding, FourAxes, SelectedPractice, DimensionId } from './types'
import { DIM_BY_ID } from './dimensions'
import { selectPractices, PRACTICE_BY_ID, type Signal } from './practices'

/**
 * PRESCRIBING — turning an analysis into a staged plan.
 *
 * The difference between an article and a therapist is not the quality of the explanation. It is
 * that the therapist hands you a specific thing to do, chosen for your situation, in an order, with
 * an answer for when it goes wrong. This is where Aaina does that.
 *
 * Two rules govern everything here:
 *
 * 1. THE MODEL NEVER CHOOSES THE INTERVENTION. Practices are selected in TypeScript from a named,
 *    published library. A language model asked to suggest exercises will produce plausible ones,
 *    and plausible is exactly the failure — "schedule a weekly check-in" sounds like therapy and
 *    is not an intervention. The writer explains the chosen practice in this person's words; it has
 *    no say in what the practice is.
 *
 * 2. THE REASON IS BUILT FROM THEIR OWN DATA. Every prescription carries a `because` sentence
 *    assembled from their scores and findings, so the plan is anchored to the analysis rather than
 *    bolted onto the end of it. A plan that could be handed to anyone has failed the same test the
 *    prose has to pass.
 */

const MAX_PRACTICES = 5

/** The dimensions this person is actually worst on, worst first, oriented so low = struggling. */
function weakestDimensions(scored: Scored[]): DimensionId[] {
  return scored
    .filter((s) => !s.thin)
    .map((s) => {
      const d = DIM_BY_ID[s.id]
      return { id: s.id, oriented: d.higherIsBetter ? s.pomp : 100 - s.pomp }
    })
    .sort((a, b) => a.oriented - b.oriented)
    .map((x) => x.id)
}

export function choosePractices(
  ctx: Context,
  scored: Scored[],
  findings: Finding[],
  axes: FourAxes,
): SelectedPractice[] {
  const weakest = weakestDimensions(scored)

  const signals = new Set<Signal>()
  if (axes.safety.physical) signals.add('physicalViolence')
  if (axes.safety.coercive) signals.add('coerciveControl')
  if (axes.safety.selfRisk) signals.add('selfRisk')
  if (axes.safety.perpetration) signals.add('perpetration')
  if (ctx.stage === 'ended' || ctx.stage === 'divorced') signals.add('ended')
  /* Somebody still weighing whether to stay should not be handed work that assumes they are
     staying. Doherty's distinction, enforced rather than described. */
  if (ctx.help.includes('decide') && !ctx.help.includes('repair')) signals.add('stillDeciding')
  /* One-sided, or already separated: half the library needs two people. */
  if (ctx.stage === 'one-sided' || ctx.stage === 'separated') signals.add('partnerWillNotParticipate')
  /* In-laws named as part of how someone is being treated is different from family pressure. */
  if (axes.safety.coercive && ctx.familyInPlay) signals.add('familyIsTheSourceOfHarm')

  const chosen = selectPractices({ help: ctx.help, weakest, signals }, MAX_PRACTICES)

  const accepted = findings.filter((f) => f.accepted)

  return chosen.map(({ practice: p, substitutedFor }) => {
    // The finding this practice answers — so the plan points back at the analysis.
    const finding = accepted.find((f) => f.dimensions.some((d) => p.indicatedFor.includes(d))) ?? null

    // The dimension it targets that this person is actually worst on.
    const target = weakest.find((d) => p.indicatedFor.includes(d))
    const targetScore = target ? scored.find((s) => s.id === target) : undefined

    const because = targetScore && target
      ? `You are at ${targetScore.pomp}% on ${DIM_BY_ID[target].label.toLowerCase()}, which is ${
          weakest.indexOf(target) === 0 ? 'the lowest thing in your profile' : `among the lowest things you reported`
        }. This is the published intervention aimed at exactly that.`
      : `Chosen for what you asked for: ${p.purpose.toLowerCase()}`

    const evidenceIds = [
      ...(target ? [`ev:dim:${target}`] : []),
      ...(finding ? finding.evidence.slice(0, 2).map((e) => e.id) : []),
    ]

    return {
      practiceId: p.id,
      because: substitutedFor
        ? `${substitutedFor.why} So instead of "${substitutedFor.title}", this. ${because}`
        : because,
      findingId: finding?.id ?? null,
      evidenceIds,
    }
  })
}

/** Everything the report renderer and the prompt need about one prescribed practice. */
export function practiceDetail(sel: SelectedPractice) {
  const p = PRACTICE_BY_ID[sel.practiceId]
  if (!p) throw new Error(`Unknown practice: ${sel.practiceId}`)
  return { ...p, because: sel.because, evidenceIds: sel.evidenceIds, findingId: sel.findingId }
}
