import { DIMENSIONS, DIMENSION_BY_ID, bandFor, type DimensionId } from "./dimensions";
import type {
  Assessment,
  DimensionScore,
  Item,
  QualitySignals,
  Response,
} from "./types";
import { findContradictions } from "./contradictions";

/** THE derivation authority. Nothing else computes a score, a band, or the overall.
 *  Every dimension is normalized to 0–100 where higher is always better, so the
 *  report can compare dimensions honestly and the composite means something. */

export const SPEEDING_MS = 900;

/** Weights for the overall composite. Chosen from what the evidence says predicts
 *  relationship quality and survival, not from intuition:
 *  Joel et al. (2020) — perceived commitment, appreciation/responsiveness, sexual
 *  satisfaction, conflict are the strongest self-report predictors; Le et al. (2010)
 *  — commitment and satisfaction dominate dissolution prediction. Context dimensions
 *  matter but are external, so they carry less weight than the couple's own state.
 *  The formula is shown to the user; nothing here is hidden math. */
export const OVERALL_WEIGHTS: Record<DimensionId, number> = {
  satisfaction: 1.6,
  commitment: 1.5,
  responsiveness: 1.4,
  "conflict-pattern": 1.3,
  "trust-security": 1.2,
  "intimacy-sexual": 1.0,
  "values-future": 1.0,
  "attachment-anxiety": 0.7,
  "attachment-avoidance": 0.7,
  "relational-certainty": 0.9,
  "autonomy-fear": 0.7,
  "digital-strain": 0.6,
  "family-acceptance": 0.7,
  "support-network": 0.7,
};

function normalizeItem(item: Item, value: number): number {
  const vals = item.scale.map((s) => s.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const p = ((value - min) / (max - min)) * 100;
  return item.reverse ? 100 - p : p;
}

export function scoreDimensions(items: Item[], responses: Response[]): DimensionScore[] {
  const rmap = new Map(responses.map((r) => [r.itemId, r]));
  const out: DimensionScore[] = [];

  for (const dim of DIMENSIONS) {
    const dimItems = items.filter((i) => i.dimension === dim.id && i.instructedValue === undefined);
    const answered = dimItems.filter((i) => rmap.has(i.id));
    if (dimItems.length === 0) continue;

    if (answered.length === 0) {
      out.push({
        dimension: dim.id,
        raw: 0,
        normalized: 0,
        band: "mixed",
        answered: 0,
        total: dimItems.length,
        itemIds: dimItems.map((i) => i.id),
        citation: dim.citation,
      });
      continue;
    }

    let sumNorm = 0;
    let sumRaw = 0;
    for (const item of answered) {
      const r = rmap.get(item.id)!;
      // Dimension direction: `invert` means a high construct score is bad news,
      // and the item bank already stores items in construct direction, so we flip once here.
      const itemNorm = normalizeItem(item, r.value);
      sumNorm += dim.invert ? 100 - itemNorm : itemNorm;
      sumRaw += r.value;
    }
    const normalized = Math.round((sumNorm / answered.length) * 10) / 10;
    out.push({
      dimension: dim.id,
      raw: Math.round((sumRaw / answered.length) * 100) / 100,
      normalized,
      band: bandFor(normalized).id,
      answered: answered.length,
      total: dimItems.length,
      itemIds: answered.map((i) => i.id),
      citation: dim.citation,
    });
  }
  return out;
}

export function computeOverall(scores: DimensionScore[]): {
  overall: number;
  components: { dimension: DimensionId; normalized: number; weight: number }[];
} {
  const components = scores
    .filter((s) => s.answered > 0)
    .map((s) => ({
      dimension: s.dimension,
      normalized: s.normalized,
      weight: OVERALL_WEIGHTS[s.dimension] ?? 1,
    }));
  const totalWeight = components.reduce((a, c) => a + c.weight, 0);
  const overall =
    totalWeight === 0
      ? 0
      : Math.round((components.reduce((a, c) => a + c.normalized * c.weight, 0) / totalWeight) * 10) /
        10;
  return { overall, components };
}

export function computeQuality(items: Item[], responses: Response[]): QualitySignals {
  const rmap = new Map(responses.map((r) => [r.itemId, r]));
  let speeding = 0;
  for (const r of responses) if (r.tMs > 0 && r.tMs < SPEEDING_MS) speeding++;

  let longestStraightline = 0;
  let run = 0;
  let prev: number | null = null;
  for (const item of items) {
    const r = rmap.get(item.id);
    if (!r) {
      run = 0;
      prev = null;
      continue;
    }
    run = r.value === prev ? run + 1 : 1;
    prev = r.value;
    longestStraightline = Math.max(longestStraightline, run);
  }

  let attentionFailed = 0;
  for (const item of items) {
    if (item.instructedValue === undefined) continue;
    const r = rmap.get(item.id);
    if (r && r.value !== item.instructedValue) attentionFailed++;
  }

  const scoreable = items.filter((i) => i.instructedValue === undefined);
  const answered = scoreable.filter((i) => rmap.has(i.id)).length;
  return {
    speeding,
    longestStraightline,
    attentionFailed,
    answered,
    skipped: scoreable.length - answered,
  };
}

export function assess(
  items: Item[],
  responses: Response[],
  hasPartnerContext: boolean,
): Assessment {
  const scores = scoreDimensions(items, responses);
  const { overall, components } = computeOverall(scores);
  const contradictions = findContradictions(scores, items, responses);
  const answeredScores = scores.filter((s) => s.answered > 0);
  const ranked = [...answeredScores].sort((a, b) => b.normalized - a.normalized);

  return {
    scores,
    overall,
    overallComponents: components,
    contradictions,
    strengths: ranked.slice(0, 3),
    pressures: ranked.slice(-3).reverse(),
    quality: computeQuality(items, responses),
    hasPartnerContext,
  };
}

export function dimensionLabel(id: DimensionId): string {
  return DIMENSION_BY_ID.get(id)?.label ?? id;
}
