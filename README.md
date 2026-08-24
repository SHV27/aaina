# Aaina · आईना

**An honest reading of your relationship — and what to actually do about it.**

Free. No account. Made in India, for anyone deciding what to do next.

**Live:** https://aaina-two.vercel.app

---

## What it is

Most relationship advice is written for nobody in particular. Aaina asks 122 questions drawn
from published psychological research, scores **14 dimensions**, finds the specific tensions
between your own answers, and writes a report that could not have been written for anyone
else. Then it does the half most tools skip: a plan of real, published exercises, chosen for
your results, in the order the evidence says to do them.

### The reading
Fourteen dimensions across three groups:

- **Core** — everyday satisfaction (CSI), commitment (Investment Model Scale), attachment
  anxiety and avoidance (ECR-S), conflict pattern (CPQ), feeling understood (PPRS), physical
  intimacy (GMSEX), trust (Rempel), life direction.
- **Modern** — phones and jealousy (Partner Phubbing Scale, social-media jealousy, electronic
  surveillance), knowing where you stand (relational uncertainty + GHOST), choosing rather than
  clinging (Fear of Being Single Scale).
- **Context** — family acceptance and network support, because Indian youth research shows
  roughly 6% of young people fully chose their own spouse while about 74% believe they should
  be able to. Family is a stakeholder here, not a footnote.

### The contradiction engine
The report is not written from scores. It is written from **tensions between your own answers** —
high commitment beside low satisfaction, stated trust beside constant checking, a future planned
with someone who wants a different one. Those tensions exist only in your data, which is what
makes the writing about them impossible to generalise.

### The work
Every prescribed activity is a published intervention with its mechanism, its evidence grade,
and — the part that matters most — its contraindications: OurRelationship's DEEP formulation,
speaker–listener from the ePREP trials, Finkel's seven-minute reappraisal writing, Aron's
novel-activity work and the thirty-six questions, active-constructive responding, IBCT's unified
detachment, EFT's core conversation, discernment counselling's three roads, self-compassion and
narrative writing after a breakup, and safety planning. Goodwill work is sequenced before
conflict work, because distressed couples cannot problem-solve first.

## How it refuses to be generic

Anti-generic is enforced in code, not requested in a prompt:

1. The model receives an **evidence bundle only** — your scores, your tensions, your own answers
   quoted verbatim — and is told it has no other information.
2. It must return every paragraph with the **evidence ids** it rests on, under a strict JSON
   schema. Any paragraph whose evidence does not resolve is **discarded before rendering**.
3. Paragraphs that would fit a stranger, or that break the voice rules, are discarded too.

Measured, not asserted: **[PROOF-ANTI-GENERIC.md](PROOF-ANTI-GENERIC.md)** runs five genuinely
different people through the live model, including two whose overall scores differ by 3.6 points,
and reports **zero identical sentences across all ten pairs**. Re-run it any time with
`npx vite-node scripts/anti-generic-proof.ts`.

## What it refuses to claim

- No compatibility percentage as a verdict. The composite exists, but always with every
  component and weight visible.
- No prediction. Claims that an assessment forecasts whether a relationship survives collapsed
  under cross-validation (Heyman & Slep, 2001).
- No lie-proofness. Careless answering is detectable and is reported to you; deliberate
  misreporting is not, in this or any self-report instrument.
- No personality types, no love languages, no astrology, no diagnosis, no character labels.

**[SCIENCE-v2.md](SCIENCE-v2.md)** lists every construct, threshold, source and licence position,
plus an honest section on the edges — which two dimensions are bespoke, which scales are used in
part and why, and where response formats were narrowed. It is written to be handed to a
professional.

## Safety

The last section screens for harm (WAST, gender-neutral). It sits behind a privacy check, carries
a quick-exit button, and **its answers are never stored, never transmitted, and never printed** —
memory only, by construction rather than by policy. When it fires, the reading is still delivered
in full, but the plan drops every conjoint exercise, because joint work is contraindicated where
there is coercive control. Verified Indian helplines are shown first.

## Privacy, stated plainly

Answers are saved in your own browser. To write the report, your scores, tensions and a few
quoted answers are sent to Groq's language model — with no name, email or identifier, because
Aaina never collects any. Groq's published policy is that API data is not used for training and
is not retained by default; that was the deciding factor over free alternatives whose terms allow
training on user input. The safety section is excluded from this by construction. See `/privacy`.

## Stack

Vite 7 · React 19 · TypeScript strict · Zustand 5 · Tailwind v4 · Vitest + Playwright ·
Vercel (static SPA + one serverless function) · Groq `openai/gpt-oss-120b` with strict structured
outputs.

```bash
npm install
npm run dev                                   # develop
npm test                                      # unit + invariant suite
npx playwright test                           # journeys, desktop + mobile
npx vite-node scripts/dev-server.ts           # serve the build WITH the real API handler
npx vite-node scripts/anti-generic-proof.ts   # regenerate the anti-generic proof
node scripts/deploy.mjs                       # deploy and verify what is actually served
```

Scaling note: inference is a single seam with a provider list in config, so moving from the free
tier to a paid one is a configuration change rather than a rewrite. The measured limits and
costed options are in [ESCALATION-1.md](ESCALATION-1.md).

---

Built as a free public good, against the pseudoscience economy.
