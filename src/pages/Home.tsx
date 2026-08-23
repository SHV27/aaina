import { Link } from "react-router-dom";
import { ModeBadge } from "../components/ModeBadge";
import { useAnswersStore } from "../store/answers";

export function Home() {
  const storageBlocked = useAnswersStore((s) => s.storageBlocked);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="reveal font-devanagari text-2xl text-brass-deep">आईना</p>
      <h1 className="reveal mt-2 font-display text-5xl font-light leading-tight tracking-tight text-ink sm:text-6xl">
        Dekhiye jo <em className="font-normal not-italic text-sindoor">sach</em> hai.
      </h1>
      <p className="reveal-late mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
        Aaina ek honest mirror hai aapke rishte ke liye — bina horoscope, bina
        pakhand. Har baat published research se, har finding aapke apne jawaabon
        se. Free. Private. Aapka data aapke phone se bahar nahi jaata.
      </p>

      <div className="reveal-late mt-10 flex flex-wrap items-center gap-4">
        <Link
          to="/jhalak"
          className="rounded-full bg-sindoor px-7 py-3.5 font-medium text-paper shadow-soft transition-transform hover:scale-[1.02] hover:bg-sindoor-deep"
        >
          Ek jhalak dekhein — 2 minute
        </Link>
        <Link
          to="/aaina"
          className="rounded-full border border-paper-edge px-7 py-3.5 text-ink-soft transition-colors hover:border-sindoor hover:text-ink"
        >
          Poora Aaina — 5 chapters
        </Link>
        <span className="text-sm text-ink-faint">
          No signup · no judgement · India ke liye bana
        </span>
      </div>

      <div className="reveal-late mt-14">
        <ModeBadge mode={storageBlocked ? "storage-blocked" : "template"} />
      </div>
    </main>
  );
}
