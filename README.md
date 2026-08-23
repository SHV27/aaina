# Aaina · आईना

**An honest, evidence-based mirror for your relationship. Free. Private. Made for India.**

Aaina is for the person standing alone in doubt — *should I stay, should I go, should I say
yes to this rishta?* — who deserves better than astrology apps, ₹3,000/hour therapy quotes,
and horoscope-shaped internet quizzes. It asks real, validated questions; it answers with a
counsellor's craft; and every single sentence it produces can show you its receipts.

**Live:** https://aaina-two.vercel.app

## What it does

- **Jhalak (2 min)** — 8 validated items → one honest micro-read, receipts included.
- **The Mirror (~50 min)** — 5 named chapters over a battery of published instruments:
  CSI-16 (satisfaction), ECR-S (attachment), CPQ-SF (conflict patterns), the Investment Model
  Scale (commitment), and Joel et al.'s stay/leave reasons pool. Auto-saved, resumable, one
  question per screen.
- **The Verdict Report** — a pattern-read with honest confidence, delivered the way real
  counsellors deliver hard truths (MI, SPIKES, Therapeutic Assessment, Discernment
  Counselling), ending in **three paths, each with its cost** — never a command.
- **Do Aaine (couple mode)** — zero-backend sealed exchange: both partners answer blind,
  links carry compressed answers in the URL hash (which never touches a server), and the
  report treats **perception gaps as first-class findings**.
- **Safety branch** — an abuse screen (WAST) behind a privacy interstitial with a quick-exit
  button; danger signals reroute the report to verified Indian helplines first. Safety answers
  live in memory only — never persisted, exchanged, printed, or sent anywhere.

## What it refuses to do

- No compatibility percentages. No divorce predictions (postdictive "90% accuracy" claims
  collapse under cross-validation — Heyman & Slep, 2001). No personality types. No love
  languages. No astrology.
- No lie-proofness claims: a motivated liar defeats any questionnaire. Aaina detects
  *carelessness* well (response-time, consistency, attention checks — Meade & Craig, 2012),
  softens interpretation under socially-desirable responding (MC Form C), and puts what it
  cannot see into a visible confidence meter.
- No accounts, no server storage of answers, no analytics on your responses. The only server
  code is an optional LLM proxy that receives coarse anonymous bands, never answers.

**Every claim → SCIENCE.md.** Every construct, threshold, and delivery rule is traceable to a
named, peer-reviewed source — a document you can hand to a professional and ask "iska base
kya hai?"

## The steals (honoured, as all good steals should be)

- Career-aptitude report craft → the deep, visual, anxiety-killing report experience.
- Comparable-sales valuation + courtroom exhibits → the **Receipts Renderer**: prose that
  cannot render without bound evidence (the user's own answers + a citation).
- Cryptographic commit–reveal → **sealed-exchange couple mode** (answer before you see).
- Engineering uncertainty displays → the **honest-confidence meter**.
- Discernment Counselling (Doherty) → three paths, each with a cost, time-boxed experiments.
- 16personalities' completion engineering → chapters, per-chapter progress, staged reveal.
- AstroTalk's trust mechanics, ethically inverted → anonymity, specificity, ritual — but with
  published science where the pseudoscience used to be.

## Stack

Vite 7 · React 19 · TypeScript · Zustand 5 (+localStorage persist) · Tailwind v4 (@theme
tokens) · lz-string · print-CSS PDF export · Vitest 4 + Playwright (full-journey e2e, both
widths) · Vercel (static SPA + one serverless fn) · Groq free tier (optional; template
narrator is the reference rendering).

```bash
npm install
npm run dev        # develop
npm test           # unit + Referee invariant suite
npm run e2e        # Playwright journeys (desktop + mobile)
npm run build      # production build
```

## Honest limits

Aaina is a self-report reading, not a diagnosis, not therapy, not a prophecy. Solo results
rest on one person's perceptions — which the best available evidence (Joel et al., 2020,
PNAS) says carry most of the predictive signal, and which are still one side of a
two-sided thing. Where you are in danger, Aaina's job is to hand you to humans: 181, 112,
Tele-MANAS 14416, and the other verified lines listed in the app.

---

Built as a free public good. यह पाखंड के ख़िलाफ़ एक छोटा सा आईना है।
