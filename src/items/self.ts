import type { Item } from '../engine/types'

/**
 * The shared spine + the self lens.
 *
 * The spine (attachment, emotion regulation, life satisfaction) is asked once and feeds BOTH
 * lenses — Joel 2020 put individual-level variables in the top tier of relationship predictors,
 * so measuring them twice would be an engineering failure and asking them twice would be rude.
 *
 * All items Aaina-authored against the named published constructs. See relationship.ts for the
 * full licence position.
 */

const it = (
  id: string,
  text: string,
  dimension: Item['dimension'],
  reverse: boolean,
  sources: string[],
  extra: Partial<Item> = {},
): Item => ({
  id,
  text,
  format: 'likert5',
  dimension,
  reverse,
  sources,
  licence: 'aaina-authored',
  chapter: 'you',
  ...extra,
})

/* ════════════════  THE SHARED SPINE — asked once, used by both lenses  ════════════════ */

export const SPINE_ITEMS: Item[] = [
  /* attachment anxiety — a dimension, never a type */
  it('anx_1', 'I worry that the people close to me will stop wanting me around.', 'attachAnxiety', false, ['wei2007', 'joel2020']),
  it('anx_2', 'When someone takes a while to reply, I start building a story about why.', 'attachAnxiety', false, ['wei2007']),
  it('anx_3', 'I need more reassurance than I am comfortable admitting.', 'attachAnxiety', false, ['wei2007']),
  it('anx_4', 'I can be apart from someone I love without something tightening in my chest.', 'attachAnxiety', true, ['wei2007']),

  /* attachment avoidance */
  it('avo_1', 'When someone gets close, part of me starts looking for the exit.', 'attachAvoidance', false, ['wei2007', 'joel2020']),
  it('avo_2', 'I would rather handle something hard alone than ask for help.', 'attachAvoidance', false, ['wei2007']),
  it('avo_3', 'I find it easy to let people see me at my worst.', 'attachAvoidance', true, ['wei2007']),
  it('avo_4', 'I keep a part of myself back, even in my closest relationships.', 'attachAvoidance', false, ['wei2007']),

  /* emotion regulation */
  it('emo_1', 'When something upsets me, I can find another way to look at it.', 'emotionRegulation', false, ['gross2003']),
  it('emo_2', 'I keep what I am feeling to myself.', 'emotionRegulation', true, ['gross2003']),
  it('emo_3', 'When a feeling is big, it decides what I do next.', 'emotionRegulation', true, ['gross2003']),
  it('emo_4', 'I can sit with an uncomfortable feeling without having to fix it immediately.', 'emotionRegulation', false, ['gross2003', 'neff2003']),

  /* life satisfaction — the single strongest individual-level predictor in Joel 2020 */
  it('life_1', 'Taking my life as a whole, I am satisfied with how it is going.', 'lifeSatisfaction', false, ['diener1985', 'joel2020']),
  it('life_2', 'Most days I have felt cheerful and in good spirits.', 'lifeSatisfaction', false, ['topp2015'], { text: 'Over the last two weeks, most days I have felt cheerful and in good spirits.' }),
  it('life_3', 'I wake up with something to look forward to.', 'lifeSatisfaction', false, ['topp2015', 'markus1986']),
  it('life_4', 'If I could live the last few years again, I would change almost everything.', 'lifeSatisfaction', true, ['diener1985']),
]

/* ════════════════  THE SELF LENS  ════════════════ */

export const SELF_ITEMS: Item[] = [
  /* self-concept clarity — the central construct */
  it('scc_1', 'I know what I am like.', 'selfConceptClarity', false, ['campbell1996'], { chapter: 'patterns' }),
  it('scc_2', 'Who I am seems to change depending on who I am with.', 'selfConceptClarity', true, ['campbell1996'], { chapter: 'patterns' }),
  it('scc_3', 'If I had to describe myself to a stranger, I would know where to start.', 'selfConceptClarity', false, ['campbell1996'], { chapter: 'patterns' }),
  it('scc_4', 'Two things I believe about myself contradict each other, and I know it.', 'selfConceptClarity', true, ['campbell1996', 'kegan2009'], { chapter: 'patterns' }),
  it('scc_5', 'What I want out of life has been steady for a while.', 'selfConceptClarity', false, ['campbell1996'], { chapter: 'patterns' }),

  /* core beliefs about self — the limiting-belief layer */
  it('cbs_1', 'Underneath it all, I think there is something wrong with me that other people do not have.', 'coreBeliefSelf', true, ['kegan2009', 'neff2003'], { chapter: 'patterns' }),
  it('cbs_2', 'I have to earn being loved. It is not a given.', 'coreBeliefSelf', true, ['kegan2009'], { chapter: 'patterns' }),
  it('cbs_3', 'If people saw all of me, they would think less of me.', 'coreBeliefSelf', true, ['kegan2009', 'neff2003'], { chapter: 'patterns' }),
  it('cbs_4', 'I am allowed to take up space.', 'coreBeliefSelf', false, ['ryan2000'], { chapter: 'patterns' }),
  it('cbs_5', 'My needs come after everyone else\'s, and that is just how it is.', 'coreBeliefSelf', true, ['ryan2000', 'kegan2009'], { chapter: 'patterns' }),
  it('cbs_6', 'Good things that happen to me feel like luck rather than something I did.', 'coreBeliefSelf', true, ['ryan2000'], { chapter: 'patterns' }),

  /* core beliefs about others */
  it('cbo_1', 'People are mostly reliable.', 'coreBeliefOther', false, ['rempel1985', 'wei2007'], { chapter: 'patterns' }),
  it('cbo_2', 'If I depend on someone, I will end up regretting it.', 'coreBeliefOther', true, ['wei2007'], { chapter: 'patterns' }),
  it('cbo_3', 'People leave.', 'coreBeliefOther', true, ['wei2007'], { chapter: 'patterns' }),
  it('cbo_4', 'I can tell someone something difficult and it will be alright.', 'coreBeliefOther', false, ['reis2004'], { chapter: 'patterns' }),

  /* self-compassion and rumination sit in the shared 'you' chapter, not in the self lens only.
     They were self-only, which meant the relationship half never measured either one — so a man
     whose partner had just left, and who wrote that he had been over every conversation looking
     for the part where he should have noticed, had no rumination score for anything to read.
     Joel 2020 put individual-level variables in the top tier of relationship predictors; these
     two are also the whole substance of the aftermath. Eight questions, both lenses. */
  it('sco_1', 'When I mess up, I talk to myself the way I would talk to a friend who messed up.', 'selfCompassion', false, ['neff2003'], { chapter: 'you' }),
  it('sco_2', 'I am harder on myself than anyone else is.', 'selfCompassion', true, ['neff2003'], { chapter: 'you' }),
  it('sco_3', 'When something goes wrong, I assume other people are handling it better than I am.', 'selfCompassion', true, ['neff2003'], { chapter: 'you' }),
  it('sco_4', 'I can forgive myself for something I did a long time ago.', 'selfCompassion', false, ['neff2003'], { chapter: 'you' }),

  /* rumination — brooding specifically */
  it('rum_1', 'I replay conversations after they are over.', 'rumination', false, ['treynor2003'], { chapter: 'you' }),
  it('rum_2', 'I ask myself "why did I do that" and never arrive anywhere.', 'rumination', false, ['treynor2003'], { chapter: 'you' }),
  it('rum_3', 'Once I start thinking about something that went wrong, I cannot put it down.', 'rumination', false, ['treynor2003'], { chapter: 'you' }),
  it('rum_4', 'Thinking things over usually helps me get somewhere.', 'rumination', true, ['treynor2003'], { chapter: 'you' }),

  /* self-determination: the three needs */
  it('aut_1', 'The way I spend my days is genuinely my choice.', 'autonomy', false, ['ryan2000'], { chapter: 'patterns' }),
  it('aut_2', 'I am living a life someone else designed for me.', 'autonomy', true, ['ryan2000'], { chapter: 'patterns' }),
  it('aut_3', 'I say yes to things I want to say no to.', 'autonomy', true, ['ryan2000'], { chapter: 'patterns' }),
  /* Competence and agency each had two items, which put them permanently below the three needed
     for a composite — so two of the three self-determination needs could never be scored, never
     entered the overall number, and appeared in every reader's "left thin" line forever. Both also
     carry exclusion claims ("you are not incapable", "you are not lazy") that could therefore never
     fire. A dimension that cannot reach its own threshold is not a measurement. */
  it('com_1', 'I am good at the things that matter to me.', 'competence', false, ['ryan2000'], { chapter: 'patterns' }),
  it('com_2', 'Lately I have felt out of my depth most of the time.', 'competence', true, ['ryan2000'], { chapter: 'patterns' }),
  it('com_3', 'When I take on something new, I expect to get the hang of it.', 'competence', false, ['ryan2000'], { chapter: 'patterns' }),
  it('com_4', 'I stay away from things I might turn out to be bad at.', 'competence', true, ['ryan2000', 'kegan2009'], { chapter: 'patterns' }),
  it('rel_1', 'There is at least one person I could call at 3am.', 'relatedness', false, ['ryan2000'], { chapter: 'patterns' }),
  it('rel_2', 'I feel lonely even around people.', 'relatedness', true, ['ryan2000'], { chapter: 'patterns' }),
  it('age_1', 'What happens in my life is mostly a result of what I do.', 'agency', false, ['ryan2000', 'kegan2009'], { chapter: 'patterns' }),
  it('age_2', 'Things happen to me and I react.', 'agency', true, ['ryan2000'], { chapter: 'patterns' }),
  it('age_3', 'When something in my life needs to change, I am the one who changes it.', 'agency', false, ['ryan2000', 'kegan2009'], { chapter: 'patterns' }),
  it('age_4', 'I tend to wait and see whether a situation sorts itself out.', 'agency', true, ['ryan2000'], { chapter: 'patterns' }),

  /* future self continuity — similarity, not just aspiration (Hershfield) */
  it('fut_1', 'The person I will be in ten years feels like me.', 'futureSelfContinuity', false, ['hershfield2011'], { chapter: 'future' }),
  it('fut_2', 'I think about my future self the way I would think about a stranger.', 'futureSelfContinuity', true, ['hershfield2011'], { chapter: 'future' }),
  it('fut_3', 'What I do today matters to who I will be.', 'futureSelfContinuity', false, ['hershfield2011', 'markus1986'], { chapter: 'future' }),
  it('fut_4', 'I can picture, specifically, a day in my life five years from now.', 'futureSelfContinuity', false, ['markus1986'], { chapter: 'future' }),

  /* values-lived gap — the discrepancy engine's fuel */
  it('val_1', 'My week actually reflects what I said matters most to me.', 'valuesLived', false, ['schwartz2012', 'miller2013'], { chapter: 'ground' }),
  it('val_2', 'There is a gap between what I believe in and how I actually live.', 'valuesLived', true, ['miller2013', 'schwartz2012'], { chapter: 'ground' }),
  it('val_3', 'If someone watched my last month with no explanation, they would work out what I care about.', 'valuesLived', false, ['schwartz2012'], { chapter: 'ground' }),
]

/* ════════════════  VALUES — the grounding chapter, first and non-skippable  ════════════════ */

export const VALUE_OPTIONS = [
  { value: 'security', label: 'Safety and stability', gloss: 'Knowing things will hold. Predictability, and people you can count on.' },
  { value: 'benevolence', label: 'Looking after my people', gloss: 'The wellbeing of the people close to you, above most other things.' },
  { value: 'achievement', label: 'Achieving something', gloss: 'Being good at what you do, and having it count.' },
  { value: 'selfDirection', label: 'Choosing for myself', gloss: 'Deciding your own direction. Independence of thought and action.' },
  { value: 'tradition', label: 'Honouring where I come from', gloss: 'Family, faith, custom — the continuity of it.' },
  { value: 'universalism', label: 'Fairness for everyone', gloss: 'Justice, equality, care beyond your own circle.' },
  { value: 'hedonism', label: 'Enjoying my life', gloss: 'Pleasure, delight, and not postponing it forever.' },
  { value: 'stimulation', label: 'Newness and risk', gloss: 'Variety, challenge, the untested thing.' },
  { value: 'power', label: 'Standing and influence', gloss: 'Respect, resources, and a say in what happens.' },
  { value: 'conformity', label: 'Not letting people down', gloss: 'Meeting expectations, keeping the peace, doing the right thing by others.' },
] as const

export const VALUES_ITEMS: Item[] = [
  {
    id: 'val_pick',
    text: 'Of these ten, choose the three that are most you. Not the three that sound best — the three that are actually true.',
    format: 'choice',
    dimension: null,
    reverse: false,
    sources: ['schwartz2012', 'steele1988', 'cohen2014'],
    licence: 'aaina-authored',
    chapter: 'ground',
    options: VALUE_OPTIONS.map((v) => ({ value: v.value, label: v.label })),
  },
  {
    id: 'val_write',
    text: 'Take the one that matters most. Write about a time you acted on it when it cost you something.',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['steele1988', 'cohen2014'],
    licence: 'aaina-authored',
    chapter: 'ground',
    placeholder: 'A few sentences. This is the part that makes the rest of it land — affirming what you value before hard information makes you less likely to flinch from it.',
  },
  {
    id: 'val_alloc',
    text: 'Now the honest part. Out of a normal week of yours, how much of it actually goes to that value?',
    format: 'allocate',
    dimension: 'valuesLived',
    reverse: false,
    sources: ['schwartz2012', 'miller2013'],
    licence: 'aaina-authored',
    chapter: 'ground',
  },
]

/* ════════════════  FUTURE SELF — the reconstruct phase  ════════════════ */

export const FUTURE_ITEMS: Item[] = [
  {
    id: 'fut_write',
    text: 'Ten years from now, things have gone as well as they realistically could. Write a few sentences about an ordinary Tuesday in that life.',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['markus1986', 'hershfield2011'],
    licence: 'aaina-authored',
    chapter: 'future',
    placeholder: 'Not the highlights. A Tuesday. Where you wake up, who is there, what you do, what you are not worrying about any more.',
  },
  {
    id: 'fut_gap',
    text: 'What would that person have that you do not have yet? Name the one that is hardest to say.',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['markus1986', 'kegan2009'],
    licence: 'aaina-authored',
    chapter: 'future',
    placeholder: 'One thing. The hard one.',
  },
  {
    id: 'fut_block',
    text: 'You already know what stops you. What is it?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['kegan2009', 'oettingen2014'],
    licence: 'aaina-authored',
    chapter: 'future',
    placeholder: 'The real obstacle, not the respectable one.',
  },
]
