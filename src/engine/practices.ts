import type { DimensionId, HelpMode } from './types'

/**
 * THE PRACTICE LIBRARY — what therapy actually does, as opposed to what an article explains.
 *
 * An article tells you communication matters. A therapist hands you a specific exercise, tells you
 * when to do it, what it will feel like the first time, what to do when it goes badly, and how you
 * will know it worked. That difference is the whole distance between advice in a therapy costume
 * and therapy, and it is the reason this file exists instead of a prompt asking a model for tips.
 *
 * Every practice here is a NAMED, PUBLISHED intervention with a protocol precise enough to execute
 * without further thought. None of it is invented. The model's job downstream is to explain the
 * chosen practice in this person's words and situation — never to decide what the practice is, and
 * never to make one up.
 *
 * CONTRAINDICATIONS ARE NOT OPTIONAL. Several of the best-evidenced couple interventions are
 * actively harmful in the wrong situation: a vulnerability exercise handed to someone living with
 * coercive control, "you both contribute" framing handed to someone being hurt, forgiveness work
 * prescribed before someone has finished being angry. Every practice carries the situations it must
 * never be offered in, and `selectPractices` enforces them — a guard that lives only in prose is
 * not a guard.
 */

export type PracticeStage = 'now' | 'week' | 'month'

export interface Practice {
  id: string
  /** What the person calls it. Plain, never clinical. */
  title: string
  /** The published intervention this is, named honestly. */
  tradition: string
  sources: string[]
  /** One line: what it is for. */
  purpose: string
  /** When it belongs in the sequence. */
  stage: PracticeStage
  /** Realistic time cost. People do not do what they cannot fit in. */
  minutes: number
  /** Whether it needs the other person, or can be done alone. Solo-doable is the default. */
  needsPartner: boolean
  /** The actual protocol. Numbered, concrete, executable. */
  steps: string[]
  /** What it feels like the first time — because the first attempt usually goes badly. */
  firstTime: string
  /** What to do when it goes wrong. Every practice has this; most advice does not. */
  ifItGoesBadly: string
  /** Observable, time-boxed. Not a feeling. */
  marker: string
  /** Dimensions this is indicated for. */
  indicatedFor: DimensionId[]
  /** Help modes this fits. */
  modes: HelpMode[]
  /** Hard blocks. Checked before anything is ever offered. */
  contraindications: {
    physicalViolence?: boolean
    coerciveControl?: boolean
    selfRisk?: boolean
    perpetration?: boolean
    /** Do not offer when the relationship is already over. */
    ended?: boolean
    /** Do not offer when the person is still deciding whether to stay. */
    stillDeciding?: boolean
  }
  /** Why it is contraindicated where it is — rendered for the clinician-minded reader. */
  cautionNote?: string
}

export const PRACTICES: Practice[] = [
  /* ══════════════ regulating first — nothing else works while flooded ══════════════ */
  {
    id: 'timeout',
    title: 'The twenty-minute stop',
    tradition: 'Physiological self-soothing / flooding protocol (Gottman)',
    sources: ['christensen1990', 'gross2003'],
    purpose: 'Stops an argument before it does the damage that takes a week to undo.',
    stage: 'now',
    minutes: 20,
    needsPartner: false,
    steps: [
      'Agree one word, in advance and while calm, that either of you can say. Not "stop" — something neutral and slightly silly, so it cannot be mistaken for an attack.',
      'When either person says it, the conversation stops mid-sentence. No last point. The last point is what causes the damage.',
      'Separate for at least twenty minutes. Below twenty, the body has not actually come down, and the research on flooding is specific about that.',
      'During the break do something absorbing and physical — a walk, a shower, dishes. Not rehearsing your argument, which extends the flooding rather than ending it.',
      'Whoever called the break is responsible for restarting it. That rule is what stops the break becoming a way to avoid the conversation.',
    ],
    firstTime: 'It will feel like losing. You will be sure the point you were about to make was the important one. It was not.',
    ifItGoesBadly: 'If one of you keeps talking after the word is said, the agreement is not real yet. Reset it while calm, not mid-fight — nothing agreed during a fight survives the next one.',
    marker: 'Within six weeks: at least one argument that stopped and restarted, instead of running to exhaustion.',
    indicatedFor: ['conflict', 'emotionRegulation'],
    modes: ['repair', 'endure', 'understand'],
    contraindications: { physicalViolence: true, coerciveControl: true, ended: true },
    cautionNote: 'Not offered where violence or control is present: a "break" can become isolation, and the person calling it is not always the person at risk.',
  },

  /* ══════════════ the small, high-evidence, low-cost ones ══════════════ */
  {
    id: 'appreciation',
    title: 'One specific thing, out loud, daily',
    tradition: 'Gratitude / appreciation intervention (Algoe; Gottman)',
    sources: ['algoe2010', 'joel2020'],
    purpose: 'Felt appreciation ranked second of thirty-five relationship predictors. It is also the cheapest thing on this list.',
    stage: 'now',
    minutes: 2,
    needsPartner: false,
    steps: [
      'Once a day, say one specific thing they did that you noticed. Out loud, to them.',
      'Specific is the whole intervention. "Thanks for dinner" does nothing. "You made dinner on a day I know you were wrecked" does the work, because it shows you saw the cost.',
      'Do not attach a request to it. The moment it becomes a preamble, it stops counting and starts being noticed as a technique.',
      'Do it for two weeks before judging whether it is working. It is not a conversation, it is a base rate.',
    ],
    firstTime: 'It will feel forced and slightly humiliating for about four days. That is normal and it passes.',
    ifItGoesBadly: 'If they react with suspicion, say the plain truth: you have been taking things for granted and you are trying to stop. Do not explain the method.',
    marker: 'Within four weeks: they say something appreciative back, unprompted.',
    indicatedFor: ['appreciation', 'satisfaction', 'responsiveness'],
    modes: ['repair', 'endure', 'understand'],
    contraindications: { ended: true, perpetration: true },
    cautionNote: 'Withheld from someone who has disclosed hurting a partner — warmth exercises there can function as repair-without-accountability.',
  },
  {
    id: 'stress-conversation',
    title: 'The twenty minutes that is not about you two',
    tradition: 'Stress-reducing conversation (Gottman)',
    sources: ['reis2004', 'christensen2004'],
    purpose: 'Most couples under load have stopped having the conversation where the problem is outside the relationship.',
    stage: 'week',
    minutes: 20,
    needsPartner: true,
    steps: [
      'Twenty minutes, most days. One person talks about something stressful that is NOT about the relationship. Work, family, money, health.',
      'The listener\'s only job is to take their side. Not to problem-solve, not to offer perspective, not to point out the other view. Their side.',
      'Ask one question that shows you were listening, then stop. The urge to fix is the thing to resist here.',
      'Then swap, properly — the person who spoke first listens with the same job, and the second turn does not get shortened because the first one ran long.',
      'If a relationship issue comes up, park it. "Let us come back to that" — and then actually come back to it another time.',
    ],
    firstTime: 'The listener will want to solve it within ninety seconds. Notice the urge and do not act on it.',
    ifItGoesBadly: 'If it turns into a relationship argument twice running, shorten it to ten minutes and keep the topic strictly external until that holds.',
    marker: 'Within six weeks: you know something about their week that you would not otherwise have known.',
    indicatedFor: ['responsiveness', 'closeness', 'lifeSatisfaction'],
    modes: ['endure', 'repair'],
    contraindications: { physicalViolence: true, coerciveControl: true, ended: true },
    cautionNote: 'Not offered where there is violence or control: an exercise that asks someone to open up nightly assumes it is safe to be known, and that is exactly what is not true there.',
  },
  {
    id: 'softened-start',
    title: 'Changing the first thirty seconds',
    tradition: 'Softened start-up (Gottman)',
    sources: ['christensen1990', 'christensen2004'],
    purpose: 'How a difficult conversation begins predicts how it ends, with unusual reliability.',
    stage: 'week',
    minutes: 5,
    needsPartner: false,
    steps: [
      'Write the opening sentence down before you say it. Once. This is the entire discipline.',
      'Three parts, in order: how you feel, about what specific situation, and what you need. "I feel X about Y, and I need Z."',
      'No "you always", no "you never", and no starting with the word "you" at all.',
      'Name a situation, not a character trait. "The last three times we planned something" is a situation. "You are unreliable" is a verdict, and nobody negotiates with a verdict.',
      'Say the sentence you wrote. Then stop talking and let them answer.',
    ],
    firstTime: 'Writing it down will feel absurd for a conversation you have had fifty times. Do it anyway — the fifty previous times are the argument for it.',
    ifItGoesBadly: 'If they react to the old version of this conversation rather than to what you actually said, say so once, plainly, and do not escalate to prove it.',
    marker: 'Within six weeks: one difficult conversation that did not become an argument.',
    indicatedFor: ['conflict', 'responsiveness'],
    modes: ['repair', 'endure'],
    contraindications: { physicalViolence: true, coerciveControl: true, ended: true },
    cautionNote: 'A communication technique cannot fix a power imbalance, and offering one where there is coercive control implies the problem is phrasing.',
  },
  {
    id: 'active-constructive',
    title: 'What you do with their good news',
    tradition: 'Active-constructive responding / capitalization (Gable)',
    sources: ['reis2004', 'algoe2010'],
    purpose: 'How a partner responds to good news predicts relationship quality better than how they respond to bad news.',
    stage: 'now',
    minutes: 3,
    needsPartner: false,
    steps: [
      'When they tell you something good, stop what you are doing. Physically. That is most of it.',
      'Ask them to tell you more, and mean it. Make them re-live the good part rather than summarising it.',
      'Do not immediately relate it to yourself, and do not name the complication. The complication will still be there in an hour.',
      'Four responses exist and only one works: enthusiastic and curious. Quiet approval, pointing out the downside, and changing the subject all measure as costs.',
    ],
    firstTime: 'You will notice how often you have been doing one of the other three.',
    ifItGoesBadly: 'If it feels performative, you are overdoing the enthusiasm. Curiosity is the active ingredient, not volume.',
    marker: 'Within four weeks: they bring you good news first, rather than telling someone else.',
    indicatedFor: ['responsiveness', 'appreciation', 'closeness'],
    modes: ['repair', 'endure', 'understand'],
    contraindications: { ended: true },
  },
  {
    id: 'self-expansion',
    title: 'Something new, together, that neither of you is good at',
    tradition: 'Self-expansion model (Aron)',
    sources: ['aron1986', 'aron1992'],
    purpose: 'Novel, effortful shared activity reliably moves closeness. Pleasant familiar activity does not.',
    stage: 'month',
    minutes: 90,
    needsPartner: true,
    steps: [
      'Pick something you have both never done and neither is competent at. Incompetence is the mechanism — it is why a new restaurant does nothing.',
      'It has to be slightly effortful and slightly absurd. The research word is "novel and arousing"; the practical version is "you will both be bad at it and laugh".',
      'Once a fortnight, not once. A single outing is a memory; a rhythm is a change.',
      'No phones, and no discussing the relationship while doing it.',
    ],
    firstTime: 'The planning will feel like a chore and the first twenty minutes will feel self-conscious.',
    ifItGoesBadly: 'If one of you is secretly competent at it, pick something else. The shared incompetence is not a joke, it is the active ingredient.',
    marker: 'Within eight weeks: a reference that only the two of you understand, that did not exist before.',
    indicatedFor: ['closeness', 'growth', 'satisfaction'],
    modes: ['repair', 'endure'],
    contraindications: { ended: true, physicalViolence: true, stillDeciding: true },
    cautionNote: 'Withheld where there is violence, and withheld from someone still deciding — closeness-building work quietly assumes the decision to stay has already been made, and making it for them is not our job.',
  },

  /* ══════════════ the harder ones ══════════════ */
  {
    id: 'cycle-naming',
    title: 'Naming the loop, out loud, while it is happening',
    tradition: 'Unified detachment (IBCT) / cycle de-escalation (EFT)',
    sources: ['christensen2004', 'doss2016'],
    purpose: 'Moves the problem from "you versus me" to "us versus the pattern" — the mechanism most couple therapies share.',
    stage: 'week',
    minutes: 15,
    needsPartner: true,
    steps: [
      'While calm, agree a name for the loop. Something slightly ridiculous works best, because it is hard to stay contemptuous while saying a silly word.',
      'Each of you writes your own move in it. Not theirs. "When I feel dismissed I go cold" — your move only.',
      'Write what you imagine the other person is feeling at their move. Then ask, and find out you were partly wrong.',
      'Agree that either of you can name the loop while it is running, and that naming it is not an accusation.',
      'The first several times you will name it too late, after the damage. That is still progress; the gap between the damage and the naming shortens.',
    ],
    firstTime: 'Naming it mid-fight will feel like a cheap trick the first three times, and then one time it will actually stop the fight.',
    ifItGoesBadly: 'If naming it becomes a weapon — "there you go, doing your thing" — stop using it mid-fight and only use it afterwards for a while.',
    marker: 'Within six weeks: you both used the name once, and neither of you used it as an insult.',
    indicatedFor: ['conflict', 'responsiveness', 'attachAnxiety', 'attachAvoidance'],
    modes: ['repair', 'understand', 'endure'],
    contraindications: { physicalViolence: true, coerciveControl: true, ended: true, perpetration: true },
    cautionNote: 'A shared-cycle frame says both people contribute. Handed to someone being hurt, that is not neutrality — it is ammunition for the person hurting them.',
  },
  {
    id: 'woop',
    title: 'Wish, outcome, obstacle, plan',
    tradition: 'Mental contrasting with implementation intentions — WOOP (Oettingen; Gollwitzer)',
    sources: ['oettingen2014', 'gollwitzer2006'],
    purpose: 'If-then plans produced a medium-to-large effect on goal attainment across 94 studies. Positive imagining alone reduces action; contrasting it against the real obstacle restores it.',
    stage: 'now',
    minutes: 10,
    needsPartner: false,
    steps: [
      'Write the wish in one sentence. Something reachable in four weeks, not a life change.',
      'Write the best realistic outcome. Then spend a minute actually picturing it — not longer, because fantasy on its own reduces the chance you act.',
      'Write the obstacle. Not the world\'s obstacle — YOURS. The internal one. "I will decide it is not the right moment" is an obstacle; "he is busy" is an excuse.',
      'Write the plan in exactly this form: "If [obstacle happens], then I will [specific action]." The if-then grammar is the part that works.',
      'Keep it somewhere you will see it on a bad day, because a bad day is when it is needed.',
    ],
    firstTime: 'The obstacle step is the one people skip, and it is the one that does the work.',
    ifItGoesBadly: 'If you did not do it, the obstacle you named was the wrong one. Write the real one, which is usually more embarrassing.',
    marker: 'Two weeks: the if-then triggered at least once and you followed it.',
    indicatedFor: ['agency', 'autonomy', 'valuesLived', 'futureSelfContinuity'],
    modes: ['repair', 'decide', 'endure', 'recover', 'understand'],
    contraindications: {},
  },
  {
    id: 'expressive-writing',
    title: 'Twenty-one minutes, three times a year',
    tradition: 'Perspective-taking writing intervention (Finkel); expressive writing (Pennebaker)',
    sources: ['kross2014', 'grossmann2014'],
    purpose: 'Writing about a conflict from a neutral third party\'s view, three times a year, held off the decline in marital quality that the control group showed.',
    stage: 'month',
    minutes: 21,
    needsPartner: false,
    steps: [
      'Think of your most significant disagreement from the last few months.',
      'Write for seven minutes about it from the point of view of a neutral person who wants the best for both of you. Not a referee deciding who is right — someone who wants you both to do well.',
      'Write for seven minutes about what makes taking that view difficult for you.',
      'Write for seven minutes about how you could adopt that view next time, despite the difficulty.',
      'Do this three times a year. Not weekly — the effect came from a small dose, and more is not better here.',
    ],
    firstTime: 'The middle section is uncomfortable and that is where the effect lives.',
    ifItGoesBadly: 'If it turns into a list of their faults, you have written from your own view. Start again and put an actual specific person in the neutral chair.',
    marker: 'The next argument: you notice the third view once, during, rather than afterwards.',
    indicatedFor: ['conflict', 'emotionRegulation', 'rumination'],
    modes: ['repair', 'endure', 'understand', 'decide'],
    contraindications: { physicalViolence: true, coerciveControl: true },
    cautionNote: 'Asking someone to take a neutral third view of a person who is hurting them is not perspective-taking; it is asking them to argue themselves out of what they already know.',
  },
  {
    id: 'self-distance',
    title: 'Write it as your friend\'s problem',
    tradition: 'Self-distancing (Kross); Solomon\'s paradox (Grossmann & Kross)',
    sources: ['kross2014', 'grossmann2014'],
    purpose: 'People reason measurably more wisely about someone else\'s version of their problem. Self-distancing eliminates the gap entirely.',
    stage: 'now',
    minutes: 12,
    needsPartner: false,
    steps: [
      'Write your situation as though it is happening to a friend, in the third person, using their name rather than "I".',
      'Keep every fact, change nothing to make the person more sympathetic. The temptation to shade it is worth noticing.',
      'Now write what you would tell that friend. Plainly, the way you would actually say it.',
      'Read it back the next morning, not the same night.',
    ],
    firstTime: 'You will write the advice faster and more decisively than you can think about your own situation. That gap is the finding.',
    ifItGoesBadly: 'If you cannot get out of the first person, write it as a scene with dialogue instead. The form matters less than the distance.',
    marker: 'Immediate: you produce advice you had not been able to reach for yourself.',
    indicatedFor: ['rumination', 'ambivalence', 'selfConceptClarity', 'agency'],
    modes: ['decide', 'understand', 'recover', 'repair'],
    contraindications: {},
  },
  {
    id: 'decisional-balance',
    title: 'Both lists, written properly',
    tradition: 'Decisional balance; discernment counselling (Doherty)',
    sources: ['doherty2016', 'joel2018', 'miller2013'],
    purpose: 'People hold many reasons to stay and many to leave at the same time. Writing only one list is how a decision gets made badly.',
    stage: 'week',
    minutes: 30,
    needsPartner: false,
    steps: [
      'Four lists, not two: reasons to stay, costs of staying, reasons to leave, costs of leaving. The two cost columns are the ones people skip.',
      'Write each entry as a concrete consequence, not a feeling. "I would not see his mother again" rather than "it would be sad".',
      'Mark each one: is this about the relationship, or about what leaving would cost? Those are different, and mixing them is how people stay for years.',
      'Leave it for three days without deciding anything. The lists need to be read on a different day than they were written, in a different mood.',
      'Come back and mark which entries have changed in the last year. A reason that has not moved in a year is a fact; one that changes weekly is a mood.',
    ],
    firstTime: 'The "costs of staying" column is the one that takes longest and matters most.',
    ifItGoesBadly: 'If one column is empty, you are arguing with yourself rather than looking. Ask what someone who disagreed with you would put there.',
    marker: 'Within two weeks: you can say what you would need to see change, specifically, to stay.',
    indicatedFor: ['ambivalence', 'constraint', 'alternatives', 'ownDedication'],
    modes: ['decide'],
    contraindications: { ended: true },
  },
  {
    id: 'differentiation',
    title: 'Your own position, said once, without a fight',
    tradition: 'Differentiation of self (Bowen family systems)',
    sources: ['bowen1978', 'chirkov2003', 'yeh2003'],
    purpose: 'Holding your own position while staying connected to people who disagree. Bowen\'s central distinction: being your own person is not the same as cutting anyone off, and most people caught between a partner and a family think they must choose.',
    stage: 'month',
    minutes: 30,
    needsPartner: false,
    steps: [
      'Write your position in one sentence, as a statement about you rather than about them. "I am going to marry him" — not "you are being unfair".',
      'Decide in advance what you will do if they react badly, and what you will NOT do. Not retaliating and not capitulating are both decisions, and both need making beforehand.',
      'Say it once, calmly, to one person — not the whole family at once, and not by message.',
      'Do not defend it, do not argue it, do not repeat it louder. You have said it; their reaction is theirs to have.',
      'Stay in contact afterwards. This is the part that distinguishes holding a position from cutting off, and it is the part that makes reconciliation possible later.',
    ],
    firstTime: 'The silence after you say it will be the longest ten seconds of the year, and the urge to fill it by softening what you said will be enormous.',
    ifItGoesBadly: 'If it turns into a fight, leave the room without withdrawing from the relationship — go, and come back the next day as normal. Coming back is the message.',
    marker: 'Within eight weeks: you stated your position once and did not either escalate or retract it.',
    indicatedFor: ['familyApproval', 'autonomy', 'constraint', 'agency'],
    modes: ['decide', 'endure', 'repair'],
    contraindications: { physicalViolence: true },
    cautionNote: 'Where a family is a source of physical danger rather than pressure, this is the wrong tool and the priority is safety, not position-holding.',
  },
  {
    id: 'behavioural-activation',
    title: 'Two things on the calendar that are yours',
    tradition: 'Behavioural activation',
    sources: ['ryan2000', 'diener1985'],
    purpose: 'The single component that moved symptoms in a dismantling trial of a digital single-session intervention. Insight without a scheduled action is the failure mode that looks like success.',
    stage: 'now',
    minutes: 10,
    needsPartner: false,
    steps: [
      'Pick two things that are yours and not theirs. A person you have not called, a thing you used to do, somewhere you used to go.',
      'Put them in the calendar with a day and a time. Not "this week" — Tuesday, seven.',
      'Tell one other person that you are doing them. External commitment roughly doubles follow-through.',
      'Do them whether or not you feel like it on the day. Waiting to feel like it is the mechanism of the problem, not the solution to it.',
    ],
    firstTime: 'You will not feel like it. That is expected and is not a signal about whether to go.',
    ifItGoesBadly: 'If you cancelled both, halve the size and put them back. A twenty-minute walk that happens beats an evening that does not.',
    marker: 'Two weeks: both happened, at least once each.',
    indicatedFor: ['lifeSatisfaction', 'relatedness', 'agency', 'competence', 'rumination'],
    modes: ['recover', 'endure', 'understand', 'decide'],
    contraindications: {},
  },
  {
    id: 'rumination-window',
    title: 'A fixed appointment for the overthinking',
    tradition: 'Stimulus-control for rumination; worry postponement',
    sources: ['treynor2003', 'gross2003'],
    purpose: 'Brooding is the component of rumination that predicts worse outcomes. Containing it works better than trying to stop it.',
    stage: 'now',
    minutes: 15,
    needsPartner: false,
    steps: [
      'Book fifteen minutes a day, same time, same place, for thinking about this. Not in bed and not the last thing at night.',
      'Outside that window, when it starts, write one line in your phone and tell yourself it has an appointment. You are postponing, not suppressing — suppression rebounds and postponement does not.',
      'In the window, think about it deliberately, with a pen. Write. Do not just circle.',
      'When the fifteen minutes end, stop mid-sentence if you have to. Ending on time is the whole intervention.',
    ],
    firstTime: 'The postponing will not work for the first few days. It starts working around day four.',
    ifItGoesBadly: 'If the window itself makes it worse, shorten it to ten minutes and end with writing one thing you will actually do tomorrow.',
    marker: 'Two weeks: fewer than half your days had the thinking outside the window.',
    indicatedFor: ['rumination', 'emotionRegulation', 'attachAnxiety'],
    modes: ['recover', 'understand', 'decide', 'endure'],
    contraindications: {},
  },
  {
    id: 'grief-structure',
    title: 'Structure for the first eight weeks',
    tradition: 'Behavioural activation + self-compassion (Neff) after loss',
    sources: ['neff2003', 'treynor2003', 'ryan2000'],
    purpose: 'After an ending, the task is not deciding anything. It is getting through the part where nothing helps.',
    stage: 'now',
    minutes: 15,
    needsPartner: false,
    steps: [
      'Three fixed points every day — a wake time, one meal with another person if possible, and one thing outside the house. Structure does more early on than insight does.',
      'Decide what you are doing about contact and write it down. Any rule works better than deciding fresh every time you want to message them.',
      'One person gets to hear the unedited version. One. Telling everybody spreads it thin; telling nobody is worse.',
      'Expect the fourth to sixth week to be worse than the second. People assume it is a straight line and conclude something is wrong with them when it is not.',
      'When you catch yourself listing your faults, ask what you would say to a friend in exactly this position, and say that instead. Self-compassion is trainable and this is the training.',
    ],
    firstTime: 'The structure will feel pointless and mechanical. It works anyway, which is the point of structure.',
    ifItGoesBadly: 'If the fixed points are not happening, cut to one: the wake time. Everything else is easier from there.',
    marker: 'Six weeks: the three fixed points are happening most days.',
    indicatedFor: ['lifeSatisfaction', 'rumination', 'selfCompassion', 'relatedness'],
    modes: ['recover'],
    contraindications: {},
  },
  {
    id: 'values-week',
    title: 'One week measured against what you said matters',
    tradition: 'Values clarification and committed action (ACT); mental contrasting',
    sources: ['schwartz2012', 'miller2013', 'oettingen2014'],
    purpose: 'Closes the gap between a stated value and an actual week — the most common shape of a stuck life, and measurable rather than felt.',
    stage: 'week',
    minutes: 15,
    needsPartner: false,
    steps: [
      'Take the value you named as mattering most. Write the three things you did last week that served it. If you cannot find three, write however many there were, including none.',
      'Now find one hour in the coming week that currently serves nothing, and give it to that value. One hour, named, in the calendar.',
      'At the end of the week, write what actually happened to that hour. Honestly, including if it vanished.',
      'Repeat for four weeks. The point is not the hour; it is watching what reliably takes it.',
    ],
    firstTime: 'The hour will get eaten in week one. What eats it is the finding.',
    ifItGoesBadly: 'If it is eaten three weeks running, the value may not be the one that actually matters most — or something is claiming a priority you have not admitted to.',
    marker: 'Four weeks: you can name exactly what takes the hour, which is more useful than protecting it.',
    indicatedFor: ['valuesLived', 'autonomy', 'agency', 'selfConceptClarity'],
    modes: ['understand', 'decide', 'repair', 'endure', 'recover'],
    contraindications: {},
  },
  {
    id: 'big-assumption',
    title: 'The smallest safe test of the belief',
    tradition: 'Immunity to Change — Big Assumption testing (Kegan & Lahey)',
    sources: ['kegan2009', 'miller2013'],
    purpose: 'A belief that has never been tested runs your life on the assumption it is true. One small, safe, deliberate test changes what you know rather than what you think.',
    stage: 'month',
    minutes: 25,
    needsPartner: false,
    steps: [
      'Write the belief as a flat sentence: "If I ___, then ___." The second half is the part running your decisions.',
      'Design the smallest possible test. Small enough that being wrong costs you almost nothing — the point is information, not courage.',
      'Write down, before you run it, exactly what you predict will happen. Specific enough to be wrong.',
      'Run the test once, exactly as designed, without enlarging it in the moment because it felt too small. Enlarging it is how people avoid running it at all.',
      'Write what actually happened next to what you predicted. Compare them. Most Big Assumptions survive the first test partly intact and that is still new information.',
    ],
    firstTime: 'You will want to design a bigger test than necessary. Resist it — a big test that you never run teaches you nothing.',
    ifItGoesBadly: 'If the prediction came true, the belief is partly accurate. That is a real result, and the next question is whether it is true everywhere or only with that person.',
    marker: 'Within six weeks: one test run, one prediction written beforehand, one comparison made.',
    indicatedFor: ['coreBeliefSelf', 'coreBeliefOther', 'agency', 'autonomy', 'futureSelfContinuity'],
    modes: ['understand', 'decide', 'repair', 'recover', 'endure'],
    contraindications: {},
  },
  {
    id: 'future-self-letter',
    title: 'A letter from the person you described',
    tradition: 'Future self-continuity (Hershfield); Best Possible Self (King)',
    sources: ['hershfield2011', 'markus1986'],
    purpose: 'People who feel continuous with their future self make choices that serve it. The exercise builds similarity, not aspiration — aspiration alone does nothing.',
    stage: 'week',
    minutes: 20,
    needsPartner: false,
    steps: [
      'Write a letter TO yourself now, FROM yourself ten years on, in their voice.',
      'They are not a better person. They are you, with ten more years. Include something they still find difficult — similarity is the mechanism, and a flawless future self is a stranger.',
      'Have them name the one thing you did this year that mattered, and the one thing they wish you had started sooner.',
      'Put a date on it and keep it somewhere you will find it by accident.',
    ],
    firstTime: 'Writing in their voice feels strange for the first paragraph and then unlocks.',
    ifItGoesBadly: 'If the letter reads like a motivational poster, you have written a stranger. Give them a specific ordinary Tuesday and an unresolved problem.',
    marker: 'Immediate: the letter names one thing to start sooner, and you can say when you will start it.',
    indicatedFor: ['futureSelfContinuity', 'valuesLived', 'agency'],
    modes: ['understand', 'decide', 'recover'],
    contraindications: {},
  },
]

export const PRACTICE_BY_ID: Record<string, Practice> = Object.fromEntries(PRACTICES.map((p) => [p.id, p]))

/* ────────────────────────────  selection  ──────────────────────────── */

export interface PracticeContext {
  help: HelpMode[]
  /** Dimensions where this person is actually struggling, worst first. */
  weakest: DimensionId[]
  ended: boolean
  stillDeciding: boolean
  safety: { physical: boolean; coercive: boolean; selfRisk: boolean; perpetration: boolean }
}

/**
 * Choose the practices this person should actually be given, in the order they should do them.
 *
 * Contraindications are checked FIRST and are absolute. Everything else is ranking.
 */
export function selectPractices(ctx: PracticeContext, limit = 5): Practice[] {
  const allowed = PRACTICES.filter((p) => {
    const c = p.contraindications
    if (c.physicalViolence && ctx.safety.physical) return false
    if (c.coerciveControl && ctx.safety.coercive) return false
    if (c.selfRisk && ctx.safety.selfRisk) return false
    if (c.perpetration && ctx.safety.perpetration) return false
    if (c.ended && ctx.ended) return false
    if (c.stillDeciding && ctx.stillDeciding) return false
    return p.modes.some((m) => ctx.help.includes(m))
  })

  const scored = allowed.map((p) => {
    // A practice that targets the dimension they are worst on is worth more than one that does not.
    let fit = 0
    for (let i = 0; i < ctx.weakest.length; i++) {
      if (p.indicatedFor.includes(ctx.weakest[i]!)) fit += ctx.weakest.length - i
    }
    // Cheap practices win ties: an exercise nobody has time for is an exercise nobody does.
    const cost = p.minutes / 120
    // Solo-doable wins ties too — solo users are first-class, and a partner may not be available.
    const solo = p.needsPartner ? 0 : 0.6
    return { p, score: fit + solo - cost }
  })

  const STAGE_ORDER: Record<PracticeStage, number> = { now: 0, week: 1, month: 2 }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p)
    .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage])
}
