# ARCHITECTURE — Aaina (locked 2026-08-24)

## System sketch
```
[Questions data (TS modules, cited)] → [Assessment UI] → [answersStore (zustand+persist)]
                                                    └→ [safetyStore (MEMORY ONLY, never persisted)]
[scoring engine (pure fns)] ← answersStore          [exchange codec (lz-string, hash fragment)]
[report generator (deterministic)] → [Receipts Renderer] → [Report UI / print CSS]
[optional narrator: browser → /api/narrate (Vercel fn, GROQ_API_KEY) → warm rephrasing of fixed slots]
```

## The state authority
`answersStore` (zustand + persist to localStorage) is the ONLY source of responses.
All derived values flow through exactly one pure module: `src/engine/score.ts →
scoreAssessment(answers): ScaleScores` and `src/engine/report.ts →
generateReport(scores, answers, mode): Report`. No component computes a score locally.
Safety-chapter answers live in `safetyStore` — a separate in-memory store with NO persist
middleware and NO codec wiring: structural impossibility, not policy.

## Choke points & enforcers
1. **GROQ_API_KEY** — exists only in the Vercel function env. Enforcer: `api/narrate.ts` (per-IP
   token-bucket throttle; rejects payloads containing raw answer text or safety fields by schema).
2. **Privacy** — raw answers never leave the browser. The narrator receives ONLY an anonymized
   scale-band summary (typed allowlist payload), and ONLY after an explicit per-session opt-in
   toggle; default is template narrator. Enforcer: the payload builder type + a test asserting no
   answer/safety field is serializable into it.
3. **Receipts** — `<Claim>` component requires `evidence: {answerIds: [...], source: CitationId}`
   as non-optional props; renderer throws in dev / refuses render in prod without them. Enforcer:
   TypeScript types + Referee test walking every generated report sentence.
4. **Danger gate** — WAST screen runs BEFORE verdict generation; a positive gate switches the
   report pipeline to the safety-first variant (abuse never framed as mutual cycle). Enforcer:
   `generateReport` branches on the gate internally — callers cannot skip it.

## Data model (≤10 lines)
- `Answer { itemId, value: int, tMs }` — keyed by itemId in answersStore.
- `Item { id, chapter, instrument, text, scale, reverse?, citation }` — static TS data, hand-authored from licensed instruments.
- `ScaleScores { csi16, ecrAnxiety, ecrAvoidance, cpqDemandWithdraw, cpqConstructive, imsCommitment, stayReasons[], leaveReasons[], quality: {speedFlags, straightline, irisFailed, mcC} }`.
- `SafetyAnswers { wast: int[], flags }` — memory only, never serialized.
- `ExchangePayload { v, mode, packedAnswers (no safety), checksum }` — lz-string in `#` fragment.
- `Report { sections: Section[], confidence: ConfidenceMeter, path3?: Experiment }`; every `Sentence { text, evidence }`.
- Modes: `solo | couple-initiator | couple-joiner | couple-merged`.

## Failure modes & visible notices
- LLM absent/down/rate-limited → template narrator, persistent badge "Template mode — पूरा report bina AI ke bhi complete hai". Never silent.
- localStorage blocked (private mode) → in-memory fallback + banner "Progress won't survive closing this tab".
- Exchange link corrupted/truncated → checksum fails → clear error + "ask your partner to re-share", never a half-merged report.
- Groq model retired again → fn tries configured model list in order; on total failure returns 503 → client shows template mode. Model list is config, not code.
- Quality flags (speeding/straight-lining/failed IRIs) → lower the confidence meter VISIBLY with counsellor-register explanation; never invalidate silently.

## Design laws for this project
1. **Receipts or silence** — a sentence without bound evidence (user answers + named citation) cannot render.
2. **The mirror never lies about itself** — confidence meter always states input quality and what self-report cannot see.
3. **Safety data is radioactive** — memory only; excluded from persistence, exchange, narrator, print, and share surfaces by type-level absence.
4. **Always a next step** — every report section and empty state ends with a legal action (R8/SPIKES-S).
5. **Degrade loudly, write conservatively** — every fallback declares its mode on screen.
6. **Verdict on evidence, never on the person's choice** (R14) — imperatives about the decision are banned strings in the generator.
7. **The wire is the deliverable** — Jhalak → Mirror → Report reachable from `/` with zero keys, zero accounts.

## STACK LOCK (live-verified 2026-08-24 — research/lane5-stack.md)
- Vite 7.3.x + React 19.2.x + TypeScript strict; SPA + `vercel.json` rewrite. WHY: client-only app, no SSR need, Vercel-native.
- Zustand 5.0.x (+persist); Tailwind v4.2 (@theme tokens as the single design-token source); Recharts 3.9+ (React-19 fix).
- lz-string (hash-fragment exchange); print CSS for PDF (Tailwind oklch breaks canvas exporters).
- `api/narrate.ts` Vercel Node fn → Groq `openai/gpt-oss-120b` (llama-3.3-70b RETIRED 2026-08-16), Gemini Flash fallback slot, template fallback mandatory.
- Vitest 4.x + Playwright 1.57 (headless screenshots, desktop+mobile). Deploy: Vercel Hobby via `$VERCEL_TOKEN`; repo under github.com/SHV27 (Hobby can't link org repos).

## Contradictions found & resolutions
1. *Autosave-everything vs never-store-danger-disclosures* → safety chapter exempt from autosave; on resume it re-asks (it is short). Logged in UI ("ye section save nahi hota — aapki safety ke liye").
2. *Warmth vs citations* → receipts behind a "Yeh kaise pata?" expander; warmth on surface, science one tap deep.
3. *Confident solo verdict vs honesty about solo limits* → verdict states the pattern confidently; the confidence meter carries the input-quality caveat as its own visible instrument — neither dilutes the other.
4. *LLM narrator vs anti-Barnum* → LLM may only rephrase fixed warm-slot text (intro, transitions); ALL claims come from the deterministic generator; narrator payload cannot carry answers (typed allowlist). Template mode is the default and reference rendering.
5. *Sealed exchange vs URL limits* → answers pack to small ints before lz-string (~200 items ≪ 2K chars); checksum guards truncation.
