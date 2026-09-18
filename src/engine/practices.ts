import type { DimensionId, HelpMode } from './types'

/**
 * THE PRACTICE LIBRARY — what therapy actually does, as opposed to what an article explains.
 *
 * An article tells you communication matters. A therapist hands you a specific exercise, tells you
 * when to do it, what it will feel like the first time, what to do when it goes badly, and how you
 * will know it worked. That difference is the whole distance between advice in a therapy costume
 * and therapy, and it is why this file exists instead of a prompt asking a model for tips.
 *
 * Every practice is a NAMED intervention with a protocol precise enough to execute without further
 * thought. The model downstream explains the chosen practice in this person's words — it never
 * decides what the practice is, and never invents one.
 *
 * ── SUPPRESSION IS NOT DELETION ──────────────────────────────────────────────────────────────
 * The first version of this file removed contraindicated practices, which meant a person who
 * disclosed violence received a SHORTER plan than a person who disclosed nothing. That is a direct
 * violation of LAW 5 — a safety flag may only ever ADD — committed in the one place it does the
 * most harm. A contraindication now names a SUBSTITUTE: the unsafe practice is withheld, the reason
 * is stated, and something appropriate takes its place.
 *
 * ── THE INDIAN FINDING THAT CHANGES PRESCRIBING ──────────────────────────────────────────────
 * NFHS-5 records the most widely endorsed justification for wife-beating in India as a woman
 * "disrespecting her in-laws" — 32% of women and 31% of men. Coaching a daughter-in-law to hold a
 * boundary directly with her husband's parents is therefore, on the national data, among the most
 * dangerous instructions this product could issue. The structural move is that each spouse handles
 * their own parents, and `inlaw-routing` exists for precisely that.
 */

export type PracticeStage = 'now' | 'week' | 'month'

/** Conditions that change what may be offered. Derived from the assessment, never self-declared. */
export type Signal =
  | 'physicalViolence'
  | 'coerciveControl'
  | 'selfRisk'
  | 'perpetration'
  /** Extended family is a source of harm, not merely of pressure. */
  | 'familyIsTheSourceOfHarm'
  /** The other person is unavailable — one-sided, estranged, or refusing. */
  | 'partnerWillNotParticipate'
  | 'ended'
  | 'stillDeciding'

export interface Practice {
  id: string
  title: string
  /** The published intervention this is, named honestly. */
  tradition: string
  sources: string[]
  /**
   * How well established the protocol is. Printed on the page, because a reader deserves to know
   * the difference between a randomised trial and a clinical consensus we find persuasive.
   */
  evidence: 'trial' | 'clinical'
  purpose: string
  stage: PracticeStage
  minutes: number
  needsPartner: boolean
  steps: string[]
  /** What the first attempt feels like — because the first attempt usually goes badly. */
  firstTime: string
  /** What to do when it goes wrong. Every practice has this; most advice does not. */
  ifItGoesBadly: string
  /** Observable and time-boxed. Never a feeling. */
  marker: string
  indicatedFor: DimensionId[]
  modes: HelpMode[]
  /**
   * The practice a mode exists to deliver. Always included when that mode is active, before
   * ranking gets a say.
   *
   * Caught by a test: somebody whose relationship had just ended was not being offered the grief
   * practice at all, because five generally-useful items outranked it and filled the plan. The one
   * thing written for exactly their situation must not be crowded out by things written for
   * everybody. Owen et al. (2012) found six-month separation rates of 10%, 45% and 56% depending
   * on what each partner came in wanting — matching the work to the ask is not a nicety.
   */
  anchorFor?: HelpMode
  /**
   * Offered ONLY when this signal is present.
   *
   * The protective practices rank well on merit — they are short, solo, and broadly indicated — so
   * without this they were being handed to people who had disclosed nothing. A live run gave a
   * safety-planning exercise and an accountability-for-hurting-someone exercise to a person whose
   * relationship had simply ended. The first is alarming and the second is an accusation. Some
   * practices must be unreachable unless the reader's own answers reach for them.
   */
  requiresSignal?: Signal[]
  /** Signals that withhold this practice, each naming what is offered instead. */
  suppressedBy?: Partial<Record<Signal, { why: string; substitute: string | null }>>
  /**
   * A practice that must be working before this one is offered.
   *
   * Taken from how OurRelationship sequences its self-guided programme: empathic joining is gated
   * behind a successful detachment conversation, on the stated reasoning that there is no therapist
   * present to catch the bullet. An unsupported vulnerability exercise attempted by a couple who
   * cannot yet step outside their own cycle does real damage, and a self-guided product has no way
   * to intervene when it goes wrong. So the dependency is structural rather than advisory.
   */
  requires?: string
}

export const PRACTICES: Practice[] = [
  /* ══════════════ protection — offered INSTEAD of unsafe work, never instead of nothing ══════════════ */
  {
    id: 'unilateral-exit',
    title: 'Leaving the room, on your own terms',
    tradition: 'Unilateral de-escalation and safety planning (WHO LIVES first-line response)',
    sources: ['who2013', 'campbell2003'],
    evidence: 'clinical',
    purpose: 'A way out of an escalating moment that does not require the other person to agree to anything.',
    stage: 'now',
    minutes: 10,
    needsPartner: false,
    steps: [
      'Work out now, while it is calm, which room in your home has a door and a second way out. Kitchens and bathrooms are usually the worst options, and they are where people default to going.',
      'Decide in advance where you would go and who you would call, and put that person on speed dial under a name that means nothing to anybody else.',
      'Keep whatever you would need for a night away — documents, a little money, a charger, medication — somewhere you could pick up in one movement, ideally outside the house.',
      'If it starts, leave early rather than at the point it becomes obvious. Leaving early feels unreasonable, and it is the version that works.',
      'You do not have to announce any of this, and you do not have to have decided anything about the relationship to have it in place.',
    ],
    firstTime: 'Setting it up will feel like being dramatic about something that "is not that bad". Almost everyone who does it says exactly that, including people for whom it very much was.',
    ifItGoesBadly: 'If you cannot keep a bag outside the house, photograph your documents and email them to yourself. Every part of this has a smaller version that still counts.',
    marker: 'This week: you can name the room, the person and where the documents are, without having to think.',
    indicatedFor: ['emotionRegulation', 'conflict'],
    modes: ['understand', 'decide', 'endure', 'repair', 'recover'],
    requiresSignal: ['physicalViolence', 'coerciveControl', 'familyIsTheSourceOfHarm'],
  },
  {
    id: 'accountability',
    title: 'The part that comes before anything else',
    tradition: 'Accountability-first practice with people who have used violence',
    sources: ['stark2007', 'who2013'],
    evidence: 'clinical',
    purpose:
      'You told us you have hurt or frightened someone. Everything else here still applies to you — but nothing else works before this, and handing you connection exercises first would be doing you a disservice as well as them.',
    stage: 'now',
    minutes: 30,
    needsPartner: false,
    steps: [
      'Write down what you did. The actions, plainly, without the argument that preceded them and without the word "but". The sentence containing "but" is the one that keeps it happening.',
      'Write what it would have looked like from where they were standing. Not what you meant — what they saw.',
      'Accept the part that is entirely yours to act on: the behaviour was a choice even when it did not feel like one, and it is not caused by them.',
      'Find the moment before the moment — the specific point where it becomes possible. There is always one, and leaving at it is the only intervention that reliably works.',
      'Get help with this specifically. It responds well to the right kind of work and it does not resolve on willpower.',
    ],
    firstTime: 'Every instinct will pull toward context and provocation. Writing it without them is the exercise.',
    ifItGoesBadly: 'If you cannot write it without justifying it, write the justified version first, then cross out every clause beginning with "because" and read what is left.',
    marker: 'Within four weeks: you can name the moment before the moment, and you left at it once.',
    indicatedFor: ['emotionRegulation', 'conflict', 'agency'],
    modes: ['understand', 'repair', 'decide', 'endure', 'recover'],
    requiresSignal: ['perpetration'],
  },
  {
    id: 'inlaw-routing',
    title: 'Each of you handles your own parents',
    tradition: 'Structural family therapy — a boundary around the couple, not around the family',
    sources: ['christensen2004', 'sabri2024', 'who2013'],
    evidence: 'clinical',
    purpose:
      'The structural change that resolves most in-law conflict, and in India also the safest one: NFHS-5 records "disrespects her in-laws" as the most widely endorsed justification for wife-beating, which makes a daughter-in-law holding the line directly the highest-risk version of this conversation.',
    stage: 'week',
    minutes: 25,
    needsPartner: true,
    steps: [
      'Agree one rule between the two of you: whatever needs saying to his parents is said by him, and whatever needs saying to yours is said by you. No exceptions, including when the other one is "better at it".',
      'This is not about who is right. It is about who can say a hard thing to that particular set of people and still be family afterwards, which is almost always their own child.',
      'Write down the two or three things that actually need to change. Specific and small — a call before visiting, a decision the two of you make first, one evening a week that is yours.',
      'Whoever delivers it says it as their own position, not as a report of their spouse\'s. "I have decided" rather than "she wants" — the second version puts the blame exactly where it becomes dangerous.',
      'Expect it to land badly the first time, and do not add a second point. One change, delivered once, repeated calmly the next time it comes up.',
    ],
    firstTime: 'Whoever has been managing this until now will find it very hard not to step in, and stepping in undoes the whole thing.',
    ifItGoesBadly: 'If your spouse will not deliver it, that is the real finding, and it is about the two of you rather than about his parents. Worth saying to each other plainly.',
    marker: 'Within six weeks: one thing was said to his parents by him and not by you.',
    indicatedFor: ['familyApproval', 'constraint', 'conflict', 'responsiveness'],
    modes: ['repair', 'endure', 'decide'],
    suppressedBy: {
      familyIsTheSourceOfHarm: {
        why: 'Where the extended family is causing harm rather than applying pressure, a boundary conversation raises risk instead of lowering it.',
        substitute: 'unilateral-exit',
      },
      physicalViolence: {
        why: 'On the national data, in-law "disrespect" is the most widely endorsed justification for violence against a wife. This conversation is not safe here.',
        substitute: 'unilateral-exit',
      },
      partnerWillNotParticipate: { why: 'This only works if the other person does their half, and they are not there to.', substitute: 'differentiation' },
    },
  },

  /* ══════════════ regulating — nothing else works while flooded ══════════════ */
  {
    id: 'timeout',
    title: 'The stop, with a time on it',
    tradition: 'Physiological self-soothing after flooding (Gottman & Levenson)',
    sources: ['christensen1990', 'gross2003'],
    evidence: 'clinical',
    purpose: 'Stops an argument before it does the damage that takes a week to undo.',
    stage: 'now',
    minutes: 20,
    needsPartner: false,
    steps: [
      'Agree one word, in advance and while calm, that either of you can say. Not "stop" — something neutral and slightly silly, so it cannot be mistaken for an attack.',
      'When either person says it, the conversation stops mid-sentence. No last point. The last point is what does the damage.',
      'Whoever calls it names the time they will come back — "twenty minutes" — out loud, as part of calling it. A break with no return time is indistinguishable from walking out, and that is exactly how this fails.',
      'Separate for at least twenty minutes. Below twenty the body has not actually come down, whatever your head says about it.',
      'During the break do something absorbing and physical. Rehearsing the argument extends the flooding rather than ending it.',
      'Come back at the time you named, even if only to agree a later one. Coming back is what makes it trustworthy rather than a tactic.',
    ],
    firstTime: 'It will feel like losing, and you will be certain the point you were about to make was the important one.',
    ifItGoesBadly: 'If one of you keeps talking after the word, the agreement is not real yet. Reset it while calm — nothing agreed during a fight survives the next one.',
    marker: 'Within six weeks: at least one argument that stopped and restarted instead of running to exhaustion.',
    indicatedFor: ['conflict', 'emotionRegulation'],
    modes: ['repair', 'endure', 'understand'],
    suppressedBy: {
      coerciveControl: { why: 'A mutual break can be used as a punishment, and the person who calls it is not always the person at risk.', substitute: 'unilateral-exit' },
      physicalViolence: { why: 'A negotiated pause assumes both people are safe during it.', substitute: 'unilateral-exit' },
      ended: { why: 'There is no argument left to stop, so this one has nothing left to do.', substitute: null },
    },
  },

  /* ══════════════ small, cheap, high-value ══════════════ */
  {
    id: 'appreciation',
    title: 'One specific thing, out loud, daily',
    tradition: 'Gratitude and appreciation intervention (Algoe)',
    sources: ['algoe2010', 'joel2020'],
    evidence: 'trial',
    purpose: 'Felt appreciation ranked second of thirty-five relationship predictors, and it is the cheapest thing on this list.',
    stage: 'now',
    minutes: 2,
    needsPartner: false,
    steps: [
      'Once a day, say one specific thing they did that you noticed. Out loud, to them.',
      'Specific is the whole intervention. "Thanks for dinner" does nothing; "you made dinner on a day I know you were wrecked" does the work, because it shows you saw the cost.',
      'Do not attach a request to it. The moment it becomes a preamble it stops counting and starts being noticed as a technique.',
      'Do it for two weeks before judging it. This is not a conversation, it is a base rate.',
    ],
    firstTime: 'It will feel forced and slightly humiliating for about four days, and then it will not.',
    ifItGoesBadly: 'If they react with suspicion, say the plain truth: you have been taking things for granted and you are trying to stop. Do not explain the method.',
    marker: 'Within four weeks: they say something appreciative back, unprompted.',
    indicatedFor: ['appreciation', 'satisfaction', 'responsiveness'],
    modes: ['repair', 'endure', 'understand'],
    suppressedBy: {
      ended: { why: 'There is nobody to say it to any more, and the work now is a different kind.', substitute: 'grief-structure' },
      perpetration: { why: 'Warmth exercises can function as repair without accountability.', substitute: 'accountability' },
      partnerWillNotParticipate: { why: 'It needs somebody present to receive it, and there is not one right now.', substitute: 'behavioural-activation' },
    },
  },
  {
    id: 'active-constructive',
    title: 'What you do with their good news',
    tradition: 'Active-constructive responding and capitalization (Gable)',
    sources: ['reis2004', 'algoe2010'],
    evidence: 'trial',
    purpose: 'How a partner responds to good news predicts relationship quality better than how they respond to bad news.',
    stage: 'now',
    minutes: 3,
    needsPartner: false,
    steps: [
      'When they tell you something good, stop what you are doing. Physically. That is most of it.',
      'Ask them to tell you more, and mean it — make them re-live the good part rather than summarise it.',
      'Do not relate it to yourself, and do not name the complication. The complication will still be there in an hour.',
      'Four responses exist and one works: enthusiastic and curious. Quiet approval, naming the downside, and changing the subject all measure as costs.',
    ],
    firstTime: 'You will notice how often you have been doing one of the other three.',
    ifItGoesBadly: 'If it feels performative you are overdoing the volume. Curiosity is the active ingredient, not enthusiasm.',
    marker: 'Within four weeks: they bring you good news first, rather than telling somebody else.',
    indicatedFor: ['responsiveness', 'appreciation', 'closeness'],
    modes: ['repair', 'endure', 'understand'],
    suppressedBy: {
      ended: { why: 'There is nobody bringing you their news any more, and that absence is its own thing.', substitute: 'grief-structure' },
      perpetration: { why: 'Connection work before accountability lets the harm stand.', substitute: 'accountability' },
    },
  },
  {
    id: 'stress-conversation',
    title: 'The twenty minutes that is not about you two',
    tradition: 'Stress-reducing conversation (Gottman)',
    sources: ['reis2004', 'christensen2004'],
    evidence: 'clinical',
    purpose: 'Most couples under load have quietly stopped having the conversation where the problem is outside the relationship.',
    stage: 'week',
    minutes: 20,
    needsPartner: true,
    steps: [
      'Twenty minutes, most days. One person talks about something stressful that is NOT about the relationship — work, family, money, health.',
      'The listener has one job: take their side. Not problem-solve, not offer perspective, not point out the other view. Their side.',
      'Ask one question that shows you were listening, then stop. The urge to fix is the thing being resisted.',
      'Then swap properly — the person who spoke first listens with the same job, and the second turn does not get shortened because the first ran long.',
      'If a relationship issue comes up, park it and actually come back to it another time.',
    ],
    firstTime: 'The listener will want to solve it within ninety seconds. Notice the urge and do not act on it.',
    ifItGoesBadly: 'If it becomes a relationship argument twice running, shorten it to ten minutes and keep the topic strictly external until that holds.',
    marker: 'Within six weeks: you know something about their week you would not otherwise have known.',
    indicatedFor: ['responsiveness', 'closeness', 'lifeSatisfaction'],
    modes: ['endure', 'repair'],
    suppressedBy: {
      coerciveControl: { why: 'An exercise that asks somebody to open up nightly assumes it is safe to be known.', substitute: 'unilateral-exit' },
      physicalViolence: { why: 'Nightly openness assumes it is safe to be known, and here it demonstrably is not.', substitute: 'unilateral-exit' },
      perpetration: { why: 'Connection work before accountability lets the harm stand.', substitute: 'accountability' },
      partnerWillNotParticipate: { why: 'This one genuinely takes two people, and only one of you is here.', substitute: 'behavioural-activation' },
      ended: { why: 'There is no shared week left to talk about.', substitute: 'grief-structure' },
    },
  },
  {
    id: 'softened-start',
    title: 'Changing the first thirty seconds',
    tradition: 'Softened start-up (Gottman)',
    sources: ['christensen1990', 'christensen2004'],
    evidence: 'clinical',
    purpose: 'How a difficult conversation opens shapes how it goes, and the opening is the one part entirely within your control.',
    stage: 'week',
    minutes: 5,
    needsPartner: false,
    steps: [
      'Write the opening sentence down before you say it. Once. That is the entire discipline.',
      'Three parts in order: how you feel, about what specific situation, and what you need — stated as what you DO want rather than what you want them to stop. "I need us to decide together" works; "I need you to stop deciding alone" restarts the argument.',
      'Describe, do not evaluate. "The last three times we planned something" is a description. "You are unreliable" is a verdict, and nobody negotiates with a verdict.',
      'No "you always", no "you never", and do not open with the word "you" at all.',
      'Say the sentence you wrote, then stop talking and let them answer.',
    ],
    firstTime: 'Writing it down will feel absurd for a conversation you have had fifty times. The fifty times are the argument for it.',
    ifItGoesBadly: 'If they answer the old version of this conversation rather than what you said, name it once, plainly, and do not escalate to prove it.',
    marker: 'Within six weeks: one difficult conversation that did not become an argument.',
    indicatedFor: ['conflict', 'responsiveness'],
    modes: ['repair', 'endure'],
    suppressedBy: {
      coerciveControl: { why: 'A phrasing technique cannot fix a power imbalance, and offering one implies the problem is your phrasing.', substitute: 'unilateral-exit' },
      physicalViolence: { why: 'Teaching better phrasing implies the violence is a communication problem, which it is not.', substitute: 'unilateral-exit' },
      perpetration: { why: 'The issue is not how you open the conversation.', substitute: 'accountability' },
      ended: { why: 'There is no conversation left to open with them.', substitute: 'grief-structure' },
    },
  },
  {
    id: 'self-expansion',
    title: 'Something new, together, every week',
    tradition: 'Self-expansion — novel and arousing shared activity (Aron et al., 2000)',
    sources: ['aron1986', 'aron1992'],
    evidence: 'trial',
    purpose: 'Novel, physiologically arousing shared activity moves closeness. Pleasant familiar activity does not, which is why a favourite restaurant changes nothing.',
    stage: 'month',
    minutes: 90,
    needsPartner: true,
    steps: [
      'Pick something novel and a bit exciting rather than merely nice. The active ingredients are newness and a raised heart rate, not difficulty for its own sake.',
      'Weekly rather than occasionally. The field study ran it weekly for ten weeks; a single outing is a memory rather than a change.',
      'It does not need to be expensive or impressive. Unfamiliar and slightly energising is the whole specification.',
      'No phones, and no discussing the relationship while doing it.',
    ],
    firstTime: 'The planning will feel like a chore and the first twenty minutes self-conscious.',
    ifItGoesBadly: 'If it settles into a routine it has stopped being novel and stopped working. Change it rather than abandon it.',
    marker: 'Within eight weeks: a reference only the two of you understand, that did not exist before.',
    indicatedFor: ['closeness', 'growth', 'satisfaction'],
    modes: ['repair', 'endure'],
    suppressedBy: {
      ended: { why: 'There is no shared activity to build, so the same mechanism has to work alone.', substitute: 'behavioural-activation' },
      physicalViolence: { why: 'Closeness-building is not the priority and can increase exposure.', substitute: 'unilateral-exit' },
      partnerWillNotParticipate: { why: 'This one genuinely takes two people, and only one of you is here.', substitute: 'behavioural-activation' },
      stillDeciding: {
        why: 'Not withheld — reframed. While you are still deciding, this is not repair work; it is data about what this feels like when you are both genuinely trying.',
        substitute: 'self-expansion',
      },
    },
  },

  /* ══════════════ the harder ones ══════════════ */
  {
    id: 'cycle-naming',
    title: 'Naming the loop while it is happening',
    tradition: 'Unified detachment (IBCT) and cycle de-escalation (EFT)',
    sources: ['christensen2004', 'doss2016'],
    evidence: 'trial',
    purpose: 'Moves the problem from "you versus me" to "us versus the pattern" — the mechanism most couple therapies share.',
    stage: 'week',
    minutes: 15,
    needsPartner: true,
    steps: [
      'While calm, agree a name for the loop. Something slightly ridiculous works best; it is hard to stay contemptuous while saying a silly word.',
      'Each of you writes your own move in it, not theirs. "When I feel dismissed I go cold" — your move only.',
      'Write what you imagine the other is feeling at their move, then ask, and find out you were partly wrong.',
      'Agree that either of you can name the loop while it is running, and that naming it is not an accusation.',
      'The first several times you will name it too late, after the damage. The gap between the damage and the naming shortens, and that gap closing is the progress.',
    ],
    firstTime: 'It will feel like a cheap trick the first three times, and then once it will genuinely stop a fight.',
    ifItGoesBadly: 'If the name becomes a weapon — "there you go again" — stop using it mid-fight and only use it afterwards for a while.',
    marker: 'Within six weeks: you both used the name once, and neither used it as an insult.',
    indicatedFor: ['conflict', 'responsiveness', 'attachAnxiety', 'attachAvoidance'],
    modes: ['repair', 'understand', 'endure'],
    suppressedBy: {
      coerciveControl: { why: 'A shared-cycle frame says both people contribute. Handed to someone being hurt, that is not neutrality — it is ammunition for the person hurting them.', substitute: 'unilateral-exit' },
      physicalViolence: { why: 'A shared-cycle frame here is the single most dangerous thing this product could say.', substitute: 'unilateral-exit' },
      perpetration: { why: 'Mutuality framing is exactly what must not be offered here.', substitute: 'accountability' },
      ended: { why: 'The loop has stopped running, and naming it now would only be rehearsal.', substitute: 'grief-structure' },
      partnerWillNotParticipate: { why: 'This one genuinely takes two people, and only one of you is here.', substitute: 'self-distance' },
    },
  },
  {
    id: 'empathic-joining',
    title: 'The softer thing underneath the sharp thing',
    tradition: 'Empathic joining (IBCT); hard-to-soft emotion (EFT)',
    sources: ['christensen2004', 'doss2016', 'reis2004'],
    evidence: 'trial',
    purpose:
      'Naming the loop shows you the pattern; this is what makes naming it do something. Under almost every hard emotion in a fight — contempt, irritation, the flat voice — there is a softer one that is harder to say, and the softer one is the only one the other person can actually answer.',
    stage: 'month',
    minutes: 30,
    needsPartner: true,
    steps: [
      'Take one recurring fight. Each of you writes the hard emotion you show in it — angry, cold, dismissive, done.',
      'Underneath it, write the softer one that is actually there. Usually some version of: I am afraid this means I do not matter to you.',
      'Say the soft one out loud, to them, without the hard one attached. This is the difficult part and it is the whole exercise.',
      'The listener does not defend, explain, or correct the facts. They say back what they heard. Facts can be settled another day; this is not that conversation.',
      'Swap. Both of you do it, or it becomes an accusation with better manners.',
    ],
    firstTime: 'Saying the soft version out loud will feel more exposing than the fight ever did, and that exposure is the mechanism.',
    ifItGoesBadly: 'If the listener defends themselves, stop and try again another day with a smaller example. A forced version of this does real damage.',
    marker: 'Within eight weeks: one argument where somebody said the soft thing instead of the hard thing.',
    indicatedFor: ['responsiveness', 'attachAnxiety', 'conflict', 'closeness'],
    modes: ['repair', 'endure'],
    requires: 'cycle-naming',
    suppressedBy: {
      coerciveControl: { why: 'Structured vulnerability hands somebody a map of exactly where you are softest.', substitute: 'unilateral-exit' },
      physicalViolence: { why: 'Structured vulnerability where there is violence increases exposure rather than closeness.', substitute: 'unilateral-exit' },
      perpetration: { why: 'Vulnerability work before accountability reverses the order that matters.', substitute: 'accountability' },
      ended: { why: 'There is no fight left to soften, and the work has moved somewhere else.', substitute: 'grief-structure' },
      partnerWillNotParticipate: { why: 'This one genuinely takes two people, and only one of you is here.', substitute: 'self-distance' },
    },
  },
  {
    id: 'dreams-within',
    title: 'What the fight is actually about',
    tradition: 'Dreams-within-conflict (Gottman); tolerance building (IBCT)',
    sources: ['christensen2004', 'doss2016'],
    evidence: 'clinical',
    purpose:
      'For a disagreement that will not resolve — where to live, whether his parents move in, how much goes home each month. These are never about logistics, and the way through is a third option rather than one side winning.',
    stage: 'month',
    minutes: 45,
    needsPartner: true,
    steps: [
      'Pick the disagreement that keeps returning in the same shape. One of you speaks, one listens, and you swap at the halfway point.',
      'The speaker answers one question: what does your position mean to you, where does it come from, and what would it cost you to give it up? There is usually a story from long before this relationship.',
      'The listener asks questions and nothing else. No negotiating, no counter-offers, no compromise yet. Their job is to understand why a reasonable person would want this.',
      'Swap, fully. Both stories get told before anything at all is decided.',
      'Only now: each of you names what is genuinely non-negotiable in your position and what is flexible. Almost everybody finds less is non-negotiable than they assumed.',
      'Look for the third option that honours both non-negotiables. It usually exists, and it is almost never the compromise either of you was arguing for.',
    ],
    firstTime: 'The listener will want to start solving it within five minutes, and both of you will feel it is going nowhere until quite suddenly it is not.',
    ifItGoesBadly: 'If it becomes the same argument, you have started negotiating. Go back to what the position MEANS and stay there longer than feels necessary.',
    marker: 'Within eight weeks: you can each state the other\'s reason in a way they would agree with.',
    indicatedFor: ['conflict', 'familyApproval', 'responsiveness', 'growth'],
    modes: ['repair', 'endure', 'decide'],
    requires: 'cycle-naming',
    suppressedBy: {
      coerciveControl: { why: 'This assumes two people whose positions carry equal weight.', substitute: 'unilateral-exit' },
      physicalViolence: { why: 'The same reasoning applies here, and more directly.', substitute: 'unilateral-exit' },
      familyIsTheSourceOfHarm: { why: 'Where the extended family is causing harm, the question is not what the disagreement means.', substitute: 'unilateral-exit' },
      partnerWillNotParticipate: { why: 'This one genuinely takes two people, and only one of you is here.', substitute: 'decisional-balance' },
      ended: { why: 'The disagreement no longer needs resolving between the two of you.', substitute: 'grief-structure' },
    },
  },
  {
    id: 'money-structure',
    title: 'Three pots, and a number for home',
    tradition: 'Structured financial agreement; behavioural exchange',
    sources: ['christensen2004', 'gollwitzer2006'],
    evidence: 'clinical',
    purpose:
      'Money fights are rarely about money; they are about who decides. The open-ended obligation to family is the specifically Indian version, and it stays a fight precisely because no number is ever attached to it.',
    stage: 'week',
    minutes: 45,
    needsPartner: true,
    steps: [
      'Three pots: ours, yours, mine. Whatever the incomes are, each person has an amount that is theirs and needs no explanation to anybody. The no-questions part is the intervention.',
      'Agree one number, per month, that goes to each side of the family. A number, decided together, in advance. An open-ended obligation cannot be planned around, which is why it never stops being an argument.',
      'Agree the amount above which a purchase gets discussed. Low enough to be real, high enough that ordinary life does not need permission.',
      'One meeting a month, thirty minutes, same three items every time: what came in, what went out, what is coming. Same day each month, so it is never a summons.',
      'Not at night, and not after an argument about something else.',
    ],
    firstTime: 'The family number is the uncomfortable one, and it is the one that ends the recurring fight.',
    ifItGoesBadly: 'If the meeting becomes an argument twice running, cut it to the three items with no discussion — just read them out for a month.',
    marker: 'Within eight weeks: two monthly meetings happened, and the family amount was not renegotiated in between.',
    indicatedFor: ['conflict', 'trust', 'familyApproval', 'autonomy'],
    modes: ['repair', 'endure'],
    suppressedBy: {
      coerciveControl: { why: 'Where money is already being used to control somebody, a shared structure formalises it.', substitute: 'unilateral-exit' },
      physicalViolence: { why: 'The same reasoning applies here, and more directly.', substitute: 'unilateral-exit' },
      partnerWillNotParticipate: { why: 'This one genuinely takes two people, and only one of you is here.', substitute: 'behavioural-activation' },
      ended: { why: 'There is nothing shared left to structure between the two of you.', substitute: 'grief-structure' },
    },
  },

  {
    id: 'invisible-load',
    title: 'Counting the work nobody counts',
    tradition: 'Cognitive household labour audit (Daminger 2019)',
    sources: ['daminger2019', 'mospi2024', 'algoe2010'],
    evidence: 'clinical',
    purpose:
      'The most common unspoken grievance in Indian marriages, and the hardest to raise without it becoming an accusation. India’s own Time Use Survey puts married women at 388 minutes a day of unpaid domestic work against married men’s 47. A number turns a resentment into a measurement, and a measurement can be discussed.',
    stage: 'week',
    minutes: 40,
    needsPartner: true,
    steps: [
      'For one week, both of you write down what you did and roughly how long it took. Not a complaint log — a list. Do it separately and do not compare until the week is over.',
      'Then add the part that never appears on such a list: who ANTICIPATED each thing before it became urgent, who worked out the OPTIONS, who DECIDED, and who kept MONITORING that it stayed done. Those four are separable, and the anticipating and the monitoring are the invisible ones.',
      'Compare the two lists side by side, once, without defending anything. Almost every couple finds the doing is more even than the anticipating.',
      'Move ONE thing over completely — all four parts of it, including the noticing and the remembering. A task handed over with the remembering kept back has not been handed over.',
      'Check after three weeks whether it stayed moved. Things move back quietly and without anyone deciding to.',
    ],
    firstTime: 'The person who does less will be genuinely surprised, and that surprise is usually real rather than performed. The person who does more will find writing it down harder than doing it.',
    ifItGoesBadly: 'If it becomes a scoreboard argument, stop comparing totals and move one single thing. The totals are almost never resolvable; one task is.',
    marker: 'Within six weeks: one task moved entirely, including the remembering, and it had not moved back.',
    indicatedFor: ['appreciation', 'conflict', 'responsiveness', 'lifeSatisfaction'],
    modes: ['repair', 'endure'],
    suppressedBy: {
      coerciveControl: {
        why: 'Where somebody is already controlling the household, an audit hands them a more precise instrument.',
        substitute: 'unilateral-exit',
      },
      physicalViolence: { why: 'Raising an imbalance is not a safe act here, whatever the numbers say.', substitute: 'unilateral-exit' },
      partnerWillNotParticipate: { why: 'This one genuinely takes two people, and only one of you is here.', substitute: 'behavioural-activation' },
      ended: { why: 'There is no shared household left to divide.', substitute: 'grief-structure' },
    },
  },
  {
    id: 'reappraisal-choice',
    title: 'Knowing which one you are actually trying to do',
    tradition: 'Emotion regulation after a break-up (Langeslag & Sanchez 2018)',
    sources: ['langeslag2018', 'gross2003', 'treynor2003'],
    evidence: 'trial',
    purpose:
      'After an ending there are two different goals and they pull in opposite directions. Thinking about their faults lowers how much you love them and makes you feel worse. Distraction lifts your mood and leaves the love where it is. Most people do both at random and conclude nothing works.',
    stage: 'week',
    minutes: 15,
    needsPartner: false,
    steps: [
      'Decide, today, which you are actually after: to stop loving them, or to feel better. They are not the same goal and they do not respond to the same thing.',
      'If it is to feel better: distraction. Deliberately, on purpose, scheduled — something absorbing that has nothing to do with them. It will feel like avoidance and it measurably is not.',
      'If it is to lower the love: negative reappraisal — deliberately recalling what was actually wrong. Know the cost in advance, because it reliably worsens mood in the short run.',
      'Do not do both in the same hour. Alternating between them is why it has felt like nothing is working.',
      'Revisit the choice weekly. Most people want the second early on and the first later, and the switch is normal rather than a relapse.',
    ],
    firstTime: 'Choosing feels arbitrary and slightly cold. Choosing is the intervention; the strategies only work when they are not competing.',
    ifItGoesBadly: 'If the negative reappraisal is flattening you, you have picked the wrong goal for this week. Switch to distraction and come back to it.',
    marker: 'Two weeks: you can say which goal you were working on, and you did not switch mid-day.',
    indicatedFor: ['rumination', 'emotionRegulation', 'lifeSatisfaction'],
    modes: ['recover'],
  },

  /* ══════════════ deciding ══════════════ */
  {
    id: 'decisional-balance',
    title: 'Four lists, written properly',
    tradition: 'Decisional balance (Janis & Mann; Motivational Interviewing)',
    sources: ['joel2018', 'miller2013'],
    evidence: 'clinical',
    purpose: 'People hold many reasons to stay and many to leave at the same time. Writing only one list is how a decision gets made badly.',
    stage: 'week',
    minutes: 30,
    needsPartner: false,
    steps: [
      'Four lists, not two: reasons to stay, costs of staying, reasons to leave, costs of leaving. The two cost columns are the ones people skip.',
      'Write each entry as a concrete consequence, not a feeling. "I would not see his mother again" rather than "it would be sad".',
      'Mark each one: is this about the relationship, or about what leaving would cost? Those are different, and mixing them is how people stay for years.',
      'Leave it for three days without deciding anything. The lists need reading on a different day and in a different mood than they were written.',
      'Come back and mark which entries have changed in the last year. One that has not moved in a year is a fact; one that changes weekly is a mood.',
    ],
    firstTime: 'The "costs of staying" column takes longest and matters most.',
    ifItGoesBadly: 'If a column is empty you are arguing with yourself rather than looking. Ask what somebody who disagreed with you would put there.',
    marker: 'Within two weeks: you can say specifically what would need to change for you to stay.',
    indicatedFor: ['ambivalence', 'constraint', 'alternatives', 'ownDedication'],
    modes: ['decide'],
    anchorFor: 'decide',
    suppressedBy: { ended: { why: 'The decision has already been made, and weighing it again is rumination in a better coat.', substitute: 'grief-structure' } },
  },
  {
    id: 'bounded-effort',
    title: 'Six months, all in, decision paused',
    tradition: 'Discernment counselling — the third path (Doherty)',
    sources: ['doherty2016', 'joel2018'],
    evidence: 'clinical',
    purpose:
      'For somebody stuck between staying and going, the useful third option is neither: a bounded period of genuine effort with the decision explicitly off the table, so that at the end you decide with information instead of with fear.',
    stage: 'month',
    minutes: 40,
    needsPartner: false,
    steps: [
      'Name the period. Six months is the usual length — long enough for something to change, short enough to be survivable.',
      'For that period the decision is off the table. Not decided: postponed, deliberately. That is a different thing, and it is what makes real effort possible.',
      'Write what "all in" would actually mean for you. Two or three behaviours, not an attitude. If you cannot name them, that is itself the finding.',
      'Write what you would need to see at the end in order to stay. Specific and observable, decided now while you can still think clearly.',
      'Put the end date in the calendar. On that date you decide with six months of evidence rather than six months of wondering.',
    ],
    firstTime: 'Postponing the decision will feel like avoiding it. It is the opposite — it is the only way to get information instead of more speculation.',
    ifItGoesBadly: 'If you cannot go all in even for a bounded period, that is real information and it arrived early. Take it seriously rather than treating it as failure.',
    marker: 'Within two weeks: the period is named, the end date is in the calendar, and the behaviours are written down.',
    indicatedFor: ['ambivalence', 'ownDedication', 'constraint'],
    modes: ['decide'],
    suppressedBy: {
      ended: { why: 'The decision has already been made, and weighing it again is rumination in a better coat.', substitute: 'grief-structure' },
      physicalViolence: { why: 'A commitment to stay for a fixed period is not a safe instruction here.', substitute: 'unilateral-exit' },
      coerciveControl: { why: 'The same reasoning applies here, and more directly.', substitute: 'unilateral-exit' },
    },
  },

  /* ══════════════ solo work — always available to everyone ══════════════ */
  {
    id: 'woop',
    title: 'Wish, outcome, obstacle, plan',
    tradition: 'Mental contrasting with implementation intentions — WOOP (Oettingen; Gollwitzer)',
    sources: ['oettingen2014', 'gollwitzer2006'],
    evidence: 'trial',
    purpose: 'If-then plans produced a medium-to-large effect on goal attainment across 94 studies. Positive imagining alone reduces action; contrasting it against the real obstacle restores it.',
    stage: 'now',
    minutes: 10,
    needsPartner: false,
    steps: [
      'Write the wish in one sentence. Something reachable in four weeks, not a life change.',
      'Write the best realistic outcome, then spend one minute picturing it. Not longer — fantasy on its own reduces the chance you act.',
      'Write the obstacle. Not the world\'s — yours, the internal one. "I will decide it is not the right moment" is an obstacle; "he is busy" is an excuse.',
      'Write the plan in exactly this form: "If [obstacle happens], then I will [specific action]." The if-then grammar is the part that works.',
      'Keep it where you will see it on a bad day, because a bad day is when it is needed.',
    ],
    firstTime: 'The obstacle step is the one people skip, and the one that does the work.',
    ifItGoesBadly: 'If you did not do it, the obstacle you named was the wrong one. Write the real one, which is usually more embarrassing.',
    marker: 'Two weeks: the if-then triggered at least once and you followed it.',
    indicatedFor: ['agency', 'autonomy', 'valuesLived', 'futureSelfContinuity'],
    modes: ['repair', 'decide', 'endure', 'recover', 'understand'],
  },
  {
    id: 'perspective-write',
    title: 'Three writes a year, from a neutral chair',
    tradition: 'Perspective-taking writing intervention (Finkel, Slotter, Luchies, Walton & Gross, 2013)',
    sources: ['kross2014', 'grossmann2014'],
    evidence: 'trial',
    purpose:
      'In a two-year trial with 120 couples, three short writes a year held off the decline the control group showed. Note precisely what moved: conflict-related DISTRESS. The arguments did not become fewer or milder — what they cost changed.',
    stage: 'month',
    minutes: 21,
    needsPartner: false,
    steps: [
      'Think of your most significant disagreement with them over the last few months.',
      'Write about it from the perspective of a neutral third party who wants the best for everyone involved. How would that person see it? How would they view your partner\'s behaviour and point of view? How might they find the good that could come from it?',
      'Then write about the obstacles you face in taking that third-party view, especially mid-disagreement, and what might help you overcome them.',
      'Then write about how you could actually take that view over the coming months, and where you would most need it. This third part is not reflection — it is an if-then plan, and it is a third of the trial.',
      'Three times a year, roughly four months apart. Whether doing it more often would help was never tested, so do not assume it would.',
    ],
    firstTime: 'The middle section is the uncomfortable one, and skipping it leaves you with a third of the intervention.',
    ifItGoesBadly: 'If it becomes a list of their faults you have written from your own view. Start again and put a specific real person in the neutral chair.',
    marker: 'The next argument: you notice the third view once during it, rather than afterwards.',
    indicatedFor: ['conflict', 'emotionRegulation', 'rumination'],
    modes: ['repair', 'endure', 'understand', 'decide'],
    suppressedBy: {
      coerciveControl: { why: '"Find the good that could come from it" is precisely the cognition that keeps somebody in a harmful situation.', substitute: 'self-distance' },
      physicalViolence: { why: 'Looking for the good in a disagreement with somebody who hurts you is the most consequential misapplication in this library.', substitute: 'unilateral-exit' },
    },
  },
  {
    id: 'self-distance',
    title: "Write it as your friend's problem",
    tradition: "Self-distancing (Kross); Solomon's paradox (Grossmann & Kross)",
    sources: ['kross2014', 'grossmann2014'],
    evidence: 'trial',
    purpose: "People reason measurably more wisely about somebody else's version of their problem. Self-distancing closes the gap entirely.",
    stage: 'now',
    minutes: 12,
    needsPartner: false,
    steps: [
      'Write your situation as though it is happening to a friend, in the third person, using their name rather than "I".',
      'Keep every fact. Changing anything to make the person more sympathetic is worth noticing rather than doing.',
      'Now write what you would tell that friend, plainly, the way you would actually say it.',
      'Read it back the next morning rather than the same night.',
    ],
    firstTime: 'You will write the advice faster and more decisively than you can think about your own situation. That gap is the finding.',
    ifItGoesBadly: 'If you cannot get out of the first person, write it as a scene with dialogue. The form matters less than the distance.',
    marker: 'Immediate: you produce advice you had not been able to reach for yourself.',
    indicatedFor: ['rumination', 'ambivalence', 'selfConceptClarity', 'agency'],
    modes: ['decide', 'understand', 'recover', 'repair'],
  },
  {
    id: 'differentiation',
    title: 'Your own position, said once, without a fight',
    tradition: 'Differentiation of self (Bowen)',
    sources: ['bowen1978', 'chirkov2003', 'yeh2003'],
    evidence: 'clinical',
    purpose:
      "Holding your own position while staying connected to people who disagree. Bowen's central point is that cutting off is not the strong version of this — it is a symptom of the same difficulty. Indian data on differentiation shows people generally know their own position; what is hard is staying regulated while saying it. So the work is the conversation, not the decision.",
    stage: 'month',
    minutes: 30,
    needsPartner: false,
    steps: [
      'Write your position in one sentence, as a statement about you rather than about them. "I am going to marry him" — not "you are being unfair".',
      'Decide in advance what you will do if they react badly, and what you will not do. Not retaliating and not capitulating are both decisions, and both need making beforehand.',
      'Say it once, calmly, to one person — not the whole family at once, and not by message.',
      'Do not defend it, argue it, or repeat it louder. You have said it; their reaction is theirs to have.',
      'Stay in contact afterwards. This is what separates holding a position from cutting off, and it is what keeps reconciliation possible later.',
    ],
    firstTime: 'The silence after you say it will be the longest ten seconds of the year, and the urge to soften it will be enormous.',
    ifItGoesBadly: 'If it becomes a fight, leave the room without withdrawing from the relationship — go, and come back the next day as normal. Coming back is the message.',
    marker: 'Within eight weeks: you stated your position once and neither escalated nor retracted it.',
    indicatedFor: ['familyApproval', 'autonomy', 'constraint', 'agency'],
    modes: ['decide', 'endure', 'repair'],
    suppressedBy: {
      physicalViolence: { why: 'Where a family is a source of danger rather than pressure, the priority is safety rather than position-holding.', substitute: 'unilateral-exit' },
      familyIsTheSourceOfHarm: { why: 'The same reasoning applies here, and more directly.', substitute: 'unilateral-exit' },
      coerciveControl: { why: 'Stating a position to somebody who controls you is not a low-cost act.', substitute: 'unilateral-exit' },
    },
  },
  {
    id: 'behavioural-activation',
    title: 'Two things on the calendar that are yours',
    tradition: 'Behavioural activation',
    sources: ['ryan2000', 'diener1985'],
    evidence: 'trial',
    purpose: 'The single component that moved symptoms in a dismantling trial of a digital single-session intervention. Insight without a scheduled action is the failure mode that looks like success.',
    stage: 'now',
    minutes: 10,
    needsPartner: false,
    steps: [
      'Pick two things that are yours and not theirs. A person you have not called, a thing you used to do, somewhere you used to go.',
      'Put them in the calendar with a day and a time. Not "this week" — Tuesday, seven.',
      'Tell one other person you are doing them. External commitment roughly doubles follow-through.',
      'Do them whether or not you feel like it on the day. Waiting to feel like it is the mechanism of the problem, not the solution to it.',
    ],
    firstTime: 'You will not feel like it, and that is not a signal about whether to go.',
    ifItGoesBadly: 'If you cancelled both, halve the size and put them back. A twenty-minute walk that happens beats an evening that does not.',
    marker: 'Two weeks: both happened, at least once each.',
    indicatedFor: ['lifeSatisfaction', 'relatedness', 'agency', 'competence', 'rumination'],
    modes: ['recover', 'endure', 'understand', 'decide'],
  },
  {
    id: 'rumination-window',
    title: 'A fixed appointment for the overthinking',
    tradition: 'Stimulus control for rumination; worry postponement',
    sources: ['treynor2003', 'gross2003'],
    evidence: 'trial',
    purpose: 'Brooding is the component of rumination that predicts worse outcomes. Containing it works better than trying to stop it.',
    stage: 'now',
    minutes: 15,
    needsPartner: false,
    steps: [
      'Book fifteen minutes a day, same time, same place, for thinking about this. Not in bed and not last thing at night.',
      'Outside the window, when it starts, write one line in your phone and tell yourself it has an appointment. This is postponing rather than suppressing — suppression rebounds and postponement does not.',
      'In the window, think about it deliberately, with a pen. Write. Do not just circle.',
      'When the fifteen minutes end, stop mid-sentence if you have to. Ending on time is the whole intervention.',
    ],
    firstTime: 'The postponing will not work for the first few days. It starts working around day four.',
    ifItGoesBadly: 'If the window makes it worse, shorten it to ten minutes and end by writing one thing you will actually do tomorrow.',
    marker: 'Two weeks: fewer than half your days had the thinking outside the window.',
    indicatedFor: ['rumination', 'emotionRegulation', 'attachAnxiety'],
    modes: ['recover', 'understand', 'decide', 'endure'],
  },
  {
    id: 'grief-structure',
    title: 'Structure for the first eight weeks',
    tradition: 'Behavioural activation with self-compassion (Neff) after loss',
    sources: ['neff2003', 'treynor2003', 'ryan2000'],
    evidence: 'clinical',
    purpose: 'After an ending the task is not deciding anything. It is getting through the part where nothing helps.',
    stage: 'now',
    minutes: 15,
    needsPartner: false,
    steps: [
      'Three fixed points every day — a wake time, one meal with another person where possible, and one thing outside the house. Early on, structure does more than insight.',
      'Decide what you are doing about contact and write it down. Any rule works better than deciding fresh every time you want to message them.',
      'One person gets the unedited version. One. Telling everybody spreads it thin; telling nobody is worse.',
      'Expect weeks four to six to be worse than week two. People assume a straight line and then conclude something is wrong with them when it is not.',
      'When you catch yourself listing your faults, ask what you would say to a friend in this exact position, and say that instead.',
    ],
    firstTime: 'The structure will feel pointless and mechanical, and it works anyway.',
    ifItGoesBadly: 'If the fixed points are not happening, cut to one: the wake time. Everything else gets easier from there.',
    marker: 'Six weeks: the three fixed points are happening most days.',
    indicatedFor: ['lifeSatisfaction', 'rumination', 'selfCompassion', 'relatedness'],
    modes: ['recover'],
    anchorFor: 'recover',
  },
  {
    id: 'values-week',
    title: 'One week measured against what you said matters',
    tradition: 'Values clarification and committed action (ACT); mental contrasting',
    sources: ['schwartz2012', 'miller2013', 'oettingen2014'],
    evidence: 'clinical',
    purpose: 'Closes the gap between a stated value and an actual week — the most common shape of a stuck life, and measurable rather than felt.',
    stage: 'week',
    minutes: 15,
    needsPartner: false,
    steps: [
      'Take the value you named as mattering most. Write the three things you did last week that served it. If there were not three, write however many there were, including none.',
      'Find one hour in the coming week that currently serves nothing, and give it to that value. One hour, named, in the calendar.',
      'At the end of the week write what actually happened to that hour, honestly, including if it vanished.',
      'Repeat for four weeks. The point is not the hour; it is watching what reliably takes it.',
    ],
    firstTime: 'The hour will get eaten in week one, and what eats it is the finding.',
    ifItGoesBadly: 'If it is eaten three weeks running, either the value is not the one that matters most, or something is claiming a priority you have not admitted to.',
    marker: 'Four weeks: you can name exactly what takes the hour, which is more useful than protecting it.',
    indicatedFor: ['valuesLived', 'autonomy', 'agency', 'selfConceptClarity'],
    modes: ['understand', 'decide', 'repair', 'endure', 'recover'],
  },
  {
    id: 'big-assumption',
    title: 'The smallest safe test of the belief',
    tradition: 'Immunity to Change — Big Assumption testing (Kegan & Lahey)',
    sources: ['kegan2009', 'miller2013'],
    evidence: 'clinical',
    purpose: 'A belief that has never been tested runs your life on the assumption it is true. One small, safe, deliberate test changes what you know rather than what you think.',
    stage: 'month',
    minutes: 25,
    needsPartner: false,
    steps: [
      'Write the belief as a flat sentence: "If I ___, then ___." The second half is the part running your decisions.',
      'Design the smallest possible test — small enough that being wrong costs almost nothing. The point is information, not courage.',
      'Write down, before you run it, exactly what you predict will happen. Specific enough to be wrong.',
      'Run the test once, exactly as designed, without enlarging it in the moment because it felt too small. Enlarging it is how people avoid running it at all.',
      'Write what actually happened next to what you predicted, and compare. Most Big Assumptions survive partly intact, and that is still new information.',
    ],
    firstTime: 'You will want to design a bigger test than necessary. A big test you never run teaches nothing.',
    ifItGoesBadly: 'If the prediction came true, the belief is partly accurate — and the next question is whether it is true everywhere or only with that person.',
    marker: 'Within six weeks: one test run, one prediction written beforehand, one comparison made.',
    indicatedFor: ['coreBeliefSelf', 'coreBeliefOther', 'agency', 'autonomy', 'futureSelfContinuity'],
    modes: ['understand', 'decide', 'repair', 'recover', 'endure'],
  },
  {
    id: 'future-self-letter',
    title: 'A letter from the person you described',
    tradition: 'Future self-continuity (Hershfield); Best Possible Self (King)',
    sources: ['hershfield2011', 'markus1986'],
    evidence: 'trial',
    purpose: 'People who feel continuous with their future self make choices that serve it. The exercise builds similarity rather than aspiration — aspiration alone does nothing.',
    stage: 'week',
    minutes: 20,
    needsPartner: false,
    steps: [
      'Write a letter TO yourself now, FROM yourself ten years on, in their voice.',
      'They are not a better person. They are you with ten more years. Include something they still find difficult — similarity is the mechanism, and a flawless future self is a stranger.',
      'Have them name the one thing you did this year that mattered, and the one thing they wish you had started sooner.',
      'Put a date on it and keep it somewhere you will find it by accident.',
    ],
    firstTime: 'Writing in their voice feels strange for one paragraph and then unlocks.',
    ifItGoesBadly: 'If the letter reads like a motivational poster you have written a stranger. Give them a specific ordinary Tuesday and an unresolved problem.',
    marker: 'Immediate: the letter names one thing to start sooner, and you can say when you will start it.',
    indicatedFor: ['futureSelfContinuity', 'valuesLived', 'agency'],
    modes: ['understand', 'decide', 'recover'],
  },
]

export const PRACTICE_BY_ID: Record<string, Practice> = Object.fromEntries(PRACTICES.map((p) => [p.id, p]))

/* ────────────────────────────  selection  ──────────────────────────── */

export interface PracticeContext {
  help: HelpMode[]
  /** Dimensions where this person is actually struggling, worst first. */
  weakest: DimensionId[]
  signals: Set<Signal>
}

export interface Selection {
  practice: Practice
  /** Set when this replaced a withheld practice, so the swap is never silent. */
  substitutedFor?: { title: string; why: string }
}

/**
 * Choose the practices this person is given, in the order they should do them.
 *
 * A suppressed practice is REPLACED, never merely removed. Somebody who discloses violence must
 * end up with at least as much as somebody who discloses nothing — and with the safer thing in
 * place of the dangerous one, rather than with a gap where it was.
 */
export function selectPractices(ctx: PracticeContext, limit = 5): Selection[] {
  const fits = (p: Practice) =>
    p.modes.some((m) => ctx.help.includes(m)) &&
    // A practice gated to a signal is unreachable unless the reader's answers reached for it.
    (!p.requiresSignal || p.requiresSignal.some((s) => ctx.signals.has(s)))

  const rank = (p: Practice) => {
    let fit = 0
    for (let i = 0; i < ctx.weakest.length; i++) {
      if (p.indicatedFor.includes(ctx.weakest[i]!)) fit += ctx.weakest.length - i
    }
    const solo = p.needsPartner ? 0 : 0.6     // solo users are first-class
    const cost = p.minutes / 120              // an exercise nobody has time for is one nobody does
    const proven = p.evidence === 'trial' ? 0.4 : 0
    return fit + solo + proven - cost
  }

  const out: Selection[] = []
  const taken = new Set<string>()

  /* Anchors first — the thing each active mode exists to deliver, before ranking gets a say. */
  const anchors = PRACTICES.filter((p) => p.anchorFor && ctx.help.includes(p.anchorFor) && fits(p))
  const ordered = [...anchors, ...PRACTICES.filter(fits).sort((a, b) => rank(b) - rank(a))]

  for (const p of ordered) {
    if (out.length >= limit) break
    if (taken.has(p.id)) continue

    // Gated behind its prerequisite: never hand somebody the harder exercise first.
    if (p.requires && !taken.has(p.requires)) continue

    const blocking = (Object.keys(p.suppressedBy ?? {}) as Signal[]).find((s) => ctx.signals.has(s))
    if (!blocking) {
      taken.add(p.id)
      out.push({ practice: p })
      continue
    }

    const rule = p.suppressedBy![blocking]!
    // A rule naming ITSELF as the substitute is a REFRAME rather than a suppression: keep it, note it.
    if (rule.substitute === p.id) {
      taken.add(p.id)
      out.push({ practice: p, substitutedFor: { title: p.title, why: rule.why } })
      continue
    }
    if (!rule.substitute) continue

    const sub = PRACTICE_BY_ID[rule.substitute]
    if (!sub || taken.has(sub.id)) continue
    taken.add(sub.id)
    out.push({ practice: sub, substitutedFor: { title: p.title, why: rule.why } })
  }

  /* Anyone carrying a safety signal is offered the protective practice, first.
     This is the concrete form of "a flag may only ever add". */
  if (
    (['physicalViolence', 'coerciveControl', 'familyIsTheSourceOfHarm'] as Signal[]).some((s) => ctx.signals.has(s)) &&
    !taken.has('unilateral-exit')
  ) {
    out.unshift({ practice: PRACTICE_BY_ID['unilateral-exit']! })
    taken.add('unilateral-exit')
  }
  if (ctx.signals.has('perpetration') && !taken.has('accountability')) {
    out.unshift({ practice: PRACTICE_BY_ID['accountability']! })
    taken.add('accountability')
  }

  const STAGE_ORDER: Record<PracticeStage, number> = { now: 0, week: 1, month: 2 }
  return out.sort((a, b) => STAGE_ORDER[a.practice.stage] - STAGE_ORDER[b.practice.stage])
}

/**
 * Markers are stored as "two weeks: fewer than half your days had it outside the window", so
 * dropping one into a sentence produced "You will know it is working when two weeks: fewer than…".
 * Split the timeframe off and put it where a person would say it.
 */
const PREPOSITIONS = ['within', 'after', 'by', 'from', 'over']

export function markerSentence(raw: string): string {
  const at = raw.indexOf(':')
  if (at < 0) return `You will know it is working when ${lowerMarker(raw)}`
  const when = raw.slice(0, at).trim().toLowerCase()
  const what = lowerMarker(raw.slice(at + 1))
  const phrase =
    when === 'immediate' ? 'Straight away' :
    // Deliberately a word check rather than a regex: a stray escape in this file once turned a
    // whitespace class in a quote-trimmer into the letter "s" and ate that letter out of the
    // reader's own words. Nothing here needs a backslash, so nothing here has one.
    PREPOSITIONS.includes(when.split(' ')[0] ?? '') ? when[0]!.toUpperCase() + when.slice(1) :
    `In ${when}`
  return `${phrase}, the thing to look for is this: ${what}`
}

function lowerMarker(s: string): string {
  const t = s.trim()
  return t.length ? t[0]!.toLowerCase() + t.slice(1) : t
}
