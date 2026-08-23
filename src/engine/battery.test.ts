import { describe, expect, it } from "vitest";
import {
  ALL_ASSESSMENT_ITEMS,
  CHAPTERS,
  CSI_ITEMS,
  ECR_ITEMS,
  IMS_COMMITMENT_ITEMS,
  JHALAK_ITEMS,
  JOEL_LEAVE_ITEMS,
  JOEL_STAY_ITEMS,
  MCC_ITEMS,
  WAST_ITEMS,
} from "./items";
import { CSI16_DISTRESS_CUTOFF, scoreAssessment, scoreSafety } from "./score";
import type { Answer } from "./types";

const a = (itemId: string, value: number, tMs = 3000): Answer => ({ itemId, value, tMs });

describe("item bank integrity (Referee)", () => {
  it("has the published item counts", () => {
    expect(CSI_ITEMS).toHaveLength(16);
    expect(ECR_ITEMS).toHaveLength(12);
    expect(JOEL_STAY_ITEMS).toHaveLength(27);
    expect(JOEL_LEAVE_ITEMS).toHaveLength(23);
    expect(MCC_ITEMS).toHaveLength(13);
    expect(WAST_ITEMS).toHaveLength(8);
  });

  it("every item carries a citation and a scale", () => {
    for (const item of [...ALL_ASSESSMENT_ITEMS, ...WAST_ITEMS]) {
      expect(item.citation, item.id).toBeTruthy();
      expect(item.scale.length, item.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("no duplicate item ids across the whole battery", () => {
    const ids = [...ALL_ASSESSMENT_ITEMS, ...WAST_ITEMS].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("WAST items are NEVER inside the persisted assessment (radioactive rule)", () => {
    const persisted = new Set(ALL_ASSESSMENT_ITEMS.map((i) => i.id));
    for (const w of WAST_ITEMS) expect(persisted.has(w.id), w.id).toBe(false);
    for (const ch of CHAPTERS) expect(ch.id).not.toBe("suraksha");
  });

  it("jhalak draws only real validated items from the bank", () => {
    expect(JHALAK_ITEMS).toHaveLength(8);
    for (const item of JHALAK_ITEMS) expect(item.instrument).not.toBe("iri");
  });
});

describe("scoreAssessment — known-answer fixtures reproduce published scoring", () => {
  it("CSI-16: maximum answers give 81; the cutoff classifies correctly", () => {
    const max = CSI_ITEMS.map((i) =>
      a(i.id, Math.max(...i.scale.map((s) => s.value))),
    );
    const s = scoreAssessment(max);
    expect(s.csi16).toBe(81);
    expect(s.csi16Distressed).toBe(false);

    const low = CSI_ITEMS.map((i) =>
      a(i.id, Math.min(...i.scale.map((s) => s.value))),
    );
    const s2 = scoreAssessment(low);
    expect(s2.csi16).toBe(0);
    expect(s2.csi16Distressed).toBe(true);
    expect(CSI16_DISTRESS_CUTOFF).toBe(51.5);
  });

  it("ECR-S: reverse-keyed items flip correctly (all 7s → anxiety mean reflects 8R)", () => {
    // All items answered 7 (strongly agree). Anxiety: 2,4,6,10,12 = 7; item 8R = 8-7 = 1.
    const answers = ECR_ITEMS.map((i) => a(i.id, 7));
    const s = scoreAssessment(answers);
    expect(s.ecrAnxiety).toBeCloseTo((7 * 5 + 1) / 6, 5);
    // Avoidance: 3,7,11 = 7; 1R,5R,9R = 1 each.
    expect(s.ecrAvoidance).toBeCloseTo((7 * 3 + 1 * 3) / 6, 5);
  });

  it("CPQ: constructive uses Crenshaw mapping (A1 reversed), demand/withdraw sums 6 items", () => {
    const answers = [
      a("cpq-a1", 2), // reversed: contributes 10-2 = 8
      a("cpq-a2", 9),
      a("cpq-b4", 8),
      a("cpq-b6", 7),
      a("cpq-a3a", 6),
      a("cpq-b7a", 5),
      a("cpq-b8a", 4),
      a("cpq-a3b", 3),
      a("cpq-b7b", 2),
      a("cpq-b8b", 1),
    ];
    const s = scoreAssessment(answers);
    expect(s.cpqConstructive).toBe(9 + 8 + 7 + 8);
    expect(s.cpqDemandWithdraw).toBe(6 + 5 + 4 + 3 + 2 + 1);
  });

  it("IMS commitment: the two reversed items flip on the 0–8 scale", () => {
    const answers = IMS_COMMITMENT_ITEMS.map((i) => a(i.id, 8));
    const s = scoreAssessment(answers);
    // 5 straight items at 8, two reversed at 8→0: mean = 40/7.
    expect(s.imsCommitment).toBeCloseTo(40 / 7, 5);
  });

  it("Joel ambivalence: both sides above midpoint → ambivalent true (the norm, not an error)", () => {
    const answers = [
      ...JOEL_STAY_ITEMS.map((i) => a(i.id, 6)),
      ...JOEL_LEAVE_ITEMS.map((i) => a(i.id, 5)),
    ];
    const s = scoreAssessment(answers);
    expect(s.stayStrength).toBe(6);
    expect(s.leaveStrength).toBe(5);
    expect(s.ambivalent).toBe(true);
  });

  it("Joel one-sided: clearly low leave side → not ambivalent (two-sided guard)", () => {
    const answers = [
      ...JOEL_STAY_ITEMS.map((i) => a(i.id, 6)),
      ...JOEL_LEAVE_ITEMS.map((i) => a(i.id, 2)),
    ];
    expect(scoreAssessment(answers).ambivalent).toBe(false);
  });

  it("MC-C: fully socially-desirable pattern scores 13; candid pattern scores 0", () => {
    const desirable = MCC_ITEMS.map((i) => a(i.id, i.keyedTrue ? 1 : 0));
    expect(scoreAssessment(desirable).quality.mcC).toBe(13);
    const candid = MCC_ITEMS.map((i) => a(i.id, i.keyedTrue ? 0 : 1));
    expect(scoreAssessment(candid).quality.mcC).toBe(0);
  });

  it("insufficient data returns null, never a fake score", () => {
    const s = scoreAssessment([a("csi-1", 6), a("ecr-2", 4)]);
    expect(s.csi16).toBeNull();
    expect(s.ecrAnxiety).toBeNull();
    expect(s.imsCommitment).toBeNull();
    expect(s.ambivalent).toBeNull();
  });
});

describe("scoreSafety — WAST danger gate (Referee)", () => {
  it("all-calm answers do not trigger the gate (two-sided)", () => {
    const calm = WAST_ITEMS.map((i) => a(i.id, 1));
    const s = scoreSafety(calm);
    expect(s.wastTotal).toBe(8);
    expect(s.wastPositive).toBe(false);
  });

  it("published cutoff ≥13 triggers the gate", () => {
    // 8 items: five 2s and three 1s = 13.
    const answers = WAST_ITEMS.map((i, idx) => a(i.id, idx < 5 ? 2 : 1));
    expect(scoreSafety(answers).wastPositive).toBe(true);
  });

  it("ANY physical/sexual endorsement triggers immediately, whatever the total", () => {
    const answers = WAST_ITEMS.map((i) => a(i.id, i.id === "wast-4" ? 2 : 1));
    const s = scoreSafety(answers);
    expect(s.wastTotal).toBe(9); // below cutoff…
    expect(s.physicalOrSexual).toBe(true);
    expect(s.wastPositive).toBe(true); // …but the gate still fires
  });

  it("WAST-Short both-extremes rule fires even without the full tool", () => {
    const s = scoreSafety([a("wast-1", 3), a("wast-2", 3)]);
    expect(s.shortPositive).toBe(true);
    expect(s.wastPositive).toBe(true);
    expect(s.wastTotal).toBeNull(); // honest: no full total from partial data
  });
});
