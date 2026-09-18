import type { AnswerMap, Finding, Evidence, Scored, Context } from './types'
import { ITEM_BY_ID } from '../items'
import { itemPomp } from './score'
import { renderAnswer } from './contradictions'

/**
 * THE CYCLE — demand and withdraw, which is a pattern and never a person.
 *
 * This is the most replicated interaction pattern in couples research (Christensen & Heavey 1990)
 * and nothing in the engine was reading it, even though the two items that measure it have been
 * in the bank from the start and two of the test personas were built as mirror images of it.
 *
 * It matters more than its share of the word count, for three reasons:
 *
 *   · It is the thing most couples are actually doing when they say "we have communication
 *     problems". Naming the loop gives them something to point at that is not each other.
 *   · Both roles feel, from the inside, like the only reasonable response to the other one. The
 *     person who pushes is not being difficult; they are trying to stop something from becoming
 *     permanent. The person who goes quiet is not stonewalling; they are usually flooded and
 *     trying not to say the unforgivable thing. Each move makes the other's more necessary.
 *   · It is symmetrical, which means there is no version of this finding where somebody is at
 *     fault — and that is exactly why it is safe to put in front of two people at once.
 *
 * The engine assigns a ROLE, and the role is about a position in a loop, not a character. Every
 * sentence here is written so that it could be read aloud by either person without either of them
 * hearing an accusation, because in couple mode it will be.
 */

let seq = 0
const fid = () => `f:cyc:${(seq += 1)}`
export function resetCycleIds() { seq = 0 }

const BREAK = String.fromCharCode(10)

const HIGH = 62
const LOW = 38

/** The pursuer item and the withdrawer item, as the bank defines them. */
const PURSUES = 'con_3' // "When I push to talk about a problem, they go quiet or leave the room."
const WITHDRAWS = 'con_4' // "When they push to talk about a problem, I shut down."
const UNRESOLVED = 'con_2' // "The same fight keeps coming back in different clothes."
const REPAIR = 'con_6' // "After a fight, one of us finds a way back within a day."

export type CycleRole = 'pursuer' | 'withdrawer' | 'both' | 'neither'

function ev(answers: AnswerMap, id: string, label: string): Evidence | null {
  const item = ITEM_BY_ID[id]
  const v = answers[id]?.value
  if (!item || typeof v !== 'number') return null
  return {
    id: `ev:item:${id}`,
    kind: 'item',
    label,
    detail: renderAnswer(item, v),
    itemText: item.text,
    sources: item.sources,
  }
}

export function cycleRole(answers: AnswerMap): { role: CycleRole; pursue: number; withdraw: number } | null {
  const p = answers[PURSUES]?.value
  const w = answers[WITHDRAWS]?.value
  if (typeof p !== 'number' || typeof w !== 'number') return null

  const pursue = Math.round(itemPomp(PURSUES, p))
  const withdraw = Math.round(itemPomp(WITHDRAWS, w))

  const role: CycleRole =
    pursue >= HIGH && withdraw >= HIGH ? 'both'
      : pursue >= HIGH && withdraw <= LOW ? 'pursuer'
        : withdraw >= HIGH && pursue <= LOW ? 'withdrawer'
          : pursue >= HIGH ? 'pursuer'
            : withdraw >= HIGH ? 'withdrawer'
              : 'neither'

  return { role, pursue, withdraw }
}

export function cycleFindings(answers: AnswerMap, _scored: Scored[], ctx: Context): Finding[] {
  if (ctx.lens !== 'relationship') return []
  const read = cycleRole(answers)
  if (!read || read.role === 'neither') return []

  const { role, pursue, withdraw } = read
  const stuck = typeof answers[UNRESOLVED]?.value === 'number'
    ? Math.round(itemPomp(UNRESOLVED, answers[UNRESOLVED]!.value as number))
    : null
  const repairs = typeof answers[REPAIR]?.value === 'number'
    ? Math.round(itemPomp(REPAIR, answers[REPAIR]!.value as number))
    : null

  const evidence = [
    ev(answers, PURSUES, 'What happens when you raise something'),
    ev(answers, WITHDRAWS, 'What happens when they raise something'),
    ev(answers, UNRESOLVED, 'Whether the same fight comes back'),
    ev(answers, REPAIR, 'Whether one of you finds a way back'),
  ].filter((e): e is Evidence => e !== null)

  /* The loop, drawn. Each role gets its own opening because the experience of standing in it is
     genuinely different, and a reader who does not recognise the description will not use it. */
  const opening =
    role === 'pursuer'
      ? `You are the one who raises it. On "when I push to talk about a problem, they go quiet or leave the room" you are at ${pursue}%, and on shutting down when they push, ${withdraw}%. Those two numbers put you in a specific position in a specific loop, and it has a name because it is the most common one there is.`
      : role === 'withdrawer'
        ? `You are the one who goes quiet. On "when they push to talk about a problem, I shut down" you are at ${withdraw}%, and on being the one who pushes, ${pursue}%. That is a specific position in a specific loop, and it has a name because it is the most common one there is.`
        : `You are doing both. Pushing to talk sits at ${pursue}% and shutting down when they push sits at ${withdraw}%, which means the roles are swapping rather than being held — usually by topic, sometimes by who is more tired.`

  const mechanism =
    `The loop runs like this. One of you raises something, because leaving it alone has started to feel like letting it become permanent. The other one goes quiet — not to punish anybody, but because the body gets to a state where the only sentences available are the ones you cannot take back, and silence is the last thing keeping this from becoming worse. ` +
    `The silence reads as not caring. So the raising gets louder, because louder is what you do when you think you have not been heard. Which makes the quiet deeper, because now there is more to absorb. ` +
    `Neither move is unreasonable. Each one is the correct response to the other one. That is what makes it a loop rather than an argument, and it is why it does not resolve by either of you trying harder at your own end.`

  const yours =
    role === 'pursuer'
      ? `From where you are standing, this looks like being the only one who cares enough to bring it up. It is worth knowing that from the other side it looks like being cornered by somebody who will not let it go until they get an answer you do not have yet.`
      : role === 'withdrawer'
        ? `From where you are standing, this looks like protecting the relationship from the version of you that comes out when it goes on too long. It is worth knowing that from the other side, silence and not caring are indistinguishable — there is no way to tell them apart from outside.`
        : `Because you are doing both, you already know what each end feels like. That is genuinely rarer, and it is the thing that makes this workable faster than it usually is.`

  const cost =
    stuck !== null && stuck >= 60
      ? `The evidence that it is a loop and not a series of arguments is your own: the same fight coming back in different clothes is at ${stuck}%.`
      : ''

  const hope =
    repairs !== null && repairs >= 55
      ? ` And the thing that makes this more workable than it feels: one of you finds a way back within a day, at ${repairs}%. Couples who repair are not couples who fight less. That capacity is the material everything else gets built on, and you have it.`
      : repairs !== null && repairs <= 35
        ? ` What is missing is the way back: repair after a fight is at ${repairs}%. That is the piece to build first, before anything about the fighting itself, because a loop with no exit is a different problem from a loop with a slow one.`
        : ''

  return [{
    id: fid(),
    kind: 'configural',
    statement: `${opening}${BREAK}${BREAK}${mechanism}${BREAK}${BREAK}${yours} ${cost}${hope}`,
    notability: role === 'both' ? 0.9 : 0.88,
    baseRate: 0.2,
    finnLevel: 3,
    evidence,
    sources: ['christensen1990', 'joel2020'],
    dimensions: ['conflict'],
    accepted: true,
  }]
}
