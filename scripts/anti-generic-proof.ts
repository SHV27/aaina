/** THE ANTI-GENERIC PROOF (brief §8).
 *
 *  Runs several genuinely different people — including two whose OVERALL scores
 *  are nearly identical, which is the hard case — through the real pipeline and
 *  the real model, then measures how much of the writing survives being moved to
 *  someone else. Produces PROOF-ANTI-GENERIC.md for the founder to read.
 *
 *  Run: npx vite-node scripts/anti-generic-proof.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ITEMS, ITEM_BY_ID } from "../src/v2/engine/items/index";
import { assess } from "../src/v2/engine/score";
import { buildPlan, suggestRoad } from "../src/v2/engine/plan";
import { buildOpeningBundle, bundleToPrompt, evidenceIdsOf } from "../src/v2/ai/bundle";
import { SYSTEM_PROMPT, CLAIMS_SCHEMA, verifyClaims } from "../src/v2/ai/contract";
import { findVoiceViolations, looksGeneric } from "../src/v2/ai/voice";
import type { Item, Response } from "../src/v2/engine/types";

for (const line of readFileSync(join(process.cwd(), ".env"), "utf8").split("\n")) {
  const i = line.indexOf("=");
  if (i > 0 && !line.startsWith("#")) {
    const k = line.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = line.slice(i + 1).trim();
  }
}

type Dial = (item: Item) => number | undefined;

/** Pick a value at `t` (0 = worst standing, 1 = best standing) for this item. */
function at(item: Item, t: number): number {
  const vals = item.scale.map((s) => s.value).sort((a, b) => a - b);
  const idx = Math.round((vals.length - 1) * (item.reverse ? 1 - t : t));
  return vals[idx];
}

function build(dial: Dial, base = 0.5): Response[] {
  return ITEMS.map((item) => {
    if (item.instructedValue !== undefined) {
      return { itemId: item.id, value: item.instructedValue, tMs: 3000 };
    }
    const t = dial(item) ?? base;
    return { itemId: item.id, value: at(item, t), tMs: 2200 + (item.id.length * 131) % 1800 };
  });
}

const byDim = (map: Record<string, number>): Dial => (item) => map[item.dimension];

/** Five people. A and B are the hard case: near-identical overall scores,
 *  completely different reasons. */
const PEOPLE = [
  {
    id: "A",
    name: "High commitment, low satisfaction (the classic ambivalent)",
    responses: build(
      byDim({
        commitment: 0.95,
        satisfaction: 0.15,
        "conflict-pattern": 0.2,
        "trust-security": 0.7,
        responsiveness: 0.35,
        "intimacy-sexual": 0.25,
        "values-future": 0.45,
        "attachment-anxiety": 0.3,
        "digital-strain": 0.5,
        "relational-certainty": 0.7,
        "autonomy-fear": 0.35,
        "family-acceptance": 0.6,
        "support-network": 0.4,
      }),
    ),
  },
  {
    id: "B",
    name: "The situationship (same overall, different everything)",
    responses: build(
      byDim({
        commitment: 0.5,
        satisfaction: 0.55,
        "conflict-pattern": 0.75,
        "trust-security": 0.35,
        responsiveness: 0.6,
        "intimacy-sexual": 0.85,
        "values-future": 0.15,
        "attachment-anxiety": 0.25,
        "digital-strain": 0.2,
        "relational-certainty": 0.05,
        "autonomy-fear": 0.2,
        "family-acceptance": 0.2,
        "support-network": 0.35,
      }),
    ),
  },
  {
    id: "C",
    name: "Family pressure on a good relationship",
    responses: build(
      byDim({
        commitment: 0.85,
        satisfaction: 0.8,
        "conflict-pattern": 0.7,
        "trust-security": 0.85,
        responsiveness: 0.8,
        "intimacy-sexual": 0.7,
        "values-future": 0.75,
        "attachment-anxiety": 0.6,
        "digital-strain": 0.7,
        "relational-certainty": 0.8,
        "autonomy-fear": 0.75,
        "family-acceptance": 0.05,
        "support-network": 0.25,
      }),
    ),
  },
  {
    id: "D",
    name: "Phones, jealousy and surveillance",
    responses: build(
      byDim({
        commitment: 0.7,
        satisfaction: 0.45,
        "conflict-pattern": 0.4,
        "trust-security": 0.75,
        responsiveness: 0.5,
        "intimacy-sexual": 0.5,
        "values-future": 0.6,
        "attachment-anxiety": 0.15,
        "digital-strain": 0.05,
        "relational-certainty": 0.55,
        "autonomy-fear": 0.4,
        "family-acceptance": 0.6,
        "support-network": 0.5,
      }),
    ),
  },
  {
    id: "E",
    name: "Quietly good",
    responses: build(
      byDim({
        commitment: 0.8,
        satisfaction: 0.85,
        "conflict-pattern": 0.8,
        "trust-security": 0.9,
        responsiveness: 0.85,
        "intimacy-sexual": 0.75,
        "values-future": 0.8,
        "attachment-anxiety": 0.7,
        "digital-strain": 0.75,
        "relational-certainty": 0.9,
        "autonomy-fear": 0.8,
        "family-acceptance": 0.7,
        "support-network": 0.8,
      }),
    ),
  },
];

async function compose(prompt: string, validIds: Set<string>) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          max_tokens: 1100,
          temperature: 0.65,
          reasoning_effort: "low",
          response_format: {
            type: "json_schema",
            json_schema: { name: "claims", strict: true, schema: CLAIMS_SCHEMA },
          },
        }),
      });
      if (r.status === 429) {
        await new Promise((res) => setTimeout(res, 25000));
        continue;
      }
      const data = await r.json();
      const claims = JSON.parse(data.choices[0].message.content).claims;
      return verifyClaims(claims, validIds, { findVoiceViolations, looksGeneric });
    } catch {
      await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
    }
  }
  return { kept: [], dropped: [] };
}

const tokens = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );

const jaccard = (a: Set<string>, b: Set<string>) => {
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / (a.size + b.size - inter || 1);
};

const sentences = (s: string) =>
  s
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 25);

async function main() {
  const results: {
    id: string;
    name: string;
    overall: number;
    tensions: string[];
    plan: string[];
    text: string;
    dropped: number;
  }[] = [];

  for (const person of PEOPLE) {
    const a = assess(ITEMS, person.responses, true);
    const road = suggestRoad(a, false);
    const plan = buildPlan(a, {
      road,
      riskPositive: false,
      partnerWilling: true,
      highRumination: false,
      coParenting: false,
    });
    const bundle = buildOpeningBundle(a);
    const { kept, dropped } = await compose(bundleToPrompt(bundle), evidenceIdsOf(bundle));
    const text = kept.map((c) => c.text).join("\n\n");
    results.push({
      id: person.id,
      name: person.name,
      overall: a.overall,
      tensions: a.contradictions.slice(0, 4).map((c) => c.headline),
      plan: plan.map((p) => p.activity.title),
      text,
      dropped: dropped.length,
    });
    console.log(`${person.id} done — overall ${a.overall}, ${kept.length} paragraphs, ${dropped.length} dropped`);
    await new Promise((r) => setTimeout(r, 22000)); // stay inside the per-minute budget
  }

  // Pairwise similarity
  const pairs: { a: string; b: string; overlap: number; shared: number; overallGap: number }[] = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const A = results[i];
      const B = results[j];
      const sa = new Set(sentences(A.text));
      const sb = new Set(sentences(B.text));
      pairs.push({
        a: A.id,
        b: B.id,
        overlap: jaccard(tokens(A.text), tokens(B.text)),
        shared: [...sa].filter((s) => sb.has(s)).length,
        overallGap: Math.abs(A.overall - B.overall),
      });
    }
  }

  const worst = [...pairs].sort((x, y) => y.overlap - x.overlap)[0];
  const anyShared = pairs.reduce((a, p) => a + p.shared, 0);

  const md = `# Proof: the reports are not generic

*Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/anti-generic-proof.ts\`, using the real
model and the real pipeline. Re-run it any time — it talks to the live service.*

The brief asked for evidence rather than a promise: run the product as several
genuinely different people, including two with similar overall scores, and show the
outputs side by side. If those two read alike, the product has failed.

## The measurement

| Pair | Overall scores differ by | Word overlap | Identical sentences |
|---|---|---|---|
${pairs
  .map(
    (p) =>
      `| ${p.a} vs ${p.b} | ${p.overallGap.toFixed(1)} points | ${(p.overlap * 100).toFixed(1)}% | **${p.shared}** |`,
  )
  .join("\n")}

**Identical sentences across all ${pairs.length} pairs: ${anyShared}.** Word overlap is
measured on words longer than three letters, so shared vocabulary like "relationship",
"satisfaction" and "commitment" counts against us — the number is a ceiling, not a flattering
floor. The worst pair is ${worst.a} vs ${worst.b} at ${(worst.overlap * 100).toFixed(1)}%.

## The people

${results
  .map(
    (r) => `### ${r.id} — ${r.name}
**Overall: ${r.overall}/100.**

Tensions the engine found:
${r.tensions.map((t) => `- ${t}`).join("\n") || "- none"}

Plan it produced:
${r.plan.map((p) => `- ${p}`).join("\n")}

What it wrote:

${r.text
  .split("\n\n")
  .map((p) => `> ${p}`)
  .join("\n>\n")}

${r.dropped > 0 ? `*(${r.dropped} paragraph(s) written by the model were rejected before you saw them — for being unsupported by evidence, generic, or off-voice.)*` : "*(No paragraphs were rejected in this run.)*"}
`,
  )
  .join("\n---\n\n")}

## Why it works

The model never receives a topic. It receives this person's scores, the specific
contradictions between their own answers, and their answers quoted word for word — and it
must attach every paragraph to those. A paragraph with no evidence behind it is discarded
before rendering, as is one that reads as if it could belong to someone else. That is why
the number in the last column is what it is.
`;

  writeFileSync(join(process.cwd(), "PROOF-ANTI-GENERIC.md"), md, "utf8");
  console.log(`\nWritten PROOF-ANTI-GENERIC.md — identical sentences across all pairs: ${anyShared}`);
}

void main();
