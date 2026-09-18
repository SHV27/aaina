import type { AssessmentInput, AnswerMap } from './types'
import { ans, fill, resetOrder, makeInput, CTX } from './fixtures'

/* ────────────────────────  problems that are not "should I stay"  ────────────────────────
 *
 * Every persona in fixtures.ts arrived with some version of a decision, which is the shape the
 * product was originally built for and the shape the scope note says is a small fraction of why
 * people actually see a therapist. These two do not. Nisha's relationship is not in question and
 * neither is Vikram's; both have a specific, ordinary, unsolved problem, which is what most
 * people have.
 *
 * They exist so that "any relationship problem that exists in the world gets real help here" is
 * something the test suite can check rather than something the README claims. One is a
 * Western-type problem that is now thoroughly Indian; the other could not be more Indian.
 */

/**
 * NISHA — eight months after the baby. Nobody is leaving anybody. The load is not being shared,
 * money has become the thing they cannot discuss, and both of them are too tired to be careful.
 * The failure to guard against is handing a stay-or-leave verdict to a couple who asked how to
 * survive a Tuesday.
 */
export function nisha(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }
  put('ctx_stage', 'married'); put('ctx_duration', '2-5y'); put('ctx_family', 'somewhat'); put('ctx_age', '26-30')
  a = fill(a, 3)

  // the relationship itself is not the problem — these stay solid
  put('tru_1', 5); put('tru_2', 1); put('tru_3', 5); put('tru_4', 1)
  put('ded_1', 5); put('ded_2', 5); put('ded_3', 1); put('ded_4', 5)
  put('amb_1', 1); put('amb_2', 1); put('amb_3', 5); put('amb_4', 1)
  put('alt_1', 4); put('alt_2', 1)

  // everything that runs on spare capacity has collapsed
  put('sat_1', 3); put('sat_3', 4); put('sat_5', 2)
  put('app_1', 2); put('app_2', 4); put('app_3', 2)
  put('resp_1', 2); put('resp_2', 4); put('resp_4', 4)
  put('con_1', 2); put('con_2', 5); put('con_3', 4); put('con_5', 2)
  put('clo_3', 2); put('clo_4', 4)
  put('life_1', 2); put('life_2', 2); put('life_3', 2)
  put('emo_3', 5); put('emo_4', 2)

  put('val_pick', 'benevolence,security,achievement')
  put('val_write', 'I took the six months unpaid because his job pays more, and I have never said out loud that I did not want to.')
  put('val_alloc', 10)
  put('txt_why', 'We have not had one conversation about money since the baby that did not end with somebody leaving the room.')
  put('txt_best', 'He did every single night feed for the first three weeks without being asked, and without telling anyone he was doing it.')
  put('txt_worst', 'Saying the creche fees out loud in the kitchen and watching him put his plate down and walk out.')
  put('txt_friend', 'I would tell her that two exhausted people are not an incompatible couple, and that she is comparing this year to a year when they both slept.')
  put('txt_fear', 'That this is not a bad patch. That this is just what we are now.')
  put('con_help', 'repair')
  put('con_story', 'Our daughter is eight months old. I went back to work in March and we have not managed a single conversation about money since. He thinks I am attacking his salary and I am not, I am drowning. I do the creche, the doctor, the vaccinations, the list of what we have run out of. He does bedtime and thinks we are even. Neither of us is a bad person and both of us are completely on our own in this.')
  put('con_tried', 'We tried talking about it properly twice, both times after ten at night, both times it turned into a fight. I made a spreadsheet which he found accusatory. I have mostly kept quiet about it for two months because I do not have the energy for the argument.')
  put('con_change', 'That he would notice one thing needed doing and do it, without me having to be the one who knows about it.')

  return makeInput(
    { ...CTX, stage: 'married', help: ['repair'], durationBucket: '2-5y', familyInPlay: true, ageBand: '26-30' },
    a,
  )
}

/**
 * VIKRAM — a year married, and his parents want the couple to move in with them. His wife does
 * not. He is not choosing between two people; he is standing in the one place both of them can
 * reach him.
 *
 * No side may be taken here. His mother is frightened of being old, which is not the same as
 * being controlling, and his wife is watching six years of her own life disappear, which is not
 * the same as being selfish. The word "boundaries" is useless to somebody who will be at the same
 * dinner table on Sunday.
 */
export function vikram(): AssessmentInput {
  resetOrder()
  let a: AnswerMap = {}
  const put = (id: string, v: number | string, o?: { revisions?: number; dwellMs?: number }) => { a[id] = ans(id, v, o) }
  put('ctx_stage', 'married'); put('ctx_duration', '6m-2y'); put('ctx_family', 'yes'); put('ctx_age', '26-30')
  a = fill(a, 4)

  // the marriage itself is in good shape
  put('sat_1', 4); put('sat_3', 2); put('sat_5', 4)
  put('tru_1', 5); put('tru_3', 5); put('tru_2', 1); put('tru_4', 1)
  put('amb_1', 1); put('amb_3', 5)
  put('clo_3', 4); put('clo_4', 2)

  // conflict is located in exactly one place
  put('con_1', 3); put('con_2', 5); put('con_3', 3); put('con_4', 3); put('con_5', 3)

  // and the family dimension is where all of it lives
  // Both families approve of the marriage itself. What is low is everything about expectation
  // and obligation, which is a completely different family problem from disapproval.
  put('fam_1', 4); put('fam_2', 4); put('fam_3', 1); put('fam_4', 4); put('fam_5', 5); put('fam_6', 4)
  put('cons_1', 4); put('cons_3', 4); put('cons_5', 3)
  put('aut_1', 2); put('aut_2', 4); put('aut_3', 5)

  put('val_pick', 'tradition,benevolence,conformity')
  put('val_write', 'I turned down a posting in Pune that I wanted because my father had his stent put in that year, and I am the only son.')
  put('val_alloc', 60)
  put('txt_why', 'My parents want us to move in with them and my wife does not, and both of them are being completely reasonable, and I am the only one who has to choose.')
  put('txt_best', 'She sat with my mother for two hours at the hospital and did not once look at her phone or make it about us.')
  put('txt_worst', 'My mother asking me, in front of my wife, whether I had forgotten who raised me.')
  put('txt_friend', 'I would tell him his mother is not trying to hurt his wife. She is frightened of being old and alone, and that is a different problem with a different answer.')
  put('txt_fear', 'That whatever I do, one of them spends the rest of her life thinking I chose the other one.')
  put('con_help', 'understand')
  put('con_story', 'We got married last year. My parents assumed we would move into the ground floor of their house and my wife assumed we would not, and nobody said it out loud until the lease came up for renewal. My mother is not a difficult woman. My wife is not being selfish. My father had a stent put in two years ago and my mother is genuinely frightened of what happens next. My wife had her own flat for six years before this and she is watching it disappear. Every conversation about it ends with somebody crying and me apologising to both of them separately.')
  put('con_tried', 'I told my parents we needed time, which they heard as no. Then I told my wife we should at least consider it, which she heard as yes. I have mostly handled it by managing each of them separately so that they never have the conversation with each other.')
  put('con_change', 'That my mother and my wife would have one conversation that I was not in the middle of.')

  /* The paired distance, measured as Hwang measures it: what he holds, and what he believes they
     hold. He is clear this is theirs to decide together; they are equally clear it is the family's.
     Neither end is the wrong answer and the report may never imply otherwise. */
  put('gap_self', 5); put('gap_family', 1)
  put('gap_sayable', 2); put('gap_regulated', 3); put('gap_contact', 4)
  /* Both halves of filial piety, held at once and firmly — which is the whole point of measuring
     them apart. He genuinely wants to care for them AND he obeys against his own judgement. */
  put('fil_recip', 5); put('fil_auth', 4); put('fil_why', 2)

  return makeInput(
    { ...CTX, stage: 'married', help: ['understand', 'repair'], durationBucket: '6m-2y', familyInPlay: true, ageBand: '26-30' },
    a,
  )
}
