import type { Item } from "../types";
import { agree5, agree7, certain6, frequency5, likely7 } from "./scales";

/** MODERN DIMENSIONS — the things that did not exist when the classic
 *  instruments were written, and that decide a great many relationships now.
 *
 *  Verbatim where the published item was verifiable; adapted items are written
 *  to the published construct definition and are listed as adaptations in
 *  SCIENCE-v2.md. Nothing here is reconstructed from quiz sites. */

/* ------------------------ Digital strain: phubbing ------------------------- */
/* Roberts & David (2016) — all nine items verbatim. */

const phub = (n: number, text: string, reverse?: boolean, echoable?: boolean): Item => ({
  id: `phb-${n}`,
  dimension: "digital-strain",
  section: "the-world",
  text,
  scale: frequency5,
  reverse,
  citation: "roberts-david-2016",
  requiresPartner: true,
  echoable,
});

export const PHUBBING_ITEMS: Item[] = [
  phub(1, "During a typical mealtime that we spend together, my partner pulls out and checks their phone.", false, true),
  phub(2, "My partner places their phone where they can see it when we are together."),
  phub(3, "My partner keeps their phone in their hand when they are with me."),
  phub(4, "When my partner's phone rings or beeps, they pull it out even if we are in the middle of a conversation.", false, true),
  phub(5, "My partner glances at their phone when talking to me.", false, true),
  phub(6, "During leisure time that we spend together, my partner uses their phone."),
  phub(7, "My partner does not use their phone when we are talking.", true, true),
  phub(8, "My partner uses their phone when we are out together."),
  phub(9, "If there is a lull in our conversation, my partner will check their phone.", false, true),
];

/* --------------- Digital strain: jealousy and surveillance ---------------- */
/* Muise et al. (2009) verbatim items 1–3; Tokunaga (2011) verbatim items 4–6.
   Stem for the jealousy items: "How likely are you to…" */

export const DIGITAL_JEALOUSY_ITEMS: Item[] = [
  {
    id: "dgj-1",
    dimension: "digital-strain",
    section: "the-world",
    text: "How likely are you to become jealous after your partner has added someone you don't know?",
    scale: likely7,
    reverse: true,
    citation: "muise-2009",
    echoable: true,
  },
  {
    id: "dgj-2",
    dimension: "digital-strain",
    section: "the-world",
    text: "How likely are you to monitor your partner's activities on social media?",
    scale: likely7,
    reverse: true,
    citation: "muise-2009",
    echoable: true,
  },
  {
    id: "dgj-3",
    dimension: "digital-strain",
    section: "the-world",
    text: "How likely are you to feel threatened if your partner added a previous romantic or sexual partner to their friends?",
    scale: likely7,
    reverse: true,
    citation: "muise-2009",
  },
  {
    id: "dgj-4",
    dimension: "digital-strain",
    section: "the-world",
    text: "I check up on my partner through updates on their social media profile.",
    scale: agree7,
    reverse: true,
    citation: "tokunaga-2011",
    echoable: true,
  },
  {
    id: "dgj-5",
    dimension: "digital-strain",
    section: "the-world",
    text: "If there are messages on my partner's profile I don't understand, I try to investigate through other people's accounts.",
    scale: agree7,
    reverse: true,
    citation: "tokunaga-2011",
    echoable: true,
  },
  {
    id: "dgj-6",
    dimension: "digital-strain",
    section: "the-world",
    text: "How often do you look at your partner's page or last-seen?",
    scale: frequency5,
    reverse: true,
    citation: "muise-2009",
    echoable: true,
  },
];

/* ------------------- Relational certainty (situationship) ------------------ */
/* Knobloch & Solomon (1999). Stem: "How certain are you about…" Verified
   exemplar items plus adaptations written to the published content domains
   (desire, evaluation, goals; norms, mutuality, definition, future). */

const cert = (n: number, text: string, echoable?: boolean): Item => ({
  id: `crt-${n}`,
  dimension: "relational-certainty",
  section: "you-and-them",
  text: `How certain are you about ${text}`,
  scale: certain6,
  citation: "knobloch-solomon-1999",
  echoable,
});

export const CERTAINTY_ITEMS: Item[] = [
  cert(1, "how committed you are to this relationship?", true),
  cert(2, "how committed your partner is to this relationship?", true),
  cert(3, "the future of this relationship?", true),
  cert(4, "whether this relationship has a clear definition that you both agree on?", true),
  cert(5, "whether your feelings and their feelings are mutual?", true),
  cert(6, "what you are allowed to expect from each other?"),
  cert(7, "whether you want this relationship to last?", true),
];

/* --------------------------- Fear of being single -------------------------- */
/* Spielmann et al. (2013) — all six items verbatim, in the partnered (R-FOBS)
   framing described by Cantarella, Girme & Spielmann (2023) where required. */

const fobs = (n: number, text: string, echoable?: boolean): Item => ({
  id: `fbs-${n}`,
  dimension: "autonomy-fear",
  section: "you",
  text,
  scale: agree5,
  reverse: true, // high fear = low standing on "choosing, not clinging"
  citation: "spielmann-2013",
  echoable,
});

export const FEAR_SINGLE_ITEMS: Item[] = [
  fobs(1, "I feel it is close to being too late for me to find the love of my life.", true),
  fobs(2, "I feel anxious when I think about being single forever.", true),
  fobs(3, "I need to find a partner before I'm too old to have and raise children."),
  fobs(4, "If I end up alone in life, I will probably feel like there is something wrong with me.", true),
  fobs(5, "As I get older, it will get harder and harder to find someone.", true),
  fobs(6, "It scares me to think that there might not be anyone out there for me.", true),
  {
    id: "fbs-7",
    dimension: "autonomy-fear",
    section: "you",
    text: "I would rather be in an unhappy relationship than be single.",
    scale: agree5,
    reverse: true,
    citation: "spielmann-2013",
    echoable: true,
  },
];

/* ------------------------------ Ghosting history --------------------------- */
/* Jahrami et al. (2023), CC-BY — all eight items verbatim, lightly punctuated
   for readability. Contributes to relational certainty. */

const ghost = (n: number, text: string, echoable?: boolean): Item => ({
  id: `gst-${n}`,
  dimension: "relational-certainty",
  section: "you-and-them",
  text,
  scale: frequency5,
  reverse: true,
  citation: "jahrami-2023",
  echoable,
});

export const GHOSTING_ITEMS: Item[] = [
  ghost(1, "They cancel plans or leave me waiting without telling me beforehand.", true),
  ghost(2, "Their replies to my messages are delayed.", true),
  ghost(3, "Their replies are confusing and vague.", true),
  ghost(4, "The phrase “I'm busy” comes up again and again in their messages.", true),
  ghost(5, "Their interest in me is inconsistent — sometimes very engaged, sometimes completely uninterested.", true),
  ghost(6, "They don't share personal information about themselves with me.", true),
];
