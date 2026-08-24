import type { CitationId } from "./sources";

/** The 14 measured dimensions. Core (validated mainstream), Modern (Gen Z,
 *  digital era), Context (what Western instruments miss about India). */

export type DimensionId =
  // Core
  | "satisfaction"
  | "commitment"
  | "attachment-anxiety"
  | "attachment-avoidance"
  | "conflict-pattern"
  | "responsiveness"
  | "intimacy-sexual"
  | "values-future"
  | "trust-security"
  // Modern
  | "digital-strain"
  | "relational-certainty"
  | "autonomy-fear"
  // India / context
  | "family-acceptance"
  | "support-network";

export type DimensionGroup = "core" | "modern" | "context";

export interface Dimension {
  id: DimensionId;
  /** Product-facing name. English. */
  label: string;
  group: DimensionGroup;
  /** One line, plain English: what this measures. */
  measures: string;
  citation: CitationId;
  /** Ends of the 0-100 view. 0 is ALWAYS the harder end and 100 ALWAYS the
   *  better end. Direction lives in each item's `reverse` flag and nowhere
   *  else, so there is exactly one place a direction bug can hide. */
  lowLabel: string;
  highLabel: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "satisfaction",
    label: "Everyday satisfaction",
    group: "core",
    measures: "How good this relationship actually feels to you, day to day.",
    citation: "funk-rogge-2007",
    lowLabel: "Running on empty",
    highLabel: "Genuinely happy",
  },
  {
    id: "commitment",
    label: "Commitment",
    group: "core",
    measures: "How firmly you intend to stay, and how far ahead you picture this lasting.",
    citation: "rusbult-1998",
    lowLabel: "One foot out",
    highLabel: "All in",
  },
  {
    id: "attachment-anxiety",
    label: "Fear of losing them",
    group: "core",
    measures: "How much of your energy goes into worrying whether you are wanted.",
    citation: "wei-2007",
    lowLabel: "Constantly braced",
    highLabel: "Settled",
  },
  {
    id: "attachment-avoidance",
    label: "Comfort with closeness",
    group: "core",
    measures: "How easily you let someone all the way in, instead of keeping distance.",
    citation: "wei-2007",
    lowLabel: "Guarded",
    highLabel: "Open",
  },
  {
    id: "conflict-pattern",
    label: "How you fight",
    group: "core",
    measures: "Whether disagreements get worked through, or turn into pressure and silence.",
    citation: "christensen-1990",
    lowLabel: "Pressure and shutdown",
    highLabel: "Worked through",
  },
  {
    id: "responsiveness",
    label: "Feeling understood",
    group: "core",
    measures: "Whether your partner sees you accurately and responds to what they see.",
    citation: "reis-2004",
    lowLabel: "Talking past each other",
    highLabel: "Deeply understood",
  },
  {
    id: "intimacy-sexual",
    label: "Physical intimacy",
    group: "core",
    measures: "How satisfying and honest the physical side of this relationship is.",
    citation: "lawrance-byers-1995",
    lowLabel: "Distant",
    highLabel: "Alive",
  },
  {
    id: "values-future",
    label: "Same direction",
    group: "core",
    measures: "Whether the lives you each want can actually be the same life.",
    citation: "aaina-values-2026",
    lowLabel: "Different roads",
    highLabel: "Same road",
  },
  {
    id: "trust-security",
    label: "Trust",
    group: "core",
    measures: "Whether you can relax about what happens when you are not in the room.",
    citation: "rempel-1985",
    lowLabel: "On guard",
    highLabel: "At ease",
  },
  {
    id: "digital-strain",
    label: "Phones and jealousy",
    group: "modern",
    measures: "How much your phones, feeds, and who-liked-what are costing this relationship.",
    citation: "roberts-david-2016",
    lowLabel: "Costing a lot",
    highLabel: "Costing very little",
  },
  {
    id: "relational-certainty",
    label: "Knowing where you stand",
    group: "modern",
    measures: "Whether you actually know what this is, and whether they agree.",
    citation: "knobloch-solomon-1999",
    lowLabel: "Undefined",
    highLabel: "Clearly defined",
  },
  {
    id: "autonomy-fear",
    label: "Choosing, not clinging",
    group: "modern",
    measures: "Whether you are here because you want this, or because being alone frightens you.",
    citation: "spielmann-2013",
    lowLabel: "Fear is driving",
    highLabel: "Choice is driving",
  },
  {
    id: "family-acceptance",
    label: "Family and the world",
    group: "context",
    measures: "Whether the families around you make this easier or harder to live.",
    citation: "aaina-family-2026",
    lowLabel: "Under pressure",
    highLabel: "Backed",
  },
  {
    id: "support-network",
    label: "What your people think",
    group: "context",
    measures: "Whether the friends who know you both are quietly worried or genuinely glad.",
    citation: "sprecher-felmlee-1992",
    lowLabel: "Quietly worried",
    highLabel: "Rooting for you",
  },
];

export const DIMENSION_BY_ID = new Map(DIMENSIONS.map((d) => [d.id, d]));

/** Bands are descriptive, never verdicts. Cutoffs are on the 0-100 view. */
export type BandId = "critical" | "strained" | "mixed" | "solid" | "strong";

export interface Band {
  id: BandId;
  min: number;
  label: string;
}

export const BANDS: Band[] = [
  { id: "critical", min: 0, label: "Needs attention now" },
  { id: "strained", min: 25, label: "Under strain" },
  { id: "mixed", min: 45, label: "Mixed" },
  { id: "solid", min: 65, label: "Solid" },
  { id: "strong", min: 82, label: "A real strength" },
];

export function bandFor(normalized: number): Band {
  let out = BANDS[0];
  for (const b of BANDS) if (normalized >= b.min) out = b;
  return out;
}
