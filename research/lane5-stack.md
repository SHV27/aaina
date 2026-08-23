# Lane 5+7 — Stack & Volatile Facts (ALL verified live 2026-08-24)

## Verdict
Vite 7 + React 19 + TS SPA (no Next). Zustand 5 + persist (localStorage). Tailwind v4 (@theme tokens). Recharts ≥3.9 (React 19 fix). LLM: one Vercel Hobby serverless fn `api/narrate` proxying Groq **`openai/gpt-oss-120b`** (llama-3.3-70b-versatile RETIRED 2026-08-16!) + Gemini Flash fallback + mandatory no-key template fallback. Couple mode: **zero backend** — lz-string compressToEncodedURIComponent in URL hash fragment (never hits server). PDF: print CSS (vector; html2canvas breaks on Tailwind v4 oklch). Vitest 4 + Playwright 1.57.

## Volatile facts [all 2026-08-24]
- Vite 7.3.0 stable; needs Node 20.19+/22.12+ (we have Node 24 ✓)
- React 19.2.7 current
- Zustand 5.0.15; persist supports localStorage/custom IndexedDB (idb-keyval)
- Recharts 3.9.0 — pin ≥3.9; 3.6.0 blank-chart bug w/ React 19.2.3 (GH #6857)
- Tailwind v4.2 — CSS-first @theme, @tailwindcss/vite plugin, no config JS; colors default oklch
- Vercel Hobby: 100 GB transfer/mo, 4 CPU-hrs Active CPU, ~1M invocations, fn timeout 10s default/60s max, 100 deploys/day, runtime logs 1hr. Commercial use banned (we're non-commercial ✓). Custom domains free. Hobby cannot connect org-owned repos — **push repo under personal account (SHV27)**.
- Deploy: `vercel deploy --prod --token=$VERCEL_TOKEN --yes`; env vars via `vercel env add NAME production`.
- Groq free tier alive, no card; ~30 RPM / 14.4K req/day org-wide; endpoint api.groq.com/openai/v1 unchanged; recommended models: openai/gpt-oss-120b, qwen/qwen3.6-27b. RETIRED: llama-3.3-70b-versatile (2026-08-16), llama-3.1-8b-instant, llama-4-scout, kimi-k2.
- Gemini free: Flash ~10–15 RPM, ~1,000–1,500 req/day; Pro removed from free tier Apr 2026.
- OpenRouter :free — 50 req/day at $0 → too thin for public app.
- Vercel KV dead (→ Upstash marketplace; free 256MB/30K cmd/day) — not needed.
- lz-string stable; keep URL payloads <~2K chars for messaging-app safety.
- Vitest 4.1 (browser mode stable, visual regression); Playwright 1.57.0, Windows headless screenshots reliable.

## Risk flags
1. Never pin llama-3.3-70b (retired). 2. Recharts ≥3.9. 3. Print CSS not canvas PDF (oklch). 4. Repo under personal GitHub account for Hobby integration. 5. Per-IP throttle in the LLM proxy fn (Groq limits org-wide).
