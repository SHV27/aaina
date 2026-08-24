# BOARDROOM — Aaina v2 — 2026-08-24

Seats: Product Visionary · Principal Engineer · Clinical Psychologist (domain) · Market Analyst ·
UX Director · Resource Officer (token economy) · The Skeptic · The Target User (22, Patiala,
three months of "should I end this").

## Round 1 — What is the product, from first principles?

**First principles restatement:** a person has information about their relationship trapped inside
their own head in a form they cannot reason about. Everything else — questions, scores, report,
plan — is machinery for getting it out, organizing it against what is actually known about
relationships, and handing it back in a form they can act on.

**Visionary:** the report is the product; make it enormous and beautiful.
**Skeptic (hit #1):** "Enormous" is how v1 died in his hands. He didn't say *short*, he said
*generic*. A 12,000-word generic report is worse than a 3,000-word specific one — it's the same
failure with more reading. Length is not the fix; **derived specificity** is.
**Clinical seat:** and the founder named the real gap — after the assessment, a counsellor does the
second half: the *work*. Assessment→report is half a product (his words: "report dena hi councellor
ka kaam nhi").
**Target User:** "I don't want to be told what my score is. I want to know what to DO on Tuesday."
VERDICT: the product is **assessment → understanding → a plan you can execute**, and the plan half
gets equal engineering weight to the report half. The report earns the plan's right to exist.

## Round 2 — How do we make "no generic at all" structurally true?

**Engineer:** three candidate architectures. (1) Pure LLM: prompt it with answers, ask for a report.
(2) Pure deterministic: template selection with slot-filling. (3) Split: deterministic engine finds
the findings, LLM writes the prose over an evidence bundle.
**Skeptic (hit #2):** (1) hallucinates psychology and can't be sourced — it becomes AstroTalk with a
transformer. (2) is what v1 was, and it's the founder's exact complaint: selection is generic
underneath however well written (his brief even says so, §7d).
**Resource Officer:** and (1) is dead on cost anyway — 8,000 TPM measured. Whole-report-in-one-call
returns 413. We are *forced* into chunks, which happens to suit (3) perfectly.
**Clinical seat:** (3) also protects the science: the engine owns every number, threshold and
citation; the model may only phrase what the engine already established.
**Skeptic:** then the model can still write Barnum prose *about* real findings. "You value honesty
in a relationship" is technically about their data and still horoscope.
**Resolution (the invention, not a compromise):** the model does not receive a topic; it receives
**contradiction pairs and specific answer echoes**, and it must emit `{text, evidence_ids[]}` under
strict JSON schema — verified working live today. A **critique pass** then scores each sentence:
*could this sentence appear unchanged in a different user's report?* If yes it is deleted, not
softened. And CI runs the **swap test** — regenerate the report with a different person's data; any
sentence that survives verbatim is a bug with a failing test attached.
VERDICT: split architecture + evidence-bound claims + Barnum critique pass + swap test in CI.

## Round 3 — Depth vs completion, and what "support system" means

**UX Director:** the founder wants A-to-Z depth; the completion research says every added minute
costs finishers. But note *who* he is designing for: someone three months into agony. That person
will spend 40 minutes. The v1 failure was never length.
**Market Analyst:** and depth per dimension is what reads as rigor (16personalities' premium
differentiator is 30 facets, not 5).
**Resource Officer:** each dimension costs tokens at report time. 14 dimensions × ~1,800 tokens is
~25K — over a minute's budget, so generation is chunked and paced regardless. Depth is affordable
*because* we already had to chunk.
**Skeptic (hit #3):** "support system" is where products bolt on notification spam and accounts —
both banned, and both dead weight for someone who visits once in crisis.
**Clinical seat:** the evidence gives us the honest version: repeated structured self-reflection is
*itself* the intervention (Larson & Sbarra 2015), and Gottman's Checkup treats the **retake delta**
as the product. So support = a dated retake + a diff of who you were then vs now, plus a plan you
tick off locally. No account, no push, no spam.
VERDICT: ~14 scored dimensions across ~100 items, chaptered; support = plan tracking + dated retake
+ delta report.

## PILLARS (5)

1. **The Reading** — ~100 items across 14 dimensions: the validated core (satisfaction, commitment,
   attachment, conflict, responsiveness, sexual satisfaction, values) *plus* the modern layer
   (phubbing, digital jealousy, surveillance, relational uncertainty/situationship, fear of being
   single, ghosting/breadcrumbing history) *plus* the India layer (family acceptance, log-kya-kahenge
   pressure) that every Western instrument misses. Beat "shorter is safer": his user is in pain and
   will finish; per-dimension granularity is what reads as rigor.
2. **The Dossier** — an overall compatibility read plus a per-dimension percentile-style score, each
   dimension a chapter: where you stand → what it means *given your specific answers* → what to do
   about this one. Hogan's bright/dark/inside frame; summary-then-descent; ranked landscape with the
   extremes spotlighted. Survives the Skeptic because every chapter is generated from that user's
   own contradiction pairs, not from a band label.
3. **The Work** — the second half the founder said was missing: a branching plan built from an
   evidence-graded activity library (OurRelationship DEEP, speaker–listener, Finkel's 21-minute
   reappraisal, Aron novel activities, 36 Questions, ACR/gratitude, self-compassion, narrative
   writing), sequenced by BCT law (positivity before conflict work), matched to *this* profile,
   branching by which road the reader picks, with contraindications enforced — conjoint work is
   suppressed entirely under coercive control.
4. **Receipts & the Harvard-bro voice** — every claim carries its evidence and its published source
   one tap away; every sentence must pass the anti-generic critique and the banned-AI-phrase list.
   English, warm, direct; Hinglish only as a headline moment.
5. **The Return** — the report is a living document: tick off plan items, a dated retake, and a
   delta view of what moved. No accounts, no notifications, no spam.

## CUT LIST
- **Template mode / AI-optional** — killed by decision 1; replaced by an honest queue and a live
  capacity indicator when the free tier is saturated.
- **The "your data never leaves your device" claim** — now false; replaced by a plain-English
  disclosure of exactly what is sent, to whom, and their retention policy.
- **Hinglish body copy** — killed on sight; the register rule is in CI, not in a style guide.
- **A single global "compatibility %" as the headline** — the number the founder asked for exists,
  but as an *aggregate with its components visible*, never as a mystical score. (Kano: it's a
  delighter that becomes a liability if it can't show its parts.)
- **Chat counsellor** (again) — unbounded, unverifiable, can't carry receipts per sentence.
- **Accounts, notifications, streaks, community, matchmaking** — dead weight for a person in crisis.
- **Real-time partner sync** — the sealed exchange already solves it without a backend.

## THE INNOVATION (ancestry named)
1. **The Contradiction Engine** (differential diagnosis in medicine + double-entry bookkeeping →
   psychometrics): the engine doesn't just score dimensions, it hunts *tensions between* a user's own
   answers — high commitment beside low satisfaction, high surveillance beside high stated trust,
   "I'd be fine alone" beside a maximal fear-of-being-single score. Those pairs, not the scores, are
   what the model is allowed to write about. It is mechanically impossible to write a horoscope
   sentence about a contradiction that exists only in this person's data.
2. **The Barnum Guillotine** (adversarial review → prose generation): a second model pass whose only
   job is to ask of each sentence "would this be true of most people?" and delete on yes. Backed by
   a CI swap test that regenerates every fixture report with a different person's answers and fails
   the build on surviving sentences.
3. **The Delta Mirror** (A/B split-testing + Gottman's retake → personal growth): the retake isn't a
   second report, it's a diff — what moved, what didn't, and what that means — which is the only
   honest way an app can claim to be a "support system" without notifications.

## PRE-MORTEM
1. *"It died because it read like ChatGPT with a psychology degree."* → Contradiction Engine +
   Barnum Guillotine + swap test in CI + banned-phrase lint.
2. *"It died because the free tier melted and everyone saw a broken page."* → chunked token-frugal
   generation, honest queue with live capacity, provider-agnostic seam, ESCALATION-1 already filed.
3. *"It died because it told someone in danger to try the 36 Questions with their abuser."* →
   contraindication rules enforced in the engine, danger branch suppresses the entire conjoint
   library, safety routing first.

## OPEN CALLS (veto in one word)
1. ~100 items / ~35–40 minutes, 14 dimensions — depth chosen over brevity per decision 3.
2. Overall compatibility number ships, but always with its component bars visible.
3. Launch on the free key with a visible capacity queue; ESCALATION-1 holds the paid options.
