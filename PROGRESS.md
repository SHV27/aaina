# PROGRESS — Aaina

Resume line: **read PROGRESS.md and continue.**

## STATUS: v2 LIVE ✦ 2026-08-24

**Live:** https://aaina-two.vercel.app · **Source:** https://github.com/SHV27/aaina
v2 fully replaces v1 at the same URL. Real AI generation verified in production.

## What v2 is
122 questions → 14 scored dimensions → contradiction engine → AI-written dossier bound to
evidence → branching plan of published interventions → safety branch. English voice, Hinglish
only in the headline. Full detail in README.md, SCIENCE-v2.md, PROOF-ANTI-GENERIC.md.

## Pipeline artifacts (v2)
INTENT-v2 · RESEARCH-v2 (+research/v2-lane1..5) · BOARDROOM-v2 · ARCHITECTURE-v2 · ARC_PLAN-v2 ·
SCIENCE-v2 · PROOF-ANTI-GENERIC · ESCALATION-1.

## Gate status
- Unit + invariant suite: 44/44 green (item bank integrity, scoring at both extremes,
  direction-from-meaning test, contradiction engine two-sided, plan contraindications,
  voice guard, composer client).
- e2e: 12/12 green desktop + mobile (English-body check, context gating, resume-after-reload,
  dossier+plan render, safety branch never-stored + solo-only plan, science/privacy pages).
- Anti-generic proof (live model, 5 people): **0 identical sentences across 10 pairs**;
  worst word overlap 31.6%; A vs B differ by 3.6 overall points and share nothing.
- Live production: all routes 200, `/api/compose` 200 with real generation, report verified
  end to end in a browser quoting the user's own answers.

## Bugs found by running it (not by tests)
1. **Direction double-flip** — score direction was encoded on BOTH the item (`reverse`) and the
   dimension (`invert`); they cancelled, so a badly-answered conflict profile scored 82/100.
   Fixed by making the item the only source of direction, plus a test asserting direction from
   the actual MEANING of 20 named items (self-consistent tests could not catch this).
2. **`api/*.ts` cross-directory import** — Vercel transpiles api files in place without bundling
   imports from `src/`, so the deployed function 500'd with MODULE_NOT_FOUND. Fixed by moving
   the contract to `api/_contract.ts` (re-exported from src, still one copy) and adding
   tsconfig.api.json so `tsc -b` typechecks the api directory.

## ESCALATION-1 (awaiting founder, nothing blocked)
Free Groq tier measured at **8,000 tokens/minute** (an 18K request returns HTTP 413) — roughly
10–15 full reports/day. Founder's stated scale (LinkedIn, ~1.5K impressions) fits. Option B
(Groq Developer tier) is ~₹1,580/month at 100 reports/day and is a **config change only**.
No money spent.

## ONE next action
Optional polish only: run a Lighthouse pass on the live site and tune anything below 90.
Everything on ARC_PLAN-v2 is otherwise complete.

## Keys
.env (gitignored): VERCEL_TOKEN (auto-revokes ~2026-08-31), GROQ_API_KEY (also set as a Vercel
production env var). Deploy with `node scripts/deploy.mjs` — it sets the key, ships, and verifies
the served artifact.
