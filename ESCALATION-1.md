# ESCALATION 1 — The free / public / AI collision

**For:** Shaurya · **From:** the build · **Date:** 2026-08-24 · **Decision needed: no rush.**
Nothing is blocked. Aaina v2 is being built and will launch on your free key. This memo exists
because §7(a) of your brief told me to bring you options with INR costs *before* architecting
around any one road — so here they are, measured rather than guessed. **No money has been spent
and none will be without your word.**

---

## What I measured (live, with your key, today)

I did not take the docs' word for it. I sent real requests:

| Test | Result |
|---|---|
| One full-size report request (~18,000 tokens) | **REJECTED — HTTP 413.** "Limit 8000, Requested 18194" |
| A ~5,300-token request | Accepted (1.0s), but it consumed **77% of the entire minute's budget** |
| Strict JSON schema output | Works perfectly — this is what lets me force every AI sentence to carry evidence |
| Response speed | 335–976 ms. Fast. Quality is good. |

**The headline number on Groq's free tier is 1,000 requests/day, and it is misleading.** The real
ceiling is **8,000 tokens per minute**. A deep, personalized report is roughly 15,000–30,000 tokens
of work. So the free tier cannot produce even one report in one go — it has to be produced in
small pieces, spaced out over minutes.

**Practical translation:** on the free key, Aaina can serve roughly **10–15 full reports per day**,
one person at a time, each taking a few minutes to generate. That is enough for you, your friends,
and a soft launch. It is not enough for "a stranger can use it on day one" at any real volume — if
the app gets 200 visitors in a day, most of them hit a queue.

---

## The options, costed in ₹

Per-report cost assumes ~21,000 tokens of generation (15K in, 6K out).

| Option | ₹ per report | ₹/month at 100 reports/day | ₹/month at 1,000/day | Honest verdict |
|---|---|---|---|---|
| **A. Stay on Groq free** | ₹0 | ₹0 (but capped at ~10–15/day) | impossible | Fine for launch + demos. Everyone past the cap waits. |
| **B. Groq Developer tier** ⭐ | ₹0.53 (₹0.26 with batching/caching) | **₹1,580** | ₹15,800 | Cheapest quality road. Same provider, same code, just a card on file. |
| **C. Gemini Flash-Lite (paid)** | ₹0.35 | ₹1,050 | ₹10,500 | Slightly cheaper, but a second provider to maintain. |
| **D. Gemini free tier** | ₹0 | ₹0 (~250/day) | impossible | **I recommend against this one.** Google's free tier permits training on what users send. For a product where people describe their marriages, that is not acceptable. Groq does not train on API data and does not retain it. |
| **E. Users bring their own key** | ₹0 | ₹0 | ₹0 | No cost, but it asks a heartbroken 20-year-old to go make a developer account. It kills the product for the person in your acceptance scene. |

*(₹90/USD. All prices verified live today; they move — I re-check every arc.)*

---

## What I am doing without you (per the Autonomy Charter)

1. **Building provider-agnostic.** The inference layer is one seam with a model list in config.
   Switching Groq free → Groq paid → Gemini is a config change, not a rewrite. You are not locked in.
2. **Making the report token-frugal by design** — chunked generation, cached shared prompts (Groq
   gives a 50% discount on cached input and does not count it against rate limits), compact evidence
   bundles. This stretches the free tier as far as it goes and halves the bill on any paid road.
3. **Being honest in the product, loudly.** If capacity is reached, the user sees a real message and
   a wait, never a quietly worse report. And the privacy page says plainly that answers are sent to
   an AI provider (Groq), that Groq does not train on them or retain them, and what that means.
4. **No silent degradation, no silent spending.** Those were the two things you told me not to do.

## What I need from you, whenever you wake up and feel like it

**One decision: A or B.**

- Say **"stay free"** and it stays exactly as it is — capped, queued, honest, ₹0.
- Say **"go dev tier"** and I switch a config value. At your likely early traffic it is **₹1,580/month
  or less**, and with batching closer to ₹800. That is the price of making the thing work for
  strangers at real volume.

My recommendation: **launch on A, and move to B the day it actually gets traffic.** You lose nothing
by waiting — the code is identical either way, and I will tell you the moment the queue starts
turning people away.

Sab kuch chal raha hai. Aaram se socho. 🌙
