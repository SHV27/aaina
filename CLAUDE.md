# Aaina (आईना)

NOTE: This file is the ONLY constitution for this repo. The SUTRADHAR CLAUDE.md in the parent
Downloads folder is a DIFFERENT project — ignore it entirely here.

## Commands
- `npm run dev` — Vite dev server
- `npm test` — Vitest (includes Referee invariant suite)
- `npm run build && npm run preview` — production build + local serve
- `npx playwright test` — journeys + screenshots (desktop 1280w + mobile 390w)
- Deploy: `vercel deploy --prod --token=$VERCEL_TOKEN --yes` (token from .env; never print it)

## What this is
A free, evidence-based relationship-clarity mirror for India: 2-min Jhalak → ~50-min 5-chapter
assessment (validated instruments) → counsellor-grade visual verdict report with three paths.
**Design law: a sentence without bound evidence (user's own answers + named published source)
cannot render.** Taste bar: "a senior studio + a real counsellor shipped this."
Non-negotiables: (1) no compatibility %, no divorce probability, no lie-proof claims;
(2) safety data is radioactive — memory only, never persisted/exchanged/sent/printed;
(3) app is fully complete with zero API keys (template narrator is the reference rendering).

## Architecture
State authority: `answersStore` (zustand+persist); ALL derivation through `src/engine/score.ts`
and `src/engine/report.ts` (pure, deterministic). `safetyStore` = memory only, no persist/codec
wiring by construction. Couple mode: lz-string sealed payload in URL hash, checksum-guarded.
Choke points: `api/narrate.ts` (holds GROQ_API_KEY, typed allowlist payload, per-IP throttle);
`<Claim>` renderer (non-optional evidence props); WAST danger gate inside `generateReport`.
Full detail: ARCHITECTURE.md. Science base + citations: SCIENCE.md (every construct sourced).

## The Verifier (definition of done for any change)
1. `npm test` green (Referee suite: receipts invariant, danger-gate, banned-strings, codec roundtrip).
2. Playwright journeys pass: Jhalak→wow, full solo flow, couple exchange, danger branch, keyless mode.
3. Headless screenshots at 1280w + 390w reviewed after any UI change — compiling proves nothing.
4. Zero console errors/warnings. 5. PROGRESS.md updated + checkpoint commit.

## Iron rules
- The wire is the deliverable: not reachable from `/` = not built.
- Fallbacks declare their mode visibly; silent degradation is banned.
- Every psychological claim traces to SCIENCE.md; unsourced = does not ship.
- Verdict language: never imperatives about the reader's decision (banned-strings test).
- One acceptance item at a time; update PROGRESS.md each; 2 failed attempts → restart sharper.
- Verify volatile facts live (Groq model list, Vercel limits) at each arc start.
- Hinglish for warmth/microcopy; English for questions; grade-8 reading ceiling on report prose.

## Stack (verified 2026-08-24 — research/lane5-stack.md)
Vite 7.3 + React 19.2 + TS strict SPA · Zustand 5 · Tailwind v4 @theme tokens (single token
source) · Recharts ≥3.9 · lz-string · print-CSS PDF · Vitest 4 + Playwright 1.57 · Vercel Hobby
· Groq `openai/gpt-oss-120b` via api/narrate.ts (llama-3.3-70b is RETIRED; model list is config).

If a rule in this file keeps being violated, the file is too long — flag it for pruning.
