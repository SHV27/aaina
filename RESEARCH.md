# RESEARCH — Aaina — 2026-08-24

Full lane reports live in `research/lane*.md`. Later stages read the verdicts below; open a lane file only when depth is needed.

## Verdicts (findings that change our decisions)

1. **The open lane is the solo "should I stay / go / say yes to this rishta?" question.** Every Western couples app assumes two cooperative partners in maintenance mode; every Indian option is either astrology, paid therapy, or thin SEO quizzes. No direct competitor exists. (Lane 3)
2. **Solo mode is scientifically defensible:** Joel et al. 2020 (PNAS, 43 dyadic datasets) — own perceptions carry nearly all predictive signal; partner reports add little. This is our citable answer to "solo can't work." (Lane 1)
3. **A free-legal instrument battery exists:** CSI-16 (free w/ citation) + ECR-S/ECR-RS (public domain) + IMS (freely distributed) + Joel 2018 stay/leave reasons pool (published) + WAST (free w/ citation) + Meade & Craig carelessness checks + MC Form C. AVOID: HITS (fee), DAS (licensed), MBTI-typing, Love Languages, Gottman items (proprietary). (Lane 1)
4. **Never claim prediction accuracy.** Gottman's 90% is postdiction (Heyman & Slep 2001: ~29% PPV on holdout); Joel 2020: change over time largely unpredictable. Verdict = current-pattern read with honest confidence, not a divorce probability. (Lane 1)
5. **Faking: detection of carelessness is solid; detection of deliberate lying is weak.** Design honesty in (privacy, no-right-answers framing, consistency/speed/straight-line flags, MC-C softening) and state limits in-product. This satisfies brief §6 as far as science allows. (Lane 1)
6. **The report's delivery craft is specifiable as 20 named rules (R1–R20)** from MI, SPIKES, Finn's Therapeutic Assessment, self-affirmation research, EFT/Gottman pattern-framing, and Doherty's discernment counselling (three paths, time-boxed test, own-contribution mirror). The report generator implements these mechanically. (Lane 2)
7. **Assessment structure that completes:** 5–6 named chapters × 8–12 min, one question per screen, tap-to-advance, per-chapter progress (never a slow global bar), autosave+resume, teaser micro-insight at each chapter boundary, mirror reveal only at 100%. 3 attention checks max. Hinglish encouragement, English questions. (Lane 4)
8. **Stack locked by live verification:** Vite 7 + React 19 + TS SPA, Zustand 5 + persist, Tailwind v4 (@theme tokens), Recharts ≥3.9. LLM narrator via one Vercel serverless fn proxying Groq `openai/gpt-oss-120b` (**llama-3.3-70b RETIRED 2026-08-16**) + template fallback (app fully works keyless). Couple mode with **zero backend**: lz-string state in URL hash fragment. PDF via print CSS (canvas tools break on Tailwind oklch). (Lane 5)
9. **Danger branch is a launch requirement:** NFHS-5 ~30% spousal-violence prevalence means disclosures WILL happen. Verified helpline list (181, 112, Tele-MANAS 14416, iCall, Vandrevala, AASRA, Shakti Shalini, NCW, SIF-One for men; KIRAN is DEAD — do not list). Quick-exit, privacy interstitial, never store danger disclosures, WHO LIVES microcopy. (Lane 6)
10. **Trust mechanics from AstroTalk, ethically inverted:** anonymity as product (no signup, data stays in browser), earned specificity (quote user's answers back), citations as authority symbols, verdict lands as a ceremony, "it sees me" jolt inside 60 seconds. (Lane 3)
11. **Vercel Hobby fits:** 100GB/mo, 1M fn invocations, commercial use banned (we're free — fine), repo must be under personal account (SHV27). Deploy: `vercel deploy --prod --token=$VERCEL_TOKEN --yes`. (Lane 5)
12. **Anti-Barnum is enforceable:** every report sentence must tie to a specific answer the user gave and be false for some users — the renderer can refuse uncited prose (analogous to SUTRADHAR's orphan-claims invariant). (Lanes 2+3)

## Lane index
- Lane 1 instruments & science → research/lane1-instruments.md
- Lane 2 counsellor craft R1–R20 → research/lane2-counsellor-craft.md
- Lane 3 market/audience/trust → research/lane3-market-audience.md
- Lane 4 completion UX → research/lane4-completion-ux.md
- Lane 5+7 stack & volatile facts → research/lane5-stack.md
- Lane 6 safety routing → research/lane6-safety.md

## Volatile facts
All dated 2026-08-24 inside lane files; re-verify Groq model list and Vercel limits at each arc start (lane 5 rule).
