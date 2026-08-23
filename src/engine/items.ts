import type { Item, ScalePoint } from "./types";

/** Arc 1 seed: 3 authentic CSI-16 items (Funk & Rogge 2007) powering the walking
 *  skeleton's micro-read. Arc 2 completes the full battery. */

const satisfactionDegree: ScalePoint[] = [
  { value: 0, label: "Extremely unhappy" },
  { value: 1, label: "Fairly unhappy" },
  { value: 2, label: "A little unhappy" },
  { value: 3, label: "Happy" },
  { value: 4, label: "Very happy" },
  { value: 5, label: "Extremely happy" },
  { value: 6, label: "Perfect" },
];

const agreement6: ScalePoint[] = [
  { value: 0, label: "Not at all true" },
  { value: 1, label: "A little true" },
  { value: 2, label: "Somewhat true" },
  { value: 3, label: "Mostly true" },
  { value: 4, label: "Almost completely true" },
  { value: 5, label: "Completely true" },
];

const frequency6: ScalePoint[] = [
  { value: 0, label: "Never" },
  { value: 1, label: "Less than once a month" },
  { value: 2, label: "Once or twice a month" },
  { value: 3, label: "Once or twice a week" },
  { value: 4, label: "Once a day" },
  { value: 5, label: "More often" },
];

export const SKELETON_ITEMS: Item[] = [
  {
    id: "csi-1",
    chapter: "jhalak",
    instrument: "csi16",
    text: "Please indicate the degree of happiness, all things considered, of your relationship.",
    scale: satisfactionDegree,
    citation: "funk-rogge-2007",
  },
  {
    id: "csi-9",
    chapter: "jhalak",
    instrument: "csi16",
    text: "Our relationship is strong.",
    scale: agreement6,
    citation: "funk-rogge-2007",
  },
  {
    id: "csi-4",
    chapter: "jhalak",
    instrument: "csi16",
    text: "In general, how often do you think that things between you and your partner are going well?",
    scale: frequency6,
    citation: "funk-rogge-2007",
  },
];
