import { describe, expect, it } from "vitest";
import { scoreMicroRead } from "./score";
import { SKELETON_ITEMS } from "./items";
import type { Answer } from "./types";

const a = (itemId: string, value: number): Answer => ({ itemId, value, tMs: 2000 });

describe("scoreMicroRead", () => {
  it("returns null until all items answered", () => {
    expect(scoreMicroRead([a("csi-1", 3)], SKELETON_ITEMS)).toBeNull();
  });

  it("scores a fully warm response into the warm band", () => {
    const read = scoreMicroRead(
      [a("csi-1", 6), a("csi-9", 5), a("csi-4", 5)],
      SKELETON_ITEMS,
    );
    expect(read).not.toBeNull();
    expect(read!.raw).toBe(16);
    expect(read!.max).toBe(16);
    expect(read!.band).toBe("warm");
  });

  it("scores a fully strained response into the strained band", () => {
    const read = scoreMicroRead(
      [a("csi-1", 0), a("csi-9", 0), a("csi-4", 0)],
      SKELETON_ITEMS,
    );
    expect(read!.band).toBe("strained");
  });

  it("mid answers land in mixed — never a fake certainty band", () => {
    const read = scoreMicroRead(
      [a("csi-1", 3), a("csi-9", 2), a("csi-4", 3)],
      SKELETON_ITEMS,
    );
    expect(read!.band).toBe("mixed");
  });
});
