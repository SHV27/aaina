#!/usr/bin/env node
/** Live probe of the Groq free tier's real ceilings for our workload.
 *  Measures: big-prompt acceptance, structured-output support, latency,
 *  and the rate-limit headers that decide the escalation memo. */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const KEY = env.GROQ_API_KEY;
const URL = "https://api.groq.com/openai/v1/chat/completions";

async function call(body, label) {
  const t0 = Date.now();
  const r = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - t0;
  const hdr = (k) => r.headers.get(k);
  const text = await r.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 300) }; }
  console.log(`\n=== ${label} ===`);
  console.log(`status=${r.status} latency=${ms}ms`);
  console.log(
    `limits: req=${hdr("x-ratelimit-limit-requests")} rem=${hdr("x-ratelimit-remaining-requests")} | tok=${hdr("x-ratelimit-limit-tokens")} rem=${hdr("x-ratelimit-remaining-tokens")} resetTok=${hdr("x-ratelimit-reset-tokens")}`,
  );
  if (parsed.error) console.log("error:", JSON.stringify(parsed.error).slice(0, 400));
  if (parsed.usage) console.log("usage:", JSON.stringify(parsed.usage));
  if (parsed.choices?.[0]?.message?.content) {
    console.log("content:", parsed.choices[0].message.content.slice(0, 300));
  }
  return { status: r.status, parsed, ms };
}

// 1) Large-prompt test: ~12K tokens of filler evidence to see if free tier accepts it.
const filler = Array.from({ length: 900 }, (_, i) =>
  `Item ${i}: dimension score ${i % 7}, respondent endorsed option ${i % 5} after ${1200 + i}ms.`,
).join("\n");
await call(
  {
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: "You summarize structured assessment evidence in one sentence." },
      { role: "user", content: `EVIDENCE:\n${filler}\n\nSummarize in one sentence.` },
    ],
    max_tokens: 100,
    reasoning_effort: "low",
  },
  "A) LARGE PROMPT (~12-14K tokens in)",
);

// 2) Structured outputs with strict schema.
await call(
  {
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: "Emit claims with evidence ids." },
      { role: "user", content: "Evidence: e1=satisfaction low, e2=commitment high. Write 2 claims." },
    ],
    max_tokens: 300,
    reasoning_effort: "low",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "claims",
        strict: true,
        schema: {
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
        },
      },
    },
  },
  "B) STRUCTURED OUTPUT strict:true",
);

// 3) Medium prompt (~4K tokens) — the token-frugal chunk size we may need.
const medium = filler.split("\n").slice(0, 260).join("\n");
await call(
  {
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: "You are a psychologist writing one paragraph." },
      { role: "user", content: `EVIDENCE:\n${medium}\n\nWrite one short paragraph.` },
    ],
    max_tokens: 400,
    reasoning_effort: "low",
  },
  "C) MEDIUM PROMPT (~4K tokens in)",
);
