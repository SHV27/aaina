# ARC PLAN — Aaina v2 (honest count: 5 arcs)

## Arc V1 — Foundations: dimensions, items, scoring, contradictions
- [ ] SCIENCE-v2.md: 14 dimensions, every instrument + threshold + license status cited
- [ ] Item bank ~100 items across 14 dimensions (core + Gen Z + India family layer), per-item citation
- [ ] engine/score: dimension raw → normalized 0–100 + bands + overall composite (formula stated)
- [ ] engine/contradictions: tension detection (≥10 named contradiction types) with magnitudes
- [ ] Tests: published-scoring fixtures, contradiction detection two-sided, no-duplicate-ids, risk items unpersistable
- [ ] English-only lint on all product strings (Hinglish allowed only in a marked headline registry)

## Arc V2 — The composer: chunked AI generation with evidence binding
- [ ] api/compose.ts: provider-agnostic seam, model list config, strict JSON schema, per-IP + global token budget, honest 429 queue
- [ ] Evidence bundle builder (compact, pseudonymized, spotlight-delimited free text)
- [ ] Barnum critique pass + verifyClaims (drop unbound claims)
- [ ] Banned-phrase lint (AI tells) + counsellorGuard carried forward
- [ ] Swap test in CI: regenerate fixtures with different user data; fail on surviving sentences
- [ ] LIVE run against real Groq key proving: chunked report completes under 8K TPM, claims all bound

## Arc V3 — The assessment experience (English, calm, fast)
- [ ] Landing + 14-dimension assessment flow, one question per screen, autosave/resume
- [ ] Privacy disclosure page: exactly what is sent, to whom, Groq's no-train/no-retain policy
- [ ] Risk section: interstitial, memory-only, quick exit
- [ ] Playwright: full run desktop+mobile, resume, risk branch

## Arc V4 — The Dossier + The Work
- [ ] Report: verdict card → overall composite with components → 14 dimension chapters (score → what it means for you → what to do)
- [ ] The Work: branching plan by road (repair/decide/leave/safety), BCT-sequenced, contraindications enforced, each activity with mechanism + citation + duration
- [ ] Receipts on every claim; sources page
- [ ] Print/PDF; plan ticks persisted
- [ ] Live end-to-end run with real generation, screenshotted

## Arc V5 — Return, proof, ship
- [ ] Delta retake (snapshot + diff view)
- [ ] ANTI-GENERIC PROOF: run as ≥4 distinct personas incl. two with near-identical overall scores; publish side-by-side + similarity metrics (brief §8 requirement)
- [ ] Full verify, security audit, Lighthouse, deploy, GitHub push, founder handoff
