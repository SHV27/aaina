import { describe, expect, it, vi } from "vitest";
import { composeSection } from "./client";
import type { SectionBundle } from "./bundle";

const bundle: SectionBundle = {
  section: "opening",
  brief: "test",
  evidence: [
    { id: "e1", fact: "Commitment: 78/100." },
    { id: "e2", fact: "Everyday satisfaction: 29/100." },
  ],
  rubric: ["Must name the tension."],
};

const jsonResponse = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const noSleep = async () => {};

describe("composeSection", () => {
  it("keeps claims that are bound to real evidence", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        result: {
          claims: [
            {
              text: "You scored 78 out of 100 on commitment and 29 on satisfaction. Those two rarely sit together.",
              evidence_ids: ["e1", "e2"],
            },
          ],
        },
      }),
    ) as unknown as typeof fetch;

    const out = await composeSection(bundle, { fetchImpl, sleep: noSleep });
    expect(out.state).toBe("done");
    if (out.state === "done") {
      expect(out.claims).toHaveLength(1);
      expect(out.claims[0].evidenceIds).toEqual(["e1", "e2"]);
    }
  });

  it("drops claims with unresolvable evidence, however good they sound", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        result: {
          claims: [
            { text: "Your childhood explains all of this.", evidence_ids: ["made-up"] },
            { text: "You scored 29 out of 100 on satisfaction.", evidence_ids: ["e2"] },
          ],
        },
      }),
    ) as unknown as typeof fetch;

    const out = await composeSection(bundle, { fetchImpl, sleep: noSleep });
    expect(out.state).toBe("done");
    if (out.state === "done") {
      expect(out.claims).toHaveLength(1);
      expect(out.dropped).toBe(1);
      expect(out.claims[0].text).toMatch(/29 out of 100/);
    }
  });

  it("drops generic prose even when the evidence resolves", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        result: {
          claims: [
            { text: "Every relationship is unique and takes work.", evidence_ids: ["e1"] },
            { text: "You value honesty in a relationship.", evidence_ids: ["e1"] },
          ],
        },
      }),
    ) as unknown as typeof fetch;

    const out = await composeSection(bundle, { fetchImpl, sleep: noSleep, maxAttempts: 1 });
    if (out.state === "done") expect(out.claims).toHaveLength(0);
    else expect(out.state).toBe("failed");
  });

  it("drops prose that breaks the voice law (Hinglish body, commands)", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        result: {
          claims: [
            { text: "Aapke jawaabon mein strain dikhta hai clearly.", evidence_ids: ["e1"] },
            { text: "Given this, you should leave him.", evidence_ids: ["e2"] },
            { text: "You scored 78 out of 100 on commitment.", evidence_ids: ["e1"] },
          ],
        },
      }),
    ) as unknown as typeof fetch;

    const out = await composeSection(bundle, { fetchImpl, sleep: noSleep });
    expect(out.state).toBe("done");
    if (out.state === "done") {
      expect(out.claims).toHaveLength(1);
      expect(out.dropped).toBe(2);
    }
  });

  it("waits and retries on capacity limits instead of degrading", async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls++;
      if (calls === 1) {
        return jsonResponse(
          { error: "capacity", retryAfterSec: 12, message: "Aaina is at capacity." },
          429,
        );
      }
      return jsonResponse({
        result: {
          claims: [{ text: "You scored 78 out of 100 on commitment.", evidence_ids: ["e1"] }],
        },
      });
    }) as unknown as typeof fetch;

    const statuses: string[] = [];
    const out = await composeSection(bundle, {
      fetchImpl,
      sleep: noSleep,
      onStatus: (s) => statuses.push(s.state),
    });
    expect(statuses).toContain("waiting");
    expect(out.state).toBe("done");
    expect(calls).toBe(2);
  });

  it("reports a real failure rather than inventing content", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;

    const out = await composeSection(bundle, { fetchImpl, sleep: noSleep, maxAttempts: 2 });
    expect(out.state).toBe("failed");
    if (out.state === "failed") expect(out.message).toMatch(/could not reach/i);
  });
});
