import type { Item, Context } from '../engine/types'

/**
 * The relationship lens.
 *
 * Licence position, stated once and applied everywhere: **every item below is written by Aaina.**
 * We name the published construct and the published interpretation rules we rely on, and we do
 * not reproduce any copyrighted instrument's item wording. This is both the legally clean path
 * and the better one — no imported scale asks whether your parents have refused the relationship,
 * and in India that is not a footnote. `licence: 'aaina-authored'` is surfaced on the science
 * page in exactly those words.
 */

const inPlay = (...stages: Context['stage'][]) => (c: Context) => stages.includes(c.stage)
const notOneSided = (c: Context) => c.stage !== 'one-sided' && c.stage !== 'arranged-considering'
const isPast = (c: Context) => c.stage === 'ended' || c.stage === 'divorced' || c.stage === 'separated'
const isLive = (c: Context) => !isPast(c)

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
  chapter: 'between',
  ...extra,
})

export const RELATIONSHIP_ITEMS: Item[] = [
  /* ── satisfaction: the anchor ── */
  it('sat_1', 'Right now, being in this relationship feels good.', 'satisfaction', false, ['funk2007', 'joel2020']),
  it('sat_2', 'There are days I feel lucky it is them.', 'satisfaction', false, ['funk2007']),
  it('sat_3', 'A lot of the time, being with them is harder than it should be.', 'satisfaction', true, ['funk2007']),
  it('sat_4', 'If I imagine the next year staying exactly like this, I feel a quiet dread.', 'satisfaction', true, ['funk2007', 'joel2018'], { showWhen: isLive }),
  it('sat_5', 'I enjoy the ordinary time we spend together — not the special occasions, the ordinary time.', 'satisfaction', false, ['funk2007']),

  /* ── perceived partner commitment: #1 predictor in Joel 2020 ── */
  it('pcom_1', 'They want a future with me and they have made that clear.', 'partnerCommitment', false, ['joel2020', 'rusbult1998'], { showWhen: notOneSided }),
  it('pcom_2', 'When it comes to us, I am the one holding on harder.', 'partnerCommitment', true, ['joel2020', 'rusbult1998']),
  it('pcom_3', 'I have had to guess where I stand with them more than once.', 'partnerCommitment', true, ['joel2020']),
  it('pcom_4', 'They have given something up for this relationship.', 'partnerCommitment', false, ['rusbult1998'], { showWhen: notOneSided }),
  it('pcom_5', 'If things got genuinely hard, I believe they would stay.', 'partnerCommitment', false, ['joel2020', 'rempel1985']),

  /* ── own dedication: strongest dissolution predictor in Le 2010 ── */
  it('ded_1', 'I want this to last.', 'ownDedication', false, ['rusbult1998', 'le2010'], { showWhen: isLive }),
  it('ded_2', 'I have built parts of my future around them being in it.', 'ownDedication', false, ['rusbult1998']),
  it('ded_3', 'I am still in this mostly because of what it would cost to leave.', 'ownDedication', true, ['rusbult1995', 'rusbult1998'], { showWhen: isLive }),
  it('ded_4', 'When I picture my life in five years, they are in the picture.', 'ownDedication', false, ['rusbult1998', 'markus1986'], { showWhen: isLive }),

  /* ── appreciation: #2 in Joel 2020 ── */
  it('app_1', 'The everyday things I do for them get noticed.', 'appreciation', false, ['algoe2010', 'joel2020']),
  it('app_2', 'I feel taken for granted.', 'appreciation', true, ['algoe2010']),
  it('app_3', 'They say thank you for things they did not have to say thank you for.', 'appreciation', false, ['algoe2010']),

  /* ── perceived partner responsiveness ── */
  it('resp_1', 'They understand me — not the version of me I show people, the actual one.', 'responsiveness', false, ['reis2004', 'joel2020']),
  it('resp_2', 'When I bring up something that is bothering me, I end up regretting it.', 'responsiveness', true, ['reis2004']),
  it('resp_3', 'They take what matters to me seriously, even when they do not share it.', 'responsiveness', false, ['reis2004']),
  it('resp_4', 'I edit myself around them so that things stay calm.', 'responsiveness', true, ['reis2004', 'stark2007']),
  it('resp_5', 'When I am upset, being with them makes it better rather than worse.', 'responsiveness', false, ['reis2004']),

  /* ── conflict: demand/withdraw is a pattern, never a person ── */
  it('con_1', 'Our arguments end with something actually settled.', 'conflict', true, ['christensen1990', 'joel2020']),
  it('con_2', 'The same fight keeps coming back in different clothes.', 'conflict', false, ['christensen1990']),
  it('con_3', 'When I push to talk about a problem, they go quiet or leave the room.', 'conflict', false, ['christensen1990']),
  it('con_4', 'When they push to talk about a problem, I shut down.', 'conflict', false, ['christensen1990']),
  it('con_5', 'Things get said in our fights that are meant to wound.', 'conflict', false, ['christensen1990']),
  it('con_6', 'After a fight, one of us finds a way back within a day.', 'conflict', true, ['christensen1990']),

  /* ── trust ── */
  it('tru_1', 'I can predict how they will behave when it matters.', 'trust', false, ['rempel1985']),
  it('tru_2', 'I check up on them in ways I would not want them to know about.', 'trust', true, ['rempel1985']),
  it('tru_3', 'I believe they would choose me even when it cost them something.', 'trust', false, ['rempel1985', 'le2010']),
  it('tru_4', 'Something happened that I have not fully let go of.', 'trust', true, ['rempel1985']),

  /* ── ambivalence: bigger effect than satisfaction in Le 2010 ── */
  it('amb_1', 'I think about ending it.', 'ambivalence', false, ['joel2018', 'le2010'], { format: 'likert5', showWhen: isLive }),
  it('amb_2', 'I have imagined my life without them and felt relief.', 'ambivalence', false, ['joel2018'], { showWhen: isLive }),
  it('amb_3', 'I am clear that I want to be in this.', 'ambivalence', true, ['joel2018'], { showWhen: isLive }),
  it('amb_4', 'I have almost ended it and then did not.', 'ambivalence', false, ['joel2018', 'rusbult1995'], { showWhen: isLive }),

  /* ── constraint: the HOLD axis. The founder's own case, made measurable. ── */
  it('cons_1', 'Too much time has gone into this for me to walk away now.', 'constraint', false, ['rusbult1998', 'rusbult1995'], { chapter: 'holding' }),
  it('cons_2', 'If this ended, I would be letting a lot of people down.', 'constraint', false, ['rusbult1998'], { chapter: 'holding' }),
  it('cons_3', 'Ending it would make me the one who broke something — the villain in the story.', 'constraint', false, ['rusbult1995', 'kegan2009'], { chapter: 'holding' }),
  it('cons_4', 'Staying is what loyalty means. Leaving would mean I was never serious.', 'constraint', false, ['kegan2009', 'miller2013'], { chapter: 'holding' }),
  it('cons_5', 'I worry about what would happen to them if I left.', 'constraint', false, ['joel2018'], { chapter: 'holding' }),
  it('cons_6', 'Practically — money, living situation, family, marriage plans — leaving would be complicated.', 'constraint', false, ['rusbult1998'], { chapter: 'holding' }),

  /* ── alternatives ── */
  it('alt_1', 'If this ended, I would be okay eventually.', 'alternatives', false, ['rusbult1998', 'rusbult1995'], { chapter: 'holding' }),
  it('alt_2', 'I would not find anyone else who would have me.', 'alternatives', true, ['rusbult1995'], { chapter: 'holding' }),
  it('alt_3', 'I have a life outside this relationship that I would still have.', 'alternatives', false, ['rusbult1998', 'ryan2000'], { chapter: 'holding' }),
  it('alt_4', 'The idea of being single frightens me more than the idea of staying unhappy.', 'alternatives', true, ['rusbult1995'], { chapter: 'holding' }),

  /* ── family approval: not a footnote in India ── */
  it('fam_1', 'My family is behind this relationship.', 'familyApproval', false, ['sprecher1992'], { chapter: 'holding', showWhen: (c) => c.familyInPlay }),
  it('fam_2', 'Their family is behind it.', 'familyApproval', false, ['sprecher1992'], { chapter: 'holding', showWhen: (c) => c.familyInPlay && notOneSided(c) }),
  it('fam_3', 'There is a difference in background — caste, community, religion, money, language — that is being treated as a problem.', 'familyApproval', true, ['sprecher1992'], { chapter: 'holding', showWhen: (c) => c.familyInPlay }),
  it('fam_4', 'I have been given a deadline, directly or indirectly.', 'familyApproval', true, ['sprecher1992'], { chapter: 'holding', showWhen: (c) => c.familyInPlay }),
  it('fam_5', 'What people would say is shaping what I do.', 'familyApproval', true, ['sprecher1992'], { chapter: 'holding' }),
  it('fam_6', 'My closest friends think I should stay.', 'familyApproval', false, ['sprecher1992'], { chapter: 'holding' }),

  /* ── growth / self-expansion ── */
  it('gro_1', 'I have become more of who I want to be since this started.', 'growth', false, ['aron1986', 'drigotas1999']),
  it('gro_2', 'This relationship has cost me things I was building — studies, work, friendships, health.', 'growth', true, ['aron1986'], { chapter: 'holding' }),
  it('gro_3', 'They actively want me to become the person I am trying to become.', 'growth', false, ['drigotas1999']),
  it('gro_4', 'We are heading in different directions with our lives.', 'growth', true, ['aron1986'], { showWhen: isLive }),
  it('gro_5', 'I have made myself smaller to keep this working.', 'growth', true, ['drigotas1999', 'stark2007']),

  /* ── closeness: rendered as the picture it is ── */
  {
    id: 'clo_1',
    text: 'How much do your life and theirs overlap?',
    format: 'likert7',
    dimension: 'closeness',
    reverse: false,
    sources: ['aron1992'],
    licence: 'aaina-authored',
    chapter: 'between',
  },
  it('clo_2', 'We have separate lives that happen to meet sometimes.', 'closeness', true, ['aron1992']),
  it('clo_3', 'When something good happens to me, they are the first person I want to tell.', 'closeness', false, ['aron1992', 'algoe2010']),
  it('clo_4', 'There are whole parts of my week they know nothing about.', 'closeness', true, ['aron1992', 'reis2004']),

  /* ── sexual satisfaction: opt-in, and skipping changes nothing ── */
  it('sex_1', 'The physical side of this feels good to me.', 'sexualSatisfaction', false, ['joel2020'], { showWhen: (c) => notOneSided(c) && isLive(c) }),
  it('sex_2', 'I have gone along with physical closeness when I did not want to.', 'sexualSatisfaction', true, ['joel2020', 'stark2007'], { showWhen: (c) => notOneSided(c) && isLive(c) }),
  it('sex_3', 'We can talk about this side of things without it becoming an argument.', 'sexualSatisfaction', false, ['joel2020', 'christensen1990'], { showWhen: (c) => notOneSided(c) && isLive(c) }),
  it('sex_4', 'How often it happens is a source of tension between us.', 'sexualSatisfaction', true, ['joel2020'], { showWhen: (c) => notOneSided(c) && isLive(c) }),

  /* ── one-sided love: a first-class situation, not an edge case ── */
  it('one_1', 'They do not know how I feel.', 'partnerCommitment', true, ['joel2018'], { showWhen: inPlay('one-sided') }),
  it('one_2', 'I have been waiting for something to change for a long time.', 'ambivalence', false, ['joel2018', 'rusbult1995'], { showWhen: inPlay('one-sided', 'talking') }),
  it('one_3', 'I have put parts of my life on hold for a possibility.', 'growth', true, ['aron1986', 'rusbult1995'], { showWhen: inPlay('one-sided', 'talking'), chapter: 'holding' }),

  /* ── arranged-considering: a yes/no is being asked of them, on very little data ── */
  it('arr_1', 'I have been given enough time and access to actually decide.', 'autonomy', false, ['ryan2000'], { showWhen: inPlay('arranged-considering'), chapter: 'holding' }),
  it('arr_2', 'The pressure to say yes is coming from outside me.', 'autonomy', true, ['ryan2000', 'sprecher1992'], { showWhen: inPlay('arranged-considering'), chapter: 'holding' }),
  it('arr_3', 'In the time we have spent together, I felt like myself.', 'responsiveness', false, ['reis2004'], { showWhen: inPlay('arranged-considering') }),
  it('arr_4', 'There is something I have noticed and decided not to think about.', 'trust', true, ['rempel1985'], { showWhen: inPlay('arranged-considering') }),

  /* ── after it has ended ── */
  it('end_1', 'I still go over what I could have done differently.', 'rumination', false, ['treynor2003'], { showWhen: isPast, chapter: 'patterns' }),
  it('end_2', 'I blame myself for how it ended.', 'coreBeliefSelf', true, ['neff2003', 'treynor2003'], { showWhen: isPast, chapter: 'patterns' }),
  it('end_3', 'People around me expect me to be over it by now.', 'relatedness', true, ['ryan2000'], { showWhen: isPast, chapter: 'patterns' }),

  /* ── the prediction gap: a two-person fact that works in solo mode ── */
  {
    id: 'pred_resp',
    text: 'Before you answer for yourself — if they were doing this right now, how do you think THEY would rate: "I feel understood in this relationship"?',
    format: 'predict',
    dimension: null,
    reverse: false,
    sources: ['joel2020', 'reis2004'],
    licence: 'aaina-authored',
    chapter: 'between',
    predicts: 'resp_1',
    showWhen: notOneSided,
  },
  {
    id: 'pred_amb',
    text: 'And how often do you think THEY think about ending it?',
    format: 'predict',
    dimension: null,
    reverse: false,
    sources: ['joel2018'],
    licence: 'aaina-authored',
    chapter: 'between',
    predicts: 'amb_1',
    showWhen: (c) => notOneSided(c) && isLive(c),
  },

  /* ── couple mode: the one thing the second person writes, knowing who reads it ── */
  {
    id: 'partner_note',
    text: 'Is there one thing you want them to know?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['reis2004'],
    licence: 'aaina-authored',
    chapter: 'between',
    placeholder: 'Optional. They will read this exactly as you write it — nothing here is summarised or softened. Skip it and nothing else changes.',
    showWhen: () => false,
  },

  /* ── free text: the quote bank. Every report must contain their own words. ── */
  {
    id: 'txt_why',
    text: 'In your own words: what made you open this today?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['miller2013'],
    licence: 'aaina-authored',
    chapter: 'story',
    placeholder: 'Whatever is actually on your mind. No one reads this but you and the analysis.',
  },
  {
    id: 'txt_best',
    text: 'Describe one moment with them that you would not trade.',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['algoe2010', 'christensen2004'],
    licence: 'aaina-authored',
    chapter: 'story',
    placeholder: 'One specific moment. A day, a conversation, something small.',
  },
  {
    id: 'txt_worst',
    text: 'And the moment you keep coming back to, that you wish you could undo.',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['christensen2004', 'treynor2003'],
    licence: 'aaina-authored',
    chapter: 'story',
    placeholder: 'Take your time with this one.',
  },
  {
    id: 'txt_friend',
    text: 'Imagine your closest friend described this exact situation to you — their situation, not yours. What would you tell them to do?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['grossmann2014', 'kross2014'],
    licence: 'aaina-authored',
    chapter: 'holding',
    placeholder: 'Say it the way you would actually say it to them.',
  },
  {
    id: 'txt_fear',
    text: 'What is the thing you are most afraid is true here?',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['kegan2009', 'miller2013'],
    licence: 'aaina-authored',
    chapter: 'holding',
    placeholder: 'The one you have not said out loud.',
  },
]
