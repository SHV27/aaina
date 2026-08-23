/** Registry of published sources. Every Claim binds to one of these ids.
 *  Full detail + rationale lives in SCIENCE.md (Arc 2 completes it). */

export const CITATIONS = {
  "funk-rogge-2007": {
    short: "Funk & Rogge (2007)",
    full: "Funk, J. L., & Rogge, R. D. (2007). Testing the ruler with item response theory: Increasing precision of measurement for relationship satisfaction with the Couples Satisfaction Index. Journal of Family Psychology, 21(4), 572–583.",
    measures: "Relationship satisfaction (CSI)",
  },
  "wei-2007": {
    short: "Wei et al. (2007)",
    full: "Wei, M., Russell, D. W., Mallinckrodt, B., & Vogel, D. L. (2007). The Experiences in Close Relationship Scale (ECR)–Short Form: Reliability, validity, and factor structure. Journal of Personality Assessment, 88(2), 187–204.",
    measures: "Attachment anxiety & avoidance (ECR-S)",
  },
  "christensen-1990": {
    short: "Christensen & Heavey (1990)",
    full: "Christensen, A., & Heavey, C. L. (1990). Gender and social structure in the demand/withdraw pattern of marital conflict. Journal of Personality and Social Psychology, 59(1), 73–81. Scoring per Crenshaw, Christensen, Baucom & Epstein (2017), Psychological Assessment, 29(7).",
    measures: "Demand/withdraw & constructive communication (CPQ)",
  },
  "rusbult-1998": {
    short: "Rusbult, Martz & Agnew (1998)",
    full: "Rusbult, C. E., Martz, J. M., & Agnew, C. R. (1998). The Investment Model Scale: Measuring commitment level, satisfaction level, quality of alternatives, and investment size. Personal Relationships, 5(4), 357–391.",
    measures: "Commitment, investment, alternatives",
  },
  "joel-2018": {
    short: "Joel, MacDonald & Page-Gould (2018)",
    full: "Joel, S., MacDonald, G., & Page-Gould, E. (2018). Wanting to stay and wanting to go: Reasons for wanting to stay and reasons for wanting to leave romantic relationships. Social Psychological and Personality Science, 9(6), 631–644.",
    measures: "Stay/leave reasons & ambivalence",
  },
  "joel-2020": {
    short: "Joel et al. (2020, PNAS)",
    full: "Joel, S., et al. (2020). Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies. PNAS, 117(32), 19061–19071.",
    measures: "What predicts relationship quality; validity of own-perception reports",
  },
  "le-2010": {
    short: "Le et al. (2010)",
    full: "Le, B., Dove, N. L., Agnew, C. R., Korn, M. S., & Mutso, A. A. (2010). Predicting nonmarital romantic relationship dissolution: A meta-analytic synthesis. Personal Relationships, 17(3), 377–390.",
    measures: "Meta-analytic predictors of breakup",
  },
  "brown-1996": {
    short: "Brown et al. (1996)",
    full: "Brown, J. B., Lent, B., Brett, P. J., Sas, G., & Pederson, L. L. (1996). Development of the Woman Abuse Screening Tool for use in family practice. Family Medicine, 28(6), 422–428.",
    measures: "Abuse screening (WAST)",
  },
  "meade-craig-2012": {
    short: "Meade & Craig (2012)",
    full: "Meade, A. W., & Craig, S. B. (2012). Identifying careless responses in survey data. Psychological Methods, 17(3), 437–455.",
    measures: "Careless-responding detection",
  },
  "reynolds-1982": {
    short: "Reynolds (1982)",
    full: "Reynolds, W. M. (1982). Development of reliable and valid short forms of the Marlowe–Crowne Social Desirability Scale. Journal of Clinical Psychology, 38(1), 119–125.",
    measures: "Socially desirable responding (MC Form C)",
  },
  "karney-bradbury-1995": {
    short: "Karney & Bradbury (1995)",
    full: "Karney, B. R., & Bradbury, T. N. (1995). The longitudinal course of marital quality and stability: A review of theory, method, and research. Psychological Bulletin, 118(1), 3–34.",
    measures: "Vulnerability–stress–adaptation model of relationship outcomes",
  },
  "doherty-2016": {
    short: "Doherty et al. (2016)",
    full: "Doherty, W. J., Harris, S. M., & Wilde, J. L. (2016). Discernment counseling for 'mixed-agenda' couples. Journal of Marital and Family Therapy, 42(2), 246–255.",
    measures: "Three-paths structure for stay/leave ambivalence",
  },
} as const;

export type CitationId = keyof typeof CITATIONS;
