import type { AnswerMap, Finding, Evidence, Scored, Context, DimensionId } from './types'
import { DIM_BY_ID } from './dimensions'
import { dimensionEvidence } from './contradictions'

/**
 * AFTER IT ENDED.
 *
 * Somebody whose partner left in April was being handed a report that said "you are 75% committed
 * to this lasting and 35% satisfied with how it currently feels", in the present tense, about a
 * relationship that no longer exists. Every detector in the engine writes in the present tense,
 * because every detector was built for a live relationship, and nothing checked.
 *
 * Two things follow from that, and both are done here.
 *
 * First, present-tense relationship claims are SUPPRESSED when the stage is past. Not softened —
 * suppressed. There is no wording of "commitment and satisfaction usually travel together" that is
 * appropriate for a person with nothing left to be committed to, and a sentence that describes a
 * dead relationship as though it were alive is the single fastest way to prove nobody is reading.
 *
 * Second, the relationship is still worth describing — in the past tense, which is the tense the
 * person is actually living in. "What was it like" is one of the first things a therapist asks
 * after an ending, because the most common thing people do in the aftermath is rewrite the whole
 * history around the ending: either it was all bad, which makes the grief inexplicable, or it was
 * all good, which makes the ending unbearable. Their own answers, given now but about then, are
 * the only defence against both.
 */

const PAST_STAGES = new Set(['ended', 'divorced'])

export function isAftermath(ctx: Context): boolean {
  return PAST_STAGES.has(ctx.stage)
}

/**
 * A finding that speaks about the relationship in the present tense has no business in an
 * aftermath report. Everything about the PERSON — how they are sleeping, what they are replaying,
 * what they believe about themselves now — is exactly what belongs there and is left alone.
 */
export function suppressPresentTense(findings: Finding[], ctx: Context): Finding[] {
  if (!isAftermath(ctx)) return findings
  return findings.filter((f) => {
    if (f.dimensions.length === 0) return true
    // Keep anything that touches the person; drop anything purely about the relationship as it is.
    return f.dimensions.some((d) => DIM_BY_ID[d].lens !== 'relationship')
  })
}

let seq = 0
const fid = () => `f:aft:${(seq += 1)}`
export function resetAftermathIds() { seq = 0 }

function get(scored: Scored[], id: DimensionId): Scored | undefined {
  return scored.find((s) => s.id === id && !s.thin)
}

function text(answers: AnswerMap, id: string): string {
  const v = answers[id]?.value
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : ''
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.lastIndexOf(' ', max)
  return s.slice(0, cut > 0 ? cut : max) + '…'
}

export function aftermathFindings(scored: Scored[], answers: AnswerMap, ctx: Context): Finding[] {
  if (!isAftermath(ctx)) return []
  const out: Finding[] = []

  const sat = get(scored, 'satisfaction')
  const ded = get(scored, 'ownDedication')
  const partner = get(scored, 'partnerCommitment')
  const trust = get(scored, 'trust')
  const resp = get(scored, 'responsiveness')

  /* ── what it actually was, in the past tense ── */
  const have = [sat, ded, trust, resp].filter((s): s is Scored => !!s)
  if (have.length >= 2) {
    const parts: string[] = [
      `Before anything about now, something about then — because the most common thing people do after an ending is rewrite the whole history around it.`,
    ]
    if (sat) {
      parts.push(
        sat.pomp >= 55
          ? `By your own answers, it was good: how it felt to be in it came out at ${sat.pomp}%. That is not a consolation and it is not an argument for anything. It is the reason this hurts the amount it hurts, and it means the pain is proportionate rather than a sign that something is wrong with you.`
          : sat.pomp <= 35
            ? `By your own answers it had stopped being good: how it felt to be in it came out at ${sat.pomp}%. Both things can be true at once — that it was not working, and that losing it is still a loss. People grieve relationships they were unhappy in, and that is not a contradiction they need to explain to anybody.`
            : `By your own answers it was mixed: how it felt came out at ${sat.pomp}%. Mixed is the hardest kind to lose, because there is no story that fits it. Good enough to miss, not good enough to have lasted.`,
      )
    }
    if (ded && partner && ded.pomp - partner.pomp >= 25) {
      parts.push(
        `You were holding it at ${ded.pomp}% and your read on how much they were holding it was ${partner.pomp}%. That gap was there before the ending, in your own answers about the time before. It is worth knowing, because "I did not see it coming" and "I was carrying more of it than they were" are usually the same fact seen from two sides.`,
      )
    }
    if (trust && resp && trust.pomp - resp.pomp >= 25) {
      parts.push(
        `You trusted them at ${trust.pomp}% and felt understood by them at ${resp.pomp}%. Those two came apart while it was still running.`,
      )
    }

    out.push({
      id: fid(),
      kind: 'extreme',
      statement: parts.join(' '),
      notability: 0.86,
      baseRate: 0.14,
      finnLevel: 2,
      evidence: have.slice(0, 3).map(dimensionEvidence),
      sources: ['rusbult1998', 'joel2020', 'langeslag2018'],
      dimensions: have.map((s) => s.id),
      accepted: true,
    })
  }

  /* ── the search for the moment they should have noticed ── */
  const rum = get(scored, 'rumination')
  const sco = get(scored, 'selfCompassion')
  const tried = text(answers, 'con_tried')
  const fear = text(answers, 'txt_fear')
  if (rum && rum.pomp >= 60) {
    const evidence: Evidence[] = [dimensionEvidence(rum)]
    if (sco) evidence.push(dimensionEvidence(sco))
    if (tried.length > 20) {
      evidence.push({
        id: 'ev:quote:con_tried',
        kind: 'quote',
        label: 'What you have already tried, and what happened',
        detail: `"${clip(tried, 240)}"`,
        sources: ['treynor2003'],
      })
    }

    out.push({
      id: fid(),
      kind: 'contradiction',
      statement:
        `Replaying came out at ${rum.pomp}%` +
        (sco ? `, and how you treat yourself while you do it at ${sco.pomp}%` : '') +
        `. What that combination is usually doing is a search: going back through it looking for the moment you should have noticed, on the theory that finding it would make sense of the ending. ` +
        `It is worth saying plainly that the search does not terminate. Not because you are not looking hard enough, but because the thing it is looking for — a version of the past where you could have prevented this — is not in there. ` +
        `The brooding kind of thinking is the kind that predicts worse outcomes, and it is separable from actually processing what happened. One of those has an end and the other does not.` +
        (fear.length > 12 ? ` You wrote that what you are most afraid of is this: "${clip(fear, 160)}" That is a sentence about the future, and it is being decided by a search into the past that cannot finish.` : ''),
      notability: 0.9,
      baseRate: 0.13,
      finnLevel: 3,
      evidence,
      sources: ['treynor2003', 'neff2003', 'langeslag2018'],
      dimensions: sco ? ['rumination', 'selfCompassion'] : ['rumination'],
      accepted: true,
    })
  }

  return out
}

/** The limits, for somebody in the aftermath. Different honesty is owed here. */
export function aftermathLimits(ctx: Context): string[] {
  if (!isAftermath(ctx)) return []
  return [
    'Nothing here tells you how long this takes. The honest answer is that the research on it ' +
    'describes wide variation and almost nothing that reliably predicts an individual course, so ' +
    'anybody offering you a timeline is guessing at your expense.',
    'This describes the relationship as you are able to see it now, which is not the same as how ' +
    'you will see it in a year. That is not a flaw in your answers. It is what the first months ' +
    'after an ending are actually like, and it is the reason nothing here is written as a verdict ' +
    'on what the relationship was.',
  ]
}
