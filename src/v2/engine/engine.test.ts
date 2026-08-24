import { describe, expect, it } from "vitest";
import { ITEMS, ITEM_BY_ID, SECTIONS, SCOREABLE_COUNT, ESTIMATED_MINUTES } from "./items";
import { DIMENSIONS } from "./dimensions";
import { SOURCES } from "./sources";
import { assess, scoreDimensions, computeOverall, computeQuality, SPEEDING_MS } from "./score";
import { findContradictions } from "./contradictions";
import { findVoiceViolations } from "../ai/voice";
import type { Item, Response } from "./types";

const answerAll = (value: (item: Item) => number, tMs = 2500): Response[] =>
  ITEMS.map((i) => ({ itemId: i.id, value: value(i), tMs }));

/** The answer that puts this person HIGHEST (best=true) on the dimension's
 *  0-100 view. Direction lives only on the item, so exactly one flip applies. */
const extremeFor = (item: Item, best: boolean): number => {
  const vals = item.scale.map((s) => s.value);
  const hi = Math.max(...vals);
  const lo = Math.min(...vals);
  const wantHigh = item.reverse ? !best : best;
  return wantHigh ? hi : lo;
};

describe("item bank integrity", () => {
  it("covers every dimension with enough items to score it", () => {
    for (const dim of DIMENSIONS) {
      const n = ITEMS.filter((i) => i.dimension === dim.id && i.instructedValue === undefined).length;
      expect(n, `${dim.id} has ${n} items`).toBeGreaterThanOrEqual(5);
    }
  });

  it("is a real assessment: 100+ scoreable items across 7 sections", () => {
    expect(SCOREABLE_COUNT).toBeGreaterThanOrEqual(100);
    expect(SECTIONS).toHaveLength(7);
    expect(ESTIMATED_MINUTES).toBeGreaterThanOrEqual(35);
  });

  it("every item has a real source, a usable scale, and a section", () => {
    const sectionIds = new Set(SECTIONS.map((s) => s.id));
    for (const item of ITEMS) {
      expect(item.citation in SOURCES, item.id).toBe(true);
      expect(item.scale.length, item.id).toBeGreaterThanOrEqual(5);
      expect(sectionIds.has(item.section), `${item.id} section ${item.section}`).toBe(true);
      expect(item.text.length, item.id).toBeGreaterThan(15);
    }
  });

  it("has no duplicate ids", () => {
    expect(ITEM_BY_ID.size).toBe(ITEMS.length);
  });

  it("asks every question in English (no Hinglish in the product)", () => {
    for (const item of ITEMS) {
      const violations = findVoiceViolations(item.text);
      expect(violations, `${item.id}: ${item.text}`).toHaveLength(0);
    }
    for (const s of SECTIONS) {
      expect(findVoiceViolations(s.intro), s.id).toHaveLength(0);
      expect(findVoiceViolations(s.title), s.id).toHaveLength(0);
    }
  });

  it("presents items grouped in section order", () => {
    const order = SECTIONS.map((s) => s.id);
    let last = -1;
    for (const item of ITEMS) {
      const idx = order.indexOf(item.section);
      expect(idx).toBeGreaterThanOrEqual(last);
      last = Math.max(last, idx);
    }
  });
});

describe("scoring", () => {
  it("best-possible answers score near 100 on every dimension", () => {
    const scores = scoreDimensions(ITEMS, answerAll((i) => extremeFor(i, true)));
    for (const s of scores) {
      expect(s.normalized, `${s.dimension} = ${s.normalized}`).toBeGreaterThanOrEqual(95);
    }
    expect(computeOverall(scores).overall).toBeGreaterThanOrEqual(95);
  });

  it("worst-possible answers score near 0 on every dimension (two-sided)", () => {
    const scores = scoreDimensions(ITEMS, answerAll((i) => extremeFor(i, false)));
    for (const s of scores) {
      expect(s.normalized, `${s.dimension} = ${s.normalized}`).toBeLessThanOrEqual(5);
    }
    expect(computeOverall(scores).overall).toBeLessThanOrEqual(5);
  });

  /** This test exists because a real direction bug shipped: a profile that
   *  answered every conflict question badly scored 82/100 on "How you fight",
   *  because direction was encoded twice and the flips cancelled. These
   *  assertions are written against the MEANING of specific items, so they fail
   *  if the flags drift again, whatever the flags happen to say. */
  it("known-meaning items move the score in the humanly correct direction", () => {
    const cases: { id: string; worstIsHighRaw: boolean; note: string }[] = [
      { id: "sat-4", worstIsHighRaw: false, note: "relationship makes me happy" },
      { id: "com-1", worstIsHighRaw: false, note: "committed to maintaining it" },
      { id: "com-5", worstIsHighRaw: true, note: "would not be upset if it ended" },
      { id: "cfl-2", worstIsHighRaw: true, note: "both of us avoid discussing" },
      { id: "cfl-5", worstIsHighRaw: true, note: "I pressure while they go silent" },
      { id: "cfl-1", worstIsHighRaw: false, note: "both of us try to discuss" },
      { id: "anx-1", worstIsHighRaw: true, note: "need a lot of reassurance" },
      { id: "anx-4", worstIsHighRaw: false, note: "do NOT often worry about abandonment" },
      { id: "avo-1", worstIsHighRaw: false, note: "helps to turn to my partner" },
      { id: "avo-4", worstIsHighRaw: true, note: "try to avoid getting too close" },
      { id: "phb-1", worstIsHighRaw: true, note: "partner checks phone at meals" },
      { id: "phb-7", worstIsHighRaw: false, note: "partner does NOT use phone when talking" },
      { id: "dgj-2", worstIsHighRaw: true, note: "likely to monitor their activities" },
      { id: "fbs-2", worstIsHighRaw: true, note: "anxious about being single forever" },
      { id: "gst-5", worstIsHighRaw: true, note: "their interest is inconsistent" },
      { id: "crt-1", worstIsHighRaw: false, note: "certain how committed you are" },
      { id: "fam-2", worstIsHighRaw: false, note: "family would accept it" },
      { id: "fam-3", worstIsHighRaw: true, note: "pressure about the timeline" },
      { id: "net-2", worstIsHighRaw: true, note: "someone told me they are worried" },
      { id: "trs-6", worstIsHighRaw: true, note: "partner is very unpredictable" },
    ];

    for (const c of cases) {
      const item = ITEM_BY_ID.get(c.id);
      expect(item, `missing item ${c.id}`).toBeTruthy();
      const vals = item!.scale.map((s) => s.value);
      const at = (v: number) =>
        scoreDimensions([item!], [{ itemId: c.id, value: v, tMs: 2000 }]).find(
          (s) => s.dimension === item!.dimension,
        )!.normalized;
      const high = at(Math.max(...vals));
      const low = at(Math.min(...vals));
      if (c.worstIsHighRaw) {
        expect(high, `${c.id} (${c.note}) should score WORSE at its top value`).toBeLessThan(low);
      } else {
        expect(high, `${c.id} (${c.note}) should score BETTER at its top value`).toBeGreaterThan(low);
      }
    }
  });

  it("reverse-keyed items actually flip", () => {
    const reversed = ITEMS.filter((i) => i.reverse && i.instructedValue === undefined);
    expect(reversed.length).toBeGreaterThan(10);
    for (const item of reversed.slice(0, 6)) {
      const vals = item.scale.map((s) => s.value);
      const high = scoreDimensions([item], [{ itemId: item.id, value: Math.max(...vals), tMs: 2000 }]);
      const low = scoreDimensions([item], [{ itemId: item.id, value: Math.min(...vals), tMs: 2000 }]);
      const hi = high.find((s) => s.dimension === item.dimension)!.normalized;
      const lo = low.find((s) => s.dimension === item.dimension)!.normalized;
      expect(hi === lo, `${item.id} did not respond to its scale`).toBe(false);
      // A reverse-keyed item always scores lower at its top raw value.
      expect(hi, item.id).toBeLessThan(lo);
    }
  });

  it("the overall composite shows its own components and weights", () => {
    const scores = scoreDimensions(ITEMS, answerAll(() => 3));
    const { components } = computeOverall(scores);
    expect(components.length).toBeGreaterThanOrEqual(14);
    for (const c of components) expect(c.weight).toBeGreaterThan(0);
  });

  it("flags careless responding without silently invalidating it", () => {
    const rushed = answerAll(() => 3, SPEEDING_MS - 300);
    const q = computeQuality(ITEMS, rushed);
    expect(q.speeding).toBeGreaterThan(50);
    expect(q.longestStraightline).toBeGreaterThan(20);

    const careful = answerAll((i) => (i.scale[i.id.length % i.scale.length]?.value ?? i.scale[0].value), 3000);
    const q2 = computeQuality(ITEMS, careful);
    expect(q2.speeding).toBe(0);
  });

  it("scores partial assessments honestly rather than guessing", () => {
    const partial = ITEMS.slice(0, 12).map((i) => ({ itemId: i.id, value: i.scale[0].value, tMs: 2000 }));
    const scores = scoreDimensions(ITEMS, partial);
    const untouched = scores.filter((s) => s.answered === 0);
    expect(untouched.length).toBeGreaterThan(0);
    for (const s of untouched) expect(s.normalized).toBe(0);
  });
});

describe("contradiction engine — the anti-generic core", () => {
  it("finds the commitment-without-satisfaction tension when it exists", () => {
    const responses = answerAll((i) => {
      if (i.dimension === "commitment") return extremeFor(i, true);
      if (i.dimension === "satisfaction") return extremeFor(i, false);
      return i.scale[Math.floor(i.scale.length / 2)].value;
    });
    const scores = scoreDimensions(ITEMS, responses);
    const found = findContradictions(scores, ITEMS, responses);
    expect(found.some((c) => c.kind === "commitment-without-satisfaction")).toBe(true);
    const c = found.find((c) => c.kind === "commitment-without-satisfaction")!;
    expect(c.aSide.echoes.length).toBeGreaterThan(0);
    expect(c.significance.length).toBeGreaterThan(60);
    expect(c.magnitude).toBeGreaterThan(30);
  });

  it("does NOT invent tensions in a consistent profile (two-sided)", () => {
    const responses = answerAll((i) => extremeFor(i, true));
    const scores = scoreDimensions(ITEMS, responses);
    const found = findContradictions(scores, ITEMS, responses);
    const crossDim = found.filter((c) => c.kind !== "self-report-tension");
    expect(crossDim).toHaveLength(0);
  });

  it("produces different tensions for different people", () => {
    const situationship = answerAll((i) => {
      if (i.dimension === "relational-certainty") return extremeFor(i, false);
      if (i.dimension === "commitment") return extremeFor(i, true);
      if (i.dimension === "autonomy-fear") return extremeFor(i, false);
      return i.scale[Math.floor(i.scale.length / 2)].value;
    });
    const surveilled = answerAll((i) => {
      if (i.dimension === "digital-strain") return extremeFor(i, false);
      if (i.dimension === "trust-security") return extremeFor(i, true);
      return i.scale[Math.floor(i.scale.length / 2)].value;
    });

    const a = findContradictions(scoreDimensions(ITEMS, situationship), ITEMS, situationship);
    const b = findContradictions(scoreDimensions(ITEMS, surveilled), ITEMS, surveilled);
    const kindsA = new Set(a.map((c) => c.kind));
    const kindsB = new Set(b.map((c) => c.kind));
    expect(kindsA.has("certainty-gap") || kindsA.has("staying-from-fear")).toBe(true);
    expect(kindsB.has("trust-vs-surveillance")).toBe(true);
    expect([...kindsA].join()).not.toBe([...kindsB].join());
  });

  it("every contradiction carries evidence a report can point at", () => {
    const responses = answerAll((i) =>
      i.dimension === "satisfaction" ? extremeFor(i, false) : extremeFor(i, true),
    );
    const found = findContradictions(scoreDimensions(ITEMS, responses), ITEMS, responses);
    expect(found.length).toBeGreaterThan(0);
    for (const c of found) {
      expect(c.aSide.itemIds.length + c.bSide.itemIds.length, c.id).toBeGreaterThan(0);
      expect(c.citation in SOURCES, c.id).toBe(true);
      expect(findVoiceViolations(c.headline), c.headline).toHaveLength(0);
      expect(findVoiceViolations(c.significance), c.id).toHaveLength(0);
    }
  });
});

describe("assess() end to end", () => {
  it("returns a complete assessment with strengths, pressures and quality", () => {
    const responses = answerAll((i) => i.scale[Math.floor(i.scale.length / 2)].value);
    const a = assess(ITEMS, responses, true);
    expect(a.scores).toHaveLength(DIMENSIONS.length);
    expect(a.strengths).toHaveLength(3);
    expect(a.pressures).toHaveLength(3);
    expect(a.overall).toBeGreaterThan(0);
    expect(a.quality.answered).toBeGreaterThanOrEqual(100);
  });
});
