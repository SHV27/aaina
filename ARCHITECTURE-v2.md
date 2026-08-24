# ARCHITECTURE — Aaina v2 (locked 2026-08-24)

Supersedes ARCHITECTURE.md. Reuse decisions are made per-module below and were verified by
reading and re-testing the module, not inherited.

## System sketch
```
[items/ 14 dimensions, ~100 cited items] → [Assessment UI] → [responseStore (persist)]
                                                          ↘ [riskStore (memory only)]
[engine/score] → dimension scores + percentile bands
[engine/contradictions] → tension pairs from THIS user's own answers   ← the anti-generic core
[engine/plan] → activity prescription (indications ∩ contraindications, BCT-sequenced)
        ↓ evidence bundle (compact, pseudonymized, ~1.2K tokens/section)
[api/compose] → chunked calls → Groq strict JSON {text, evidence_ids[]} → Barnum critique pass
        ↓ verified claims
[report renderer] refuses any claim whose evidence_ids don't resolve → Dossier + The Work
[localStorage] report snapshot + plan ticks + retake date → [delta view on retake]
```

## The state authority
`responseStore` (zustand+persist) is the only source of answers. All derivation flows through
pure modules in this order, each with one exported entry point:
`scoreAll(responses)` → `findContradictions(scores, responses)` → `buildPlan(scores, contradictions,
risk)` → `buildEvidenceBundle(...)`. Nothing else computes a score, a band, or a prescription.
`riskStore` is memory-only by construction (no persist middleware, no codec path, no bundle field).
Generated prose is cached in `reportStore` keyed by a hash of the evidence bundle — regeneration is
idempotent and free.

## Choke points & enforcers
1. **GROQ_API_KEY** — only inside `api/compose.ts` (Vercel fn env). Never in the bundle, never client-side.
2. **Evidence binding** — the LLM's JSON schema makes `evidence_ids` a required non-empty array;
   `verifyClaims()` drops any claim whose ids don't resolve against the bundle; the renderer takes
   only verified claims. Three independent layers, so a schema slip cannot reach the page.
3. **Anti-generic** — Barnum critique pass + CI swap test + banned-phrase lint. All three run on
   fixtures in `npm test`; the build fails on a surviving cross-user sentence.
4. **Contraindications** — enforced inside `buildPlan`, not in the UI. A plan for a risk-positive
   profile cannot contain conjoint activities: the filter runs before selection, and a test asserts
   the entire conjoint library is absent from that output.
5. **Rate/queue** — `api/compose` holds a per-IP bucket and a global token-budget meter; when the
   free tier is saturated it returns 429 with a real retry-after that the UI shows as a queue.
6. **PII minimization** — the bundle carries scores, ids, and short answer echoes only; free-text is
   spotlight-delimited and never used as an instruction. Names are never sent.

## Data model (≤10 lines)
- `Item {id, dimension, instrument, text, scale[], reverse?, citation, genZ?, indiaSpecific?}`
- `Response {itemId, value, tMs}` — responseStore, persisted.
- `RiskResponse {itemId, value}` — riskStore, memory only, never serialized.
- `DimensionScore {dimension, raw, normalized 0-100, band, itemIds[], citation}`
- `Contradiction {id, kind, aSide{label,itemIds,value}, bSide{...}, magnitude, citation}`
- `Activity {id, title, mechanism, citation, evidence: A|B|C, indications[], contraindications[], soloOk, minutes}`
- `PlanStep {activity, why (bound to contradiction/dimension), order, road}`
- `Claim {text, evidenceIds[], section}` — the only prose that may render.
- `ReportSnapshot {takenAt, scores, contradictionIds, planIds, overall}` — for the delta view.
- `Road = "repair" | "decide" | "leave" | "safety"` — the branch the reader picks.

## Failure modes & visible notices
- Free tier saturated → 429 → UI queue screen with live position/retry, never a lesser report.
- Model returns unparseable/unbound claims → those claims are dropped; if a section ends up empty,
  the section renders its deterministic evidence (scores, echoes, sources) with a visible note that
  the written commentary for it could not be produced — the numbers are never lost.
- Model list rot (llama-3.3 precedent) → provider/model list is config; on total failure the compose
  fn returns 503 and the UI says so plainly with a retry.
- localStorage blocked → in-memory + banner; retake/delta unavailable, stated.
- Risk-positive profile → safety report variant; conjoint library suppressed; disclosures never stored.

## Design laws (v2)
1. **Nothing renders without resolvable evidence** — deterministic or AI prose alike.
2. **The engine finds; the model phrases.** No number, threshold, or clinical judgment originates in
   the model.
3. **Specificity is derived, not written** — every AI sentence traces to a contradiction, a score, or
   an answer echo unique to this person.
4. **English body, Hinglish only as a headline moment** — enforced by lint on report strings.
5. **Radioactive risk data** — memory only, never persisted/sent/printed/shared.
6. **Confident about the pattern, silent about the command** — no imperative about the reader's
   decision (banned-strings guard, carried from v1 and re-verified).
7. **Honest capacity** — a queue is shown, never a quietly degraded report.
8. **The wire is the deliverable** — assessment → dossier → plan → retake reachable from `/`.

## STACK LOCK (live-verified 2026-08-24)
Vite 7.3 + React 19.2 + TS strict SPA · Zustand 5 + persist · Tailwind v4 `@theme` · Vitest 4 +
Playwright 1.57 · Vercel Hobby + one Node serverless fn · **Groq `openai/gpt-oss-120b`** (131K ctx,
strict structured outputs verified working today, prompt caching automatic, `reasoning_effort: low`
for prose passes; measured hard ceiling 8,000 TPM → chunked generation is mandatory, not optional).
Provider/model list in config for the ESCALATION-1 switch.

## Reuse vs rebuild (salvage clause §6 — decided by re-verification, not inheritance)
**REUSE (verified by re-reading + re-running their tests):** the Claim/receipts pattern (upgraded to
govern AI output), `counsellorGuard` banned-strings, the WAST risk gate and memory-only risk store,
the verified helpline list, the print-CSS approach, the token/paper art direction (calm temperature
was explicitly right per brief §4f), the secret-scan hook and test harness.
**REBUILD:** the entire item bank (14 dimensions vs 5 chapters), the scoring engine (dimension
normalization + percentile bands), all report generation (contradiction-driven + LLM), every screen
and all copy (English voice), the plan/activity system (did not exist), the store shape.
**DELETE:** Hinglish body copy, "template mode" concept, the device-only privacy claim, v1 chapter
structure, `insights.ts`, the v1 `report.ts` archetype generator, the v1 couple-mode UI copy.

## Contradictions found & resolutions
1. *"AI is required" vs "the app must never show a broken page"* → the app is never AI-less, but it
   is honestly capacity-limited: a queue, not a fallback. Numbers/plan are deterministic and always
   present; the *prose* is what waits.
2. *"No generic output" vs "generation must be token-frugal"* → per-section calls carry only that
   section's contradictions and echoes (~1.2K tokens), which is simultaneously cheaper and more
   specific. Frugality serves specificity here rather than fighting it.
3. *"Deep report" vs "8K TPM"* → chunked, paced, cached (Groq caches the shared system prefix at a
   50% discount and exempts it from rate limits); the UI streams sections in as they land.
4. *"Compatibility %" vs "no pseudoscience scores"* → the aggregate ships only as a composite with
   its component dimensions visible and its formula stated; never a standalone verdict number.
5. *"Support system" vs "no accounts/notifications"* → local plan ticks + a dated retake + delta.
6. *"Danger case gets the analysis" vs "conjoint work is contraindicated"* → the analysis is
   delivered in full; the *plan* switches to the safety library only. Both halves of decision 7 hold.
