import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { encodeExchange, decodeExchange } from "../engine/codec";
import { CHAPTERS } from "../engine/items";
import { derivePosition, useAnswersStore } from "../store/answers";
import { usePartnerStore } from "../store/partner";

/** Do Aaine — sealed-exchange couple mode. Zero backend: the link's hash
 *  fragment carries the compressed answers and never reaches any server.
 *  Sealed-commit: a received mirror stays closed until you finish your own. */

export function Saath() {
  const location = useLocation();
  const answers = useAnswersStore((s) => s.answers);
  const skippedIds = useAnswersStore((s) => s.skippedIds);
  const partner = usePartnerStore();
  const [received, setReceived] = useState<null | "ok" | "corrupt">(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");

  const pos = derivePosition(answers, skippedIds);
  const mineComplete = pos.chapterIndex >= CHAPTERS.length;

  // Incoming sealed link: decode, store, wipe the fragment from the URL bar.
  useEffect(() => {
    const frag = location.hash.replace(/^#/, "");
    if (!frag) return;
    const decoded = decodeExchange(frag);
    if (decoded.ok) {
      partner.setPartner(decoded.answers, decoded.from);
      setReceived("ok");
    } else {
      setReceived("corrupt");
    }
    window.history.replaceState(null, "", location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareLink = useMemo(() => {
    if (!mineComplete) return null;
    return `${window.location.origin}/saath#${encodeExchange(answers, name || undefined)}`;
  }, [mineComplete, answers, name]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="reveal font-devanagari text-2xl text-brass-deep">दो आईने</p>
      <h1 className="reveal mt-2 font-display text-4xl font-light text-ink">
        Saath mein dekhein — do aaine, ek rishta.
      </h1>

      {received === "corrupt" && (
        <p className="reveal-late mt-5 rounded-lg border border-sindoor bg-sindoor-tint px-4 py-3 text-ink">
          Yeh link poora nahi pahuncha — kabhi-kabhi messaging apps lambi links
          kaat deti hain. Apne saathi se dobara bhejne ko kahiye (ya "copy
          link" se bheja hua poora link istemal karein).
        </p>
      )}

      {received === "ok" && (
        <p className="reveal-late mt-5 rounded-lg border border-brass bg-brass-tint px-4 py-3 text-ink">
          {partner.from ? `${partner.from} ka` : "Aapke saathi ka"} aaina pahunch
          gaya hai — seal-band. {mineComplete
            ? "Aapka aaina bhi poora hai: neeche se milaan dekhiye."
            : "Woh tab khulega jab aap apna aaina poora kar lenge — pehle jawaab, phir milaan. Isi se dono taraf imaandaari bani rehti hai."}
        </p>
      )}

      <p className="reveal-late mt-5 max-w-prose leading-relaxed text-ink-soft">
        Dono apna-apna Aaina alag-alag, bina dekhe bharte hain. Phir ek link
        exchange hota hai — jisme sirf jawaab hote hain, compressed, kisi server
        ko chhue bina. Milaan ka report dikhata hai ki ek hi rishte ko do nazrein
        kahan ek jaisa dekhti hain, aur kahan bilkul alag. Suraksha-section kabhi
        exchange nahi hota. (Saaf baat: link encryption nahi, compression hai —
        app use pehle nahi kholta, par yeh vaada software ka hai, taale ka nahi.)
      </p>

      {!mineComplete ? (
        <div className="reveal-late mt-8">
          <Link
            to="/aaina"
            className="rounded-full bg-sindoor px-7 py-3.5 font-medium text-paper shadow-soft hover:bg-sindoor-deep"
          >
            Pehle apna Aaina poora karein
          </Link>
        </div>
      ) : (
        <div className="reveal-late mt-8 rounded-(--radius-card) border border-paper-edge bg-paper-deep p-6">
          <h2 className="font-display text-xl text-ink">Apna aaina bhejein</h2>
          <label className="mt-3 block text-sm text-ink-soft">
            Naam (optional — link mein sirf yeh naam aur aapke jawaab jaate hain)
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="e.g. Priya"
              className="mt-1 w-full rounded-lg border border-paper-edge bg-paper px-3 py-2 text-ink outline-none focus:border-sindoor"
            />
          </label>
          <button
            type="button"
            onClick={async () => {
              if (!shareLink) return;
              try {
                await navigator.clipboard.writeText(shareLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              } catch {
                window.prompt("Copy link:", shareLink);
              }
            }}
            className="mt-4 rounded-full bg-sindoor px-7 py-3 font-medium text-paper shadow-soft hover:bg-sindoor-deep"
          >
            {copied ? "Copy ho gaya ✓" : "Link copy karein"}
          </button>
          <p className="mt-2 text-xs text-ink-faint">
            Link lamba hai — WhatsApp par poora paste hua ya nahi, ek baar dekh lijiye.
          </p>
        </div>
      )}

      {partner.answers && mineComplete && (
        <div className="reveal-late mt-6">
          <Link
            to="/report"
            className="rounded-full bg-brass px-7 py-3.5 font-medium text-paper shadow-soft hover:bg-brass-deep"
          >
            Do aaine ka milaan dekhein
          </Link>
        </div>
      )}

      <Link to="/" className="reveal-late mt-8 text-sm text-ink-faint underline decoration-dotted underline-offset-4">
        ← Ghar wapas
      </Link>
    </main>
  );
}
