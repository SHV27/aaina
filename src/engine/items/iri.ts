import type { Item } from "../types";
import { agree7, csiTruth, factor7 } from "./scales";

/** Instructed-response items (attention checks) — Meade & Craig (2012).
 *  Three total (one per ~20 minutes), formats matched to surrounding blocks.
 *  Exclusion rule: flag on ≥2 failures — never on one. */

export const IRI_ITEMS: Item[] = [
  {
    id: "iri-1",
    chapter: "dil",
    instrument: "iri",
    citation: "meade-craig-2012",
    scale: csiTruth,
    text: 'To show you are reading, please select "Mostly true" for this one.',
    instructedValue: 3,
  },
  {
    id: "iri-2",
    chapter: "baat-cheet",
    instrument: "iri",
    citation: "meade-craig-2012",
    scale: agree7,
    text: 'This one is a reading check — please choose "Slightly agree".',
    instructedValue: 5,
  },
  {
    id: "iri-3",
    chapter: "dono-taraf",
    instrument: "iri",
    citation: "meade-craig-2012",
    scale: factor7,
    text: 'A quick attention check — please select "3" for this item.',
    instructedValue: 3,
  },
];
