# Proof: the reports are not generic

*Generated 2026-08-24 by `scripts/anti-generic-proof.ts`, using the real
model and the real pipeline. Re-run it any time — it talks to the live service.*

The brief asked for evidence rather than a promise: run the product as several
genuinely different people, including two with similar overall scores, and show the
outputs side by side. If those two read alike, the product has failed.

## The measurement

| Pair | Overall scores differ by | Word overlap | Identical sentences |
|---|---|---|---|
| A vs B | 3.6 points | 22.7% | **0** |
| A vs C | 22.3 points | 16.1% | **0** |
| A vs D | 2.0 points | 21.7% | **0** |
| A vs E | 29.9 points | 14.0% | **0** |
| B vs C | 25.9 points | 31.6% | **0** |
| B vs D | 5.6 points | 20.0% | **0** |
| B vs E | 33.5 points | 16.0% | **0** |
| C vs D | 20.3 points | 12.5% | **0** |
| C vs E | 7.6 points | 17.5% | **0** |
| D vs E | 27.9 points | 12.6% | **0** |

**Identical sentences across all 10 pairs: 0.** Word overlap is
measured on words longer than three letters, so shared vocabulary like "relationship",
"satisfaction" and "commitment" counts against us — the number is a ceiling, not a flattering
floor. The worst pair is B vs C at 31.6%.

## The people

### A — High commitment, low satisfaction (the classic ambivalent)
**Overall: 47.8/100.**

Tensions the engine found:
- You are committed to a relationship that is not currently making you happy.
- Your reasons for staying and your fear of being alone are hard to tell apart.

Plan it produced:
- Say the specific thank-you
- Respond properly when they are happy
- The daily fifteen about everything else
- The seven-minute rewrite
- Put the three roads on paper
- The six-month experiment, with a date

What it wrote:

> Your overall reading across 14 dimensions lands at 48 out of 100, a mixed picture where strengths and weaknesses balance each other out.
>
> The single biggest tension is clear: you are committed to a relationship that is not currently making you happy. You scored a perfect 100 on commitment, yet only 19 on everyday satisfaction. You said, "Agree completely" to "I am committed to maintaining my relationship with my partner," and you also said "Agree completely" to "I want our relationship to last for a very long time."
>
> What holds the relationship up are solid scores on knowing where you stand (78/100) and trust (67/100), while what pulls it down are very low scores on choosing versus clinging (25/100) and how you fight (25/100).

*(No paragraphs were rejected in this run.)*

---

### B — The situationship (same overall, different everything)
**Overall: 44.2/100.**

Tensions the engine found:
- You are happier in this than the people who know you both are.
- The relationship is carrying weight from outside it.

Plan it produced:
- Respond properly when they are happy
- Do something new together, not something nice
- Ask for reassurance in words instead of tests
- Two phone-free hours you both defend
- A week without checking
- The conversation underneath the fight

What it wrote:

> Your overall reading across 14 dimensions sits at 44 out of 100, a mixed picture where strong physical intimacy (83/100) and solid conflict handling (75/100) hold the relationship up, while critical deficits in knowing where you stand (0/100) and fear of losing them (19/100) pull it down.
>
> The single biggest tension is that you are happier in this relationship than the people who know you both are; you rate your own satisfaction at 57/100 but your closest friends are only "A little true" about being glad you are together, and they rate the support‑network side at 25/100.

*(No paragraphs were rejected in this run.)*

---

### C — Family pressure on a good relationship
**Overall: 70.1/100.**

Tensions the engine found:
- The relationship is carrying weight from outside it.
- You are happier in this than the people who know you both are.

Plan it produced:
- A written check-in every week

What it wrote:

> Your overall reading across the 14 dimensions comes in at 70 out of 100, which shows a generally solid foundation without being exceptional.
>
> The biggest tension is that the relationship is carrying weight from outside it: you score 88 on commitment but a 0 on family and the world, and you answered “Not at all true” to the question about your family knowing about this relationship.
>
> Your friends are less supportive than you are happy together — you rate overall happiness as “Extremely happy” while your friends’ support sits at 25 out of 100, and you noted “A little true” when asked if your closest friends are glad you’re with this person.

*(No paragraphs were rejected in this run.)*

---

### D — Phones, jealousy and surveillance
**Overall: 49.8/100.**

Tensions the engine found:
- You say you trust them, and you are still checking.
- You are committed to a relationship that is not currently making you happy.

Plan it produced:
- Ask for reassurance in words instead of tests
- Two phone-free hours you both defend
- A week without checking
- The seven-minute rewrite
- Put the three roads on paper
- The six-month experiment, with a date

What it wrote:

> Your overall reading sits at 50 out of 100, a mixed picture. Trust at 79 and commitment at 75 hold you up, while digital‑strain at 0 and fear of loss at 17 pull you down.
>
> The core tension is clear: you say you trust them, and you are still checking. You rated “I can rely on my partner to keep the promises they make to me” as “Moderately agree,” yet you also answered “Very likely” to becoming jealous when your partner adds someone you don’t know.
>
> A second strain shows up in the gap between commitment and satisfaction. You scored 75 on commitment and 6 on how committed you feel, but your satisfaction sits at 43, indicating you’re staying for reasons other than how the relationship feels right now.

*(No paragraphs were rejected in this run.)*

---

### E — Quietly good
**Overall: 77.7/100.**

Tensions the engine found:
- none

Plan it produced:
- A written check-in every week

What it wrote:

> Your overall reading is solid at 78 out of 100, showing a generally healthy relationship. The strongest scores are Physical intimacy (83/100) and Feeling understood (83/100), while Comfort with closeness is the weakest at 50/100, indicating a mixed ability to let someone in fully. You answered 122 questions, which gave us the data for these numbers. The biggest tension is between the high sense of being understood and the moderate comfort with closeness, a gap that defines the current dynamic.

*(No paragraphs were rejected in this run.)*


## Why it works

The model never receives a topic. It receives this person's scores, the specific
contradictions between their own answers, and their answers quoted word for word — and it
must attach every paragraph to those. A paragraph with no evidence behind it is discarded
before rendering, as is one that reads as if it could belong to someone else. That is why
the number in the last column is what it is.
