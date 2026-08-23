import { useEffect } from "react";

/** Quick-exit for the safety chapter (NNEDV pattern): one click or ESC swaps to
 *  an innocuous site and replaces this history entry. Shown with the honest
 *  limitation note — it does not erase history or defeat device monitoring. */

export function quickExit() {
  try {
    window.location.replace("https://www.google.com/search?q=aaj+ka+mausam");
  } catch {
    window.location.href = "https://www.google.com";
  }
}

export function QuickExit() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") quickExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <button
      type="button"
      onClick={quickExit}
      className="no-print fixed right-4 top-4 z-50 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper shadow-lift hover:bg-ink-soft"
      aria-label="Quick exit — leaves this page immediately (Escape key also works)"
    >
      Turant niklein (Esc)
    </button>
  );
}
