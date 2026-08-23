import { describe, expect, it } from "vitest";
import { chapterInsight } from "./insights";
import {
  ALL_ASSESSMENT_ITEMS,
  CHAPTERS,
} from "./items";
import type { Answer } from "./types";

const mid = (): Answer[] =>
  ALL_ASSESSMENT_ITEMS.map((i) => {
    const values = i.scale.map((s) => s.value);
    const v = values[Math.floor(values.length / 2)];
    return { itemId: i.id, value: v, tMs: 2500 };
  });

const extreme = (high: boolean): Answer[] =>
  ALL_ASSESSMENT_ITEMS.map((i) => {
    const values = i.scale.map((s) => s.value);
    const v = high ? Math.max(...values) : Math.min(...values);
    return { itemId: i.id, value: v, tMs: 2500 };
  });

describe("chapter insights (Referee: evidence-bound, counsellor-safe)", () => {
  it("every chapter yields an insight on complete data, with evidence, at all bands", () => {
    for (const answers of [mid(), extreme(true), extreme(false)]) {
      for (const ch of CHAPTERS) {
        const ins = chapterInsight(ch.id, answers);
        expect(ins, ch.id).not.toBeNull();
        expect(ins!.evidence.answerIds.length, ch.id).toBeGreaterThan(0);
        expect(ins!.text.length, ch.id).toBeGreaterThan(40);
        // assertCounsellorSafe runs inside chapterInsight — reaching here means it passed.
      }
    }
  });

  it("returns null on insufficient data — honesty over decoration (two-sided)", () => {
    expect(chapterInsight("dil", [])).toBeNull();
    expect(chapterInsight("dono-taraf", [{ itemId: "joel-s1", value: 5, tMs: 2000 }])).toBeNull();
  });
});
