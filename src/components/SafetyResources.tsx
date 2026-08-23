/** Verified India helplines (research/lane6-safety.md, verified 2026-08-24).
 *  KIRAN deliberately excluded (discontinued, merged into Tele-MANAS).
 *  WHO LIVES register: validating, never judging. */

const HELPLINES = [
  { name: "Emergency (police/medical)", number: "112", note: "24x7, all India" },
  { name: "Women Helpline", number: "181", note: "24x7 — police, One Stop Centres, legal aid, shelter" },
  { name: "Tele-MANAS (Govt. mental health)", number: "14416", note: "24x7, free, 20 bhashayein" },
  { name: "Vandrevala Foundation", number: "9999666555", note: "24x7, call/WhatsApp — DV, abuse, distress" },
  { name: "iCall (TISS)", number: "9152987821", note: "Mon–Sat, 10am–8pm, professional counsellors" },
  { name: "AASRA", number: "+91-9820466726", note: "24x7, English/Hindi" },
  { name: "Shakti Shalini (Delhi, DV)", number: "011-24373737", note: "10am–6pm, sab genders" },
  { name: "NCW complaint line", number: "14490", note: "Formal complaints — DV, dowry, FIR refusal" },
  { name: "Men in family distress (SIF-One)", number: "8882-498-498", note: "Volunteer-run, all India" },
];

export function SafetyResources() {
  return (
    <section
      aria-label="Safety resources"
      className="rounded-(--radius-card) border-2 border-sindoor bg-sindoor-tint p-6"
    >
      <h2 className="font-display text-2xl font-normal text-sindoor-deep">
        Pehle sabse zaroori baat
      </h2>
      <p className="mt-2 max-w-prose leading-relaxed text-ink">
        Aapke jawaabon mein aisi baatein hain jo dar ya chot ki taraf ishara karti
        hain. <strong>Yeh aapki galti nahi hai, aur aap akele nahi hain.</strong>{" "}
        Jo ho raha hai woh theek nahi hai — aur madad maangna kamzori nahi,
        samajhdari hai.
      </p>
      <ul className="mt-4 space-y-2">
        {HELPLINES.map((h) => (
          <li key={h.number} className="flex flex-wrap items-baseline gap-x-3">
            <a
              href={`tel:${h.number.replace(/[^+\d]/g, "")}`}
              className="font-medium text-sindoor-deep underline underline-offset-4"
            >
              {h.number}
            </a>
            <span className="text-ink">{h.name}</span>
            <span className="text-sm text-ink-soft">{h.note}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-soft">
        Kanoon bhi aapke saath hai: Protection of Women from Domestic Violence Act
        (2005) civil suraksha deta hai — protection order, ghar mein rehne ka haq,
        maali madad — bina koi criminal case kiye, Protection Officer ya kisi NGO ke
        zariye. Yeh app kanooni salaah nahi deta; upar ki helplines aapko sahi
        raaste tak pahuncha sakti hain.
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        Agar aapka phone ya browser koi aur bhi dekhta hai, toh in numbers ko yaad
        ya kisi bharosemand dost ke paas rakhna zyada surakshit hai. Is section ke
        jawaab kahin save nahi hue hain.
      </p>
    </section>
  );
}
