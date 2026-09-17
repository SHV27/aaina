import type { Item, Context, HelpMode, Stage } from '../engine/types'
import { HELP_MODES } from '../engine/types'

/**
 * THE CONCERN CHAPTER — what they actually came with.
 *
 * Everything else in Aaina measures constructs. This chapter does the thing a therapist does in
 * the first five minutes and an assessment app usually never does: it asks what is going on, in
 * the person's own words, with real room to answer, and then asks what kind of help they want.
 *
 * Why this exists at all: the relationship half was originally shaped for one question — where
 * does this stand, should I stay. That is discernment, and it is a small fraction of why people
 * see a couples therapist. Somebody arriving because their in-laws want them to move in, or
 * because they cannot talk about money since the baby, does not want a stay-or-go verdict. They
 * want their problem understood and a way through it. Handing them a verdict would be answering a
 * question they did not ask.
 *
 * Note what is NOT here: a menu of problems. There is no list of relationship difficulties that
 * would not fail the first person whose situation is not on it. The person writes; we read.
 */

const isPast = (c: Context) => c.stage === 'ended' || c.stage === 'divorced' || c.stage === 'separated'

/** A sensible default so nobody starts from a blank choice — always overridable. */
export function suggestedHelp(stage: Stage): HelpMode[] {
  switch (stage) {
    case 'ended':
    case 'divorced':
      return ['recover']
    case 'separated':
      return ['decide', 'recover']
    case 'arranged-considering':
      return ['decide']
    case 'one-sided':
    case 'talking':
      return ['decide', 'understand']
    case 'long-distance':
      return ['endure']
    case 'married':
    case 'engaged':
      return ['repair']
    default:
      return ['understand']
  }
}

export const CONCERN_ITEMS: Item[] = [
  {
    id: 'con_story',
    text: 'Tell us what is actually going on.',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['miller2013', 'christensen2004'],
    licence: 'aaina-authored',
    chapter: 'concern',
    placeholder:
      'In as much detail as you want. What happened, what keeps happening, who else is involved, what you have already tried. There is no wrong way to write this and nobody is reading it but the analysis.',
  },
  {
    id: 'con_help',
    text: 'What would actually help you right now?',
    format: 'choice',
    dimension: null,
    reverse: false,
    sources: ['doherty2016', 'miller2013'],
    licence: 'aaina-authored',
    chapter: 'concern',
    options: HELP_MODES.map((h) => ({ value: h.id, label: h.label })),
  },
  {
    id: 'con_tried',
    text: 'What have you already tried, and what happened?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['doherty2016', 'christensen2004'],
    licence: 'aaina-authored',
    chapter: 'concern',
    placeholder:
      'Conversations, ultimatums, waiting it out, involving family, therapy, distance. What you tried matters as much as the problem — it rules things out.',
  },
  {
    id: 'con_change',
    text: 'If one thing were different tomorrow morning, what would you pick?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['doherty2016', 'oettingen2014'],
    licence: 'aaina-authored',
    chapter: 'concern',
    placeholder: 'One thing. Be specific — "he would listen" is a wish, "he would not walk out mid-argument" is a target.',
  },

  /* ── The collision. Not a problem category — a measured distance, asked of everyone whose
        family is in play, because in India it is the single most common shape of difficulty and
        most people are living in the gap rather than at either end. ── */
  /**
   * PAIRED ITEMS. We never score anyone on how modern or traditional they are — independent and
   * interdependent self-construal are separable dimensions rather than two ends of one line
   * (Singelis 1994), so a single axis would be measuring a thing that does not exist.
   *
   * Instead, following the method of Hwang's acculturative family distancing: ask what THEY hold,
   * ask what they believe their FAMILY holds, and take the distance. The gap is the finding, and
   * neither end of it is the wrong answer.
   */
  {
    id: 'gap_self',
    text: 'On this decision, I should be the one who decides.',
    format: 'likert5',
    dimension: 'autonomy',
    reverse: false,
    sources: ['singelis1994', 'hwang2006', 'chirkov2003'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'gap_family',
    text: 'On this decision, my family believes they should have the final say.',
    format: 'likert5',
    dimension: 'familyApproval',
    reverse: true,
    sources: ['hwang2006', 'sprecher1992'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'gap_sayable',
    text: 'I can tell my family what I actually think about this without it becoming a fight.',
    format: 'likert5',
    dimension: 'autonomy',
    reverse: false,
    sources: ['bowen1978', 'hwang2006'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'gap_regulated',
    text: 'When this comes up at home, I stay calm enough to say what I mean.',
    format: 'likert5',
    dimension: 'emotionRegulation',
    reverse: false,
    sources: ['bowen1978', 'gross2003'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'gap_contact',
    text: 'If I went against them on this, I would stop being close to them.',
    format: 'likert5',
    dimension: 'constraint',
    reverse: false,
    sources: ['bowen1978', 'rusbult1998'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },

  /**
   * DUAL FILIAL PIETY (Yeh & Bedford 2003). Two components that live in the same person:
   * RECIPROCAL — gratitude and care, which is associated with BETTER wellbeing — and
   * AUTHORITARIAN — obedience regardless of cost, which is the half associated with worse.
   *
   * Measuring them apart is what lets Aaina say the truest and most useful sentence available to
   * someone caught here: the part of you that wants to look after them is not the part that is
   * hurting you. Collapsing them into one "family pressure" score loses exactly that, and produces
   * a product that treats loving your parents as a symptom.
   */
  {
    id: 'fil_recip',
    text: 'I want to take care of my parents as they get older, and I would choose that freely.',
    format: 'likert5',
    dimension: 'relatedness',
    reverse: false,
    sources: ['yeh2003', 'chirkov2003'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'fil_auth',
    text: 'I should do what my parents want even when I think they are wrong.',
    format: 'likert5',
    dimension: 'autonomy',
    reverse: true,
    sources: ['yeh2003', 'chirkov2003'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'fil_why',
    text: 'When I go along with what my family wants, it is because I genuinely agree — not because of what happens if I do not.',
    format: 'likert5',
    dimension: 'autonomy',
    reverse: false,
    sources: ['chirkov2003', 'ryan2000'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'gap_participation',
    text: 'I had a real say in how this relationship came about.',
    format: 'likert5',
    dimension: 'autonomy',
    reverse: false,
    sources: ['allendorf2013', 'chirkov2003'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'gap_apology',
    text: 'Before things could be alright with them again, they would have to admit they were wrong.',
    format: 'likert5',
    dimension: 'coreBeliefOther',
    reverse: true,
    sources: ['pillemer2020', 'bowen1978'],
    licence: 'aaina-authored',
    chapter: 'concern',
    showWhen: (c) => c.familyInPlay,
  },
  {
    id: 'gap_text',
    text: 'Where do you and your family see this differently?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['sprecher1992', 'miller2013'],
    licence: 'aaina-authored',
    chapter: 'concern',
    placeholder:
      'Caste, community, religion, money, timing, where you would live, who you would become. Or nothing — plenty of people have no gap here, and that is worth knowing too.',
    showWhen: (c) => c.familyInPlay,
  },

  /* ── The ending, when there is one. Recovery is a different job from deciding. ── */
  {
    id: 'rec_what',
    text: 'What ended, and how did it end?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['treynor2003', 'neff2003'],
    licence: 'aaina-authored',
    chapter: 'concern',
    placeholder: 'However much you want to say about it.',
    showWhen: isPast,
  },
]

export const HELP_BY_ID: Record<HelpMode, (typeof HELP_MODES)[number]> = Object.fromEntries(
  HELP_MODES.map((h) => [h.id, h]),
) as Record<HelpMode, (typeof HELP_MODES)[number]>
