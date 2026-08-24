# v2 Lane 3 — LLM Architecture + INR Costs (verified 2026-08-24)

## Architecture patterns (pipeline order)
1. **Evidence-bundle injection** — all deterministic computation OUTSIDE the LLM (scores, deltas, contradiction pairs from user's own answers) → structured JSON bundle. LLM narrates, never analyzes. Plus explicit **"no new facts"** constraint. Barnum statements are exactly the sentences with no evidence anchor.
2. **Citation-anchored generation + refusing renderer** — model emits `{claim, evidence_ids[]}`; renderer refuses empty evidence_ids. Generic becomes structurally impossible (invariant, not prompt-hope). ← v1's Claim law, upgraded to LLM output.
3. **Rubric-guided generation** — instance-specific rubric from THIS user's data ("must address the avoidance–jealousy contradiction in Q7 vs Q12"). Query-specific rubrics beat generic (arXiv 2602.03619); PARL (2605.31545): generic judges fail personalized eval.
4. **Self-critique / critique-refine pass** — cheap second call scoring draft vs rubric + Barnum checklist ("would this be true of most people? delete"). PerFine arXiv 2510.24469. Doubles request count — matters for rate math.
5. **Swap test (anti-Barnum acid test)** — regenerate with a DIFFERENT user's data; if >X% sentences survive unchanged, it's horoscope.

## Groq capability facts [VOLATILE 2026-08-24]
- gpt-oss-120b: 131,072 ctx, 65,536 max output. **Structured Outputs `strict:true` (constrained decoding, 100% schema adherence) — GPT-OSS models only.** No streaming/tool-use with structured outputs; all properties must be `required`, `additionalProperties:false`.
- `reasoning_effort`: low/medium/high on gpt-oss (use low for prose pass).
- **Prompt caching exists**: automatic, GPT-OSS only, min prefix 128–1024 tokens, 50% input discount, 2-hr TTL, **cached tokens don't count against rate limits** → long shared system prompt + rubric library nearly free.
- **Data policy: Groq does NOT train on API data, no retention by default** (abuse logs ≤30 days), self-serve Zero Data Retention toggle. Materially better than Gemini free tier (which allows training on inputs) for relationship data.

## Safety
- Prompt injection: no complete defense. Layer (1) spotlighting/randomized delimiters around user text as opaque data, (2) instruction hierarchy, (3) **blast-radius limiting** — generator has no tools, output is schema-constrained JSON → worst case corrupts only that user's own report. Strict mode is itself a strong mitigation.
- PII minimization: pseudonymize before the call (names → USER/PARTNER roles), strip contact/location, re-substitute client-side. Send derived features, not raw transcripts.

## Anti-generic testing
Pairwise cosine of sentence embeddings ACROSS different users' reports (group-level) + n-gram overlap (distinct-3/self-BLEU). No universal threshold → **relative gating**: cross-user mean cosine materially below same-user regeneration similarity (e.g., ≤0.75 vs ~0.9), zero verbatim 8-gram overlap between different users' reports, plus swap test. Calibrate once, freeze as CI gates.

## Costs (₹90/USD; report ≈ 15K in + 6K out)
| Provider | ₹/report |
|---|---|
| Groq gpt-oss-120b paid | **₹0.53** (₹0.46 w/ cache; ₹0.26 batch) |
| Gemini 2.5 Flash-Lite paid | ₹0.35 |
| Gemini 2.5 Flash paid | ₹1.76 |
| DeepSeek V4-Flash | ₹0.65 off-peak / ₹1.31 peak |

| Scale/day | Groq paid | Flash-Lite | 2.5 Flash | DeepSeek |
|---|---|---|---|---|
| 100 | ₹1,580 | ₹1,050 | ₹5,270 | ₹1,960 |
| 1,000 | ₹15,800 | ₹10,500 | ₹52,700 | ₹19,600 |
| 10,000 | ₹1.58L | ₹1.05L | ₹5.27L | ₹1.96L |

## CRITICAL (escalation item 1)
**Groq free tier cannot run a 15K-token report workload.** Headline 1,000 req/day is a mirage; binding limits are **8,000 TPM and 200K TPD** → a single 15K-input request exceeds the per-minute budget; 200K TPD ≈ 9 full reports/day. Free-tier alternatives: Cerebras free caps context at 8,192 (can't fit prompt); SambaNova 20 RPD; OpenRouter 50 RPD ($0) / 1,000 (after $10). Gemini free ~250 RPD BUT free-tier terms allow training on inputs — unacceptable for relationship data.
→ Architecture must be **token-frugal + chunked + provider-agnostic**, and the memo must give the founder INR options.
