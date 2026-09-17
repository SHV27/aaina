/** Emits the localStorage payload for a fixture persona, so a browser can be dropped straight
 *  into a completed assessment. Test scaffolding only — never shipped. */
import { arjun, priya, rohit, aarti } from '../src/engine/fixtures'

const which = process.argv[2] ?? 'arjun'
const pick = { arjun, priya, rohit, aarti }[which] ?? arjun
const input = pick()

const payload = {
  state: {
    context: input.context,
    answers: input.answers,
    skipped: input.skipped,
    startedAt: input.startedAt || Date.now() - 2_700_000,
    finishedAt: Date.now(),
    chapterDone: ['jhalak', 'ground', 'story', 'you', 'between', 'holding', 'patterns', 'future', 'safety'],
    jhalakDone: true,
    understood: true,
  },
  version: 3,
}
process.stdout.write(JSON.stringify(payload))
