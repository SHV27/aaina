/** Vercel serverless fn (Node runtime, (req,res) signature) — the ONLY server
 *  code in Aaina, and the only place a secret lives. Receives an anonymized
 *  band summary (typed allowlist — never raw answers, never safety data),
 *  returns one warm opening paragraph. The app is fully complete without it.
 *  Models are config: llama-3.3-70b is retired (2026-08-16); don't pin old ids. */

const MODELS = ["openai/gpt-oss-120b", "qwen/qwen3.6-27b"];
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Per-IP token bucket (per warm instance — abuse damping on the free tier).
const buckets = new Map<string, { tokens: number; last: number }>();
const RATE = { capacity: 6, refillPerMin: 3 };

function allow(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: RATE.capacity, last: now };
  b.tokens = Math.min(RATE.capacity, b.tokens + ((now - b.last) / 60000) * RATE.refillPerMin);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

const ARCHETYPES = new Set([
  "warm-rooted",
  "strained-rooted",
  "ambivalent-centre",
  "leaning-out",
  "constrained-staying",
  "unclear",
]);
const LEVELS = new Set(["high", "moderate", "tentative"]);
const BANDS = new Set(["low", "mid", "high", "na"]);

interface Payload {
  archetype: string;
  confidence: string;
  satisfactionBand: string;
  commitmentBand: string;
  ambivalent: boolean;
}

function validate(body: unknown): Payload | null {
  if (typeof body !== "object" || body === null) return null;
  if (Object.keys(body as Record<string, unknown>).length > 5) return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.archetype !== "string" || !ARCHETYPES.has(b.archetype) ||
    typeof b.confidence !== "string" || !LEVELS.has(b.confidence) ||
    typeof b.satisfactionBand !== "string" || !BANDS.has(b.satisfactionBand) ||
    typeof b.commitmentBand !== "string" || !BANDS.has(b.commitmentBand) ||
    typeof b.ambivalent !== "boolean"
  ) {
    return null;
  }
  return b as unknown as Payload;
}

// Untyped req/res to avoid a @vercel/node dependency; shapes are stable.
export default async function handler(
  req: { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> },
  res: {
    status: (code: number) => { json: (v: unknown) => void };
    setHeader: (k: string, v: string) => void;
  },
): Promise<void> {
  res.setHeader("content-type", "application/json");
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    res.status(503).json({ error: "keyless", template: true });
    return;
  }
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) {
    res.status(429).json({ error: "rate" });
    return;
  }

  const payload = validate(req.body);
  if (!payload) {
    res.status(400).json({ error: "payload" });
    return;
  }

  const system =
    "You are the warm opening voice of Aaina, an evidence-based relationship-clarity mirror for India. " +
    "Write ONE short opening paragraph (55-80 words) in warm Hinglish (Roman script, English scaffold, Hindi warmth), " +
    "welcoming the reader to their report. You know only coarse bands, so never state numbers, never make claims about " +
    "their relationship, never advise, never predict, never mention bands or data. No astrology words. No 'you should'. " +
    "Just a homely, calm welcome that honours the effort of looking honestly.";
  const user = `Context (coarse, anonymous): overall pattern=${payload.archetype}, reading clarity=${payload.confidence}, satisfaction=${payload.satisfactionBand}, commitment=${payload.commitmentBand}, ambivalent=${payload.ambivalent}.`;

  for (const model of MODELS) {
    try {
      const r = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: 220,
          temperature: 0.7,
        }),
      });
      if (!r.ok) continue;
      const data = (await r.json()) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) {
        res.status(200).json({ text, model });
        return;
      }
    } catch {
      // try next model
    }
  }
  res.status(503).json({ error: "upstream", template: true });
}
