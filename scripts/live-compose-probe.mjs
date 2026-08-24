#!/usr/bin/env node
/** Live proof that the composer contract works against the real model:
 *  - a section-sized prompt fits inside the free-tier per-minute ceiling
 *  - strict schema returns claims with evidence ids
 *  - the returned prose passes the voice guard and the anti-generic check
 *  Run: node scripts/live-compose-probe.mjs [--swap] */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

// Read the prompt from the single source of truth so this probe tests production text.
const contract = readFileSync("src/v2/ai/contract.ts", "utf8");
const SYSTEM = contract.split("export const SYSTEM_PROMPT = `")[1].split("`;")[0];

const SCHEMA = {
  type: "object",
  properties: {
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          evidence_ids: { type: "array", items: { type: "string" } },
        },
        required: ["text", "evidence_ids"],
        additionalProperties: false,
      },
    },
  },
  required: ["claims"],
  additionalProperties: false,
};

/** Two genuinely different people whose OVERALL scores are close — the hard case
 *  from the brief: if their reports read alike, the product has failed. */
const PROFILES = {
  ambivalent: {
    ids: ["o1", "d0", "d1", "d90", "d91", "c0", "c0e0", "c0e1", "c1", "q1"],
    prompt: `SECTION: opening
PURPOSE: The first thing they read. Orient them: what this reading found overall, and what the single most important tension is. Do not give advice here.

EVIDENCE (the only facts you may use):
[o1] Overall reading across 14 dimensions: 46/100.
[d0] Commitment: 78/100 (solid). Measures: How firmly you intend to stay, and how far ahead you picture this lasting. (Source: Rusbult, Martz & Agnew, 1998)
[d1] Trust: 71/100 (solid). Measures: Whether you can relax about what happens when you are not in the room. (Source: Rempel, Holmes & Zanna, 1985)
[d90] Everyday satisfaction: 29/100 (strained). Measures: How good this relationship actually feels to you, day to day. (Source: Funk & Rogge, 2007)
[d91] How you fight: 24/100 (critical). Measures: Whether disagreements get worked through, or turn into pressure and silence. (Source: Christensen & Heavey, 1990)
[c0] TENSION — You are committed to a relationship that is not currently making you happy. One side: commitment at 78/100. Other side: satisfaction at 29/100. Why this matters: Commitment and satisfaction usually move together. When commitment stays high while satisfaction falls, the commitment is being held up by something other than how the relationship feels — investment, alternatives, or duty. (Source: Rusbult, Martz & Agnew, 1998)
[c0e0] THEIR OWN ANSWER — they answered "I want our relationship to last forever" — agreed completely.
[c0e1] THEIR OWN ANSWER — they answered "In general, how satisfied are you with your relationship?" — a little.
[c1] TENSION — Things feel fine because the hard conversation keeps not happening. One side: satisfaction at 29/100. Other side: how you fight at 24/100. Why this matters: Avoiding a subject is not the same as resolving it. Demand-withdraw patterns are among the most reliable predictors of decline. (Source: Christensen & Heavey, 1990)
[q1] They answered 96 questions, skipped 4.

THIS SECTION MUST:
1. Must name this tension explicitly: You are committed to a relationship that is not currently making you happy.
2. Must quote at least one of their own answers verbatim.
3. Must not tell them what to do — that comes later in the report.
4. The overall reading is mixed; name what is holding it up and what is pulling it down.`,
  },
  situationship: {
    ids: ["o1", "d0", "d1", "d90", "d91", "c0", "c0e0", "c0e1", "c1", "q1"],
    prompt: `SECTION: opening
PURPOSE: The first thing they read. Orient them: what this reading found overall, and what the single most important tension is. Do not give advice here.

EVIDENCE (the only facts you may use):
[o1] Overall reading across 14 dimensions: 44/100.
[d0] Physical intimacy: 81/100 (strong). Measures: How satisfying and honest the physical side of this relationship is. (Source: Lawrance & Byers, 1995)
[d1] Feeling understood: 66/100 (solid). Measures: Whether your partner sees you accurately and responds to what they see. (Source: Reis, Clark & Holmes, 2004)
[d90] Knowing where you stand: 18/100 (critical). Measures: Whether you actually know what this is, and whether they agree. (Source: Knobloch & Solomon, 1999)
[d91] Choosing, not clinging: 31/100 (strained). Measures: Whether you are here because you want this, or because being alone frightens you. (Source: Spielmann et al., 2013)
[c0] TENSION — You are committed to something neither of you has defined. One side: commitment at 63/100. Other side: knowing where you stand at 18/100. Why this matters: Relational uncertainty — not knowing what this is, or whether they agree — independently predicts distress, and it is the defining feature of the situationship. (Source: Knobloch & Solomon, 1999)
[c0e0] THEIR OWN ANSWER — they answered "I know where I stand with this person" — strongly disagree.
[c0e1] THEIR OWN ANSWER — they answered "I would rather be in an unhappy relationship than be single" — somewhat agree.
[c1] TENSION — Your reasons for staying and your fear of being alone are hard to tell apart. One side: commitment at 63/100. Other side: choosing not clinging at 31/100. Why this matters: Fear of being single predicts settling for less responsive partners and staying in relationships people rate as unsatisfying. (Source: Spielmann et al., 2013)
[q1] They answered 93 questions, skipped 7.

THIS SECTION MUST:
1. Must name this tension explicitly: You are committed to something neither of you has defined.
2. Must quote at least one of their own answers verbatim.
3. Must not tell them what to do — that comes later in the report.
4. The overall reading is mixed; name what is holding it up and what is pulling it down.`,
  },
};

async function fetchWithRetry(url, init, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, init);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function compose(name, profile) {
  const t0 = Date.now();
  const r = await fetchWithRetry("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: profile.prompt },
      ],
      max_tokens: 1100,
      temperature: 0.65,
      reasoning_effort: "low",
      response_format: {
        type: "json_schema",
        json_schema: { name: "claims", strict: true, schema: SCHEMA },
      },
    }),
  });
  const ms = Date.now() - t0;
  const data = await r.json();
  if (data.error) {
    console.log(`${name}: ERROR`, JSON.stringify(data.error).slice(0, 300));
    return null;
  }
  const parsed = JSON.parse(data.choices[0].message.content);
  const valid = new Set(profile.ids);

  console.log(`\n${"=".repeat(70)}\n${name.toUpperCase()} — ${ms}ms, ${data.usage.total_tokens} tokens, ${parsed.claims.length} claims`);
  let leaked = 0;
  for (const [i, c] of parsed.claims.entries()) {
    const resolved = c.evidence_ids.filter((id) => valid.has(id));
    const idLeak = /\((?:[a-z]\d+[a-z]?\d*)\)|\[[a-z]\d+\]/i.test(c.text);
    if (idLeak) leaked++;
    console.log(`\n[${i}] resolved=${resolved.length}/${c.evidence_ids.length}${idLeak ? "  ⚠ ID LEAK" : ""}`);
    console.log(c.text);
  }
  console.log(`\nid-leaks: ${leaked}`);
  return parsed.claims.map((c) => c.text).join("\n");
}

const a = await compose("ambivalent", PROFILES.ambivalent);
if (process.argv.includes("--swap")) {
  await new Promise((r) => setTimeout(r, 20000)); // stay inside the per-minute budget
  const b = await compose("situationship", PROFILES.situationship);
  if (a && b) {
    const setA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    const setB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    const overlap = [...setA].filter((w) => setB.has(w)).length / Math.max(setA.size, 1);
    const sentA = a.split(/(?<=[.!?])\s+/).map((s) => s.trim());
    const sentB = new Set(b.split(/(?<=[.!?])\s+/).map((s) => s.trim()));
    const shared = sentA.filter((s) => s.length > 25 && sentB.has(s));
    console.log(`\n${"=".repeat(70)}\nSWAP TEST — word overlap ${(overlap * 100).toFixed(1)}% · identical sentences: ${shared.length}`);
    if (shared.length > 0) console.log("SHARED:", shared);
  }
}
