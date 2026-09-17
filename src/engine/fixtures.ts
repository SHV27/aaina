import type { AssessmentInput, Context, AnswerMap, Item } from './types'
import { ALL_ITEMS, SAFETY_ITEMS, ITEM_BY_ID } from '../items'
import { scaleFor } from './score'

/**
 * Test personas.
 *
 * These are people, not fixtures. Each one is a real shape from the recon — the Indian problem
 * taxonomy put family-system problems in seven of the top seven slots, so most of these are not
 * "unhappy couple" variants. Two of them (aarti / meera) are deliberately SIMILAR so the
 * anti-generic harness has to work for the hard case, not just the easy one.
 *
 * They are also the only thing `scripts/eval-*` is allowed to send to Gemini: synthetic people,
 * invented here, with no real person's data in them.
 */

export const CTX: Context = {
  lens: 'relationship',
  voice: 'solo',
  stage: 'dating',
  help: ['decide', 'understand'],
  durationBucket: '2-5y',
  familyInPlay: true,
  ageBand: '22-25',
}

let order = 0
export function ans(itemId: string, value: number | string, opts: { revisions?: number; dwellMs?: number } = {}) {
  return {
    itemId,
    value,
    revisions: opts.revisions ?? 0,
    dwellMs: opts.dwellMs ?? 6000,
    order: order++,
  }
}

export function resetOrder() { order = 0 }

/** Fill every unanswered scored item for a lens at a given POMP-ish level (1..5 raw). */
export function fill(base: AnswerMap, raw: number, only?: (i: Item) => boolean): AnswerMap {
  const out: AnswerMap = { ...base }
  for (const i of ALL_ITEMS) {
    if (i.format !== 'likert5' && i.format !== 'likert7') continue
    if (!i.dimension) continue
    if (only && !only(i)) continue
    if (out[i.id]) continue
    const s = scaleFor(i)
    const v = Math.min(s.max, Math.max(s.min, i.format === 'likert7' ? Math.round((raw / 5) * s.max) : raw))
    out[i.id] = ans(i.id, v)
  }
  return out
}

function input(context: Context, answers: AnswerMap, safetyAnswers: AnswerMap = {}, skipped: string[] = []): AssessmentInput {
  return { context, answers, safetyAnswers, skipped, startedAt: 0, finishedAt: 2_700_000 }
}

/* ────────────────────────────  the people  ──────────────────────────── */

/**
 * ARJUN — the acceptance scene. Second year of college. Loves her. Families are worlds apart.
 * They have stopped growing in the same direction. He believes leaving makes him the villain,
 * and he believes staying is what loyalty means. Quality low, Hold very high, Pull low.
 * If Aaina cannot reach "held by cost" for Arjun, it is not built.
 */
export function arjun(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }

  put('ctx_stage', 'dating'); put('ctx_duration', '2-5y'); put('ctx_family', 'yes'); put('ctx_age', '18-21')

  // it does not feel good any more
  put('sat_1', 2); put('sat_2', 3); put('sat_3', 4); put('sat_4', 4); put('sat_5', 2)
  // he is holding it alone
  put('pcom_1', 2); put('pcom_2', 5); put('pcom_3', 4); put('pcom_4', 2); put('pcom_5', 3)
  // and he is fully committed anyway — the contradiction that defines him
  put('ded_1', 5, { revisions: 3, dwellMs: 71_000 }); put('ded_2', 5); put('ded_3', 4); put('ded_4', 3)
  put('app_1', 2); put('app_2', 4); put('app_3', 2)
  put('resp_1', 2); put('resp_2', 4); put('resp_3', 2); put('resp_4', 4); put('resp_5', 2)
  put('con_1', 2); put('con_2', 5); put('con_3', 3); put('con_4', 4); put('con_5', 2); put('con_6', 3)
  // trust is intact — which is what makes this hard, and triggers an exclusion claim
  put('tru_1', 4); put('tru_2', 1); put('tru_3', 4); put('tru_4', 2)
  put('amb_1', 4); put('amb_2', 4); put('amb_3', 2); put('amb_4', 4)
  // HOLD: maximal
  put('cons_1', 5); put('cons_2', 5); put('cons_3', 5); put('cons_4', 5); put('cons_5', 5); put('cons_6', 4)
  put('alt_1', 2); put('alt_2', 4); put('alt_3', 2); put('alt_4', 4)
  put('fam_1', 1); put('fam_2', 2); put('fam_3', 5); put('fam_4', 4); put('fam_5', 5); put('fam_6', 2)
  put('gro_1', 2); put('gro_2', 5); put('gro_3', 2); put('gro_4', 5); put('gro_5', 4)
  put('clo_1', 5); put('clo_2', 3)
  put('sex_1', 3); put('sex_2', 1)
  put('anx_1', 4); put('anx_2', 4); put('anx_3', 4); put('anx_4', 2)
  put('avo_1', 2); put('avo_2', 4); put('avo_3', 2); put('avo_4', 3)
  put('emo_1', 2); put('emo_2', 4); put('emo_3', 4); put('emo_4', 2)
  put('life_1', 2); put('life_2', 2); put('life_3', 2); put('life_4', 4)
  put('pred_resp', 4); put('pred_amb', 2)
  put('val_pick', 'benevolence,tradition,achievement')
  put('val_write', 'I stayed back from a trip my friends had planned for a year because she was not doing well that week. I did not tell her that was why. I just said I could not afford it.')
  put('val_alloc', 15)
  put('txt_why', 'I do not know if I am being loyal or if I am just scared of being the person who ruined everything. My parents will never agree and she knows it. I have already lost a year of my degree to this.')
  put('txt_best', 'The night before my second semester exams she stayed on call with me till 4am, not talking, just there, so I would not fall asleep. Nobody has ever done that for me.')
  put('txt_worst', 'When I told her my father had said no for the last time and she just went quiet and said okay. She did not fight for it. That okay is still in my head.')
  put('txt_friend', 'I would tell him it is already over and he is just paying interest on it. I would tell him that he is not saving her by staying, he is just making the ending more expensive for both of them.')
  put('txt_fear', 'That I wasted the best years I had and I did it to myself, and that she will be fine and I will not.')

  return input({ ...CTX, stage: 'dating', ageBand: '18-21' }, a, {}, ['sco_4', 'rum_4'])
}

/**
 * PRIYA — the family-system case. The relationship itself is genuinely good; the world around it
 * is not. Aaina must be able to conclude "the problem is not between you two."
 */
export function priya(): AssessmentInput {
  resetOrder()
  const a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }

  put('ctx_stage', 'dating'); put('ctx_duration', '2-5y'); put('ctx_family', 'yes'); put('ctx_age', '26-30')
  put('sat_1', 4); put('sat_2', 5); put('sat_3', 2); put('sat_4', 2); put('sat_5', 4)
  put('pcom_1', 5); put('pcom_2', 2); put('pcom_3', 2); put('pcom_4', 5); put('pcom_5', 5)
  put('ded_1', 5); put('ded_2', 4); put('ded_3', 1); put('ded_4', 5)
  put('app_1', 4); put('app_2', 2); put('app_3', 4)
  put('resp_1', 5); put('resp_2', 2); put('resp_3', 5); put('resp_4', 2); put('resp_5', 5)
  put('con_1', 4); put('con_2', 2); put('con_3', 2); put('con_4', 2); put('con_5', 1); put('con_6', 5)
  put('tru_1', 5); put('tru_2', 1); put('tru_3', 5); put('tru_4', 1)
  put('amb_1', 2); put('amb_2', 1); put('amb_3', 5); put('amb_4', 1)
  put('cons_1', 3); put('cons_2', 4); put('cons_3', 2); put('cons_4', 2); put('cons_5', 2); put('cons_6', 3)
  put('alt_1', 4); put('alt_2', 1); put('alt_3', 4); put('alt_4', 1)
  // the whole drag is here
  put('fam_1', 1); put('fam_2', 1); put('fam_3', 5); put('fam_4', 5); put('fam_5', 5); put('fam_6', 4)
  put('gro_1', 4); put('gro_2', 2); put('gro_3', 5); put('gro_4', 2); put('gro_5', 2)
  put('clo_1', 6); put('clo_2', 2)
  put('sex_1', 4); put('sex_2', 1)
  put('anx_1', 3); put('anx_2', 3); put('anx_3', 2); put('anx_4', 4)
  put('avo_1', 2); put('avo_2', 3); put('avo_3', 4); put('avo_4', 2)
  put('emo_1', 4); put('emo_2', 3); put('emo_3', 2); put('emo_4', 4)
  put('life_1', 3); put('life_2', 3); put('life_3', 3); put('life_4', 2)
  put('pred_resp', 4); put('pred_amb', 2)
  put('val_pick', 'tradition,benevolence,security')
  put('val_write', 'I moved back to my parents city after my masters because my mother was alone, even though the job I wanted was in Bangalore.')
  put('val_alloc', 55)
  put('txt_why', 'Everyone keeps asking when. His family is from a different community and mine has stopped discussing it. I am 28 and my relatives have started suggesting other rishtas to my mother directly.')
  put('txt_best', 'He learned to make the tea exactly how my father takes it, before he had even met him, in case he ever got the chance.')
  put('txt_worst', 'My mother crying in the kitchen and saying she would not be able to show her face, and me not being able to say anything back.')
  put('txt_friend', 'I would ask her whether the problem is the man or the people around the man, because those need completely different answers.')
  put('txt_fear', 'That I will pick one and lose the other either way.')

  return input({ ...CTX, stage: 'dating', ageBand: '26-30' }, a)
}

/**
 * AARTI and MEERA — deliberately SIMILAR profiles. Same stage, same duration, close scores.
 * The transplant gate has to separate these two, not just the obvious pairs. If Aaina writes
 * interchangeable reports for them, the founder's central promise has failed.
 */
export function aarti(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }
  put('ctx_stage', 'married'); put('ctx_duration', '5-10y'); put('ctx_family', 'somewhat'); put('ctx_age', '31-40')
  a = fill(a, 3)
  put('sat_1', 3); put('sat_3', 3); put('amb_1', 3)
  put('resp_1', 2); put('resp_4', 4)          // the difference: she edits herself
  put('app_1', 2); put('app_2', 4)
  put('tru_1', 4); put('tru_3', 4)
  put('con_3', 4); put('con_4', 2)            // she pursues, he withdraws
  put('val_pick', 'selfDirection,achievement,hedonism')
  put('val_write', 'I turned down a promotion that needed travel because it would have meant he did all the school runs, and I never told him it was on the table.')
  put('val_alloc', 20)
  put('txt_why', 'We are fine. That is the problem. We are completely fine and I feel like I have gone missing somewhere inside it.')
  put('txt_best', 'Driving back from Lonavala in the rain, both of us singing badly, before the kids.')
  put('txt_worst', 'Realising at my own birthday dinner that I had nothing to say to him that was not logistics.')
  put('txt_friend', 'I would tell her that fine is not the same as alive and she is allowed to want more than fine.')
  put('txt_fear', 'That this is just what marriage is and I am the ungrateful one.')
  return input({ ...CTX, stage: 'married', durationBucket: '5-10y', familyInPlay: true, ageBand: '31-40' }, a)
}

export function meera(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }
  put('ctx_stage', 'married'); put('ctx_duration', '5-10y'); put('ctx_family', 'somewhat'); put('ctx_age', '31-40')
  a = fill(a, 3)
  put('sat_1', 3); put('sat_3', 3); put('amb_1', 3)
  put('resp_1', 3); put('resp_4', 3)
  put('app_1', 2); put('app_2', 4)
  put('tru_1', 4); put('tru_3', 4)
  put('con_3', 2); put('con_4', 4)            // the mirror image: she withdraws, he pursues
  put('val_pick', 'security,benevolence,tradition')
  put('val_write', 'I gave my sister the money I had saved for three years for my own course, when her husband lost his job, and I have not restarted saving.')
  put('val_alloc', 25)
  put('txt_why', 'He wants to talk about it constantly and I want twenty minutes where nobody needs anything from me. I have started staying late at work for the quiet.')
  put('txt_best', 'The week after my father died, he did not say a single wise thing. He just did everything, silently, for nine days.')
  put('txt_worst', 'Telling him I needed space and watching his face, and then spending the whole night making it up to him instead of taking the space.')
  put('txt_friend', 'I would tell her that needing room is not the same as not loving someone, and that she has never once said it out loud without immediately taking it back.')
  put('txt_fear', 'That the quiet I want is actually me having already left.')
  return input({ ...CTX, stage: 'married', durationBucket: '5-10y', familyInPlay: true, ageBand: '31-40' }, a)
}

/** ROHIT — the self lens. Know Thyself, no relationship in it at all. */
export function rohit(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }
  put('ctx_age', '22-25')
  a = fill(a, 3, (i) => i.chapter === 'you' || i.chapter === 'patterns' || i.chapter === 'future')
  put('scc_1', 2); put('scc_2', 5); put('scc_3', 2); put('scc_4', 5); put('scc_5', 2)
  put('cbs_1', 4); put('cbs_2', 5); put('cbs_3', 5); put('cbs_4', 4); put('cbs_5', 5); put('cbs_6', 5)
  put('sco_1', 4); put('sco_2', 5); put('sco_3', 4); put('sco_4', 2)
  put('rum_1', 5, { revisions: 2, dwellMs: 48_000 }); put('rum_2', 5); put('rum_3', 5); put('rum_4', 2)
  put('aut_1', 2); put('aut_2', 4); put('aut_3', 5)
  put('fut_1', 2); put('fut_2', 4); put('fut_3', 3); put('fut_4', 2)
  put('val_pick', 'achievement,selfDirection,security')
  put('val_write', 'I said no to my uncles offer to put me in his firm, which caused three months of silence at home, because I wanted to find something myself.')
  put('val_alloc', 20)
  put('txt_why', 'I have a good job and I cannot explain to anyone why I feel like I am watching my own life from outside it.')
  put('fut_write', 'I wake up somewhere with light in the morning, I work on something that is mine, I am not performing for anyone at breakfast.')
  put('fut_gap', 'The ability to disappoint people I love and survive it.')
  put('fut_block', 'That if I stop being useful to everyone there is no reason for anyone to keep me around.')
  return input({ lens: 'self', voice: 'solo', stage: 'dating', help: ['understand'], durationBucket: null, familyInPlay: true, ageBand: '22-25' }, a)
}

/** A safety-disclosing variant of arjun's partner-case, used ONLY for the LAW 5 test. */
export function withSafetyDisclosure(base: AssessmentInput): AssessmentInput {
  resetOrder()
  const safety: AnswerMap = {}
  for (const id of ['saf_phys', 'saf_escalate', 'saf_monitor', 'saf_isolate', 'saf_inlaws']) {
    if (ITEM_BY_ID[id]) safety[id] = ans(id, 5)
  }
  safety['saf_text'] = ans('saf_text', 'It has happened three times. His mother was in the room the last time and said nothing.')
  return { ...base, safetyAnswers: safety }
}

/** No safety answers at all — the control for the LAW 5 test. */
export function withoutSafetyDisclosure(base: AssessmentInput): AssessmentInput {
  return { ...base, safetyAnswers: {} }
}

export const PERSONAS = { arjun, priya, aarti, meera, rohit }
export const SAFETY_ITEM_IDS = SAFETY_ITEMS.map((i) => i.id)
