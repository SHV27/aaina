import type { Activity } from "./types";

/** THE ACTIVITY LIBRARY — the second half of a counsellor's job.
 *
 *  Every entry is a real, published intervention with its mechanism, its evidence
 *  grade, its indications, and — the part that matters most — its contraindications.
 *  Nothing here is invented advice. The plan builder selects from this library;
 *  it never writes activities of its own.
 *
 *  Evidence grades: A = multiple RCTs or meta-analysis · B = at least one RCT or
 *  strong longitudinal evidence · C = established clinical protocol, theory-backed. */

export const ACTIVITIES: Activity[] = [
  /* ---------------- Positivity first (BCT sequencing law) ---------------- */
  {
    id: "gratitude-spoken",
    title: "Say the specific thank-you",
    mechanism:
      "Voicing appreciation for one concrete thing your partner did makes both people feel more connected, and the effect shows up the next day, not months later.",
    citation: "algoe-2010",
    evidence: "B",
    indications: [{ dimension: "satisfaction", below: 60 }, { dimension: "responsiveness", below: 60 }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 5,
    roads: ["repair", "decide"],
    steps: [
      "Once a day for the next week, name one specific thing they did — not a quality they have.",
      "Say what it did for you: “When you called Ma yourself, I stopped carrying that all day.”",
      "Do not attach a request to it. This one is not a negotiation.",
    ],
  },
  {
    id: "acr-good-news",
    title: "Respond properly when they are happy",
    mechanism:
      "How you react to your partner's good news predicts satisfaction and breakup risk better than how you handle their bad news. Enthusiasm plus questions is the version that works.",
    citation: "gable-2004",
    evidence: "B",
    indications: [{ dimension: "responsiveness", below: 65 }, { dimension: "satisfaction", below: 65 }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 3,
    roads: ["repair", "decide"],
    steps: [
      "When they tell you something good, stop what you are doing and turn towards them.",
      "React first, ask second: “That's brilliant — how did they tell you?”",
      "Keep them in the good news for a full minute before you move on or add a caution.",
    ],
  },
  {
    id: "caring-days",
    title: "Two weeks of small deliberate things",
    mechanism:
      "Each person writes a list of small things that would make them feel cared for, then both do items from the other's list daily — regardless of how the day went. It rebuilds goodwill before any hard conversation.",
    citation: "christensen-2004",
    evidence: "B",
    indications: [{ dimension: "satisfaction", below: 50 }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 15,
    roads: ["repair"],
    steps: [
      "Each of you writes 8–10 small, specific, doable requests. “Text me when you reach” counts. “Be more loving” does not.",
      "Swap lists. Each day, do at least two things from theirs.",
      "No scorekeeping and no trading. If it becomes a ledger, stop and go back to the list.",
    ],
  },

  /* ---------------- Conflict ---------------- */
  {
    id: "speaker-listener",
    title: "The structured conversation",
    mechanism:
      "One person speaks in short pieces; the other paraphrases before replying. It slows escalation down enough that the actual disagreement becomes visible. This is the core skill taught in couple-education trials.",
    citation: "braithwaite-fincham-2011",
    evidence: "A",
    indications: [{ dimension: "conflict-pattern", below: 50 }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 25,
    roads: ["repair"],
    steps: [
      "Pick one topic and one object to hold. Whoever holds it is the speaker.",
      "Speaker: two or three sentences, about your own experience, then stop.",
      "Listener: say back what you heard before you answer. Not agreement — accuracy.",
      "Swap the object. Twenty minutes maximum, then stop whether or not it is resolved.",
    ],
  },
  {
    id: "soft-startup",
    title: "Change the first thirty seconds",
    mechanism:
      "How a disagreement opens predicts how it ends with unnerving accuracy. Starting with the situation and your own feeling, instead of their character, changes the whole conversation.",
    citation: "christensen-1990",
    evidence: "B",
    indications: [{ dimension: "conflict-pattern", below: 55 }, { kind: "conflict-avoided-not-solved" }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 5,
    roads: ["repair", "decide"],
    steps: [
      "Write the opening sentence before you say it. Three parts: what happened, what you felt, what you need.",
      "“When the plan changed and I found out from your friend, I felt sidelined. I need to hear it from you first.”",
      "Ban two words from the opening: “always” and “never”.",
    ],
  },
  {
    id: "time-out-protocol",
    title: "The twenty-minute break, with a return time",
    mechanism:
      "Past a certain point of physiological arousal people stop taking in new information, so continuing the argument cannot work. A break only helps if a return time is agreed, otherwise it becomes stonewalling.",
    citation: "christensen-1990",
    evidence: "C",
    indications: [{ dimension: "conflict-pattern", below: 45 }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 20,
    roads: ["repair", "decide"],
    steps: [
      "Agree the signal now, while things are calm. One word, no sarcasm.",
      "Whoever calls it names the return time out loud: “Twenty minutes, then we finish this.”",
      "During the break, do not rehearse your case. Walk, wash your face, anything that is not the argument.",
      "Come back at the time you said. That part is the whole protocol.",
    ],
  },
  {
    id: "reappraisal-writing",
    title: "The seven-minute rewrite",
    mechanism:
      "Write about your last fight from the point of view of a neutral person who wants the best for both of you. In a controlled trial, three of these a year stopped the usual decline in marital quality.",
    citation: "finkel-2013",
    evidence: "B",
    indications: [{ dimension: "conflict-pattern", below: 60 }, { kind: "commitment-without-satisfaction" }],
    contraindications: [],
    soloOk: true,
    minutes: 7,
    roads: ["repair", "decide"],
    steps: [
      "Think of your most recent disagreement.",
      "Write for seven minutes as a neutral third person who wants the best for both of you. What would they notice that you missed?",
      "Then write two lines on what stops you taking that view mid-fight, and what would help you take it next time.",
      "Repeat about every four months. Three times a year is the tested dose.",
    ],
  },
  {
    id: "unified-detachment",
    title: "Name the pattern and put it on the table",
    mechanism:
      "Describing the cycle together as a third thing — “it” — moves the conversation from blaming each other to studying something you are both stuck inside.",
    citation: "christensen-2004",
    evidence: "A",
    indications: [{ dimension: "conflict-pattern", below: 50 }, { kind: "conflict-avoided-not-solved" }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 30,
    roads: ["repair"],
    steps: [
      "Give the pattern a plain name you both accept. “The Sunday thing.” “The chase and the wall.”",
      "Describe the last time it ran, in sequence, without adjectives about each other.",
      "Find the point where it turns. That point, not the topic, is what you work on.",
    ],
  },

  /* ---------------- Closeness ---------------- */
  {
    id: "novel-activity",
    title: "Do something new together, not something nice",
    mechanism:
      "New and slightly demanding shared activities raise relationship quality; pleasant familiar ones do not. Novelty is the active ingredient, which is why dinner at the usual place does nothing.",
    citation: "aron-2000",
    evidence: "A",
    indications: [{ dimension: "intimacy-sexual", below: 60 }, { dimension: "satisfaction", below: 65 }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 90,
    roads: ["repair"],
    steps: [
      "Choose something neither of you has done and both are slightly bad at. Climbing wall, pottery, a cooking class, a new part of the city on foot.",
      "Once a week for four weeks. Same slot, protected.",
      "The rule: it has to be a little awkward. Comfortable does not work.",
    ],
  },
  {
    id: "36-questions",
    title: "The thirty-six questions",
    mechanism:
      "A published sequence of escalating personal questions that reliably generates closeness between strangers, and works on people who think they already know everything about each other.",
    citation: "aron-1997",
    evidence: "B",
    indications: [{ dimension: "responsiveness", below: 60 }, { dimension: "intimacy-sexual", below: 55 }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 60,
    roads: ["repair"],
    steps: [
      "Three sets of twelve questions, in order, both answering each. Phones away.",
      "Do not skip ahead to the deep ones. The order is what does the work.",
      "Finish with four minutes of looking at each other without talking. It is uncomfortable and it is the point.",
    ],
  },
  {
    id: "stress-debrief",
    title: "The daily fifteen about everything else",
    mechanism:
      "A protected conversation about stress from outside the relationship, where the listener validates and does not solve. It stops outside pressure from being processed as relationship failure.",
    citation: "bodenmann-2008",
    evidence: "B",
    indications: [{ dimension: "responsiveness", below: 65 }, { dimension: "satisfaction", below: 60 }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 15,
    roads: ["repair", "decide"],
    steps: [
      "Fifteen minutes, most days, about anything that is not the two of you.",
      "The listener's job is to take your side against the world. No advice unless asked.",
      "If a relationship complaint sneaks in, park it. This slot is not for that, and protecting it is what makes it work.",
    ],
  },
  {
    id: "sexual-communication",
    title: "The conversation about sex, in writing first",
    mechanism:
      "Couples who can talk specifically about sex report more sexual and relationship satisfaction. Writing first removes the on-the-spot pressure that makes the conversation fail.",
    citation: "mallory-2022",
    evidence: "B",
    indications: [{ dimension: "intimacy-sexual", below: 50 }, { kind: "intimacy-gap" }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 40,
    roads: ["repair"],
    steps: [
      "Separately, each write three things: something you like and want more of, something you are curious about, something you would rather stop.",
      "Swap the lists and read them without discussing. Sit with it for a day.",
      "Then talk, starting with the “more of” list only. The other two lists can wait a week.",
    ],
  },

  /* ---------------- Attachment ---------------- */
  {
    id: "ask-plainly",
    title: "Ask for reassurance in words instead of tests",
    mechanism:
      "Anxiety about being wanted usually gets expressed as testing, checking or withdrawing, which produces the distance it fears. Naming the need directly is the intervention.",
    citation: "wei-2007",
    evidence: "C",
    indications: [{ dimension: "attachment-anxiety", below: 50 }, { kind: "closeness-wanted-not-allowed" }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 10,
    roads: ["repair", "decide"],
    steps: [
      "Notice the next time you are about to check their phone, re-read a message, or go quiet to see if they notice.",
      "Instead, say the sentence underneath it: “I am feeling far from you and I would like to hear that we are okay.”",
      "Write down what actually happened after you said it. Do this five times before you judge whether it works.",
    ],
  },
  {
    id: "name-the-exit",
    title: "Leave the room out loud",
    mechanism:
      "Needing space is legitimate; disappearing without saying so reads as abandonment and escalates the pursuit you are trying to escape. Announcing the exit keeps the need and removes the damage.",
    citation: "wei-2007",
    evidence: "C",
    indications: [{ dimension: "attachment-avoidance", below: 50 }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 5,
    roads: ["repair", "decide"],
    steps: [
      "When you feel the pull to withdraw, say it: “I need an hour. I am not going anywhere.”",
      "Name the return time, and keep it.",
      "Afterwards, say one sentence about what you needed the hour for. One sentence is enough.",
    ],
  },
  {
    id: "hold-me-tight",
    title: "The conversation underneath the fight",
    mechanism:
      "A structured conversation where each person shows the fear under their usual reaction — the anger that is actually panic, the silence that is actually shame — and the other responds to that instead of to the surface.",
    citation: "johnson-1999",
    evidence: "A",
    indications: [{ dimension: "attachment-anxiety", below: 45 }, { kind: "closeness-wanted-not-allowed" }],
    contraindications: ["risk-positive", "partner-unwilling"],
    soloOk: false,
    minutes: 60,
    roads: ["repair"],
    steps: [
      "Each of you finishes: “When we fight, what I am most afraid of is…”",
      "The other person's only job is to say what they heard and what it makes them want to do for you.",
      "Then swap. Do not problem-solve in this conversation. This one is only for being heard.",
      "If either of you cannot get there, that is information, not failure — it usually means a professional should be in the room.",
    ],
  },

  /* ---------------- Digital ---------------- */
  {
    id: "phone-boundary",
    title: "Two phone-free hours you both defend",
    mechanism:
      "Being ignored for a phone predicts conflict about phones, which predicts lower satisfaction. Fixing it is unglamorous and specific: a protected window, agreed rather than imposed.",
    citation: "roberts-david-2016",
    evidence: "B",
    indications: [{ dimension: "digital-strain", below: 55 }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 120,
    roads: ["repair", "decide"],
    steps: [
      "Pick the two hours that matter most — usually dinner and the hour before sleep.",
      "Phones in another room, not face-down on the table. Face-down still wins the room.",
      "If one of you slips, the other says the agreed word, not a complaint.",
    ],
  },
  {
    id: "stop-checking",
    title: "A week without checking",
    mechanism:
      "Monitoring a partner online relieves anxiety for minutes and rebuilds it for hours; over a year the loop predicts lower satisfaction. Breaking the loop requires stopping the behaviour, not winning the argument about it.",
    citation: "tokunaga-2011",
    evidence: "B",
    indications: [{ dimension: "digital-strain", below: 50 }, { kind: "trust-vs-surveillance" }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 10,
    roads: ["repair", "decide"],
    steps: [
      "For seven days: no checking their likes, their last-seen, their followers, or their location.",
      "Each time you want to, write down the time and what you were afraid of. One line.",
      "At the end of the week, read the list. The pattern in it is the thing to talk about — with them, or with someone else.",
    ],
  },

  /* ---------------- Deciding ---------------- */
  {
    id: "three-roads",
    title: "Put the three roads on paper",
    mechanism:
      "The structure used in discernment counselling for people who are genuinely undecided: not a choice between staying and leaving, but between three roads — carry on as you are, separate, or commit fully to a bounded repair effort and then decide.",
    citation: "doherty-2016",
    evidence: "C",
    indications: [{ kind: "commitment-without-satisfaction" }, { kind: "staying-from-fear" }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 45,
    roads: ["decide"],
    steps: [
      "Three columns: carry on unchanged, separate, six months of real effort then decide.",
      "For each, write what it costs you, what it costs them, and what you would need to be able to live with it.",
      "Add one line to each: what would have to be true in six months for this to have been the right road?",
      "Keep the page. Re-read it in two weeks and see which column you keep defending.",
    ],
  },
  {
    id: "six-month-test",
    title: "The six-month experiment, with a date",
    mechanism:
      "Endless ambivalence is exhausting because it has no end condition. Committing fully to two or three specific changes, with a date to reassess, converts an unanswerable question into an experiment that produces an answer.",
    citation: "doherty-2016",
    evidence: "C",
    indications: [{ kind: "commitment-without-satisfaction" }, { kind: "certainty-gap" }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 30,
    roads: ["decide", "repair"],
    steps: [
      "Choose no more than three changes. Fewer is better and specific beats ambitious.",
      "Put a date in the calendar, six months out, with the words “decide” on it.",
      "Between now and then, act as though you have chosen to stay. Half-effort makes the experiment meaningless.",
      "On the date, retake this assessment and compare. That comparison is the answer you have been waiting for.",
    ],
  },
  {
    id: "define-it",
    title: "Ask the question you have been avoiding",
    mechanism:
      "Not knowing what something is, and not knowing whether the other person agrees, is independently linked to distress. The uncertainty is the injury, and the only treatment is the conversation.",
    citation: "knobloch-solomon-1999",
    evidence: "B",
    indications: [{ dimension: "relational-certainty", below: 50 }, { kind: "certainty-gap" }],
    contraindications: ["risk-positive"],
    soloOk: true,
    minutes: 20,
    roads: ["decide"],
    steps: [
      "Write the question in one sentence. Usually it is simply: “What are we?”",
      "Decide in advance what you will do with each possible answer, including the one you do not want.",
      "Ask it in person, early in a conversation, not at 1 a.m. at the end of one.",
      "If the answer is a non-answer twice, treat the non-answer as the answer.",
    ],
  },

  /* ---------------- Leaving and after ---------------- */
  {
    id: "self-compassion",
    title: "Talk to yourself the way you would to your closest friend",
    mechanism:
      "How kindly people speak about themselves during a separation predicts how well they are doing months later — more strongly than how long the relationship was or who ended it.",
    citation: "sbarra-2012",
    evidence: "B",
    indications: [],
    contraindications: [],
    soloOk: true,
    minutes: 10,
    roads: ["leave", "decide", "safety"],
    steps: [
      "Write what you would say to your closest friend if they were in exactly your situation.",
      "Read it back addressed to yourself. Notice how different it is from what you have been saying.",
      "Keep it somewhere you will see it on the bad evenings.",
    ],
  },
  {
    id: "narrative-writing",
    title: "Write it as a story, not as a wound",
    mechanism:
      "Writing about a breakup helps only when it has the shape of a story — beginning, middle, and where you are now. Open-ended venting made things measurably worse for people prone to going over and over events.",
    citation: "sbarra-2013",
    evidence: "B",
    indications: [],
    contraindications: ["high-rumination"],
    soloOk: true,
    minutes: 20,
    roads: ["leave"],
    steps: [
      "Three sittings, twenty minutes each, spread over a week.",
      "Write it as a story with a beginning, a middle and a present tense. What happened, what it meant, where you are now.",
      "If you find yourself writing the same paragraph again in a different order, stop for the day. That is the pattern the research warns about.",
    ],
  },
  {
    id: "self-concept-rebuild",
    title: "Get back the parts of you that went quiet",
    mechanism:
      "Breakups blur the sense of who you are, and that blurring — not sadness alone — is what makes recovery slow. Deliberately restarting things that were yours before repairs it.",
    citation: "slotter-2010",
    evidence: "B",
    indications: [],
    contraindications: [],
    soloOk: true,
    minutes: 60,
    roads: ["leave"],
    steps: [
      "List five things you did before this relationship that you have not done in the last year.",
      "Restart two of them this month. Actual dates in the calendar.",
      "Tell one person about it, so it exists outside your head.",
    ],
  },
  {
    id: "reduce-monitoring",
    title: "Stop watching them from a distance",
    mechanism:
      "Continuing to follow an ex's life online is associated with slower recovery and more distress. The evidence here is correlational, so treat it as a strong hint rather than a law — but the hint is consistent.",
    citation: "tokunaga-2011",
    evidence: "C",
    indications: [],
    contraindications: ["co-parenting"],
    soloOk: true,
    minutes: 5,
    roads: ["leave"],
    steps: [
      "Mute rather than block if blocking feels too final. The goal is not to see it, not to make a statement.",
      "Remove the shortcut, not just the habit. Log out, delete the app for a fortnight.",
      "Give it thirty days before you decide whether it helped.",
    ],
  },
  {
    id: "structured-checkin",
    title: "A written check-in every week",
    mechanism:
      "In a study of people going through breakups, simply answering structured questions about themselves each week improved recovery — the reflection itself was the active ingredient, by making the sense of self clearer.",
    citation: "larson-sbarra-2015",
    evidence: "B",
    indications: [],
    contraindications: [],
    soloOk: true,
    minutes: 15,
    roads: ["leave", "decide", "repair"],
    steps: [
      "Same time each week. Three questions: what changed, what did not, what do I want next week to look like.",
      "Keep them in one place so you can read backwards.",
      "After six weeks, read the first entry. The distance travelled is usually invisible day to day and obvious across six weeks.",
    ],
  },

  /* ---------------- Safety ---------------- */
  {
    id: "safety-plan",
    title: "Make a safety plan, privately",
    mechanism:
      "A structured personal safety plan — where you would go, who you would call, what you would need to take — measurably reduces the difficulty of decisions and improves safety outcomes for people in violent relationships.",
    citation: "glass-2017",
    evidence: "A",
    indications: [],
    contraindications: [],
    soloOk: true,
    minutes: 30,
    roads: ["safety"],
    steps: [
      "Decide one place you could go tonight if you had to, and one person who would answer.",
      "Keep essentials together and accessible: identity documents, some money, medication, phone charger, a spare key.",
      "Agree a code word with one trusted person that means “call me and give me a reason to leave”.",
      "Do this on a device they cannot see, and do not save it where it can be found.",
    ],
  },
];

export const ACTIVITY_BY_ID = new Map(ACTIVITIES.map((a) => [a.id, a]));

/** Activities that must never be prescribed when the risk screen is positive.
 *  Enforced in the plan builder, tested in the Referee suite. */
export const CONJOINT_IDS = ACTIVITIES.filter((a) => !a.soloOk).map((a) => a.id);
