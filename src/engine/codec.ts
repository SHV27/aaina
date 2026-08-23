import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { Answer } from "./types";
import { ALL_ASSESSMENT_ITEMS } from "./items";

/** Sealed-exchange codec (couple mode). Zero backend: answers pack into the URL
 *  hash fragment (never sent to any server; fragments don't leave the browser).
 *
 *  STRUCTURAL SAFETY: the codec iterates ALL_ASSESSMENT_ITEMS only — WAST items
 *  have no position in the packing order, so safety answers are unencodable by
 *  construction, not by policy.
 *
 *  HONESTY (brief §6): this is compression, not encryption. The app never shows
 *  a partner's answers before the reader completes their own, but a determined
 *  technical person could decode a link. The UI says this plainly. */

const VERSION = 1;

/** Values are small ints (0–9); "." marks unanswered. */
function packValues(answers: Record<string, Answer>): string {
  return ALL_ASSESSMENT_ITEMS.map((item) => {
    const a = answers[item.id];
    if (!a) return ".";
    const v = a.value;
    return v >= 0 && v <= 9 ? String(v) : ".";
  }).join("");
}

function unpackValues(packed: string): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  for (let i = 0; i < ALL_ASSESSMENT_ITEMS.length && i < packed.length; i++) {
    const ch = packed[i];
    if (ch === ".") continue;
    const item = ALL_ASSESSMENT_ITEMS[i];
    out[item.id] = { itemId: item.id, value: Number(ch), tMs: 0 };
  }
  return out;
}

function checksum(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export interface ExchangePayload {
  v: number;
  /** Display name the initiator chooses to sign with (optional, never required). */
  from?: string;
  packed: string;
}

export function encodeExchange(
  answers: Record<string, Answer>,
  from?: string,
): string {
  const packed = packValues(answers);
  const body = JSON.stringify({ v: VERSION, from: from || undefined, packed });
  const sum = checksum(body);
  return compressToEncodedURIComponent(`${sum}|${body}`);
}

export type DecodeResult =
  | { ok: true; answers: Record<string, Answer>; from?: string; answeredCount: number }
  | { ok: false; reason: "corrupt" | "version" };

export function decodeExchange(fragment: string): DecodeResult {
  try {
    const raw = decompressFromEncodedURIComponent(fragment);
    if (!raw) return { ok: false, reason: "corrupt" };
    const sep = raw.indexOf("|");
    if (sep < 1) return { ok: false, reason: "corrupt" };
    const sum = raw.slice(0, sep);
    const body = raw.slice(sep + 1);
    if (checksum(body) !== sum) return { ok: false, reason: "corrupt" };
    const parsed = JSON.parse(body) as ExchangePayload;
    if (parsed.v !== VERSION) return { ok: false, reason: "version" };
    if (typeof parsed.packed !== "string") return { ok: false, reason: "corrupt" };
    const answers = unpackValues(parsed.packed);
    return {
      ok: true,
      answers,
      from: typeof parsed.from === "string" ? parsed.from.slice(0, 40) : undefined,
      answeredCount: Object.keys(answers).length,
    };
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}
