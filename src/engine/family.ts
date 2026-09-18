import type { AnswerMap, Finding, Evidence, Context } from './types'

/**
 * THE GAP BETWEEN WHAT YOU WANT AND WHAT THEY EXPECT.
 *
 * Most people in India are living somewhere between a modern life and a traditional obligation,
 * and that distance is one of the largest single sources of relationship difficulty here. It is
 * also the place a product is most likely to do harm, because the obvious Western move — name the
 * family as the problem, recommend boundaries, imply the reader should choose themselves — is
 * useless to somebody who will be at the same dinner table on Sunday and who does not want to
 * stop loving their parents.
 *
 * Three findings are built here, and each exists to prevent a specific failure:
 *
 *   · THE PAIRED DISTANCE. Measured by Hwang's acculturative-family-distancing method: ask what
 *     the person holds, ask what they believe their family holds, take the distance. Never a
 *     modern-to-traditional score, because independent and interdependent self-construal are
 *     separable dimensions rather than two ends of one line (Singelis 1994) — a single axis would
 *     measure something that does not exist, and would quietly rank one end as more evolved.
 *
 *   · THE FILIAL PIETY SPLIT. Reciprocal filial piety (gratitude, care freely chosen) and
 *     authoritarian filial piety (obedience regardless of cost) live in the same person and run in
 *     opposite directions for wellbeing (Yeh & Bedford 2003). Collapsing them into one "family
 *     pressure" score produces a product that treats loving your parents as a symptom. Kept apart,
 *     they produce the truest sentence available to somebody caught here: the part of you that
 *     wants to look after them is not the part that is hurting you.
 *
 *   · THE COST OF DISAGREEING. Bowen's distinction between differentiation and cutoff. Somebody
 *     who believes that holding their own position would end the closeness is not free to hold it,
 *     and telling them to be more assertive ignores what they are actually weighing.
 */

const AGREE = 4 // raw likert5: endorsed
const FIRM = 2 // raw likert5 distance that counts as a real gap

let seq = 0
const fid = () => `f:fam:${(seq += 1)}`
export function resetFamilyIds() { seq = 0 }

function raw(answers: AnswerMap, id: string): number | null {
  const v = answers[id]?.value
  return typeof v === 'number' ? v : null
}

const scaleWord = (v: number) =>
  v >= 5 ? 'completely' : v === 4 ? 'mostly' : v === 3 ? 'somewhat' : v === 2 ? 'a little' : 'not at all'

/**
 * Is the collision live for this person?
 *
 * Deliberately NOT "does your family approve". Vikram's parents are delighted about his marriage
 * and want the couple to move in with them; measuring approval reported no family problem in a
 * situation that is entirely a family problem. Approval and expectation are different things, and
 * this asks about expectation.
 */
export function familyGapLive(answers: AnswerMap, ctx: Context): boolean {
  if (!ctx.familyInPlay) return false

  const self = raw(answers, 'gap_self')
  const family = raw(answers, 'gap_family')
  // gap_family is reverse-scored on its dimension; read it here as the endorsement it was.
  if (self !== null && family !== null && Math.abs(self - (6 - family)) >= FIRM) return true

  // Obedience held as a rule, by somebody who also thinks this one is theirs to decide.
  const auth = raw(answers, 'fil_auth')
  if (auth !== null && auth >= AGREE && self !== null && self >= AGREE) return true

  // Cannot say it without a fight, or believes saying it would cost the closeness.
  const sayable = raw(answers, 'gap_sayable')
  const contact = raw(answers, 'gap_contact')
  if (sayable !== null && sayable <= 2) return true
  if (contact !== null && contact >= AGREE) return true

  // A deadline, or living by what people would say.
  for (const id of ['fam_4', 'fam_5']) {
    const v = raw(answers, id)
    if (v !== null && v >= AGREE) return true
  }

  return false
}

export function familyFindings(answers: AnswerMap, ctx: Context): Finding[] {
  if (!ctx.familyInPlay) return []
  const out: Finding[] = []

  const ev = (id: string, label: string): Evidence | null => {
    const v = raw(answers, id)
    if (v === null) return null
    return {
      id: `ev:item:${id}`,
      kind: 'item',
      label,
      detail: `You chose: ${scaleWord(v)} true`,
      sources: ['hwang2006', 'yeh2003'],
    }
  }

  /* ── the paired distance ── */
  const self = raw(answers, 'gap_self')
  const family = raw(answers, 'gap_family')
  if (self !== null && family !== null) {
    const theirs = 6 - family
    const distance = Math.abs(self - theirs)
    if (distance >= FIRM) {
      const evidence = [
        ev('gap_self', 'Whether this is yours to decide'),
        ev('gap_family', 'Whether your family believes it is theirs'),
      ].filter((e): e is Evidence => e !== null)

      out.push({
        id: fid(),
        kind: 'contradiction',
        statement:
          `Asked whether "On this decision, I should be the one who decides", you said ${scaleWord(self)} true. ` +
          `Asked whether "On this decision, my family believes they should have the final say", you said ${scaleWord(theirs)} true. ` +
          `That distance is what you are actually living in, and it is worth being precise about what it is and what it is not. ` +
          `It is not evidence that you have become too modern, and it is not evidence that they are backward. They are two coherent ideas about who a decision belongs to, and both are held by people who love you — including you. ` +
          `The research that measures this measures it exactly this way, as a distance between two positions, and pointedly not as a score where one end is further along than the other. ` +
          `What makes it hard is not that one side is wrong. It is that the distance is real and nobody in it has said so out loud.`,
        notability: Math.min(1, 0.6 + distance / 10),
        baseRate: 0.2,
        finnLevel: 3,
        evidence,
        sources: ['hwang2006', 'singelis1994', 'chirkov2003'],
        dimensions: ['autonomy', 'familyApproval'],
        accepted: true,
      })
    }
  }

  /* ── the filial piety split ── */
  const recip = raw(answers, 'fil_recip')
  const auth = raw(answers, 'fil_auth')
  if (recip !== null && auth !== null && recip >= AGREE && auth >= AGREE) {
    const evidence = [
      ev('fil_recip', 'Wanting to care for them, freely'),
      ev('fil_auth', 'Doing what they want even when you think they are wrong'),
    ].filter((e): e is Evidence => e !== null)

    out.push({
      id: fid(),
      kind: 'configural',
      statement:
        `Two of your answers belong next to each other, because nearly everyone treats them as one thing and they are not. ` +
        `Asked about "I want to take care of my parents as they get older, and I would choose that freely", you said ${scaleWord(recip)} true. ` +
        `Asked about "I should do what my parents want even when I think they are wrong", you said ${scaleWord(auth)} true. ` +
        `Those are two separate things. They are measured separately in the research and they pull in opposite directions: the first is consistently associated with people doing better, and the second with people doing worse. ` +
        `This matters more than almost anything else here, because most advice you will be given asks you to give up the first in order to escape the second. You do not have to. ` +
        `Wanting to look after them is not what is costing you. Obedience that overrides your own judgement is a different thing entirely, and it is the only one of the two that has to move.`,
      notability: 0.92,
      baseRate: 0.11,
      finnLevel: 3,
      evidence,
      sources: ['yeh2003', 'chirkov2003', 'bowen1978'],
      dimensions: ['autonomy', 'relatedness'],
      accepted: true,
    })
  }

  /* ── the cost of disagreeing ── */
  const contact = raw(answers, 'gap_contact')
  const sayable = raw(answers, 'gap_sayable')
  if (contact !== null && contact >= AGREE) {
    const evidence = [
      ev('gap_contact', 'What going against them would cost'),
      ev('gap_sayable', 'Whether you can say what you think without a fight'),
    ].filter((e): e is Evidence => e !== null)

    out.push({
      id: fid(),
      kind: 'cutoff',
      statement:
        `Asked about "If I went against them on this, I would stop being close to them", you said ${scaleWord(contact)} true. ` +
        (sayable !== null && sayable <= 2
          ? `You also said you cannot tell them what you actually think without it becoming a fight. `
          : '') +
        `That belief is doing more work in this situation than any number in this report. Somebody who believes disagreement ends closeness is not choosing between two options; they are weighing one option against losing their family, and nobody makes that choice well. ` +
        `What is worth knowing is that the family research treats holding your own position and staying connected as two separate capacities rather than as opposites. The failure case is not disagreeing. It is disagreeing by disappearing. ` +
        `Whether the belief is accurate about your particular family is a real question and this cannot answer it from here. But it is a belief, and it has almost certainly never been tested at the smallest possible size.`,
      notability: 0.86,
      baseRate: 0.16,
      finnLevel: 3,
      evidence,
      sources: ['bowen1978', 'hwang2006', 'kegan2009'],
      dimensions: ['constraint', 'autonomy'],
      accepted: true,
    })
  }

  return out
}
