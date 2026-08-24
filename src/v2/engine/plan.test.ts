import { describe, expect, it } from "vitest";
import { buildPlan, suggestRoad, type PlanContext } from "./plan";
import { ACTIVITIES, CONJOINT_IDS } from "./activities";
import { SOURCES } from "./sources";
import type { Assessment, DimensionScore } from "./types";
import type { DimensionId } from "./dimensions";
import { DIMENSIONS } from "./dimensions";

const ds = (dimension: DimensionId, normalized: number): DimensionScore => ({
  dimension,
  raw: normalized / 20,
  normalized,
  band: "mixed",
  answered: 4,
  total: 4,
  itemIds: [`${dimension}-1`, `${dimension}-2`],
  citation: "funk-rogge-2007",
});

function assessment(overrides: Partial<Record<DimensionId, number>> = {}, contradictions: Assessment["contradictions"] = []): Assessment {
  const scores = DIMENSIONS.map((d) => ds(d.id, overrides[d.id] ?? 50));
  return {
    scores,
    overall: 50,
    overallComponents: [],
    contradictions,
    strengths: scores.slice(0, 3),
    pressures: scores.slice(-3),
    quality: { speeding: 0, longestStraightline: 2, attentionFailed: 0, answered: 100, skipped: 0 },
    hasPartnerContext: true,
  };
}

const ctx = (over: Partial<PlanContext> = {}): PlanContext => ({
  road: "repair",
  riskPositive: false,
  partnerWilling: true,
  highRumination: false,
  coParenting: false,
  ...over,
});

describe("activity library integrity", () => {
  it("every activity has a real citation, steps, and an evidence grade", () => {
    for (const a of ACTIVITIES) {
      expect(a.citation in SOURCES, a.id).toBe(true);
      expect(a.steps.length, a.id).toBeGreaterThanOrEqual(3);
      expect(["A", "B", "C"]).toContain(a.evidence);
      expect(a.roads.length, a.id).toBeGreaterThan(0);
    }
  });

  it("no duplicate activity ids", () => {
    const ids = ACTIVITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("plan builder — contraindications are structural", () => {
  it("NEVER prescribes conjoint work when the risk screen is positive", () => {
    for (const road of ["repair", "decide", "leave", "safety"] as const) {
      const plan = buildPlan(
        assessment({ satisfaction: 20, "conflict-pattern": 20, "intimacy-sexual": 20 }),
        ctx({ road, riskPositive: true }),
      );
      for (const step of plan) {
        expect(CONJOINT_IDS, `${road}: ${step.activity.id}`).not.toContain(step.activity.id);
        expect(step.activity.soloOk).toBe(true);
      }
    }
  });

  it("safety road leads with the safety plan", () => {
    const plan = buildPlan(assessment({ satisfaction: 15 }), ctx({ road: "safety", riskPositive: true }));
    expect(plan[0].activity.id).toBe("safety-plan");
  });

  it("drops partner-dependent work when the partner will not participate (two-sided)", () => {
    const withPartner = buildPlan(
      assessment({ "conflict-pattern": 25 }),
      ctx({ partnerWilling: true }),
    );
    const soloOnly = buildPlan(
      assessment({ "conflict-pattern": 25 }),
      ctx({ partnerWilling: false }),
    );
    expect(withPartner.some((s) => s.activity.id === "speaker-listener")).toBe(true);
    expect(soloOnly.some((s) => !s.activity.soloOk)).toBe(false);
  });

  it("withholds venting-style writing from high ruminators (Sbarra 2013)", () => {
    const normal = buildPlan(assessment({ satisfaction: 20 }), ctx({ road: "leave" }));
    const ruminator = buildPlan(
      assessment({ satisfaction: 20 }),
      ctx({ road: "leave", highRumination: true }),
    );
    expect(normal.some((s) => s.activity.id === "narrative-writing")).toBe(true);
    expect(ruminator.some((s) => s.activity.id === "narrative-writing")).toBe(false);
  });
});

describe("plan builder — selection is driven by this profile", () => {
  it("a conflict-heavy profile and an intimacy-heavy profile get different plans", () => {
    const conflict = buildPlan(
      assessment({ "conflict-pattern": 18, "intimacy-sexual": 75 }),
      ctx(),
    ).map((s) => s.activity.id);
    const intimacy = buildPlan(
      assessment({ "conflict-pattern": 80, "intimacy-sexual": 20, satisfaction: 45 }),
      ctx(),
    ).map((s) => s.activity.id);
    expect(conflict).not.toEqual(intimacy);
    expect(conflict.some((id) => ["speaker-listener", "soft-startup", "time-out-protocol"].includes(id))).toBe(true);
    expect(intimacy.some((id) => ["sexual-communication", "36-questions", "novel-activity"].includes(id))).toBe(true);
  });

  it("every step is bound to the finding that selected it", () => {
    const plan = buildPlan(
      assessment({ "digital-strain": 20, "attachment-anxiety": 25 }),
      ctx(),
    );
    for (const step of plan) {
      const bound = step.becauseDimension || step.becauseContradiction || step.activity.indications.length === 0;
      expect(bound, step.activity.id).toBeTruthy();
    }
  });

  it("orders goodwill work before conflict work (BCT sequencing)", () => {
    const plan = buildPlan(
      assessment({ satisfaction: 30, "conflict-pattern": 25, responsiveness: 35 }),
      ctx(),
    ).map((s) => s.activity.id);
    const gratitude = plan.indexOf("gratitude-spoken");
    const speaker = plan.indexOf("speaker-listener");
    if (gratitude >= 0 && speaker >= 0) expect(gratitude).toBeLessThan(speaker);
  });
});

describe("road suggestion", () => {
  it("risk always routes to safety, whatever the scores say", () => {
    expect(suggestRoad(assessment({ satisfaction: 90, commitment: 90 }), true)).toBe("safety");
  });

  it("ambivalence routes to decide, not to a command", () => {
    const a = assessment({ commitment: 75, satisfaction: 30 }, [
      {
        id: "commitment-without-satisfaction",
        kind: "commitment-without-satisfaction",
        headline: "x",
        aSide: { label: "a", itemIds: ["i1"], echoes: [], value: 75 },
        bSide: { label: "b", itemIds: ["i2"], echoes: [], value: 30 },
        magnitude: 45,
        citation: "rusbult-1998",
        significance: "y",
      },
    ]);
    expect(suggestRoad(a, false)).toBe("decide");
  });

  it("a healthy profile routes to repair; a spent one routes to leave", () => {
    expect(suggestRoad(assessment({ satisfaction: 75, commitment: 80 }), false)).toBe("repair");
    expect(suggestRoad(assessment({ satisfaction: 20, commitment: 20 }), false)).toBe("leave");
  });
});
