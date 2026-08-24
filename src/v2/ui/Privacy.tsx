import { Link } from "react-router-dom";

/** The honest disclosure. v1 claimed answers never left the device; that is no
 *  longer true, and saying so plainly is not optional. */

export function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="rise font-display text-4xl font-light text-ink">
        What happens to your answers
      </h1>

      <div className="prose-aaina rise-2 mt-6">
        <p>
          Written plainly, because you are about to tell this thing something private.
        </p>

        <h2 className="mt-8 font-display text-xl text-ink">Your answers stay on your device</h2>
        <p>
          Every answer is saved in your own browser so you can stop and come back. There is
          no account, no login, and no database with your name in it. Clearing your browser
          data deletes everything.
        </p>

        <h2 className="mt-8 font-display text-xl text-ink">
          To write your report, some of it is sent to an AI service
        </h2>
        <p>
          The writing is done by a language model run by <strong>Groq</strong>. What gets
          sent is your dimension scores, the tensions found between your answers, and a
          small number of your own answers quoted word for word so the report can quote
          them back to you. It is sent without your name, your email, or anything that
          identifies you — because Aaina never asks for those in the first place.
        </p>
        <p>
          Groq's stated policy is that they do not train models on data sent through their
          API and do not retain it by default. That policy is theirs, not ours, and you are
          entitled to weigh it. It is the reason Groq was chosen over free alternatives
          whose terms allow training on what users send.
        </p>

        <h2 className="mt-8 font-display text-xl text-ink">
          The safety section is never sent anywhere
        </h2>
        <p>
          The eight questions about tension, fear and harm are handled differently from
          everything else. They are held in memory while the page is open, and they are
          never saved to your device, never sent to any server including the AI service,
          and never printed into your report. They are used once, on your own device, to
          decide what your plan should not contain. Closing the tab erases them.
        </p>

        <h2 className="mt-8 font-display text-xl text-ink">What Aaina does not do</h2>
        <p>
          No advertising, no analytics on your responses, no selling anything, no sharing
          with anyone. The plan you tick off is stored only in your browser. If you print
          the report, that copy is yours alone.
        </p>

        <h2 className="mt-8 font-display text-xl text-ink">If you are on a shared device</h2>
        <p>
          Anyone with access to this browser could open the report or see the saved
          progress. A private or incognito window avoids that, at the cost of losing your
          progress when you close it. If you are worried about someone seeing this, that
          trade is usually worth making.
        </p>
      </div>

      <p className="mt-10 text-sm text-ink-3">
        <Link to="/" className="underline underline-offset-4 hover:text-ink-2">
          Back
        </Link>
        {" · "}
        <Link to="/science" className="underline underline-offset-4 hover:text-ink-2">
          The research behind the questions
        </Link>
      </p>
    </main>
  );
}
