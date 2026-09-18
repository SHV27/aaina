import type { AssessmentInput, AnswerMap } from './types'
import { ans, fill, resetOrder, makeInput, CTX } from './fixtures'

/**
 * THE HARDEST TWO.
 *
 * The standard is that this has to be equally strong for a small fix and for a decision that ends
 * a marriage. Small fixes were well covered and the ending was not tested at all, which is the
 * wrong way round — the person deciding whether to end fourteen years is the one with the least
 * help available to them anywhere else, and the one for whom a glib report does the most damage.
 *
 * Neither of these people may be told what to do. Aaina is directive about the formulation and
 * non-directive about the decision, and that distinction is the difference between a therapist
 * and a stranger with an opinion.
 */

/**
 * SUNITA — fourteen years, two children, and she is deciding.
 *
 * Nothing is happening to her that has a name. Nobody hits anybody, nobody is unfaithful, and
 * that is precisely why she has had nowhere to take this: every framework she has found needs a
 * villain and there isn't one. What her answers hold is a relationship that is being kept in
 * place entirely by what leaving would cost — which is the one verdict this engine is built to
 * be able to reach, and the one it must never turn into an instruction.
 */
export function sunita(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }
  put('ctx_stage', 'married'); put('ctx_duration', '10y+'); put('ctx_family', 'yes'); put('ctx_age', '40+')
  a = fill(a, 3)

  // quality: gone, and not dramatically
  put('sat_1', 1); put('sat_2', 2); put('sat_3', 5); put('sat_4', 4); put('sat_5', 1)
  put('app_1', 1); put('app_2', 5); put('app_3', 1)
  put('resp_1', 1); put('resp_2', 5); put('resp_3', 2); put('resp_4', 5); put('resp_5', 1)
  put('clo_1', 2); put('clo_2', 5); put('clo_3', 1); put('clo_4', 5)
  put('gro_1', 1); put('gro_2', 5); put('gro_3', 1); put('gro_4', 5); put('gro_5', 5)

  // pull: almost nothing left
  put('ded_1', 2, { revisions: 4, dwellMs: 96_000 }); put('ded_2', 2); put('ded_3', 4); put('ded_4', 2)
  put('amb_1', 5); put('amb_2', 5); put('amb_3', 1); put('amb_4', 5)

  // trust is intact, which is what has made this so hard to justify to anybody
  put('tru_1', 5); put('tru_2', 1); put('tru_3', 3); put('tru_4', 2)

  // hold: everything
  put('cons_1', 5); put('cons_2', 5); put('cons_3', 5); put('cons_4', 5); put('cons_5', 5); put('cons_6', 5)
  put('alt_1', 2); put('alt_2', 4); put('alt_3', 2); put('alt_4', 5)
  put('fam_1', 2); put('fam_2', 2); put('fam_3', 1); put('fam_4', 2); put('fam_5', 5); put('fam_6', 5)
  put('gap_self', 5); put('gap_family', 1); put('gap_sayable', 1); put('gap_regulated', 2); put('gap_contact', 5)
  put('fil_recip', 4); put('fil_auth', 4); put('fil_why', 2)

  put('anx_1', 2); put('anx_2', 2); put('anx_3', 2); put('anx_4', 4)
  put('avo_1', 3); put('avo_2', 5); put('avo_3', 2); put('avo_4', 5)
  put('emo_1', 3); put('emo_2', 5); put('emo_3', 2); put('emo_4', 4)
  put('life_1', 2); put('life_2', 2); put('life_3', 1); put('life_4', 4)
  put('pred_resp', 2); put('pred_amb', 4)

  put('val_pick', 'benevolence,security,selfDirection')
  put('val_write', 'I did not take the transfer to Hyderabad in 2016 because the children were settled and he did not want to move, and I have thought about that year every year since.')
  put('val_alloc', 10)
  put('txt_why', 'I have been deciding this for four years and I have not said it out loud once, to anybody, including him.')
  put('txt_best', 'The first year, he used to read out the funny bits of the newspaper to me while I was getting ready, every single morning, and neither of us thought that was anything.')
  put('txt_worst', 'My daughter asked me last month why I never sit in the same room as Papa, and I said I was busy, and she said okay in a way that told me she already knew.')
  put('txt_friend', 'I would tell her that fourteen years is a reason it is hard, not a reason it is right, and that her children are already watching whatever she thinks she is hiding.')
  put('txt_fear', 'That I will do it and find out the problem was me, and then I will have broken all of it for nothing.')
  put('con_help', 'decide')
  put('con_story', 'Nothing has happened. That is what I cannot explain to anyone. He is not cruel, he does not drink, he has never raised his hand, he provides, his family is decent to me. We have not had a real conversation in about six years. I do the children, the house, his parents, and I have stopped being able to remember what I was like. I have been carrying this by myself for four years because the moment I say it out loud to one person it becomes real and then everyone will have an opinion about my life.')
  put('con_tried', 'I suggested counselling twice and he said we do not need a stranger in our house. I waited for the children to get older, which they now have. I have mostly managed it by keeping busy and by not sitting in the same room as him.')
  put('con_change', 'That I would know whether this is my life ending or my life starting.')

  return makeInput(
    { ...CTX, stage: 'married', help: ['decide'], durationBucket: '10y+', familyInPlay: true, ageBand: '40+' },
    a,
  )
}

/**
 * KABIR — it is over, and he did not choose it.
 *
 * No decision is pending, so he must not be offered one. Everything a report normally does —
 * weigh, compare, recommend — is the wrong shape here, and handing a grieving person a set of
 * options is a way of telling them the thing is still open when it is not.
 */
export function kabir(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }
  put('ctx_stage', 'ended'); put('ctx_duration', '5-10y'); put('ctx_family', 'somewhat'); put('ctx_age', '31-40')
  a = fill(a, 3)

  put('sat_1', 2); put('sat_3', 4); put('sat_5', 2)
  put('amb_1', 1); put('amb_3', 4)
  put('ded_1', 5); put('ded_2', 5)
  put('alt_1', 2); put('alt_2', 4); put('alt_4', 5)
  put('anx_1', 5); put('anx_2', 5); put('anx_3', 4); put('anx_4', 1)
  put('avo_1', 2); put('avo_2', 4); put('avo_3', 2)
  put('emo_1', 2); put('emo_2', 4); put('emo_3', 5); put('emo_4', 2)
  put('life_1', 1); put('life_2', 1); put('life_3', 1); put('life_4', 5)
  put('rum_1', 5); put('rum_2', 5); put('rum_3', 5); put('rum_4', 2)
  put('scc_1', 2); put('scc_2', 4); put('scc_3', 2)
  put('sco_1', 2); put('sco_2', 5); put('sco_3', 5); put('sco_4', 1)
  put('rel_1', 3); put('rel_2', 4)

  put('val_pick', 'benevolence,security,achievement')
  put('val_write', 'I moved cities for her in 2021 and left the only job I have ever been good at, and I would do it again, which is the part I cannot explain to my brother.')
  put('val_alloc', 15)
  put('txt_why', 'She left in April and I still put two cups out. I am not asking anyone to fix it, I just want to know if this is normal or if something is wrong with me.')
  put('txt_best', 'She used to fall asleep in the middle of arguments and wake up having decided she was sorry.')
  put('txt_worst', 'Watching her pack the kitchen things she had brought, and helping her, because it was heavy.')
  put('txt_friend', 'I would tell him that five months is nothing, and that the reason it hurts this much is not weakness, it is the size of what he actually had.')
  put('txt_fear', 'That I peaked at thirty-four and the rest is admin.')
  put('con_help', 'recover')
  put('con_story', 'She left in April. There was no affair and no big fight, she said she had been unhappy for two years and I genuinely did not know. Everyone keeps telling me I will meet someone, which is not what I am asking. I want to know how to be a person again on a normal Wednesday.')
  put('con_tried', 'I went out a lot for about a month and it made it worse. I tried to keep busy. I have been over every conversation from the last two years looking for the part where I should have noticed.')
  put('con_change', 'That I would stop rehearsing what I would say if she called.')

  return makeInput(
    { ...CTX, stage: 'ended', voice: 'solo', help: ['recover'], durationBucket: '5-10y', familyInPlay: false, ageBand: '31-40' },
    a,
  )
}
