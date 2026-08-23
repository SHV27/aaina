# ARC PLAN — Aaina (honest count: 5 arcs, continuous autonomous run)

Note: the founder is intentionally away (Autonomy Charter). Arc boundaries are verification
boundaries, not owner-feedback boundaries; studio-verify closes each arc before the next opens.

## Arc 1 — Walking Skeleton
Thinnest end-to-end: land on `/` → answer 3 real CSI-16 items → see a scored micro-output
rendered through the Receipts pipeline → deployed to Vercel.
Acceptance (frozen):
- [ ] Vite 7 + React 19 + TS strict scaffold; Tailwind v4 @theme token file (art direction seeded)
- [ ] answersStore (zustand+persist) + engine/score.ts skeleton + `<Claim>` with required evidence props
- [ ] Template-mode badge pattern (observable degradation) present
- [ ] Vitest running incl. first Referee test (Claim refuses evidence-less render)
- [ ] Playwright journey: home → 3 answers → micro-read visible; screenshots 1280w + 390w
- [ ] `vercel.json` SPA rewrite; deployed preview via $VERCEL_TOKEN; live URL fetched & verified (build marker)
- [ ] GitHub repo created under SHV27, pushed
- [ ] Zero console errors; PROGRESS.md checkpoint

## Arc 2 — The Science Core
Acceptance (frozen):
- [ ] SCIENCE.md: every construct/instrument/threshold with full citations (from lane 1) — the hand-to-a-professional document
- [ ] Item bank: CSI-16, ECR-S(12), CPQ-SF (Crenshaw scoring), IMS-short, Joel stay/leave pool, WAST(8), MC-C(13), 3 IRIs — typed `Item[]` with per-item citation + chapter mapping (~110–130 items + Jhalak-8)
- [ ] engine/score.ts complete: all subscales, reverse-coding, published cutoffs, quality flags (speed, straight-line, IRI fails, MC-C), confidence model
- [ ] engine unit tests: known-answer fixtures reproduce published scoring; two-sided guard tests
- [ ] Referee: banned-strings suite (imperatives about the decision, "compatibility %", lie-proof claims)
- [ ] Danger gate: WAST branch logic in engine with tests (positive → safety-first mode; never mutual-cycle framing)

## Arc 3 — The Mirror (assessment UX) + Jhalak
Acceptance (frozen):
- [ ] Jhalak: 8 items → honest micro-read with receipts, <2 min, funnels to full Mirror
- [ ] 5 named chapters, one-question-per-screen, tap-to-advance chips (thumb zone), per-chapter progress + chapter dots
- [ ] Autosave/resume (deep-link to exact item); localStorage-blocked banner fallback
- [ ] Chapter-boundary micro-insight + designed break screen (Hinglish microcopy)
- [ ] Safety chapter: privacy interstitial, every item skippable, quick-exit button (ESC + click, honest limitation note), answers in memory-only safetyStore (test: never in localStorage/exchange payload)
- [ ] Screen-0 expectation setting ("5 chapters · ~10 min each · auto-saved · private") + demo question
- [ ] Playwright: full solo journey incl. resume-after-reload and danger-branch entry; screenshots both widths

## Arc 4 — The Verdict Report
Acceptance (frozen):
- [ ] engine/report.ts: deterministic generator implementing R1–R20 master sequence; Finn ladder ordering; three paths each with costs; time-boxed Path-3 experiment when repair plausible; own-contribution mirror; autonomy clause
- [ ] Receipts Renderer: every sentence a `<Claim>` with answerIds + citation; "Yeh kaise pata?" expander; Referee test walks EVERY sentence of generated reports for bound evidence
- [ ] Honest-confidence meter (input quality: solo/couple, flags, skips) in counsellor register
- [ ] Visuals: Recharts scale profiles + stay/leave ambivalence map; report reveal ceremony (reduced-motion respected)
- [ ] Danger-variant report: safety-first layout, verified helplines, PWDVA paragraph, no stored/shared disclosures, report still delivered (founder decision 7)
- [ ] Print CSS export verified by Playwright PDF snapshot
- [ ] Readability check: report prose Flesch-Kincaid ≤ grade 8 (scripted check)

## Arc 5 — Couple Mode, Narrator, Ship
Acceptance (frozen):
- [ ] Sealed exchange: pack/unpack codec (small-int pack → lz-string → hash fragment, checksum); commit-before-see flow; joiner experience; merged gap report (perception gaps as first-class findings); safety data excluded by construction (test)
- [ ] api/narrate.ts: Groq openai/gpt-oss-120b via typed allowlist payload (scale bands only), per-IP throttle, opt-in toggle, visible template/AI mode badge; app identical in value keyless
- [ ] Polish pass with studio-taste + Chrome DevTools MCP: zero console errors, Lighthouse perf+a11y ≥90, LCP <2.5s, keyboard nav, WCAG AA, prefers-reduced-motion
- [ ] Full studio-verify: all journeys, fresh-eyes walkthrough, pre-ship security audit (incl. no secrets in repo history)
- [ ] README (steals named, science summary, honest limits); SCIENCE.md final
- [ ] GitHub push final; `vercel deploy --prod` → live URL verified serving the real build (marker check); founder handoff note

Parked (NOTES.md): shareable result card, Hindi full translation, retake comparison, domain purchase, PWA.
