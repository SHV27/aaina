import { describe, expect, it } from "vitest";
import { computeConfidence, computeQualityFlags, SPEEDING_MS } from "./quality";
import type { Answer, Item, QualityFlags } from "./types";

const mkItem = (id: string, instructedValue?: number): Item => ({
  id,
  chapter: "dil",
  instrument: instructedValue === undefined ? "csi16" : "iri",
  text: id,
  scale: [0, 1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) })),
  citation: "funk-rogge-2007",
  instructedValue,
});

const mkAnswer = (itemId: string, value: number, tMs = 2500): Answer => ({ itemId, value, tMs });

describe("quality flags (Meade & Craig 2012)", () => {
  it("flags speeding and straight-lining on careless data", () => {
    const items = Array.from({ length: 12 }, (_, i) => mkItem(`q${i}`));
    const answers = items.map((it) => mkAnswer(it.id, 3, SPEEDING_MS - 400));
    const q = computeQualityFlags(answers, items, items.length);
    expect(q.speedingCount).toBe(12);
    expect(q.longestStraightline).toBe(12);
  });

  it("stays quiet on attentive, varied data (two-sided)", () => {
    const items = Array.from({ length: 12 }, (_, i) => mkItem(`q${i}`));
    const answers = items.map((it, i) => mkAnswer(it.id, i % 5, 2200 + i * 100));
    const q = computeQualityFlags(answers, items, items.length);
    expect(q.speedingCount).toBe(0);
    expect(q.longestStraightline).toBeLessThan(3);
    expect(q.irisFailed).toBe(0);
  });

  it("counts failed instructed-response items", () => {
    const items = [mkItem("q1"), mkItem("iri1", 2), mkItem("iri2", 4)];
    const answers = [mkAnswer("q1", 3), mkAnswer("iri1", 0), mkAnswer("iri2", 4)];
    const q = computeQualityFlags(answers, items, 3);
    expect(q.irisFailed).toBe(1);
  });
});

describe("confidence meter", () => {
  const clean: QualityFlags = {
    speedingCount: 0,
    longestStraightline: 2,
    irisFailed: 0,
    mcC: null,
    answeredCount: 100,
    skippedCount: 0,
  };

  it("solo mode is high confidence but always carries the one-sided-input reason", () => {
    const c = computeConfidence(clean, "solo");
    expect(c.level).toBe("high");
    expect(c.reasons.some((r) => r.includes("aankhon"))).toBe(true);
  });

  it("degrades visibly, with reasons, on bad quality — never silently", () => {
    const c = computeConfidence(
      { ...clean, irisFailed: 2, speedingCount: 40, longestStraightline: 12 },
      "solo",
    );
    expect(c.level).toBe("tentative");
    expect(c.reasons.length).toBeGreaterThanOrEqual(3);
  });
});
