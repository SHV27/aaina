import type { Context, Scored, Finding, FourAxes, SelectedPractice, DimensionId, AnswerMap } from './types'
import { DIM_BY_ID } from './dimensions'
import { selectPractices, PRACTICE_BY_ID, type Signal } from './practices'
import { alreadyTried } from './concern'

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
  answers: AnswerMap = {},
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

  /* Two practices that name the same weak dimension produce the same sentence, and a plan whose
     steps all say "you are at 15% on how clearly you see yourself" is a list wearing a sequence's
     clothes. Each practice claims the worst dimension it treats that nothing earlier has claimed. */
  const claimed = new Set<DimensionId>()

  /* They told us what they already tried. Handing it back as a suggestion is the fastest way to
     prove nobody read it, so where a chosen practice is a version of something they attempted,
     the reason LEADS with that and says what is different about this version. */
  const tried = alreadyTried(answers)
  /* Said once. Repeating "you said you already tried a version of this" under three separate
     steps stops sounding like listening and starts sounding like a mail merge. */
  let acknowledgedOnce = false

  return chosen.map(({ practice: p, substitutedFor }) => {
    // The finding this practice answers — so the plan points back at the analysis.
    const finding = accepted.find((f) => f.dimensions.some((d) => p.indicatedFor.includes(d))) ?? null

    // The dimension it targets that this person is actually worst on, and that is still unclaimed.
    const fresh = weakest.find((d) => p.indicatedFor.includes(d) && !claimed.has(d))
    const target = fresh ?? weakest.find((d) => p.indicatedFor.includes(d))
    if (target) claimed.add(target)
    const targetScore = target ? scored.find((s) => s.id === target) : undefined

    /* Say the number in the direction it actually runs.
     *
     * POMP always points along the CONSTRUCT, not toward the good end — 85% on Overthinking is the
     * worst score in the profile, and the old sentence read "you are at 85% on overthinking, which
     * is among the lowest things you reported", which is the opposite of true and is the kind of
     * error that costs a reader their trust in every other number on the page. */
    const dim = target ? DIM_BY_ID[target] : undefined
    const rank = target ? weakest.indexOf(target) : -1
    const place = rank === 0 ? 'the hardest thing in your whole profile' : 'among the hardest things you reported'
    const direction = dim && !dim.higherIsBetter ? ', and on that scale a high number is the costly direction' : ''

    const because = targetScore && dim
      ? (fresh
          ? `You are at ${targetScore.pomp}% on ${dim.label.toLowerCase()}${direction} — ${place}. This is the published intervention aimed at exactly that.`
          : `This one works on the same ${targetScore.pomp}% — ${dim.label.toLowerCase()} — from a different angle: the step above changes what you notice, and this one changes what you do about it.`)
      : `Chosen for what you asked for: ${p.purpose.toLowerCase()}`

    const evidenceIds = [
      ...(target ? [`ev:dim:${target}`] : []),
      ...(finding ? finding.evidence.slice(0, 2).map((e) => e.id) : []),
    ]

    const priorAttempt = acknowledgedOnce ? undefined : tried.get(p.id)
    if (priorAttempt) acknowledgedOnce = true
    const acknowledged = priorAttempt
      ? `You said you have already tried a version of this and that it did not get you anywhere, so it matters that ${priorAttempt}. ${because}`
      : because

    return {
      practiceId: p.id,
      because: substitutedFor
        ? `${substitutedFor.why} So instead of "${substitutedFor.title}", this. ${acknowledged}`
        : acknowledged,
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
