/** Emits the localStorage payload for a fixture persona, so a browser can be dropped straight
 *  into a completed assessment. Test scaffolding only — never shipped. */
import { arjun, priya, rohit, aarti, meera } from '../src/engine/fixtures'

const which = process.argv[2] ?? 'arjun'
const pick = { arjun, priya, rohit, aarti, meera }[which] ?? arjun
const input = pick()

const payload = {
  state: {
    context: input.context,
    answers: input.answers,
    skipped: input.skipped,
    startedAt: input.startedAt || Date.now() - 2_700_000,
    finishedAt: Date.now(),
    chapterDone: ['jhalak', 'ground', 'story', 'concern', 'you', 'between', 'holding', 'patterns', 'future', 'safety'],
    jhalakDone: true,
    understood: true,
  },
  // Must track the persisted store's version, or every seeded run exercises the migration
  // path instead of the current one.
  version: 4,
}
process.stdout.write(JSON.stringify(payload))
