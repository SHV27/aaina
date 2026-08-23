import type { Item } from "../types";
import { csiExtent, csiFrequency, csiHappiness, csiSemantic, csiTruth } from "./scales";

/** CSI-16 — Funk & Rogge (2007). Verbatim from the authors' distributed form.
 *  Ids use original CSI-32 numbering. Sum 0–81; distress cutoff < 51.5. */

const c = "funk-rogge-2007" as const;
const ch = "dil" as const;

export const CSI_ITEMS: Item[] = [
  { id: "csi-1", chapter: ch, instrument: "csi16", citation: c, scale: csiHappiness,
    text: "Please indicate the degree of happiness, all things considered, of your relationship." },
  { id: "csi-5", chapter: ch, instrument: "csi16", citation: c, scale: csiFrequency,
    text: "In general, how often do you think that things between you and your partner are going well?" },
  { id: "csi-9", chapter: ch, instrument: "csi16", citation: c, scale: csiTruth,
    text: "Our relationship is strong." },
  { id: "csi-11", chapter: ch, instrument: "csi16", citation: c, scale: csiTruth,
    text: "My relationship with my partner makes me happy." },
  { id: "csi-12", chapter: ch, instrument: "csi16", citation: c, scale: csiTruth,
    text: "I have a warm and comfortable relationship with my partner." },
  { id: "csi-17", chapter: ch, instrument: "csi16", citation: c, scale: csiTruth,
    text: "I really feel like part of a team with my partner." },
  { id: "csi-19", chapter: ch, instrument: "csi16", citation: c, scale: csiExtent,
    text: "How rewarding is your relationship with your partner?" },
  { id: "csi-20", chapter: ch, instrument: "csi16", citation: c, scale: csiExtent,
    text: "How well does your partner meet your needs?" },
  { id: "csi-21", chapter: ch, instrument: "csi16", citation: c, scale: csiExtent,
    text: "To what extent has your relationship met your original expectations?" },
  { id: "csi-22", chapter: ch, instrument: "csi16", citation: c, scale: csiExtent,
    text: "In general, how satisfied are you with your relationship?" },
  { id: "csi-26", chapter: ch, instrument: "csi16", citation: c,
    scale: csiSemantic("Interesting", "Boring", true),
    text: "My relationship feels… (Interesting — Boring)" },
  { id: "csi-27", chapter: ch, instrument: "csi16", citation: c,
    scale: csiSemantic("Bad", "Good", false),
    text: "My relationship feels… (Bad — Good)" },
  { id: "csi-28", chapter: ch, instrument: "csi16", citation: c,
    scale: csiSemantic("Full", "Empty", true),
    text: "My relationship feels… (Full — Empty)" },
  { id: "csi-30", chapter: ch, instrument: "csi16", citation: c,
    scale: csiSemantic("Sturdy", "Fragile", true),
    text: "My relationship feels… (Sturdy — Fragile)" },
  { id: "csi-31", chapter: ch, instrument: "csi16", citation: c,
    scale: csiSemantic("Discouraging", "Hopeful", false),
    text: "My relationship feels… (Discouraging — Hopeful)" },
  { id: "csi-32", chapter: ch, instrument: "csi16", citation: c,
    scale: csiSemantic("Enjoyable", "Miserable", true),
    text: "My relationship feels… (Enjoyable — Miserable)" },
];
