import type { Item } from "../types";
import { agree9 } from "./scales";

/** Investment Model Scale, global items — Rusbult, Martz & Agnew (1998).
 *  0–8 agree scale; subscale MEANS; two commitment items reversed (8 − raw). */

const c = "rusbult-1998" as const;
const ch = "jadein" as const;

const mk = (id: string, text: string, reverse?: boolean): Item => ({
  id,
  chapter: ch,
  instrument: "ims",
  citation: c,
  scale: agree9,
  text,
  reverse,
});

export const IMS_SATISFACTION_ITEMS: Item[] = [
  mk("ims-s1", "I feel satisfied with our relationship."),
  mk("ims-s2", "My relationship is much better than others' relationships."),
  mk("ims-s3", "My relationship is close to ideal."),
  mk("ims-s4", "Our relationship makes me very happy."),
  mk("ims-s5", "Our relationship does a good job of fulfilling my needs for intimacy, companionship, etc."),
];

export const IMS_ALTERNATIVES_ITEMS: Item[] = [
  mk("ims-a1", "My alternatives are attractive to me (dating another, spending time with friends or on my own, etc.)."),
  mk("ims-a2", "My alternatives to our relationship are close to ideal."),
  mk("ims-a3", "If I weren't with my partner, I would do fine — I would find another appealing person to be with."),
  mk("ims-a4", "The people other than my partner with whom I might become involved are very appealing."),
  mk("ims-a5", "My needs for intimacy, companionship, etc., could easily be fulfilled in alternative relationships."),
];

export const IMS_INVESTMENT_ITEMS: Item[] = [
  mk("ims-i1", "I have put a great deal into our relationship that I would lose if the relationship were to end."),
  mk("ims-i2", "Compared to other people I know, I have invested a great deal in my relationship with my partner."),
  mk("ims-i3", "I feel very involved in our relationship — like I have put a great deal into it."),
  mk("ims-i4", "Many aspects of my life have become linked to my partner (recreational activities, etc.), and I would lose all of this if we were to break up."),
  mk("ims-i5", "My relationships with friends and family members would be complicated if my partner and I were to break up (e.g., partner is friends with people I care about)."),
];

export const IMS_COMMITMENT_ITEMS: Item[] = [
  mk("ims-c1", "I am committed to maintaining my relationship with my partner."),
  mk("ims-c2", "I want our relationship to last for a very long time."),
  mk("ims-c3", "I feel very attached to our relationship — very strongly linked to my partner."),
  mk("ims-c4", "It is likely that I will be with someone other than my partner within the next year.", true),
  mk("ims-c5", "I would not feel very upset if our relationship were to end in the near future.", true),
  mk("ims-c6", "I want our relationship to last forever."),
  mk("ims-c7", "I am oriented toward the long-term future of my relationship (for example, I imagine being with my partner several years from now)."),
];

export const IMS_ITEMS: Item[] = [
  ...IMS_SATISFACTION_ITEMS,
  ...IMS_ALTERNATIVES_ITEMS,
  ...IMS_INVESTMENT_ITEMS,
  ...IMS_COMMITMENT_ITEMS,
];
