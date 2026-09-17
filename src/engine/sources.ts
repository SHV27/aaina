/**
 * The citation registry.
 *
 * Founder decision #8: every psychological claim must be traceable to named, published,
 * peer-reviewed work. A dimension, threshold, weight or interpretation rule that cannot name a
 * key in here does not ship. `sources.test.ts` asserts that every source key referenced anywhere
 * in the engine resolves, and that nothing here is orphaned.
 */

export interface Source {
  key: string
  authors: string
  year: number
  title: string
  venue: string
  /** What WE take from it. Not an abstract — the specific load it bears in this product. */
  claim: string
  url?: string
}

const S = <T extends Record<string, Omit<Source, 'key'>>>(t: T) => t

const RAW = S({
  /* ── the prediction literature: what is and is not computable ── */
  joel2020: {
    authors: 'Joel, S., Eastwick, P. W., Allison, C. J., et al.',
    year: 2020,
    title: 'Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies',
    venue: 'PNAS 117(32), 19061–19071',
    claim: 'Across 11,196 couples, own perceptions of the relationship explained up to ~45% of variance in relationship quality; partner-reported variables added only 0–3.5% beyond actor reports. Ranked predictor strength is the source of our composite weights. Change over time was near-unpredictable (~2–3%).',
    url: 'https://www.pnas.org/doi/10.1073/pnas.1917036117',
  },
  joel2017: {
    authors: 'Joel, S., Eastwick, P. W., & Finkel, E. J.',
    year: 2017,
    title: 'Is romantic desire predictable? Machine learning applied to initial romantic attraction',
    venue: 'Psychological Science 28(10), 1478–1489',
    claim: 'Predicted 4–18% of actor variance and 7–27% of partner variance, but 0% of dyad-specific "compatibility" variance. This is why Aaina does not and cannot ship a match score.',
  },
  montoya2008: {
    authors: 'Montoya, R. M., Horton, R. S., & Kirchner, J.',
    year: 2008,
    title: 'Is actual similarity necessary for attraction? A meta-analysis of actual and perceived similarity',
    venue: 'Journal of Social and Personal Relationships 25(6), 889–922',
    claim: 'Across 313 studies, actual similarity predicts attraction at zero acquaintance but has no significant effect within existing relationships.',
  },
  finkel2012: {
    authors: 'Finkel, E. J., Eastwick, P. W., Karney, B. R., Reis, H. T., & Sprecher, S.',
    year: 2012,
    title: 'Online dating: A critical analysis from the perspective of psychological science',
    venue: 'Psychological Science in the Public Interest 13(1), 3–66',
    claim: 'No compatibility-matching algorithm has ever been shown to work. Matching claims are unsupported.',
  },
  heyman2001: {
    authors: 'Heyman, R. E., & Slep, A. M. S.',
    year: 2001,
    title: 'The hazards of predicting divorce without crossvalidation',
    venue: 'Journal of Marriage and Family 63(2), 473–479',
    claim: "Gottman's ~90% divorce-prediction accuracy fell to 29% positive predictive value on cross-validation. Aaina therefore never predicts an outcome — present-tense bands only.",
  },
  le2010: {
    authors: 'Le, B., Dove, N. L., Agnew, C. R., Korn, M. S., & Mutso, A. A.',
    year: 2010,
    title: 'Predicting nonmarital romantic relationship dissolution: A meta-analytic synthesis',
    venue: 'Personal Relationships 17(3), 377–395',
    claim: 'Effect sizes for dissolution: own commitment/dedication d=−.80 (k=58), ambivalence d=+.67, closeness d=−.70, trust d=−.64, satisfaction d=−.52 (k=55), conflict only d=+.16. Second input to our composite weights.',
  },

  /* ── scoring & measurement method ── */
  cohen1999: {
    authors: 'Cohen, P., Cohen, J., Aiken, L. S., & West, S. G.',
    year: 1999,
    title: 'The problem of units and the circumstance for POMP',
    venue: 'Multivariate Behavioral Research 34(3), 315–346',
    claim: 'Percentage of Maximum Possible scoring. Every percentage Aaina shows is a POMP score: how far up the scale the person answered. It is a restatement of what they did, not a norm or a prediction.',
  },
  funk2007: {
    authors: 'Funk, J. L., & Rogge, R. D.',
    year: 2007,
    title: 'Testing the ruler with item response theory: Increasing precision of measurement for relationship satisfaction with the Couples Satisfaction Index',
    venue: 'Journal of Family Psychology 21(4), 572–583',
    claim: 'The Couples Satisfaction Index. CSI-16 α=.98; scores below the published cutoff indicate notable relationship dissatisfaction.',
  },
  rusbult1998: {
    authors: 'Rusbult, C. E., Martz, J. M., & Agnew, C. R.',
    year: 1998,
    title: 'The Investment Model Scale: Measuring commitment level, satisfaction level, quality of alternatives, and investment size',
    venue: 'Personal Relationships 5(4), 357–391',
    claim: 'Commitment is predicted by satisfaction, quality of alternatives, and investment size. The three are separable — which is what lets Aaina distinguish PULL from HOLD.',
  },
  rusbult1995: {
    authors: 'Rusbult, C. E., & Martz, J. M.',
    year: 1995,
    title: 'Remaining in an abusive relationship: An investment model analysis of nonvoluntary dependence',
    venue: 'Personality and Social Psychology Bulletin 21(6), 558–571',
    claim: 'Investment size and poor alternatives — not satisfaction — predicted staying. This is the evidential basis for the HOLD axis and for the verdict shape "held by cost".',
  },
  joel2018: {
    authors: 'Joel, S., Impett, E. A., Spielmann, S. S., & MacDonald, G.',
    year: 2018,
    title: 'How interdependent are stay/leave decisions? On staying in the relationship for the sake of the romantic partner',
    venue: 'Journal of Personality and Social Psychology 115(5), 805–824',
    claim: 'People hold many reasons to stay and many to leave simultaneously, and weigh the partner\'s welfare heavily. Aaina therefore surfaces both lists rather than resolving ambivalence by fiat.',
  },
  hendrick1988: {
    authors: 'Hendrick, S. S.',
    year: 1988,
    title: 'A generic measure of relationship satisfaction',
    venue: 'Journal of Marriage and the Family 50(1), 93–98',
    claim: 'The Relationship Assessment Scale: 7 items, a compact general satisfaction measure.',
  },
  wei2007: {
    authors: 'Wei, M., Russell, D. W., Mallinckrodt, B., & Vogel, D. L.',
    year: 2007,
    title: 'The Experiences in Close Relationship Scale (ECR)-Short Form',
    venue: 'Journal of Personality Assessment 88(2), 187–204',
    claim: 'Attachment anxiety and avoidance as two separable continuous dimensions, measured briefly.',
  },
  aron1992: {
    authors: 'Aron, A., Aron, E. N., & Smollan, D.',
    year: 1992,
    title: 'Inclusion of Other in the Self Scale and the structure of interpersonal closeness',
    venue: 'Journal of Personality and Social Psychology 63(4), 596–612',
    claim: 'Closeness measured as overlap between self and other. Aaina renders it as the picture it is, not as a percentage.',
  },
  reis2004: {
    authors: 'Reis, H. T., Clark, M. S., & Holmes, J. G.',
    year: 2004,
    title: 'Perceived partner responsiveness as an organizing construct in the study of intimacy and closeness',
    venue: 'Handbook of Closeness and Intimacy, 201–225',
    claim: 'Feeling understood, validated and cared for by a partner is a central organising construct of intimacy — and it is a perception, so a solo user can report it truthfully.',
  },
  algoe2010: {
    authors: 'Algoe, S. B., Gable, S. L., & Maisel, N. C.',
    year: 2010,
    title: 'It\'s the little things: Everyday gratitude as a booster shot for romantic relationships',
    venue: 'Personal Relationships 17(2), 217–233',
    claim: 'Felt appreciation predicts relationship outcomes above general satisfaction. Ranked second of 35 relationship predictors in Joel 2020.',
  },
  christensen1990: {
    authors: 'Christensen, A., & Heavey, C. L.',
    year: 1990,
    title: 'Gender and social structure in the demand/withdraw pattern of marital conflict',
    venue: 'Journal of Personality and Social Psychology 59(1), 73–81',
    claim: 'The demand/withdraw pattern: one partner pursues discussion while the other withdraws. A pattern, not a person — which is how Aaina is required to name it.',
  },
  rempel1985: {
    authors: 'Rempel, J. K., Holmes, J. G., & Zanna, M. P.',
    year: 1985,
    title: 'Trust in close relationships',
    venue: 'Journal of Personality and Social Psychology 49(1), 95–112',
    claim: 'Trust as predictability, dependability and faith — three separable components.',
  },
  sprecher1992: {
    authors: 'Sprecher, S., & Felmlee, D.',
    year: 1992,
    title: 'The influence of parents and friends on the quality and stability of romantic relationships',
    venue: 'Journal of Marriage and the Family 54(4), 888–900',
    claim: 'Social-network approval predicts relationship quality and stability. Basis for treating family approval as a scored dimension rather than a footnote.',
  },
  sinclair2014: {
    authors: 'Sinclair, H. C., Hood, K. B., & Wright, B. L.',
    year: 2014,
    title: 'Revisiting the Romeo and Juliet effect: Reexamining the links between social network opinions and romantic relationship outcomes',
    venue: 'Social Psychology 45(3), 170–178',
    claim: 'The "opposition increases love" effect failed to replicate; network disapproval is generally associated with WORSE, not better, outcomes. Aaina therefore never tells anyone their family\'s opposition is proof of love.',
  },
  aron1986: {
    authors: 'Aron, A., & Aron, E. N.',
    year: 1986,
    title: 'Love as the expansion of self: Understanding attraction and satisfaction',
    venue: 'Hemisphere Publishing',
    claim: 'The self-expansion model: relationships that expand the self are experienced as satisfying. Basis for the "growth" dimension and for reading "we stopped growing together".',
  },
  drigotas1999: {
    authors: 'Drigotas, S. M., Rusbult, C. E., Wieselquist, J., & Whitton, S. W.',
    year: 1999,
    title: 'Close partner as sculptor of the ideal self: Behavioral affirmation and the Michelangelo phenomenon',
    venue: 'Journal of Personality and Social Psychology 77(2), 293–323',
    claim: 'Partners who affirm your ideal self move you toward it, and this predicts couple wellbeing. Read as: does this relationship make you more or less of who you are trying to become.',
  },

  /* ── the self lens ── */
  campbell1996: {
    authors: 'Campbell, J. D., Trapnell, P. D., Heine, S. J., et al.',
    year: 1996,
    title: 'Self-concept clarity: Measurement, personality correlates, and cultural boundaries',
    venue: 'Journal of Personality and Social Psychology 70(1), 141–156',
    claim: 'Self-concept clarity: the extent to which self-beliefs are clearly defined, internally consistent and stable. The central construct of the self lens.',
  },
  ipip: {
    authors: 'Goldberg, L. R., et al.',
    year: 2006,
    title: 'The International Personality Item Pool and the future of public-domain personality measures',
    venue: 'Journal of Research in Personality 40(1), 84–96',
    claim: 'A public-domain item pool: "permission has already been automatically granted … for any purpose, commercial or non-commercial." The licensing escape hatch that makes a shippable battery possible.',
    url: 'https://ipip.ori.org/',
  },
  schwartz2012: {
    authors: 'Schwartz, S. H.',
    year: 2012,
    title: 'An overview of the Schwartz theory of basic values',
    venue: 'Online Readings in Psychology and Culture 2(1)',
    claim: 'Ten basic human values in a circular motivational structure, with opposing pairs. The structure Aaina uses to read a values-vs-living gap.',
  },
  steele1988: {
    authors: 'Steele, C. M.',
    year: 1988,
    title: 'The psychology of self-affirmation: Sustaining the integrity of the self',
    venue: 'Advances in Experimental Social Psychology 21, 261–302',
    claim: 'Affirming a core value before encountering threatening information reduces defensive distortion. This is why the values chapter comes first and cannot be skipped.',
  },
  cohen2014: {
    authors: 'Cohen, G. L., & Sherman, D. K.',
    year: 2014,
    title: 'The psychology of change: Self-affirmation and social psychological intervention',
    venue: 'Annual Review of Psychology 65, 333–371',
    claim: 'Self-affirmation reliably reduces defensiveness to threatening feedback. The evidential basis for the GROUND → DESTABILISE ordering.',
  },
  markus1986: {
    authors: 'Markus, H., & Nurius, P.',
    year: 1986,
    title: 'Possible selves',
    venue: 'American Psychologist 41(9), 954–969',
    claim: 'Possible selves — who one might become, would like to become, and is afraid of becoming — function as incentives and as evaluative context for the current self.',
  },
  hershfield2011: {
    authors: 'Hershfield, H. E.',
    year: 2011,
    title: 'Future self-continuity: How conceptions of the future self transform intertemporal choice',
    venue: 'Annals of the New York Academy of Sciences 1235(1), 30–43',
    claim: 'People who feel more continuous with their future self make choices that serve it. The future-self exercise must build SIMILARITY, not just aspiration.',
  },
  kegan2009: {
    authors: 'Kegan, R., & Lahey, L. L.',
    year: 2009,
    title: 'Immunity to Change',
    venue: 'Harvard Business Review Press',
    claim: 'Competing commitments and Big Assumptions: a stuck goal is usually protected by a hidden commitment resting on an untested belief. Aaina ends the self lens with one falsifiable test of one Big Assumption.',
  },
  miller2013: {
    authors: 'Miller, W. R., & Rollnick, S.',
    year: 2013,
    title: 'Motivational Interviewing: Helping People Change (3rd ed.)',
    venue: 'Guilford Press',
    claim: 'Developing discrepancy between present behaviour and held values is one of the few change mechanisms with consistent evidence; and resistance is met by rolling with it, not by argument. Aaina juxtaposes contradictions and does not resolve them for the user.',
  },
  kross2014: {
    authors: 'Kross, E., Bruehlman-Senecal, E., Park, J., et al.',
    year: 2014,
    title: 'Self-talk as a regulatory mechanism: How you do it matters',
    venue: 'Journal of Personality and Social Psychology 106(2), 304–324',
    claim: 'Self-distanced reflection improves emotion regulation and reasoning about one\'s own situation. Costs one textarea; used at the hardest moment.',
  },
  grossmann2014: {
    authors: 'Grossmann, I., & Kross, E.',
    year: 2014,
    title: 'Exploring Solomon\'s paradox: Self-distancing eliminates the self-other asymmetry in wise reasoning',
    venue: 'Psychological Science 25(8), 1571–1580',
    claim: 'People reason more wisely about others\' problems than their own — and self-distancing eliminates the gap entirely.',
  },
  neff2003: {
    authors: 'Neff, K. D.',
    year: 2003,
    title: 'The development and validation of a scale to measure self-compassion',
    venue: 'Self and Identity 2(3), 223–250',
    claim: 'Self-compassion: self-kindness, common humanity and mindfulness versus self-judgement, isolation and over-identification.',
  },
  treynor2003: {
    authors: 'Treynor, W., Gonzalez, R., & Nolen-Hoeksema, S.',
    year: 2003,
    title: 'Rumination reconsidered: A psychometric analysis',
    venue: 'Cognitive Therapy and Research 27(3), 247–259',
    claim: 'Brooding — the maladaptive component of rumination — is separable from reflective pondering. Only brooding predicts worse outcomes.',
  },
  gross2003: {
    authors: 'Gross, J. J., & John, O. P.',
    year: 2003,
    title: 'Individual differences in two emotion regulation processes',
    venue: 'Journal of Personality and Social Psychology 85(2), 348–362',
    claim: 'Cognitive reappraisal and expressive suppression are distinct strategies with different consequences.',
  },
  ryan2000: {
    authors: 'Ryan, R. M., & Deci, E. L.',
    year: 2000,
    title: 'Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being',
    venue: 'American Psychologist 55(1), 68–78',
    claim: 'Autonomy, competence and relatedness are basic psychological needs; their satisfaction or frustration explains wellbeing. The self lens reads which need is being starved.',
  },
  diener1985: {
    authors: 'Diener, E., Emmons, R. A., Larsen, R. J., & Griffin, S.',
    year: 1985,
    title: 'The Satisfaction with Life Scale',
    venue: 'Journal of Personality Assessment 49(1), 71–75',
    claim: 'Global life satisfaction, five items, freely usable. Joel 2020 ranked individual life satisfaction the single strongest individual-level predictor (88%).',
  },
  topp2015: {
    authors: 'Topp, C. W., Østergaard, S. D., Søndergaard, S., & Bech, P.',
    year: 2015,
    title: 'The WHO-5 Well-Being Index: A systematic review of the literature',
    venue: 'Psychotherapy and Psychosomatics 84(3), 167–176',
    claim: 'A five-item wellbeing index, free to use with acknowledgement, validated across settings and translated widely.',
  },

  /* ── therapy craft: how the report is allowed to speak ── */
  christensen2004: {
    authors: 'Christensen, A., Atkins, D. C., Berns, S., Wheeler, J., Baucom, D. H., & Simpson, L. E.',
    year: 2004,
    title: 'Traditional versus integrative behavioral couple therapy for significantly and chronically distressed married couples',
    venue: 'Journal of Consulting and Clinical Psychology 72(2), 176–191',
    claim: 'Integrative Behavioral Couple Therapy and its DEEP formulation — Differences, Emotional sensitivities, External circumstances, Patterns of interaction. The IBCT feedback session is the skeleton of Aaina\'s report.',
  },
  doss2016: {
    authors: 'Doss, B. D., Cicila, L. N., Georgia, E. J., et al.',
    year: 2016,
    title: 'A randomized controlled trial of the web-based OurRelationship program',
    venue: 'Journal of Consulting and Clinical Psychology 84(4), 285–296',
    claim: 'A self-guided web adaptation of the IBCT formulation produced relationship-satisfaction gains of d≈0.69 in distressed couples, with high completion. Evidence that this format can work without a therapist in the room.',
  },
  doherty2016: {
    authors: 'Doherty, W. J., Harris, S. M., & Wilde, J. L.',
    year: 2016,
    title: 'Discernment counseling for "mixed-agenda" couples',
    venue: 'Journal of Marital and Family Therapy 42(2), 246–255',
    claim: 'For people who do not know whether to stay or go, the task is clarity and confidence about a direction — not a push. The three-paths structure comes from here.',
  },
  schleider2018: {
    authors: 'Schleider, J. L., & Weisz, J. R.',
    year: 2018,
    title: 'A single-session growth mindset intervention for adolescent anxiety and depression: 9-month outcomes of a randomized trial',
    venue: 'Journal of Child Psychology and Psychiatry 59(2), 160–170',
    claim: 'A single self-administered session produced durable effects at nine months, with self-administered no worse than therapist-administered. The evidential basis for a one-sitting product.',
  },
  gollwitzer2006: {
    authors: 'Gollwitzer, P. M., & Sheeran, P.',
    year: 2006,
    title: 'Implementation intentions and goal achievement: A meta-analysis of effects and processes',
    venue: 'Advances in Experimental Social Psychology 38, 69–119',
    claim: 'If-then plans produced a medium-to-large effect (d=.65) on goal attainment across 94 studies. Every action Aaina offers is specified as an if-then, never as advice.',
  },
  oettingen2014: {
    authors: 'Oettingen, G.',
    year: 2014,
    title: 'Rethinking Positive Thinking: Inside the New Science of Motivation',
    venue: 'Current',
    claim: 'Mental contrasting with implementation intentions (WOOP): Wish, Outcome, Obstacle, Plan. Positive fantasy alone reduces action; contrasting it against the real obstacle restores it.',
  },
  wampold2015: {
    authors: 'Wampold, B. E.',
    year: 2015,
    title: 'How important are the common factors in psychotherapy? An update',
    venue: 'World Psychiatry 14(3), 270–277',
    claim: 'Alliance, expectation, and a credible explanatory framework account for more outcome variance than specific techniques. A written product can deliver the explanation and the expectation; it cannot deliver a relationship, and must not pretend to.',
  },
  finn1997: {
    authors: 'Finn, S. E., & Tonsager, M. E.',
    year: 1997,
    title: 'Information-gathering and therapeutic models of assessment: Complementary paradigms',
    venue: 'Psychological Assessment 9(4), 374–385',
    claim: 'Feedback is organised by how discrepant it is with the client\'s self-story: Level 1 confirms, Level 2 amplifies, Level 3 challenges. Level 3 must be delivered last and with support — and Level 1 is the most transplantable, so Aaina caps it.',
  },
  baile2000: {
    authors: 'Baile, W. F., Buckman, R., Lenzi, R., et al.',
    year: 2000,
    title: 'SPIKES — A six-step protocol for delivering bad news',
    venue: 'The Oncologist 5(4), 302–311',
    claim: 'Setting, Perception, Invitation, Knowledge, Emotions, Strategy — including the "warning shot" before hard news and an explicit check of the listener\'s reaction. Aaina\'s report uses both.',
  },
  neki1973: {
    authors: 'Neki, J. S.',
    year: 1973,
    title: 'Guru-Chela relationship: The possibility of a therapeutic paradigm',
    venue: 'American Journal of Orthopsychiatry 43(5), 755–766',
    claim: 'In the Indian context a helping relationship is culturally expected to be guiding rather than strictly non-directive. Basis for being directive about the formulation while staying non-directive about stay-or-leave.',
  },

  /* ── the gap between a modern life and a traditional obligation ── */
  yeh2003: {
    authors: 'Yeh, K.-H., & Bedford, O.',
    year: 2003,
    title: 'A test of the Dual Filial Piety model',
    venue: 'Asian Journal of Social Psychology 6(3), 215–228',
    claim: 'Filial piety splits into two components that coexist in the same person: RECIPROCAL (gratitude and care, associated with better wellbeing) and AUTHORITARIAN (obedience regardless of cost, associated with worse). This is the frame that lets Aaina say the part of you that wants to look after them is not the part that is hurting you — without asking anyone to choose between their own life and their family.',
  },
  bowen1978: {
    authors: 'Bowen, M.',
    year: 1978,
    title: 'Family Therapy in Clinical Practice',
    venue: 'Jason Aronson',
    claim: "Differentiation of self: holding your own position while staying emotionally connected to people who disagree. Critically, emotional CUTOFF is a symptom of LOW differentiation, not high — so going no-contact is the failure mode rather than the cure. Every target in this frame sits on the reader’s own side of the relationship, which is why it can help without requiring a verdict on anyone’s family."
  },
  hwang2006: {
    authors: 'Hwang, W.-C.',
    year: 2006,
    title: 'Acculturative family distancing: Theory, research, and clinical practice',
    venue: 'Psychotherapy: Theory, Research, Practice, Training 43(4), 397–409',
    claim: 'Measures the distance between a person and their family as value AGREEMENT versus value DISAGREEMENT per domain, rather than as a score of how modern anyone is. Aaina adapts the method — paired items, one for the person and one for their read of their family — and does not claim its validation, which was established in immigrant rather than Indian-domestic samples.',
  },
  singelis1994: {
    authors: 'Singelis, T. M.',
    year: 1994,
    title: 'The measurement of independent and interdependent self-construals',
    venue: 'Personality and Social Psychology Bulletin 20(5), 580–591',
    claim: 'Independent and interdependent self-construal are separable dimensions rather than two ends of one line — a person can be high on both. The reason Aaina never scores anyone on a modern-to-traditional axis.',
  },
  chirkov2003: {
    authors: 'Chirkov, V., Ryan, R. M., Kim, Y., & Kaplan, U.',
    year: 2003,
    title: 'Differentiating autonomy from individualism and independence',
    venue: 'Journal of Personality and Social Psychology 84(1), 97–110',
    claim: 'Autonomy is not the same as independence. A person can fully and autonomously choose what their family wants, and that is a strength rather than submission. Without this distinction a product inevitably pathologises obligation, which would be both wrong and useless in India.',
  },
  allendorf2013: {
    authors: 'Allendorf, K., & Ghimire, D. J.',
    year: 2013,
    title: 'Determinants of marital quality in an arranged marriage society',
    venue: 'Social Science Research 42(1), 59–70',
    claim: 'What predicts marital quality is the degree of PARTICIPATION IN THE CHOICE, not whether a marriage was arranged or love. This turns a binary war between two family positions into a negotiable gradient, which is the thing a person can actually act on.',
  },
  pillemer2020: {
    authors: 'Pillemer, K.',
    year: 2020,
    title: 'Fault Lines: Fractured Families and How to Mend Them',
    venue: 'Avery',
    claim: 'Among people who reconciled with estranged family, the common move was dropping the demand for an apology first. Useful precisely because it is an action available to the person alone.',
  },

  /* ── the anti-generic problem ── */
  forer1949: {
    authors: 'Forer, B. R.',
    year: 1949,
    title: 'The fallacy of personal validation: A classroom demonstration of gullibility',
    venue: 'Journal of Abnormal and Social Psychology 44(1), 118–123',
    claim: 'People accept vague, universally-true statements as accurate descriptions of themselves. The failure mode Aaina is engineered against: a statement that is true of nearly everyone carries almost no information.',
  },
  snyder1972: {
    authors: 'Snyder, C. R., & Larson, G. R.',
    year: 1972,
    title: 'A further look at student acceptance of general personality interpretations',
    venue: 'Journal of Consulting and Clinical Psychology 38(3), 384–388',
    claim: 'Identical generic feedback is rated MORE accurate when labelled as written specifically for the reader. The personalisation label is itself the manipulation — which is why Aaina makes evidence openable rather than merely claiming personalisation.',
  },
  baillargeon1984: {
    authors: 'Baillargeon, J., & Danis, C.',
    year: 1984,
    title: 'Barnum meets the computer: A critical test',
    venue: 'Journal of Personality Assessment 48(4), 415–419',
    claim: 'People CAN discriminate genuine individualised feedback from Barnum feedback on uniqueness and new-information. This is why the transplant test is a valid ship gate.',
  },

  /* ── safety ── */
  cues: {
    authors: 'Miller, E., McCaw, B., Chuang, C. H., et al.',
    year: 2015,
    title: 'Integrating intimate partner violence assessment and intervention into healthcare in the United States: A systems approach',
    venue: 'Journal of Women\'s Health 24(1), 92–99',
    claim: 'CUES — Confidentiality, Universal Education, Support: give everyone the information regardless of disclosure, because disclosure is not the goal. The reason Aaina\'s support information is ambient for every user and never triggered by anything anyone says.',
  },
  who2013: {
    authors: 'World Health Organization',
    year: 2013,
    title: 'Responding to intimate partner violence and sexual violence against women: WHO clinical and policy guidelines',
    venue: 'WHO',
    claim: 'First-line response (LIVES): Listen, Inquire, Validate, Enhance safety, Support. Validation — "this is not your fault, you did not deserve this" — is a named clinical act, not a pleasantry.',
  },
  campbell2003: {
    authors: 'Campbell, J. C., Webster, D., Koziol-McLain, J., et al.',
    year: 2003,
    title: 'Risk factors for femicide in abusive relationships: Results from a multisite case control study',
    venue: 'American Journal of Public Health 93(7), 1089–1097',
    claim: 'Separation is a period of markedly elevated danger, and specific patterns (escalation, threats, control, weapons) raise risk. The reason Aaina never issues "just leave" as an instruction.',
  },
  stark2007: {
    authors: 'Stark, E.',
    year: 2007,
    title: 'Coercive Control: How Men Entrap Women in Personal Life',
    venue: 'Oxford University Press',
    claim: 'Coercive control is a liberty crime rather than an injury crime — isolation, monitoring, micro-regulation. Giving someone this word is itself an intervention, and the absence of physical violence never downgrades it.',
  },
  dazzi2014: {
    authors: 'Dazzi, T., Gribble, R., Wessely, S., & Fear, N. T.',
    year: 2014,
    title: 'Does asking about suicide and related behaviours induce suicidal ideation? What is the evidence?',
    venue: 'Psychological Medicine 44(16), 3361–3363',
    claim: 'Asking about suicide does not induce or increase suicidal ideation. Aaina may therefore ask directly rather than avoiding the question.',
  },
  sabri2024: {
    authors: 'Sabri, B., Kaur, N., Rajaram, N., et al.',
    year: 2024,
    title: 'Adaptation and validation of a danger assessment tool for women in India',
    venue: 'Journal of Interpersonal Violence / PMC11245836',
    claim: 'An India-adapted Danger Assessment with strong discrimination, including India-specific risk items (in-laws supporting the abuse, being denied food, violence during pregnancy). The reason Aaina\'s risk items are India-real rather than imported.',
  },
})

export const SOURCES: Record<string, Source> = Object.fromEntries(
  Object.entries(RAW).map(([key, v]) => [key, { key, ...v }]),
)

export type SourceKey = keyof typeof RAW

export function cite(key: string): Source {
  const s = SOURCES[key]
  if (!s) throw new Error(`Unknown source key: ${key}`)
  return s
}

export function citeAll(keys: string[]): Source[] {
  return keys.map(cite)
}

/** Short form for inline rendering: "Joel et al., 2020". */
export function short(key: string): string {
  const s = cite(key)
  const first = s.authors.split(',')[0]?.trim() ?? s.authors
  const many = s.authors.includes('&') || s.authors.includes('et al')
  return `${first}${many ? ' et al.' : ''}, ${s.year}`
}
