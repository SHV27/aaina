import { ACTIVITIES } from "./activities";
import type { Activity, Assessment, PlanStep, Road } from "./types";

/** THE PLAN BUILDER — "The Work".
 *
 *  Selects activities for this specific profile, in the order the evidence says
 *  they should happen, and binds each one to the finding that selected it so the
 *  report can say WHY this activity and not another.
 *
 *  Contraindications are filtered BEFORE selection, so a risk-positive profile
 *  cannot receive conjoint work by any code path. The Referee suite asserts it. */

export interface PlanContext {
  road: Road;
  riskPositive: boolean;
  partnerWilling: boolean;
  highRumination: boolean;
  coParenting: boolean;
}

/** Sequencing law from behavioural couple therapy: goodwill before conflict work.
 *  Distressed couples cannot problem-solve before positivity is restored. */
const PHASE_ORDER: Record<string, number> = {
  // goodwill first
  "gratitude-spoken": 10,
  "acr-good-news": 11,
  "caring-days": 12,
  "novel-activity": 13,
  "stress-debrief": 14,
  // self-regulation next (solo work that makes the joint work possible)
  "self-compassion": 20,
  "ask-plainly": 21,
  "name-the-exit": 22,
  "phone-boundary": 23,
  "stop-checking": 24,
  "reappraisal-writing": 25,
  // then conflict and closeness skills
  "soft-startup": 30,
  "time-out-protocol": 31,
  "speaker-listener": 32,
  "unified-detachment": 33,
  "36-questions": 34,
  "hold-me-tight": 35,
  "sexual-communication": 36,
  // deciding
  "define-it": 40,
  "three-roads": 41,
  "six-month-test": 42,
  // after
  "narrative-writing": 50,
  "self-concept-rebuild": 51,
  "reduce-monitoring": 52,
  "structured-checkin": 53,
  // safety overrides everything
  "safety-plan": 1,
};

function allowed(activity: Activity, ctx: PlanContext): boolean {
  if (!activity.roads.includes(ctx.road)) return false;
  for (const c of activity.contraindications) {
    if (c === "risk-positive" && ctx.riskPositive) return false;
    if (c === "partner-unwilling" && !ctx.partnerWilling) return false;
    if (c === "high-rumination" && ctx.highRumination) return false;
    if (c === "co-parenting" && ctx.coParenting) return false;
  }
  // Structural rule: no conjoint work at all when the risk screen is positive.
  if (ctx.riskPositive && !activity.soloOk) return false;
  return true;
}

interface Hit {
  activity: Activity;
  score: number;
  becauseDimension?: PlanStep["becauseDimension"];
  becauseContradiction?: string;
}

export function buildPlan(
  assessment: Assessment,
  ctx: PlanContext,
  limit = 6,
): PlanStep[] {
  const scoreByDim = new Map(assessment.scores.map((s) => [s.dimension, s]));
  const contradictionKinds = new Set(assessment.contradictions.map((c) => c.kind));
  const hits: Hit[] = [];

  for (const activity of ACTIVITIES) {
    if (!allowed(activity, ctx)) continue;

    let best = 0;
    let becauseDimension: Hit["becauseDimension"];
    let becauseContradiction: string | undefined;

    for (const ind of activity.indications) {
      if (ind.kind) {
        if (contradictionKinds.has(ind.kind)) {
          const c = assessment.contradictions.find((x) => x.kind === ind.kind)!;
          const s = 60 + c.magnitude / 2;
          if (s > best) {
            best = s;
            becauseContradiction = c.id;
            becauseDimension = undefined;
          }
        }
        continue;
      }
      if (ind.dimension) {
        const ds = scoreByDim.get(ind.dimension);
        if (!ds || ds.answered === 0) continue;
        if (ind.below !== undefined && ds.normalized < ind.below) {
          // The further below the threshold, the more this is needed.
          const s = 50 + (ind.below - ds.normalized);
          if (s > best) {
            best = s;
            becauseDimension = ind.dimension;
            becauseContradiction = undefined;
          }
        }
        if (ind.above !== undefined && ds.normalized > ind.above) {
          const s = 50 + (ds.normalized - ind.above);
          if (s > best) {
            best = s;
            becauseDimension = ind.dimension;
            becauseContradiction = undefined;
          }
        }
      }
    }

    // Road-defining activities with no specific indication still belong on their road
    // (e.g. breakup recovery work on the "leave" road, safety planning on "safety").
    if (best === 0 && activity.indications.length === 0) best = 55;

    if (best > 0) hits.push({ activity, score: best, becauseDimension, becauseContradiction });
  }

  hits.sort((a, b) => b.score - a.score);

  // Cap solo-heavy plans so the reader gets a plan, not a syllabus.
  const chosen = hits.slice(0, limit);
  chosen.sort(
    (a, b) =>
      (PHASE_ORDER[a.activity.id] ?? 99) - (PHASE_ORDER[b.activity.id] ?? 99),
  );

  return chosen.map((h, i) => ({
    activity: h.activity,
    becauseDimension: h.becauseDimension,
    becauseContradiction: h.becauseContradiction,
    order: i + 1,
  }));
}

/** The road the evidence points to, which the reader may override.
 *  Confident about the pattern; silent about the command. */
export function suggestRoad(assessment: Assessment, riskPositive: boolean): Road {
  if (riskPositive) return "safety";
  const sat = assessment.scores.find((s) => s.dimension === "satisfaction");
  const com = assessment.scores.find((s) => s.dimension === "commitment");
  if (!sat || !com || sat.answered === 0 || com.answered === 0) return "decide";

  const ambivalent = assessment.contradictions.some(
    (c) => c.kind === "commitment-without-satisfaction" || c.kind === "staying-from-fear",
  );
  if (ambivalent) return "decide";
  if (com.normalized < 35 && sat.normalized < 40) return "leave";
  if (sat.normalized >= 55 || com.normalized >= 60) return "repair";
  return "decide";
}
