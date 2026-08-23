import type { Item } from "../types";
import { factor7 } from "./scales";

/** Stay/leave reasons — Joel, MacDonald & Page-Gould (2018), Tables 1 & 2.
 *  Category names verbatim; one-line explanations are display aids in the
 *  paper's coder-definition spirit. Rated 1 (not a factor) – 7 (major factor).
 *  Administered leave list = 23 (excludes Sample-C-only "General frustration"
 *  and near-zero "Concern for partner") — mapping logged in DECISIONS.md. */

const c = "joel-2018" as const;
const ch = "dono-taraf" as const;

const stay = (n: number, name: string, hint: string): Item => ({
  id: `joel-s${n}`,
  chapter: ch,
  instrument: "joel-stay",
  citation: c,
  scale: factor7,
  text: `A reason to STAY — ${name}: ${hint}`,
});

const leave = (n: number, name: string, hint: string): Item => ({
  id: `joel-l${n}`,
  chapter: ch,
  instrument: "joel-leave",
  citation: c,
  scale: factor7,
  text: `A reason to LEAVE — ${name}: ${hint}`,
});

export const JOEL_STAY_ITEMS: Item[] = [
  stay(1, "Emotional intimacy", "you feel deeply known and connected"),
  stay(2, "Emotional investment", "you have poured so much of yourself into this"),
  stay(3, "Family duty", "family expectations or responsibilities hold you here"),
  stay(4, "Partner's personality", "who they are as a person draws you"),
  stay(5, "Enjoyment", "you genuinely have good times together"),
  stay(6, "Emotional security", "the relationship feels like a safe base"),
  stay(7, "Physical intimacy", "the physical closeness matters to you"),
  stay(8, "Financial benefits", "money or practical support is part of it"),
  stay(9, "Compatibility", "your values, interests, or rhythms fit"),
  stay(10, "Concern for partner", "you worry what leaving would do to them"),
  stay(11, "Optimism", "you believe it can get better"),
  stay(12, "Validation", "they make you feel valued and wanted"),
  stay(13, "Dependence", "you rely on them in daily life"),
  stay(14, "Attraction", "you are drawn to them"),
  stay(15, "General satisfaction", "overall, it feels good"),
  stay(16, "Comparison of alternatives", "other options seem worse"),
  stay(17, "Logistical barriers", "living situation, paperwork, practicalities"),
  stay(18, "Fear of uncertainty", "the unknown after leaving feels frightening"),
  stay(19, "Social connections", "shared friends and community"),
  stay(20, "Comfort", "the familiarity itself is comforting"),
  stay(21, "Habituation", "this life is what you are used to"),
  stay(22, "Companionship", "having someone beside you"),
  stay(23, "Long-term orientation", "you think in years, not weeks"),
  stay(24, "Long-term prospects", "you can picture a real future together"),
  stay(25, "Social pressure", "what people would say if you left"),
  stay(26, "Self-improvement", "you have grown because of this relationship"),
  stay(27, "Social status", "the relationship carries standing or image"),
];

export const JOEL_LEAVE_ITEMS: Item[] = [
  leave(1, "Partner's personality", "something in who they are wears you down"),
  leave(2, "Breach of trust", "cheating, lying, or broken promises"),
  leave(3, "Partner withdrawal", "they have pulled away from you"),
  leave(4, "External reason", "circumstances outside the relationship"),
  leave(5, "Physical distance", "bad sex life, no sex life, or not enough physical affection"),
  leave(6, "Conflict", "the fighting itself"),
  leave(7, "Incompatibility", "your values or lives do not fit"),
  leave(8, "Emotional distance", "you feel far from them even when close"),
  leave(9, "Lack of validation", "you do not feel valued or seen"),
  leave(10, "Lack of financial benefits", "money strain or imbalance"),
  leave(11, "Lack of enjoyment", "the good times have dried up"),
  leave(12, "Problems with long-term prospects", "you cannot picture a future"),
  leave(13, "General dissatisfaction", "overall, it does not feel good"),
  leave(14, "Inequity", "you give far more than you receive"),
  leave(15, "Social consequences", "what the relationship costs you socially"),
  leave(16, "Dealbreaker", "addiction, abuse, legal or psychological problems, or a controlling partner"),
  leave(17, "Loss of attraction", "the pull toward them has faded"),
  leave(18, "Too demanding", "the relationship asks more than you can give"),
  leave(19, "Alternative partner", "someone else is on your mind"),
  leave(20, "Pursuit of other opportunities", "a life you want that this relationship blocks"),
  leave(21, "Discomfort with commitment", "the commitment itself feels heavy"),
  leave(22, "Hindering self-improvement", "you cannot grow while staying"),
  leave(23, "Violation of expectations", "this is not the relationship you were promised"),
];
