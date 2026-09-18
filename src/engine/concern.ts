import type { AnswerMap, Finding, Evidence, Context } from './types'

/**
 * WHAT THEY ACTUALLY CAME WITH.
 *
 * The concern chapter asks three open questions — what is going on, what you have already tried,
 * and what you would change tomorrow — and until this file existed the answers reached the packet
 * only as loose quotes in a list of fourteen, which the writer might or might not pick up.
 *
 * That is the difference between a report that works on a person's problem and one that describes
 * their scores next to it. Whatever somebody walks in with — in-laws who want them to move in, a
 * year of not being able to talk about money since the baby, an arranged match they have three
 * weeks to answer, a marriage they are deciding whether to end — is in that text and nowhere else,
 * because there is deliberately no menu of problems anywhere in this product.
 *
 * So it becomes a finding: the highest-notability Level-1 material in the report, anchoring the
 * opening section, and carrying the thing a therapist does in the first five minutes and an
 * assessment app never does.
 */

const MIN = 25

function text(answers: AnswerMap, id: string): string {
  const v = answers[id]?.value
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : ''
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.lastIndexOf(' ', max)
  return s.slice(0, cut > 0 ? cut : max) + '…'
}

let seq = 0
const fid = () => `f:con:${(seq += 1)}`
export function resetConcernIds() { seq = 0 }

/**
 * Their problem, in their words, held next to what they have already done about it.
 *
 * Deliberately NOT analysis. Repeating somebody's situation back to them with the detail a
 * skimmer would have missed is how a person decides whether the rest is worth reading, and it is
 * also the only honest place to acknowledge that they have already tried things — because a plan
 * that hands back what somebody told you failed is the single fastest way to prove you were not
 * listening.
 */
export function concernFindings(answers: AnswerMap, ctx: Context): Finding[] {
  const story = text(answers, 'con_story')
  const tried = text(answers, 'con_tried')
  const change = text(answers, 'con_change')
  const why = text(answers, 'txt_why')

  const source = story.length >= MIN ? story : why
  if (source.length < MIN) return []

  const evidence: Evidence[] = []
  const add = (id: string, label: string, body: string, sources: string[]) => {
    if (body.length < 12) return
    evidence.push({
      id: `ev:quote:${id}`,
      kind: 'quote',
      label,
      detail: `"${clip(body, 320)}"`,
      itemText: label,
      sources,
    })
  }
  add(story.length >= MIN ? 'con_story' : 'txt_why', 'What is actually going on', source, ['miller2013', 'christensen2004'])
  add('con_tried', 'What you have already tried, and what happened', tried, ['doherty2016'])
  add('con_change', 'The one thing you would have different tomorrow', change, ['oettingen2014'])

  const parts: string[] = [
    `You wrote this, and it is the thing everything below is actually about: "${clip(source, 300)}"`,
  ]

  if (tried.length >= 12) {
    parts.push(
      `You have also already done things about it: "${clip(tried, 220)}" ` +
      `That is not a footnote. It rules things out, and it means nobody gets to hand you the obvious suggestion as though you had not thought of it.`,
    )
  }

  if (change.length >= 12) {
    parts.push(
      `And asked what you would have different by tomorrow morning, you picked this: "${clip(change, 200)}" ` +
      `Hold on to that one. It is the most specific statement of what you want in the whole assessment, and specific is what makes a thing workable.`,
    )
  }

  parts.push(
    ctx.lens === 'relationship'
      ? `Nothing below is a verdict on whether you should have this problem. It is work on the problem you have.`
      : `Nothing below is a judgement about you. It is work on what you brought.`,
  )

  return [
    {
      id: fid(),
      kind: 'quote',
      statement: parts.join(' '),
      /* Highest notability in the report, and Level 1 on purpose: this is not news to them. It is
         the proof that we read it, which is what buys the right to say anything harder later. */
      notability: 0.99,
      baseRate: 0.02,
      finnLevel: 1,
      evidence,
      sources: ['miller2013', 'doherty2016', 'christensen2004'],
      dimensions: [],
      accepted: true,
    },
  ]
}

/* ══════════════════════════════════════════════════════════════════════════
   WHAT THEY ALREADY TRIED — so the plan never hands it back.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * The fastest way to lose somebody is to prescribe the thing they just told you did not work.
 *
 * A therapist never does this, because they were listening. Software usually does, because it was
 * matching on a score. So the plan reads what they said they tried, and where a prescribed
 * practice is a version of it, the reason sentence LEADS with the acknowledgement and names what
 * is different about this version. Nothing is ever removed — LAW 5 is about safety flags, but the
 * principle is the same: a person who tells us more should not end up with less.
 */
interface Attempt {
  id: string
  /** Lowercase fragments. Matched as substrings, so short and unambiguous only. */
  words: string[]
  /** Practices this attempt is a rough version of. */
  practices: string[]
  /** What is different about the prescribed version, in one sentence. */
  difference: string
}

const ATTEMPTS: Attempt[] = [
  {
    id: 'talked',
    words: ['talked', 'talking', 'spoke to', 'conversation', 'tried to discuss', 'sat down'],
    practices: ['softened-start', 'stress-conversation', 'empathic-joining', 'money-structure'],
    difference:
      'what is different here is not that you talk, it is when and how it opens — the first three sentences of a difficult conversation predict how the rest of it goes, and that is the only part this changes',
  },
  {
    id: 'ultimatum',
    words: ['ultimatum', 'threatened to leave', 'said i would leave', 'gave him a choice', 'gave her a choice'],
    practices: ['decisional-balance', 'bounded-effort', 'timeout'],
    difference:
      'an ultimatum asks the other person to decide. This does the opposite: it is a decision with a date on it that you make and keep to yourself, which is the version that does not need their cooperation to work',
  },
  {
    id: 'waited',
    words: ['waited', 'waiting it out', 'gave it time', 'hoped it would', 'let it pass'],
    practices: ['bounded-effort', 'woop', 'decisional-balance'],
    difference:
      'waiting with no end point is the thing that turns a bad year into a bad decade. This is the same patience with a boundary on it, which is a completely different act',
  },
  {
    id: 'family',
    words: ['told my parents', 'involved family', 'family got involved', 'my mother', 'his mother', 'her mother', 'in-laws', 'inlaws'],
    practices: ['inlaw-routing', 'differentiation'],
    difference:
      'bringing family in is not the same as deciding which of you carries which conversation. The second one keeps you two on the same side of it, which is usually what went wrong the first time',
  },
  {
    id: 'therapy',
    words: ['therapy', 'counsell', 'counsel', 'therapist', 'psychologist'],
    practices: ['cycle-naming', 'empathic-joining', 'dreams-within'],
    difference:
      'you have been in the room already, which means the language will be familiar. What is here is the specific piece your own answers point at, rather than a general course of it',
  },
  {
    id: 'distance',
    words: ['took a break', 'space', 'moved out', 'stopped talking', 'went home to'],
    practices: ['timeout', 'bounded-effort', 'self-expansion'],
    difference:
      'distance without a return plan is how a break becomes an ending nobody chose. The difference here is that the coming-back is agreed before the going-away',
  },
  {
    id: 'ignored',
    words: ['ignored it', 'let it go', 'did nothing', 'kept quiet', 'said nothing'],
    practices: ['softened-start', 'invisible-load', 'appreciation'],
    difference:
      'keeping quiet is not a failure of nerve, it is usually the correct read that raising it would go badly. This changes the conditions rather than asking you to be braver',
  },
]

/** Which prescribed practices are versions of something this person already tried. */
export function alreadyTried(answers: AnswerMap): Map<string, string> {
  const tried = text(answers, 'con_tried').toLowerCase()
  const story = text(answers, 'con_story').toLowerCase()
  const haystack = `${tried} ${story}`
  const out = new Map<string, string>()
  if (tried.length < 10) return out

  for (const a of ATTEMPTS) {
    if (!a.words.some((w) => haystack.includes(w))) continue
    for (const p of a.practices) {
      if (!out.has(p)) out.set(p, a.difference)
    }
  }
  return out
}
