import type { CitationId } from "./sources";
import type { BandId, DimensionId } from "./dimensions";

export interface ScalePoint {
  value: number;
  label: string;
}

export interface Item {
  id: string;
  dimension: DimensionId;
  /** Section shown to the user (assessment ordering). */
  section: SectionId;
  text: string;
  scale: ScalePoint[];
  /** High raw value means LOW standing on the dimension. */
  reverse?: boolean;
  citation: CitationId;
  /** Attention check: the value the instruction demands. */
  instructedValue?: number;
  /** Only asked when the user says they have a partner in view. */
  requiresPartner?: boolean;
  /** Tagged for the anti-generic engine's echo selection. */
  echoable?: boolean;
}

export type SectionId =
  | "you-and-them"
  | "the-feeling"
  | "friction"
  | "closeness"
  | "the-world"
  | "the-future"
  | "you";

export interface Response {
  itemId: string;
  value: number;
  tMs: number;
}

export interface DimensionScore {
  dimension: DimensionId;
  /** Mean of answered items on their native scale. */
  raw: number;
  /** 0–100, direction-corrected so higher is always better. */
  normalized: number;
  band: BandId;
  answered: number;
  total: number;
  itemIds: string[];
  citation: CitationId;
}

/** A tension between two things this person said. The ONLY thing the writer may
 *  build a claim around, which is what makes generic prose impossible. */
export interface Contradiction {
  id: string;
  kind: ContradictionKind;
  /** Plain-English label of the tension, engine-generated, no adjectives. */
  headline: string;
  aSide: ContradictionSide;
  bSide: ContradictionSide;
  /** 0–100: how sharp the tension is. */
  magnitude: number;
  citation: CitationId;
  /** Why this tension matters, in research terms — the writer must not invent this. */
  significance: string;
}

export interface ContradictionSide {
  label: string;
  itemIds: string[];
  /** Verbatim option labels the user chose, for echoing back. */
  echoes: string[];
  value: number;
}

export type ContradictionKind =
  | "commitment-without-satisfaction"
  | "staying-from-fear"
  | "trust-vs-surveillance"
  | "closeness-wanted-not-allowed"
  | "understood-but-unhappy"
  | "future-without-agreement"
  | "family-pressure-vs-choice"
  | "conflict-avoided-not-solved"
  | "intimacy-gap"
  | "certainty-gap"
  | "network-warning"
  | "self-report-tension";

export type Road = "repair" | "decide" | "leave" | "safety";

export interface Activity {
  id: string;
  title: string;
  /** What it does, mechanistically — one sentence, plain English. */
  mechanism: string;
  citation: CitationId;
  evidence: "A" | "B" | "C";
  indications: { dimension?: DimensionId; below?: number; above?: number; kind?: ContradictionKind }[];
  contraindications: ("risk-positive" | "partner-unwilling" | "high-rumination" | "co-parenting")[];
  soloOk: boolean;
  minutes: number;
  roads: Road[];
  /** Concrete instructions, written as steps. */
  steps: string[];
}

export interface PlanStep {
  activity: Activity;
  /** Bound to the finding that selected it. */
  becauseDimension?: DimensionId;
  becauseContradiction?: string;
  order: number;
}

export interface QualitySignals {
  speeding: number;
  longestStraightline: number;
  attentionFailed: number;
  answered: number;
  skipped: number;
}

export interface Assessment {
  scores: DimensionScore[];
  overall: number;
  overallComponents: { dimension: DimensionId; normalized: number; weight: number }[];
  contradictions: Contradiction[];
  strengths: DimensionScore[];
  pressures: DimensionScore[];
  quality: QualitySignals;
  hasPartnerContext: boolean;
}

/** A sentence that may render: bound to evidence, or it does not exist. */
export interface Claim {
  text: string;
  evidenceIds: string[];
  section: string;
}
