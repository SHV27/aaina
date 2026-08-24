# RESEARCH — Aaina v2 — 2026-08-24

Lane detail: `research/v2-lane*.md`. Later stages read the verdicts only.

## Verdicts

1. **The free/public/AI collision is real and measured, not theoretical.** Live probe: an 18,194-token
   request to Groq free tier returns **HTTP 413 — TPM limit 8,000**. Structured output (`strict:true`)
   returns 200 and perfect schema adherence. So: the report must be generated as **many small
   chunked calls**, and free-tier capacity is roughly a dozen full reports per day. → ESCALATION-1.md.
2. **Strict JSON schema output is the anti-generic enforcement mechanism.** The model emits
   `{text, evidence_ids[]}`; the renderer refuses any claim with empty evidence_ids. v1's Claim law
   survives verification and is *upgraded* to govern AI prose (salvage clause: keep it).
3. **Anti-generic is architecture, not prose** (brief §7d): deterministic engine computes ALL
   findings (scores, deltas, contradiction pairs from the user's own answers); the LLM narrates a
   per-user evidence bundle under a per-user rubric, then a critique pass deletes Barnum sentences.
   Testable by the **swap test** (regenerate with another user's data; surviving sentences = horoscope)
   and cross-user embedding similarity gates.
4. **Groq's data policy is materially better than the free alternatives** for relationship data: no
   training on API data, no retention by default, self-serve ZDR. Gemini's free tier permits training
   on inputs → unacceptable here. This decides the provider, not just the price.
5. **The India dimension Western instruments miss: family acceptance.** Lokniti-CSDS: only ~6% fully
   self-chose a spouse while 74% support choosing → "arranged dating" is the modal path. Family
   acceptance/network support must be a first-class scored dimension, not a footnote.
6. **Gen Z needs its own measured dimensions, with clean licenses:** GHOST (CC-BY), FOBS, Partner
   Phubbing Scale, Instagram-adapted jealousy, electronic surveillance, Knobloch–Solomon relational
   uncertainty (the situationship meter). **Breadcrumbing hurts more than ghosting** (Navarro 2020) —
   "being kept on hold" is the toxic state to detect.
7. **Guidance has a real evidence base, and it is specific:** OurRelationship's DEEP formulation
   (d=0.69), ePREP speaker–listener, Finkel's 21-minute reappraisal, Aron's novel-activity RCTs,
   36 Questions, ACR/gratitude, IBCT unified detachment, EFT Hold-Me-Tight, self-compassion and
   narrative (not venting) writing post-breakup, myPlan for danger. Each carries **indications AND
   contraindications** — the prescription engine must respect both.
8. **Sequencing law from BCT:** positivity-building precedes conflict-skills work. Distressed couples
   cannot problem-solve first. The plan generator must order activities, not just list them.
9. **Conjoint exercises are contraindicated under coercive control** (EFT/BCT/discernment exclusions).
   The danger branch must suppress the entire couple-activity library, not merely add helplines.
10. **Report craft is a solved problem with named techniques:** summary-then-descent, staged reveal
    over a scannable re-read document, full ranking with a fold, per-dimension chapters with tips
    inside, Hogan's bright/dark/inside frame, worksheet close. TOC at top, max two disclosure levels,
    pull-quotes made of the user's own words.
11. **"Support system" has a measured mechanism:** repeated structured self-reflection is itself an
    intervention (Larson & Sbarra 2015 — self-concept clarity ↑, loneliness ↓), and Gottman's Checkup
    treats the **retake delta** as the product. So: dated retake + diff view + locally-tracked plan,
    with no accounts and no notification spam.
12. **Voice is specifiable as rules** (Perel/Gottlieb/Savage/School of Life) with a banned-phrase list
    for AI tells — enforceable in a critique pass and in CI.

## Volatile facts (2026-08-24, re-verify each arc)
Groq free: 8,000 TPM (measured, 413 on excess), 1,000 req/day (headers), gpt-oss-120b 131K ctx /
65,536 max out, strict structured outputs GPT-OSS-only, prompt caching automatic (50% input discount,
cached tokens exempt from rate limits, 2h TTL), `reasoning_effort` low/med/high. Groq paid dev tier
$0.15/M in, $0.60/M out ≈ ₹0.53/report. Gemini 2.5 Flash-Lite $0.10/$0.40 ≈ ₹0.35/report but free
tier trains on inputs. Cerebras free context capped ~8K (unusable). SambaNova 20 req/day. OpenRouter
free 50/day.
