import { describe, expect, it } from "vitest";
import { decodeExchange, encodeExchange } from "./codec";
import { ALL_ASSESSMENT_ITEMS, WAST_ITEMS } from "./items";
import { analyzeCouple } from "./couple";
import { findBannedLanguage } from "./counsellorGuard";
import type { Answer } from "./types";

const a = (itemId: string, value: number): Answer => ({ itemId, value, tMs: 2500 });

function answersRecord(valueFor: (i: number) => number): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  ALL_ASSESSMENT_ITEMS.forEach((item, i) => {
    const values = item.scale.map((s) => s.value);
    const v = values[Math.min(values.length - 1, Math.max(0, valueFor(i) % values.length))];
    out[item.id] = a(item.id, v);
  });
  return out;
}

describe("sealed-exchange codec (Referee)", () => {
  it("roundtrips a full answer set losslessly, under 2K chars", () => {
    const answers = answersRecord((i) => i);
    const encoded = encodeExchange(answers, "Priya");
    expect(encoded.length).toBeLessThan(2000);
    const decoded = decodeExchange(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.from).toBe("Priya");
      expect(decoded.answeredCount).toBe(Object.keys(answers).length);
      for (const [id, ans] of Object.entries(answers)) {
        expect(decoded.answers[id]?.value, id).toBe(ans.value);
      }
    }
  });

  it("WAST/safety answers are UNENCODABLE by construction (radioactive rule)", () => {
    const withSafety: Record<string, Answer> = {
      ...answersRecord(() => 2),
      ...Object.fromEntries(WAST_ITEMS.map((i) => [i.id, a(i.id, 3)])),
    };
    const decoded = decodeExchange(encodeExchange(withSafety));
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      for (const w of WAST_ITEMS) expect(decoded.answers[w.id], w.id).toBeUndefined();
    }
  });

  it("corrupted/truncated links fail loudly, never half-merge (two-sided)", () => {
    const encoded = encodeExchange(answersRecord(() => 2));
    expect(decodeExchange(encoded.slice(0, encoded.length - 10)).ok).toBe(false);
    expect(decodeExchange("garbage").ok).toBe(false);
    expect(decodeExchange("").ok).toBe(false);
  });
});

describe("couple gap analysis", () => {
  it("finds perception gaps where partners answered the same item far apart", () => {
    const mine = answersRecord(() => 0); // low end
    const theirs = answersRecord((i) => i + 100); // varied/high
    const view = analyzeCouple(mine, theirs);
    expect(view.topGaps.length).toBeGreaterThan(0);
    for (const g of view.topGaps) {
      expect(g.distance).toBeGreaterThanOrEqual(0.5);
      expect(g.evidence.answerIds).toContain(g.itemId);
    }
    expect(findBannedLanguage(view.framing.text)).toHaveLength(0);
  });

  it("identical answers → no item gaps, agreement framing (two-sided)", () => {
    const same = answersRecord(() => 2);
    const view = analyzeCouple(same, { ...same });
    expect(view.topGaps).toHaveLength(0);
    expect(view.framing.text).toMatch(/ek jaisa/);
  });
});
