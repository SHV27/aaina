# VISION BRIEF — AAINA (v2, RE-BRIEF)

**This is a RE-BRIEF.** A v1 build exists. The founder has seen it, and it is not the product.
This document supersedes v1 entirely. Read it before you look at any existing code.

**Working name:** Aaina (Hindi: *mirror*). Retained. Verify availability during recon; propose a
replacement if taken.

**Founder:** Shaurya Verma. Directs the work; does not hand-write code. **He cannot audit
psychology, psychometrics, scoring, or clinical correctness himself.** See §8.

**Scale of ambition, in his words:** *"what I should be getting is a product that has power to
change this world and bring peace to the society in the ways no one has ever imagined."* He is
giving you one long run, across as many continuous sessions as it takes. Take the time. What
comes out is meant to be the real thing.

---

## 1. His criticism — verbatim, uncleaned

On language:

> "dekho ab jaise bada bada likha hai dekhiye jo sach hai voh sahi lag rha hai, hinglish mein
> likha ek chota sentence looks cool, but full sentences proper paragrahs they look cheesy and
> bad, I want english not hinglish, hinglish works but at places where it doest look cheesy,
> like dekhiye jo sach hai looks cool / inn 8 swaalon .... etc, this looks bad"

On depth:

> "I want the report to be far more detailed buddy, and no generic solutions or results"

> "what I want is full detailed report jismein ek ek cheez ho, from a to z sab, like usko padhne
> ke baad insaan khudko ko partner ko apne rishte ko ek ek cheez samjh paye"

> "like a one stop compatability checker, and also overall compatibilty ho, har choti cheez ki
> percentage ho sab details hon, badi saari proper well made report, fir verdict ho"

On guidance — the part he says was missing most:

> "and like proper councellor like guidance with proper activities to be done, like report dena
> hi councellor ka kaam nhi uske baad ek shot mein proper guidance bhi detailed, like as per
> report karna kya chahiye but if you choosing this, toh iss level pe aise ye voh etc, backed by
> this, proper activities, jaise movies series mein dekhte"

> "if a relationship is good but not good enough ki voh survive kar jaye test of time... uske
> basis pe no generic guidance but a one that the person needs, like something designed for him,
> in depth, proper jitni detail mei jaake ressaure kar sakti hai ye app utna karre, support
> system banna hai iss app ko"

On voice:

> "aisa lage its coming from a bro which is oxofrd or harvard graduate"

> "proper councellor therapist level evaluation of it and then guidance like a bro which is phd
> from havard in psychology"

On who it must serve:

> "gen z ki toh new new problems hain bahut voh especially taken care hon uss hisab se questions
> bhi hon, har generation har kisi ke liye ye app ho, har shaqs ko bahut customized feeling
> aaye, and genuinely kuch generic na ho, pyaar bahut keemti cheez hai, we have to deal with it
> dil o jaan se"

The standard, one line:

> "no generic answers at all, special to special people"

And:

> "bahut polish ki zarurat hai"

---

## 2. Kill list — what must not exist in the next version

1. **Hinglish body copy.** No paragraphs, no explanatory prose, no report text in transliterated
   Hindi. See §3 for the rule that replaces it.
2. **Any claim that the user's data never leaves their device.** Under decision 1 (below) this
   is no longer true, and shipping a false privacy promise is disqualifying.
3. **"Template mode" as a user-facing concept, and the AI-optional framing around it.** The
   founder does not want a product that is complete without intelligence. That framing came from
   a constraint in the v1 brief, not from him — see §9.
4. **Any output that could be pasted into a different user's report unchanged.** If a paragraph
   would still make sense for someone else, it is generic, and generic is the failure condition
   of this entire product.
5. **Thin guidance.** A verdict without a worked, specific, situation-matched plan behind it is
   half a product.

---

## 3. The voice rule (this is the fix for the single most visible v1 failure)

**The founder's briefing voice and the product's voice are two different things.** He briefs in
Hinglish. The product does not speak Hinglish.

- **Product language: English.** Clear, warm, adult English. Decision 2(a).
- **Hinglish is permitted only as a short, deliberate, high-impact moment** — a headline, a
  section title, a single line that lands. *"Dekhiye jo sach hai"* is his own example of this
  working. The moment it becomes a sentence inside a paragraph, it is cheesy and it is out.
- **The register to hit:** *"a bro who is a Harvard PhD in psychology, with years of experience,
  who is helping you."* Not a clinician's report. Not a chatbot. Not a self-help book. Someone
  extremely qualified sitting across from you who likes you and will not lie to you.
- **Polish is an explicit deliverable, not a finishing touch.** He said it plainly: "bahut polish
  ki zarurat hai." Typography, rhythm, spacing, the pacing of a long read — treat as core work.

---

## 4. What the product must actually do

Stated as outcomes, not as a spec. How you achieve any of it is yours.

**a) Understand the person, the partner, and the relationship — to the last detail.** After
reading, a person should understand themselves, their partner, and the thing between them, item
by item. He wants an overall compatibility read *and* granular per-dimension numbers, richly
presented, then a verdict.

**b) Then counsel.** The report is the halfway point, not the destination. What follows must be
guidance of the kind a real counsellor gives after a real assessment: **specific to this
person's actual results**, branching by what they choose ("if you take this road, then at this
stage, do this"), grounded in published work, and made of **concrete activities and action
plans** — things to actually do, not principles to contemplate.

**c) Serve everyone, and Gen Z on purpose.** Every generation, every stage, every kind of couple
(v1 brief's audience section stands). But Gen Z's specific, newer relationship problems must be
deliberately researched and represented — including in the questions themselves.

**d) Be a support system.** Not a one-shot verdict machine. *"support system banna hai iss app
ko."* What that means in practice is yours to work out.

**e) Stand the test of time.**

**f) Reduce panic on contact.** The v1 emotional temperature — calm, soothing, unhurried, a
person in distress can breathe here — was right and must survive whatever else changes.

**Carried forward unchanged from v1, still binding:**
- Free public good. No monetisation. Anyone can use it.
- **The founder's father is not mentioned anywhere in the product.** No attribution, no persona.
- Solo users are first-class. Most partners will not participate.
- Total clarity, stated plainly, and never leave a reader without a next step.
- Danger cases: deliver the analysis without judgement **and** route to safety. Both.
- The enemy is the pseudoscience economy. Every psychological claim must be sourced.

---

## 5. Founder decisions from this round

| # | Decision |
|---|---|
| 1 | **AI is required, not optional.** The customized layer cannot exist without it. User answers will leave the device to reach a model, and **the product must say so plainly and honestly** — no false privacy promise, no burying it. Free-tier key (Groq) is what he has; see the collision in §7. |
| 2 | **English product, Hinglish only as short deliberate moments.** See §3. |
| 3 | **Test length, and where depth comes from: the team decides.** His words: *"ye aisi cheezein ceo thodi batata hai... my job is to explain the vision and what do I expect and must be getting."* He is right, and the question should not have been asked. Resolve it during boardroom, log the reasoning. |
| 4 | **Final means public-ready.** *"4 a hi maan tu uss level ka kaam chahiye."* Build so a stranger can use it on day one. |
| 5 | **Full freedom to start from zero.** *"kuch shuru se shuru karna full azaadi hai, do anything whatever you want."* |

---

## 6. Bias reset and salvage clause

**Inherit zero product bias from v1.** Screens, flows, chapter structure, section names, question
set, report shape, vocabulary — all of it starts from nothing. Do not treat any v1 decision as
settled just because it exists. Do your own recon, your own boardroom, your own architecture.

**But do not delete first and think later.** The founder's frustration is with the *shape* of the
product, and some of what sits underneath v1 is genuinely good work that took real effort:
the discipline of tying claims to named published instruments, the "how do we know this?"
traceability pattern, the safety-first handling of danger signals, and the calm visual
temperature. **Whether any of it survives is your call, made by your own verification — not
by inheritance and not by this brief.** Where reuse is faster and you have verified the thing
yourself, reuse it. Where rebuilding is cleaner, rebuild. The clock is the tiebreaker.

---

## 7. Collisions you must resolve, and where reality will not cooperate

**a) The free / public / AI-required collision — resolve this early.** Three constraints now
hold at once: the product is free and public-ready (decisions 4 and v1), it requires AI
(decision 1), and only free tools are permitted (v1). Free inference tiers are rate-limited at
the organization level and will not survive public traffic. **These three cannot all hold at
scale.** Investigate the honest options, cost them out **in INR**, and escalate with a
recommendation before you architect around any one of them. Do not silently pick a road that
quietly costs him money or quietly degrades every user's report.

**b) Honesty enforcement remains partly unreachable.** No self-report instrument is fake-proof.
Detection is probabilistic. Get as close as the science allows, then state inside the product
what the honesty machinery can and cannot see. Never imply lie-proofness — overclaiming here
turns Aaina into the thing it was built to replace.

**c) Solo reads cannot equal two-sided reads.** Deliver the confident, complete verdict he asked
for; be honest about having one side of the story.

**d) "No generic at all" is a demand on your architecture, not on your prose.** A system that
selects from pre-written text will always be generic underneath, however well written. If you
find a place where true per-person specificity is not achievable, say so openly rather than
disguising selection as personalisation.

---

## 8. Verification burden

He cannot check your psychology. Therefore:

- **Every construct, scale, threshold, and interpretation rule must be traceable to a named,
  published, peer-reviewed source**, collected in a document he can hand to a professional. If
  it cannot be sourced, the product does not say it.
- **Be skeptical of popular-but-weak instruments.** Commercial popularity in India is not
  validity. Type-based personality systems in particular are not automatically defensible.
- **Prove the anti-generic claim with evidence, not assertion.** Run the product as several
  genuinely different people, including two with similar overall scores, and show him the
  outputs side by side. If those two reports read alike, the product has failed its central
  promise and you must fix it before shipping.
- Verify with live runs and real tools, not just passing tests.

---

## 9. Where v1 went wrong because of the previous brief (so you don't repeat it)

Two v1 outcomes trace to wording in the v1 brief rather than to team error:

1. **The Hinglish product voice** — the previous brief quoted the founder extensively in Hinglish
   and never distinguished his voice from the product's. §3 now fixes this.
2. **"Template mode" and the AI-optional architecture** — the previous brief said free tools only
   and escalate if anything costs money. The safest reading of that was "build it so it works
   with no AI at all," which structurally caps how personal any output can be. Decision 1 now
   fixes this.

Neither was a failure of your process. Do not over-correct into caution: the founder wants
ambition here, not risk management.

---

## 10. Acceptance scene

**Shaurya, in his second year of college, alone, whose partner would never have opened this app,
reads it end to end and knows — with enough certainty to actually act — that letting go is the
right call, a year before he actually figured it out.**

If what you build would not have worked for that person, on that day, it is not built.

---

## 11. Autonomy charter

Decide, log, continue. **Escalate only for:**

1. The free / public / AI collision in §7(a) — with options and INR costs.
2. Anything that would cost him money.
3. Anything that changes who the product is for or what it promises.
4. Discovering that per-person specificity is unreachable somewhere central.
5. The safety conflict: where handing a compatibility analysis to someone in danger would itself
   be harmful.

Everything else — research, priorities, stack, architecture, data model, art direction, question
design, report structure, guidance framework, arc plan — **is yours, and you are expected to
decide it better than this brief could.** Keep PROGRESS.md current so any session resumes cold.

---

## 12. What this brief deliberately does not contain

No stack. No architecture. No screens. No feature list. No report structure. No question set. No
psychological framework. No art direction. No pillars. No arcs. No test length.

Intent and constraints only. If your recon points somewhere completely different from anything
implied above, follow your recon — that is exactly why he is not handing you a spec.
