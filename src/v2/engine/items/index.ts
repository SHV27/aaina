import type { Item, SectionId } from "../types";
import {
  ATTACHMENT_ITEMS,
  COMMITMENT_ITEMS,
  CONFLICT_ITEMS,
  RESPONSIVENESS_ITEMS,
  SATISFACTION_ITEMS,
  SEXUAL_ITEMS,
  TRUST_ITEMS,
} from "./core";
import {
  CERTAINTY_ITEMS,
  DIGITAL_JEALOUSY_ITEMS,
  FEAR_SINGLE_ITEMS,
  GHOSTING_ITEMS,
  PHUBBING_ITEMS,
} from "./modern";
import {
  ATTENTION_ITEMS,
  FAMILY_ITEMS,
  NETWORK_ITEMS,
  OPENING_ITEMS,
  VALUES_ITEMS,
} from "./context";

export * from "./core";
export * from "./modern";
export * from "./context";
export * from "./scales";

/** The assessment, in the order it is asked. Sections are named for the reader,
 *  not for the instruments they contain — nobody wants to answer "the CPQ block". */

export interface Section {
  id: SectionId;
  title: string;
  /** Shown once, at the top of the section. */
  intro: string;
  minutes: number;
}

export const SECTIONS: Section[] = [
  {
    id: "you-and-them",
    title: "Where things stand",
    intro:
      "Start with the plain facts of it. There are no right answers here, and nothing you choose is judged.",
    minutes: 5,
  },
  {
    id: "the-feeling",
    title: "How it feels",
    intro: "How this relationship actually feels to live in, day to day.",
    minutes: 4,
  },
  {
    id: "friction",
    title: "When you disagree",
    intro:
      "Every relationship has friction. What matters is the shape it takes, so answer for what usually happens rather than the worst time.",
    minutes: 3,
  },
  {
    id: "closeness",
    title: "Closeness",
    intro:
      "Being understood, trusted, and physically close are three different things. This section separates them.",
    minutes: 8,
  },
  {
    id: "the-world",
    title: "The world around you",
    intro:
      "Relationships are not lived in private. Phones, families and friends all get a vote, whether or not you gave them one.",
    minutes: 9,
  },
  {
    id: "the-future",
    title: "Where this is going",
    intro: "The practical questions people often skip until they cannot skip them any more.",
    minutes: 6,
  },
  {
    id: "you",
    title: "You",
    intro:
      "Last part, and it is only about you. How you attach to people, and what drives your choices, shapes every relationship you will have.",
    minutes: 7,
  },
];

const ALL: Item[] = [
  ...OPENING_ITEMS,
  ...CERTAINTY_ITEMS,
  ...GHOSTING_ITEMS,
  ...SATISFACTION_ITEMS,
  ...CONFLICT_ITEMS,
  ...RESPONSIVENESS_ITEMS,
  ...TRUST_ITEMS,
  ...SEXUAL_ITEMS,
  ...PHUBBING_ITEMS,
  ...DIGITAL_JEALOUSY_ITEMS,
  ...FAMILY_ITEMS,
  ...NETWORK_ITEMS,
  ...VALUES_ITEMS,
  ...COMMITMENT_ITEMS,
  ...ATTACHMENT_ITEMS,
  ...FEAR_SINGLE_ITEMS,
  ...ATTENTION_ITEMS,
];

/** Items in presentation order: grouped by section, in SECTIONS order. */
export const ITEMS: Item[] = SECTIONS.flatMap((s) => ALL.filter((i) => i.section === s.id));

export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function itemsForSection(section: SectionId): Item[] {
  return ITEMS.filter((i) => i.section === section);
}

/** Total scoreable items (attention checks excluded). */
export const SCOREABLE_COUNT = ITEMS.filter((i) => i.instructedValue === undefined).length;

export const ESTIMATED_MINUTES = SECTIONS.reduce((a, s) => a + s.minutes, 0);
