import { describe, expect, it } from "vitest";
import { generateReport, type Report } from "./report";
import {
  ALL_ASSESSMENT_ITEMS,
  CSI_ITEMS,
  IMS_ALTERNATIVES_ITEMS,
  IMS_COMMITMENT_ITEMS,
  IMS_INVESTMENT_ITEMS,
  IMS_SATISFACTION_ITEMS,
  JOEL_LEAVE_ITEMS,
  JOEL_STAY_ITEMS,
  WAST_ITEMS,
} from "./items";
import { findBannedLanguage } from "./counsellorGuard";
import { CITATIONS } from "./citations";
import type { Answer } from "./types";

const a = (itemId: string, value: number): Answer => ({ itemId, value, tMs: 2500 });

function fullAnswers(overrides: Record<string, number> = {}): Answer[] {
  return ALL_ASSESSMENT_ITEMS.filter((i) => i.instrument !== "iri").map((i) => {
    if (i.id in overrides) return a(i.id, overrides[i.id]);
    const values = i.scale.map((p) => p.value);
    return a(i.id, values[Math.floor(values.length / 2)]);
  });
}

const calmWast = WAST_ITEMS.map((i) => a(i.id, 1));

function everySentence(r: Report) {
  const out = [r.affirmation, ...r.confirmations, ...r.verdict];
  if (r.cycle) out.push(r.cycle);
  if (r.experiment) out.push(r.experiment);
  if (r.ownContribution) out.push(r.ownContribution);
  for (const p of r.paths) out.push(p.body, p.cost);
  return out;
}

describe("generateReport — receipts law over every sentence (Referee)", () => {
  it("every sentence in every archetype carries answer ids and a known citation", () => {
    const scenarios: Record<string, number>[] = [
      {}, // mid everything
      Object.fromEntries([
        ...CSI_ITEMS.map((i) => [i.id, Math.max(...i.scale.map((s) => s.value))]),
        ...IMS_COMMITMENT_ITEMS.map((i) => [i.id, i.reverse ? 0 : 8]),
        ...JOEL_LEAVE_ITEMS.map((i) => [i.id, 1]),
      ]), // warm-rooted
      Object.fromEntries([
        ...CSI_ITEMS.map((i) => [i.id, 0]),
        ...IMS_COMMITMENT_ITEMS.map((i) => [i.id, i.reverse ? 8 : 1]),
        ...JOEL_LEAVE_ITEMS.map((i) => [i.id, 7]),
        ...JOEL_STAY_ITEMS.map((i) => [i.id, 2]),
      ]), // leaning-out
      Object.fromEntries([
        ...JOEL_STAY_ITEMS.map((i) => [i.id, 6]),
        ...JOEL_LEAVE_ITEMS.map((i) => [i.id, 6]),
      ]), // ambivalent
    ];
    for (const overrides of scenarios) {
      const r = generateReport(fullAnswers(overrides), calmWast);
      for (const sen of everySentence(r)) {
        expect(sen.evidence.answerIds.length, sen.text.slice(0, 60)).toBeGreaterThan(0);
        expect(sen.evidence.source in CITATIONS, sen.text.slice(0, 60)).toBe(true);
        expect(findBannedLanguage(sen.text), sen.text).toHaveLength(0);
      }
      expect(findBannedLanguage(r.warningShot + r.empathy + r.autonomy)).toHaveLength(0);
      expect(r.paths).toHaveLength(3);
    }
  });

  it("archetypes classify sanely on constructed profiles", () => {
    const warm = generateReport(
      fullAnswers(
        Object.fromEntries([
          ...CSI_ITEMS.map((i) => [i.id, Math.max(...i.scale.map((s) => s.value))]),
          ...IMS_COMMITMENT_ITEMS.map((i) => [i.id, i.reverse ? 0 : 8]),
          ...JOEL_LEAVE_ITEMS.map((i) => [i.id, 1]),
          ...JOEL_STAY_ITEMS.map((i) => [i.id, 6]),
        ]),
      ),
      calmWast,
    );
    expect(warm.archetype).toBe("warm-rooted");

    const constrained = generateReport(
      fullAnswers(
        Object.fromEntries([
          ...CSI_ITEMS.map((i) => [i.id, 0]),
          ...IMS_SATISFACTION_ITEMS.map((i) => [i.id, 1]),
          ...IMS_COMMITMENT_ITEMS.map((i) => [i.id, i.reverse ? 1 : 7]),
          ...IMS_INVESTMENT_ITEMS.map((i) => [i.id, 7]),
          ...IMS_ALTERNATIVES_ITEMS.map((i) => [i.id, 1]),
          ...JOEL_STAY_ITEMS.map((i) => [i.id, 3]),
          ...JOEL_LEAVE_ITEMS.map((i) => [i.id, 3]),
        ]),
      ),
      calmWast,
    );
    expect(constrained.archetype).toBe("constrained-staying");
  });

  it("danger gate branches inside the generator — callers cannot skip it", () => {
    const r = generateReport(
      fullAnswers(),
      WAST_ITEMS.map((i) => a(i.id, 3)),
    );
    expect(r.danger).toBe(true);
    // R13 exception: no mutual-cycle framing, no joint-repair prescription.
    expect(r.cycle).toBeNull();
    expect(r.experiment).toBeNull();
    expect(r.ownContribution).toBeNull();
    expect(r.verdict[0].text).toMatch(/zimmedari|suraksha/i);
    // Report is still delivered (founder decision 7): paths and verdict exist.
    expect(r.paths).toHaveLength(3);
    expect(r.verdict.length).toBeGreaterThan(1);
  });

  it("insufficient data → unclear archetype with an honest sentence, no fake verdict", () => {
    const r = generateReport([a("csi-1", 3)], []);
    expect(r.archetype).toBe("unclear");
    expect(r.verdict[0].text).toMatch(/imaandaari|adhoore/);
  });

  it("readability: verdict sentences stay short (grade-8 discipline, R18)", () => {
    const r = generateReport(fullAnswers(), calmWast);
    for (const sen of r.verdict) {
      const sentences = sen.text.split(/[.!?]/).filter((x) => x.trim().length > 0);
      for (const st of sentences) {
        expect(st.trim().split(/\s+/).length, st).toBeLessThanOrEqual(30);
      }
    }
  });
});
