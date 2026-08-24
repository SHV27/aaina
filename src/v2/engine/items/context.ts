import type { Item } from "../types";
import { agree5, agree7, certain6 } from "./scales";

/** CONTEXT DIMENSIONS — India.
 *
 *  No free validated instrument measures family acceptance and timeline pressure,
 *  and Western scales assume the couple is the only decision-maker. Indian youth
 *  research says otherwise: roughly 6% of young people fully chose their spouse
 *  themselves while 74% believe they should be able to (Lokniti-CSDS, 2017), which
 *  makes "arranged dating" the modal path and family a first-class stakeholder.
 *
 *  These items are bespoke, written to that evidence, and labelled as bespoke in
 *  SCIENCE-v2.md. They are interpreted descriptively — never as a validated norm.
 *  The network-support items are anchored to Sprecher & Felmlee (1992), whose
 *  finding — that the opinion of the people around a couple predicts survival —
 *  is what makes this dimension worth measuring at all. */

const fam = (n: number, text: string, opts: Partial<Item> = {}): Item => ({
  id: `fam-${n}`,
  dimension: "family-acceptance",
  section: "the-world",
  text,
  scale: agree5,
  citation: "aaina-family-2026",
  ...opts,
});

export const FAMILY_ITEMS: Item[] = [
  fam(1, "My family knows about this relationship.", { echoable: true }),
  fam(2, "If my family knew everything about this relationship, they would accept it.", {
    echoable: true,
  }),
  fam(3, "I feel pressure about the timeline of this relationship — when to commit, when to marry — from people who are not in it.", {
    reverse: true,
    echoable: true,
  }),
  fam(4, "Their family treats me as someone who belongs.", { echoable: true }),
  fam(5, "I have changed how I behave in this relationship because of what people would say.", {
    reverse: true,
    echoable: true,
  }),
  fam(6, "If we decided to be together permanently, our families would make it difficult.", {
    reverse: true,
    echoable: true,
  }),
  fam(7, "Caste, religion, language or community differences are a live issue for us.", {
    reverse: true,
    echoable: true,
  }),
  fam(8, "I can picture our families in the same room without dreading it.", { echoable: true }),
];

const net = (n: number, text: string, opts: Partial<Item> = {}): Item => ({
  id: `net-${n}`,
  dimension: "support-network",
  section: "the-world",
  text,
  scale: agree5,
  citation: "sprecher-felmlee-1992",
  ...opts,
});

export const NETWORK_ITEMS: Item[] = [
  net(1, "My closest friends are glad I am with this person.", { echoable: true }),
  net(2, "At least one person who knows us both has told me they are worried about this relationship.", {
    reverse: true,
    echoable: true,
  }),
  net(3, "I find myself leaving parts out when I describe this relationship to people close to me.", {
    reverse: true,
    echoable: true,
  }),
  net(4, "I see my friends as much as I did before this relationship.", { echoable: true }),
  net(5, "If this ended tomorrow, I have people who would show up for me.", { echoable: true }),
];

/** Values and life direction. Bespoke, concrete, and deliberately unromantic:
 *  the questions couples discover too late. Descriptive agreement, not a norm. */

const val = (n: number, text: string, opts: Partial<Item> = {}): Item => ({
  id: `val-${n}`,
  dimension: "values-future",
  section: "the-future",
  text,
  scale: agree5,
  citation: "aaina-values-2026",
  ...opts,
});

export const VALUES_ITEMS: Item[] = [
  val(1, "We agree about whether we want children.", { echoable: true }),
  val(2, "We agree about where we would live — city, country, near which family.", {
    echoable: true,
  }),
  val(3, "We agree about how money should be handled and spent.", { echoable: true }),
  val(4, "We agree about how much either of us should sacrifice career for the other.", {
    echoable: true,
  }),
  val(5, "We agree about the place of religion and ritual in our life.", { echoable: true }),
  val(6, "We agree about how much our parents should be involved in our decisions.", {
    echoable: true,
  }),
  val(7, "When I picture my life in ten years, they are clearly in it.", { echoable: true }),
  val(8, "We have actually talked about these things, not just assumed them.", { echoable: true }),
];

/** A small number of certainty items that belong to the opening section, so the
 *  assessment starts with the question people actually arrive with. */
export const OPENING_ITEMS: Item[] = [
  {
    id: "opn-1",
    dimension: "relational-certainty",
    section: "you-and-them",
    text: "How certain are you about what this relationship actually is right now?",
    scale: certain6,
    citation: "knobloch-solomon-1999",
    echoable: true,
  },
  {
    id: "opn-2",
    dimension: "satisfaction",
    section: "you-and-them",
    text: "I have seriously considered ending this relationship in the last three months.",
    scale: agree7,
    reverse: true,
    citation: "funk-rogge-2007",
    echoable: true,
  },
];

/** Attention checks — Meade & Craig (2012). Instructed-response items, spaced out;
 *  excluded from all scoring, flagged only when two or more fail. */
export const ATTENTION_ITEMS: Item[] = [
  {
    id: "att-1",
    dimension: "satisfaction",
    section: "the-feeling",
    text: "To show you are reading carefully, please choose “Mostly true” for this one.",
    scale: [
      { value: 0, label: "Not at all true" },
      { value: 1, label: "A little true" },
      { value: 2, label: "Somewhat true" },
      { value: 3, label: "Mostly true" },
      { value: 4, label: "Almost completely true" },
      { value: 5, label: "Completely true" },
    ],
    instructedValue: 3,
    citation: "meade-craig-2012",
  },
  {
    id: "att-2",
    dimension: "attachment-anxiety",
    section: "you",
    text: "This one is a reading check — please choose “Slightly agree”.",
    scale: agree7,
    instructedValue: 5,
    citation: "meade-craig-2012",
  },
];
