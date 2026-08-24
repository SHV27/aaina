# SCIENCE — Aaina v2

*This document exists so that anyone — a psychologist, a skeptical friend, a journalist —
can ask "what is this based on?" and get a real answer. Every construct, scale, threshold and
interpretation rule the product uses is here, with its published source and its licence
position. If a claim is not traceable to something in this document, the product does not make
it.*

Last updated: 2026-08-24. Supersedes SCIENCE.md (v1).

---

## 1. What is measured, and with what

Fourteen dimensions, 122 scored questions. The in-app page at `/science` renders this same
list from the code itself, so the two cannot drift apart.

### Core (validated mainstream instruments)

| Dimension | Instrument | Source | Licence position |
|---|---|---|---|
| Everyday satisfaction | Couples Satisfaction Index | Funk & Rogge (2007), *J Family Psychology* 21(4) | Distributed free by the authors for research/clinical use with citation |
| Commitment | Investment Model Scale (global items) | Rusbult, Martz & Agnew (1998), *Personal Relationships* 5(4) | Published in full in the journal appendix; distributed by the authors' lab |
| Fear of losing them (attachment anxiety) | ECR–Short Form | Wei, Russell, Mallinckrodt & Vogel (2007), *J Personality Assessment* 88(2); parent ECR-R (Fraley et al., 2000) is public domain | Freely reproduced in the literature; non-commercial use with citation |
| Comfort with closeness (attachment avoidance) | ECR–Short Form | as above | as above |
| How you fight | Communication Patterns Questionnaire, short form | Christensen & Heavey (1990), *JPSP* 59(1); scoring per Crenshaw et al. (2017), *Psychological Assessment* 29(7) | Unpublished academic instrument, circulated freely for research/clinical use |
| Feeling understood | Perceived Partner Responsiveness Scale | Reis, Crasta, Rogge, Maniaci & Carmichael (2018), in *The Sourcebook of Listening Research* | Author's distributed copy states it is **"freely available to researchers with appropriate citation"** |
| Physical intimacy | Global Measure of Sexual Satisfaction | Lawrance & Byers (1995), *Personal Relationships* 2(4) | Published in full; free with citation |
| Trust | Trust in Close Relationships Scale | Rempel, Holmes & Zanna (1985), *JPSP* 49(1) | Published academic scale; free with citation |
| Same direction | **Bespoke** — see §4 | anchored to Karney & Bradbury (1995) on enduring vulnerabilities | Written for this product |

### Modern (the Gen Z layer)

| Dimension | Instrument | Source | Licence position |
|---|---|---|---|
| Phones and jealousy | Partner Phubbing Scale (9 items, verbatim) + social-media jealousy items (Muise) + electronic surveillance items (Tokunaga) | Roberts & David (2016), *Computers in Human Behavior* 54; Muise, Christofides & Desmarais (2009), *CyberPsychology & Behavior* 12(4); Tokunaga (2011), *CHB* 27(2) | Standard academic scales, free for non-commercial use with citation. Only verified items are used — see §4 |
| Knowing where you stand | Relational uncertainty items + GHOST | Knobloch & Solomon (1999), *Communication Studies* 50(4); Jahrami et al. (2023), *Heliyon* 9(6) | GHOST is **CC-BY** (free reuse with attribution). Knobloch & Solomon: see §4 |
| Choosing, not clinging | Fear of Being Single Scale (6 items, verbatim) | Spielmann, MacDonald, Maxwell, Joel, Peragine, Muise & Impett (2013), *JPSP* 105(6) | Published in full; free with citation |

### Context (what Western instruments miss about India)

| Dimension | Instrument | Source |
|---|---|---|
| Family and the world | **Bespoke** — see §4 | Lokniti-CSDS & KAS (2017) *Youth Study*; anchored to Sprecher & Felmlee (1992) |
| What your people think | Network-support items | Sprecher & Felmlee (1992), *J Marriage & Family* 54(4) |

### Deliberately not used, and why

- **Personality-type systems (MBTI and its imitators).** Type assignments are unstable on
  retest and dichotomise continuous traits (Pittenger, 1993, 2005; Stein & Swan, 2019).
- **The five love languages.** The core claims — one preferred language, five distinct
  languages, matching predicts satisfaction — are unsupported (Impett, Park & Muise, 2024,
  *Current Directions in Psychological Science* 33(2)). The quiz is also proprietary.
- **Dyadic Adjustment Scale.** Superseded psychometrically by the CSI and commercially licensed.
- **HITS abuse screen.** Copyrighted with a fee; WAST is used instead.
- **Any single compatibility percentage presented as a verdict.** No validity literature exists
  for that format. Aaina reports a composite *with every component and weight visible*.

---

## 2. How scores are produced

- Each item is normalised to 0–100 on its own published response scale. **Direction lives on
  the item and nowhere else**: after an item's reverse flag is applied, higher always means a
  better standing. (This is enforced by a test that asserts direction from the *meaning* of
  twenty named items, written after a real double-flip bug reached a live run.)
- A dimension score is the mean of its answered items. Unanswered dimensions score nothing and
  say so; they are never imputed.
- **The composite** is a weighted mean of the answered dimensions. Weights follow what the
  evidence says predicts relationship quality and survival: perceived commitment,
  appreciation/responsiveness, sexual satisfaction and conflict are the strongest self-report
  predictors across 43 longitudinal studies (Joel et al., 2020, *PNAS* 117(32)), and commitment
  and satisfaction dominate dissolution prediction meta-analytically (Le et al., 2010,
  *Personal Relationships* 17(3)). Context dimensions are external to the couple and carry less
  weight. **Every weight and contribution is shown to the user inside the report.**
- **Bands** (`Needs attention now` / `Under strain` / `Mixed` / `Solid` / `A real strength`) are
  descriptive language for ranges on that 0–100 view. They are not clinical cut-offs and are
  not presented as diagnoses.

### Data quality
Careless responding is detected with the methods in Meade & Craig (2012), *Psychological
Methods* 17(3): response latency (answers under ~900ms), long strings of identical answers, and
instructed-response items. Findings are reported to the reader in the report's closing section.
They lower confidence in the reading; they never silently alter a score.

---

## 3. What the report does with the scores

### The contradiction engine
The report is not written from scores; it is written from **tensions between a person's own
answers**. Eleven cross-dimension rules fire only when one dimension is high while a specific
other is low, plus a within-dimension rule for answers that disagree with each other. Each
carries its own research significance, which the writer may not invent. Examples:

- *Commitment without satisfaction* — commitment and satisfaction normally move together; when
  they separate, something other than how the relationship feels is holding it up (Rusbult et
  al., 1998).
- *Staying from fear* — fear of being single predicts settling for less responsive partners
  (Spielmann et al., 2013).
- *Trust versus surveillance* — checking maintains the anxiety it is meant to relieve; the loop
  predicts lower satisfaction a year later (Muise et al., 2009; Tokunaga, 2011).
- *Family pressure versus choice* — the surrounding network's approval is one of the few
  external factors reliably predicting whether relationships last (Le et al., 2010; Sprecher &
  Felmlee, 1992), and it sits closer to the centre of the decision in India than Western
  research assumes (Lokniti-CSDS, 2017).

### The writing
A language model writes the prose, under three constraints that are enforced in code rather
than requested in a prompt:

1. It receives only an evidence bundle — scores, tensions, and the person's own quoted answers.
   It is told it has no other information and may not introduce any.
2. It must return each paragraph with the evidence ids it rests on, under a strict JSON schema.
   **Any paragraph whose evidence does not resolve is discarded before rendering.**
3. Paragraphs that read as if they could belong to a different reader are discarded, as are any
   that break the voice rules (commands about the decision, compatibility percentages,
   prophecy, astrology, diagnosis, character labels).

Evidence that this works, measured rather than asserted, is in `PROOF-ANTI-GENERIC.md`.

### The plan
Every prescribed activity is a published intervention with its own indications **and
contraindications**: OurRelationship's DEEP formulation (Doss et al., 2016, *JCCP* 84(4)),
speaker–listener from the ePREP trials (Braithwaite & Fincham, 2011), Finkel's conflict
reappraisal writing (Finkel et al., 2013, *Psychological Science* 24(8)), Aron's novel-activity
work (Aron et al., 2000, *JPSP* 78(2)) and the thirty-six questions (Aron et al., 1997, *PSPB*
23(4)), active-constructive responding (Gable et al., 2004), expressed gratitude (Algoe et al.,
2010), IBCT's unified detachment and empathic joining (Christensen et al., 2004), EFT's core
conversation (Johnson et al., 1999), discernment counselling's three roads (Doherty, Harris &
Wilde, 2016), self-compassion in separation (Sbarra, Smith & Mehl, 2012), narrative rather than
venting writing after a breakup (Sbarra et al., 2013), self-concept rebuilding (Slotter,
Gardner & Finkel, 2010), structured weekly reflection (Larson & Sbarra, 2015), and safety
planning (Glass et al., 2017).

Ordering follows the sequencing rule from behavioural couple therapy: goodwill-building work
comes before conflict-skills work, because distressed couples cannot problem-solve first.

---

## 4. Honest about the edges

**Two dimensions are bespoke.** No free validated instrument measures family acceptance and
timeline pressure, and Western scales largely assume the couple decides alone. Indian youth
research says otherwise: roughly 6% of young Indians fully chose their own spouse while about
74% believe they should be able to (Lokniti-CSDS & KAS, 2017, n > 6,000 across 19 states),
which makes "arranged dating" the modal path and the family a genuine stakeholder. Those items,
and the life-direction items, were written for this product, anchored to the finding that the
surrounding network's view predicts relationship survival. **They are interpreted descriptively
and are not claimed to be validated scales.**

**Some instruments are used in part.** Where a published scale sits behind a paywall and only
some items could be verified word for word, Aaina administers only the verified items rather
than reconstructions circulating on quiz websites. This applies to the electronic-surveillance
items (Tokunaga, 2011 — four items verified), the social-media jealousy items (Muise et al.,
2009 — the full 27-item list was never published openly), and the relational uncertainty items
(Knobloch & Solomon, 1999 — structure and exemplars verified, full appendix paywalled).
Partial administration means these subscales are **indicative rather than normed**.

**Response formats are sometimes narrowed.** The PPRS is published on a 9-point scale and is
administered here at 7 points for consistency across a long assessment; the Rempel trust scale
retains its −3..+3 structure in plain words. Narrowing a response scale changes its variance
properties and is noted here for completeness.

**No test can detect deliberate dishonesty.** Careless answering is measurable and is reported.
Someone determined to misrepresent their relationship can do so — in this instrument and in
every self-report instrument ever written. The product says so in the report itself, and never
implies otherwise.

**Solo readings are one-sided.** Own perceptions are the strongest single self-report predictor
of relationship quality, and partner reports add little beyond them (Joel et al., 2020), which
is what makes a solo reading worth doing. It remains one side of a two-sided thing, and the
report says so.

**This is not prediction.** Claims that an assessment forecasts whether a relationship survives
have collapsed under proper cross-validation — a model reported at over 90% accuracy fell to
roughly 29% positive predictive accuracy on a held-out sample (Heyman & Slep, 2001, *J Marriage
and Family* 63(2)). Aaina describes the present and names what usually follows patterns like
this one, with the uncertainty attached.

---

## 5. Safety

The risk screen is the Woman Abuse Screening Tool (Brown, Lent, Brett, Sas & Pederson, 1996,
*Family Medicine* 28(6)), administered gender-neutrally — an adaptation, since the original was
validated with women, and one that does not alter the thresholds. The gate is deliberately
conservative: the published cut-off, **or** both short-screen items at their extreme, **or** any
endorsement of physical or sexual harm, **or** endorsement of feeling frightened. A false
positive shows someone a page of helplines; a false negative could prescribe couple exercises to
someone being hurt.

No IPV screening tool has fully established psychometric properties (Rabin, Jennings, Campbell &
Bair-Merritt, 2009, *American Journal of Preventive Medicine* 36(5)), and the product does not
present the screen as diagnostic.

When the screen is positive:
- The reading is still delivered in full. Withholding someone's own analysis is its own harm.
- **The plan changes**: every conjoint activity is removed by the plan builder before selection,
  because joint exercises are contraindicated where coercive control or violence is present —
  this is an explicit exclusion in EFT, in behavioural couple therapy, and in discernment
  counselling. Only solo work and safety planning remain.
- Verified Indian helplines are shown first (112, 181, Tele-MANAS 14416, Vandrevala, iCall,
  AASRA, Shakti Shalini, NCW 14490, SIF-One), each re-verified 2026-08-24. The discontinued
  KIRAN line is deliberately excluded.
- Microcopy follows WHO first-line support ("LIVES"): listen, validate, never judge, never ask
  why they have not left.
- **The screen's answers are never stored, never transmitted, and never printed.** They exist in
  memory only, and are used once, on the device, to decide what the plan must not contain.

---

## 6. Where the answers go

The report is written by a language model hosted by Groq. What is sent is dimension scores, the
tensions found, and a small number of the person's own answers quoted verbatim — with no name,
no email and no identifier, because the product never collects any. Groq's published policy is
that API data is not used for training and is not retained by default; that policy was the
deciding factor in choosing it over free alternatives whose terms permit training on user input.
The safety section is excluded from this by construction, not by configuration. This is stated
plainly to the user at `/privacy` before they begin.
