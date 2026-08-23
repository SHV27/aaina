import { useState } from "react";
import { ModeBadge } from "./ModeBadge";
import type { Report } from "../engine/report";

/** Optional AI-warmed welcome. Template is the default and the reference
 *  rendering; the AI may only rephrase this welcome slot and receives ONLY
 *  coarse anonymous bands (see api/narrate.ts allowlist) — never answers,
 *  never safety data. Mode is always declared on screen. */

const TEMPLATE_WELCOME =
  "Aaiye. Yeh report kisi machine ka faisla nahi — aapke apne jawaabon ka aaina hai, published research ke tarazu par tula hua. Aaram se padhiye, chai ke saath. Jahan bhi 'Yeh kaise pata?' dikhe, wahan tap kar ke aap khud dekh sakte hain ki har baat kahan se aayi.";

function band(v: number | null, lowCut: number, midCut: number): string {
  if (v === null) return "na";
  return v < lowCut ? "low" : v < midCut ? "mid" : "high";
}

export function Narrator({ report }: { report: Report }) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);

  async function warmUp() {
    setBusy(true);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          archetype: report.archetype,
          confidence: report.confidence.level,
          satisfactionBand: band(report.scores.csi16, 51.5, 65),
          commitmentBand: band(report.scores.imsCommitment, 4, 6),
          ambivalent: report.scores.ambivalent === true,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { text?: string };
        if (data.text) {
          setAiText(data.text);
          return;
        }
      }
      setDeclined(true);
    } catch {
      setDeclined(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-(--radius-card) border border-paper-edge p-5">
      <p className="max-w-prose leading-relaxed text-ink-soft">
        {aiText ?? TEMPLATE_WELCOME}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ModeBadge mode={aiText ? "ai" : "template"} />
        {!aiText && !declined && (
          <button
            type="button"
            onClick={warmUp}
            disabled={busy}
            className="no-print text-sm text-sindoor underline decoration-dotted underline-offset-4 hover:text-sindoor-deep disabled:opacity-50"
          >
            {busy
              ? "Ek pal…"
              : "AI se lehja aur garam karein? (sirf anonymous score-band jaata hai)"}
          </button>
        )}
        {declined && (
          <span className="text-xs text-ink-faint">
            AI abhi uplabdh nahi — template hi poora hai, kuch nahi chhoota.
          </span>
        )}
      </div>
    </div>
  );
}
