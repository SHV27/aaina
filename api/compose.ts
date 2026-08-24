/** The inference seam — the only server code in Aaina and the only place the key
 *  lives. Provider-agnostic by construction: switching Groq free → Groq paid →
 *  another provider is a change to PROVIDERS below, not to the app.
 *
 *  Free-tier reality (measured 2026-08-24): 8,000 tokens/minute. A whole report
 *  cannot be one call, so the client asks for one section at a time and this
 *  function stays small, cached, and honest about capacity. */

interface ProviderConfig {
  id: string;
  url: string;
  keyEnv: string;
  models: string[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    keyEnv: "GROQ_API_KEY",
    models: ["openai/gpt-oss-120b", "openai/gpt-oss-20b"],
  },
  // To scale (ESCALATION-1 option B/C), add the provider here and set its key.
  // Nothing else in the app changes.
];

/* ------------------------------ rate limiting ------------------------------ */

const buckets = new Map<string, { tokens: number; last: number }>();
const PER_IP = { capacity: 30, refillPerMin: 10 };

/** Global token pacing against the measured 8,000 TPM ceiling. Kept under it on
 *  purpose so a burst never produces a wall of 413s for real people. */
const TPM_BUDGET = 6500;
let windowStart = Date.now();
let windowTokens = 0;

function allowIp(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: PER_IP.capacity, last: now };
  b.tokens = Math.min(PER_IP.capacity, b.tokens + ((now - b.last) / 60000) * PER_IP.refillPerMin);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

function reserveTokens(estimate: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (now - windowStart >= 60_000) {
    windowStart = now;
    windowTokens = 0;
  }
  if (windowTokens + estimate > TPM_BUDGET) {
    return { ok: false, retryAfterSec: Math.ceil((60_000 - (now - windowStart)) / 1000) };
  }
  windowTokens += estimate;
  return { ok: true, retryAfterSec: 0 };
}

/* --------------------------------- payload -------------------------------- */

interface ComposeRequest {
  /** Rendered evidence bundle for ONE section. */
  prompt: string;
  /** Valid evidence ids, so the model is told what it may cite. */
  evidenceIds: string[];
  /** Section name, for logging only. */
  section: string;
  mode?: "compose" | "critique";
}

const MAX_PROMPT_CHARS = 9000; // ~2.5K tokens: comfortably inside the per-minute budget

function validate(body: unknown): ComposeRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (Object.keys(b).length > 4) return null;
  if (typeof b.prompt !== "string" || b.prompt.length === 0 || b.prompt.length > MAX_PROMPT_CHARS) {
    return null;
  }
  if (!Array.isArray(b.evidenceIds) || b.evidenceIds.some((x) => typeof x !== "string")) return null;
  if (b.evidenceIds.length > 60) return null;
  if (typeof b.section !== "string" || b.section.length > 60) return null;
  if (b.mode !== undefined && b.mode !== "compose" && b.mode !== "critique") return null;
  return {
    prompt: b.prompt,
    evidenceIds: b.evidenceIds as string[],
    section: b.section,
    mode: (b.mode as ComposeRequest["mode"]) ?? "compose",
  };
}

/* --------------------------------- prompts -------------------------------- */

// One source of truth for the prompt and schemas — the tests exercise the same
// module, so what CI checks is exactly what production sends.
import { CLAIMS_SCHEMA, CRITIQUE_SCHEMA, SYSTEM_PROMPT } from "../src/v2/ai/contract";

/* --------------------------------- handler -------------------------------- */

export default async function handler(
  req: { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> },
  res: {
    status: (code: number) => { json: (v: unknown) => void };
    setHeader: (k: string, v: string) => void;
  },
): Promise<void> {
  res.setHeader("content-type", "application/json");

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const provider = PROVIDERS.find((p) => process.env[p.keyEnv]);
  if (!provider) {
    res.status(503).json({
      error: "no_provider",
      message: "The writing service is not configured right now.",
    });
    return;
  }

  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() || "unknown";
  if (!allowIp(ip)) {
    res.setHeader("retry-after", "60");
    res.status(429).json({
      error: "rate_limited",
      scope: "ip",
      retryAfterSec: 60,
      message: "Too many requests from this device. One moment.",
    });
    return;
  }

  const parsed = validate(req.body);
  if (!parsed) {
    res.status(400).json({ error: "bad_payload" });
    return;
  }

  // ~4 chars/token, plus headroom for the shared system prompt and the output.
  const estimate = Math.ceil(parsed.prompt.length / 4) + 1400;
  const reservation = reserveTokens(estimate);
  if (!reservation.ok) {
    res.setHeader("retry-after", String(reservation.retryAfterSec));
    res.status(429).json({
      error: "capacity",
      scope: "global",
      retryAfterSec: reservation.retryAfterSec,
      message:
        "Aaina is writing someone else's report right now. Yours continues in a moment — nothing is lost.",
    });
    return;
  }

  const key = process.env[provider.keyEnv]!;
  const isCritique = parsed.mode === "critique";

  for (const model of provider.models) {
    try {
      const r = await fetch(provider.url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: isCritique
                ? "You are a strict editor hunting generic writing. Return only the JSON verdicts."
                : SYSTEM_PROMPT,
            },
            { role: "user", content: parsed.prompt },
          ],
          max_tokens: isCritique ? 700 : 1100,
          temperature: isCritique ? 0.1 : 0.65,
          reasoning_effort: "low",
          response_format: {
            type: "json_schema",
            json_schema: {
              name: isCritique ? "verdicts" : "claims",
              strict: true,
              schema: isCritique ? CRITIQUE_SCHEMA : CLAIMS_SCHEMA,
            },
          },
        }),
      });

      if (r.status === 429) {
        const retry = Number(r.headers.get("retry-after") ?? "30");
        res.setHeader("retry-after", String(retry));
        res.status(429).json({
          error: "capacity",
          scope: "upstream",
          retryAfterSec: retry,
          message: "Aaina has reached its writing capacity for the moment. Your place is held.",
        });
        return;
      }
      if (!r.ok) continue;

      const data = (await r.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { total_tokens?: number };
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      let payload: unknown;
      try {
        payload = JSON.parse(content);
      } catch {
        continue;
      }

      res.status(200).json({
        ok: true,
        model,
        provider: provider.id,
        section: parsed.section,
        usage: data.usage?.total_tokens ?? null,
        result: payload,
      });
      return;
    } catch {
      // fall through to the next model
    }
  }

  res.status(503).json({
    error: "upstream_unavailable",
    message: "The writing service did not answer. Your answers are safe; try again shortly.",
  });
}
