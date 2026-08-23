import type { CitationId } from "./citations";

export type ChapterId =
  | "dil" // Chapter 1 — closeness & satisfaction (CSI-16)
  | "baat-cheet" // Chapter 2 — how you talk & fight (CPQ-SF + ECR-S)
  | "jadein" // Chapter 3 — roots: commitment, investment, alternatives (IMS)
  | "dono-taraf" // Chapter 4 — both directions: stay/leave reasons (Joel)
  | "aap" // Chapter 5 — you as an individual (MC-C)
  | "suraksha"; // Safety (WAST) — memory-only store, never persisted

export type InstrumentId =
  | "csi16"
  | "ecr-s"
  | "cpq-sf"
  | "ims"
  | "joel-stay"
  | "joel-leave"
  | "wast"
  | "mc-c"
  | "iri"; // instructed response items (attention checks)

export interface ScalePoint {
  value: number;
  label: string;
}

export interface Item {
  id: string;
  chapter: ChapterId;
  instrument: InstrumentId;
  text: string;
  /** Response options, in display order. */
  scale: ScalePoint[];
  /** Reverse-scored relative to the construct. */
  reverse?: boolean;
  citation: CitationId;
  /** For IRIs: the required answer value. */
  instructedValue?: number;
}

export interface Answer {
  itemId: string;
  value: number;
  /** Response time in ms, for careless-responding flags. */
  tMs: number;
}

export type AssessmentMode = "solo" | "couple-initiator" | "couple-joiner" | "couple-merged";

export interface QualityFlags {
  speedingCount: number;
  longestStraightline: number;
  irisFailed: number;
  mcC: number | null;
  answeredCount: number;
  skippedCount: number;
}

export interface ScaleScores {
  csi16: number | null;
  csi16Distressed: boolean | null;
  ecrAnxiety: number | null;
  ecrAvoidance: number | null;
  cpqDemandWithdraw: number | null;
  cpqConstructive: number | null;
  imsCommitment: number | null;
  imsSatisfaction: number | null;
  imsAlternatives: number | null;
  imsInvestment: number | null;
  stayStrength: number | null;
  leaveStrength: number | null;
  ambivalent: boolean | null;
  quality: QualityFlags;
}

/** Evidence bound to every rendered claim — the receipts law. */
export interface Evidence {
  answerIds: readonly string[];
  source: CitationId;
}
