import type { AnswerMap, Finding, Evidence, Scored, DimensionId, Context, Item } from './types'
import { DIM_BY_ID } from './dimensions'
import { ITEM_BY_ID, VALUE_OPTIONS } from '../items'
import { itemPomp, scaleFor } from './score'

/**
 * THE CONTRADICTION ENGINE — the product's thesis.
 *
 * A facilitator produces insight by remembering what you said an hour ago and holding it next to
 * what you just said. That mechanism — "the client's experience of discrepancy" — is one of the
 * few with consistent evidence (Miller & Rollnick 2013). Software remembers all 174 answers
 * perfectly. This is the one place where software does not approximate a facilitator; it beats one.
 *
 * Every finding here is non-transplantable BY CONSTRUCTION: it is a relationship between two
 * specific things THIS person did. No other user's report can contain it.
 *
 * MI's rule, obeyed throughout: **juxtapose, do not resolve.** We put the two things side by side
 * and stop. Resolving it for the reader is both worse therapy and, conveniently, the thing that
 * would have required us to write an imperative about their own decision.
 */

/* ────────────────────────────  evidence helpers  ──────────────────────────── */

export function itemEvidence(itemId: string, answers: AnswerMap): Evidence | null {
  const a = answers[itemId]
  const i = ITEM_BY_ID[itemId]
  if (!a || !i) return null
  return {
    id: `ev:item:${itemId}`,
    kind: 'item',
    label: labelFor(i),
    detail: renderAnswer(i, a.value),
    itemText: i.text,
    sources: i.sources,
  }
}

function labelFor(i: Item): string {
  return i.dimension ? DIM_BY_ID[i.dimension].label : 'Your situation'
}

export function renderAnswer(i: Item, value: number | string): string {
  if (typeof value === 'string') return `"${value.trim()}"`
  const scale = scaleFor(i)
  const idx = Math.round(value) - scale.min
  const label = scale.labels[idx] ?? String(value)
  return `You chose: ${label}`
}

export function dimensionEvidence(s: Scored): Evidence {
  const d = DIM_BY_ID[s.id]
  return {
    id: `ev:dim:${s.id}`,
    kind: 'dimension',
    label: d.label,
    detail: `${s.pomp}% — from ${s.answered} answer${s.answered === 1 ? '' : 's'}`,
    sources: d.sources,
  }
}

let seq = 0
const fid = (kind: string) => `f:${kind}:${(seq += 1)}`
export function resetFindingIds() {
  seq = 0
}

/* ────────────────────────────  detector 1: score–score discordance  ──────────────────────────── */

/**
 * Pairs that the literature says normally move together. When one is high and its partner is low,
 * that is a real tension in the person's own data — not a template.
 * `expect` is the direction of the published association, and the pair carries the citation that
 * justifies expecting it at all.
 */
const EXPECTED_PAIRS: {
  a: DimensionId
  b: DimensionId
  /** 'same' = normally rise together (after orienting), 'opposite' = normally trade off. */
  expect: 'same'
  sources: string[]
  /** Written when a is HIGH and b is LOW. */
  whenAHigh: (av: number, bv: number) => string
}[] = [
  {
    a: 'ownDedication', b: 'satisfaction', expect: 'same', sources: ['rusbult1998', 'le2010'],
    whenAHigh: (av, bv) => `You are ${av}% committed to this lasting, and ${bv}% satisfied with how it currently feels. Commitment and satisfaction usually travel together. Here they have separated, and that separation is the single most informative thing in your answers.`,
  },
  {
    a: 'ownDedication', b: 'partnerCommitment', expect: 'same', sources: ['joel2020', 'rusbult1998'],
    whenAHigh: (av, bv) => `You are holding this at ${av}%. Your read on how much they are holding it is ${bv}%. You are carrying a weight you have described as shared.`,
  },
  {
    a: 'trust', b: 'responsiveness', expect: 'same', sources: ['rempel1985', 'reis2004'],
    whenAHigh: (av, bv) => `You trust them at ${av}%, but you feel understood by them at only ${bv}%. You are relying on someone you do not feel seen by — which is a harder position than either number alone suggests.`,
  },
  {
    a: 'closeness', b: 'growth', expect: 'same', sources: ['aron1992', 'aron1986'],
    whenAHigh: (av, bv) => `Your lives are ${av}% merged, and you rate how much you are becoming who you want to be at ${bv}%. The self-expansion research treats those as the same engine. In your answers they have come apart.`,
  },
  {
    a: 'selfConceptClarity', b: 'valuesLived', expect: 'same', sources: ['campbell1996', 'schwartz2012'],
    whenAHigh: (av, bv) => `You see yourself clearly — ${av}% — but you are living by what you said you value at ${bv}%. Knowing and doing have separated. That is a different problem from confusion, and it needs a different answer.`,
  },
  {
    a: 'relatedness', b: 'lifeSatisfaction', expect: 'same', sources: ['ryan2000', 'diener1985'],
    whenAHigh: (av, bv) => `You have people — ${av}% — and life overall is at ${bv}%. Connection is usually the strongest protective factor there is. Something else is doing the damage.`,
  },
]

const DISCORD_GAP = 30

function discordance(scored: Scored[], answers: AnswerMap): Finding[] {
  const by = new Map(scored.map((s) => [s.id, s]))
  const out: Finding[] = []

  for (const pair of EXPECTED_PAIRS) {
    const A = by.get(pair.a)
    const B = by.get(pair.b)
    if (!A || !B || A.thin || B.thin) continue
    const av = DIM_BY_ID[A.id].higherIsBetter ? A.pomp : 100 - A.pomp
    const bv = DIM_BY_ID[B.id].higherIsBetter ? B.pomp : 100 - B.pomp
    const gap = av - bv
    if (gap < DISCORD_GAP) continue

    const evidence = [
      dimensionEvidence(A),
      dimensionEvidence(B),
      ...[...A.itemIds.slice(0, 2), ...B.itemIds.slice(0, 2)]
        .map((iid) => itemEvidence(iid, answers))
        .filter((e): e is Evidence => e !== null),
    ]

    out.push({
      id: fid('discord'),
      kind: 'contradiction',
      statement: pair.whenAHigh(A.pomp, B.pomp),
      notability: Math.min(1, gap / 60),
      baseRate: 0.18,
      finnLevel: 3,
      evidence,
      sources: pair.sources,
      dimensions: [pair.a, pair.b],
      accepted: true,
    })
  }
  return out
}

/* ────────────────────────────  detector 2: item–scale residual  ──────────────────────────── */

/**
 * One answer that sits far away from the rest of its own dimension. The person agreed with
 * everything about trust except one thing — and that one thing is usually where the story is.
 */
function residuals(scored: Scored[], answers: AnswerMap): Finding[] {
  const out: Finding[] = []
  for (const s of scored) {
    if (s.answered < 4) continue
    const pomps = s.itemIds.map((iid) => ({ iid, p: itemPomp(iid, answers[iid]!.value as number) }))
    const mean = pomps.reduce((a, b) => a + b.p, 0) / pomps.length
    const sd = Math.sqrt(pomps.reduce((a, b) => a + (b.p - mean) ** 2, 0) / pomps.length)
    if (sd < 12) continue
    const odd = pomps.reduce((a, b) => (Math.abs(b.p - mean) > Math.abs(a.p - mean) ? b : a))
    if (Math.abs(odd.p - mean) < 2 * sd || Math.abs(odd.p - mean) < 30) continue

    const i = ITEM_BY_ID[odd.iid]!
    const d = DIM_BY_ID[s.id]
    const ev = itemEvidence(odd.iid, answers)
    if (!ev) continue

    out.push({
      id: fid('residual'),
      kind: 'contradiction',
      /* The answer itself is in the sentence, not only in the receipts. Without it, two different
         people whose outlier happened to be the same question were handed the same paragraph
         word for word — which is the failure this whole engine exists to make impossible. */
      statement:
        `Across everything you said about ${d.label.toLowerCase()} — ${s.answered} answers, averaging ${Math.round(mean)}% — you were consistent, except once. ` +
        `To "${i.text}" you answered ${renderAnswer(i, answers[odd.iid]!.value as number).replace('You chose: ', '').toLowerCase()}, which puts it at ${Math.round(odd.p)}%: ${Math.round(Math.abs(odd.p - mean))} points away from the rest of you. ` +
        `It is the only place in everything you said about that where you broke your own pattern, and an outlier that size is usually about one specific thing rather than about the whole of it.`,
      notability: Math.min(1, Math.abs(odd.p - mean) / 60),
      baseRate: 0.12,
      finnLevel: 2,
      evidence: [ev, dimensionEvidence(s)],
      sources: i.sources,
      dimensions: [s.id],
      accepted: true,
    })
  }
  return out
}

/* ────────────────────────────  detector 3: attitude vs frequency  ──────────────────────────── */

/**
 * The sharpest kind: a stated position colliding with a reported behaviour.
 * "I am clear I want to be in this" next to "I think about ending it, often."
 */
/**
 * Each rule states which END of each item's own scale it needs, explicitly.
 *
 * This used to be implicit — "both items point the good way after reversal, so a real collision is
 * high-vs-low" — and that is not true. `itemPomp` points along the item's DIMENSION, and a
 * dimension is not always oriented toward the good end: Ambivalence and Constraint both score
 * high for the thing you do not want. So two rules fired on answers that agreed with each other,
 * and the most committed person in the fixture set was told that wanting it to last and never
 * thinking of ending it were "a 100-point split inside a single person's answers".
 *
 * Presenting agreement as contradiction is worse than saying nothing. It is the report's "aha",
 * the reader knows their own answers, and getting it wrong there costs every other claim on the
 * page. So the direction is now written down per rule and tested against the sentence it prints.
 *
 * 'high' and 'low' are on the item's own construct scale, after `itemPomp` has applied reversal.
 */
const ATTITUDE_BEHAVIOUR: {
  attitude: string
  behaviour: string
  needAttitude: 'high' | 'low'
  needBehaviour: 'high' | 'low'
  write: (a: string, b: string) => string
  sources: string[]
}[] = [
  {
    attitude: 'ded_1', behaviour: 'amb_1', needAttitude: 'high', needBehaviour: 'high',
    write: (a, b) => `You said you want this to last — ${a.toLowerCase()}. On how often you think about ending it, you said ${b.toLowerCase()}. Both of those are your answers, given minutes apart. Most people never see the two of them in the same place.`,
    sources: ['joel2018', 'miller2013'],
  },
  {
    attitude: 'amb_3', behaviour: 'amb_2', needAttitude: 'low', needBehaviour: 'high',
    write: (a, b) => `You said you are clear you want to be in this — ${a.toLowerCase()} — and separately, that you have imagined life without them and felt relief: ${b.toLowerCase()}. Relief is not the same as wanting out. It is information about load, not about love.`,
    sources: ['joel2018'],
  },
  {
    attitude: 'tru_1', behaviour: 'tru_2', needAttitude: 'high', needBehaviour: 'low',
    write: (a, b) => `On being able to predict them you answered ${a.toLowerCase()}. On checking up on them in ways you would not want them to know about, you answered ${b.toLowerCase()}. Checking is what we do when a part of us has already stopped predicting.`,
    sources: ['rempel1985'],
  },
  {
    attitude: 'cons_4', behaviour: 'sat_1', needAttitude: 'high', needBehaviour: 'low',
    write: (a, b) => `You said staying is what loyalty means — ${a.toLowerCase()}. On whether being in this currently feels good, you said ${b.toLowerCase()}. You are running a definition of love that does not require the relationship to feel good, and you have never had to say that out loud before.`,
    sources: ['kegan2009', 'rusbult1995'],
  },
  {
    attitude: 'alt_1', behaviour: 'alt_4', needAttitude: 'high', needBehaviour: 'low',
    write: (a, b) => `You said that if this ended you would be okay eventually — ${a.toLowerCase()}. You also said the idea of being single frightens you more than staying unhappy: ${b.toLowerCase()}. The first is what you believe about yourself. The second is what is actually deciding.`,
    sources: ['rusbult1995', 'rusbult1998'],
  },
  {
    attitude: 'cbs_4', behaviour: 'cbs_5', needAttitude: 'high', needBehaviour: 'low',
    write: (a, b) => `You said you are allowed to take up space — ${a.toLowerCase()}. You also said your needs come after everyone else's and that is just how it is: ${b.toLowerCase()}. The first is the belief you hold. The second is the rule you run.`,
    sources: ['kegan2009', 'ryan2000'],
  },
  {
    attitude: 'sco_1', behaviour: 'sco_2', needAttitude: 'high', needBehaviour: 'low',
    write: (a, b) => `On talking to yourself the way you would talk to a friend, you said ${a.toLowerCase()}. On being harder on yourself than anyone else is, you said ${b.toLowerCase()}. Those two cannot both be the operating rule.`,
    sources: ['neff2003'],
  },
]

const HIGH = 66
const LOW = 34

/** Exported for the test that checks each rule only fires when its own sentence is true. */
export const ATTITUDE_BEHAVIOUR_RULES = ATTITUDE_BEHAVIOUR

function attitudeBehaviour(answers: AnswerMap): Finding[] {
  const out: Finding[] = []
  for (const rule of ATTITUDE_BEHAVIOUR) {
    const a = answers[rule.attitude]
    const b = answers[rule.behaviour]
    if (!a || !b || typeof a.value !== 'number' || typeof b.value !== 'number') continue
    const ap = itemPomp(rule.attitude, a.value)
    const bp = itemPomp(rule.behaviour, b.value)
    const meets = (v: number, need: 'high' | 'low') => (need === 'high' ? v >= HIGH : v <= LOW)
    if (!meets(ap, rule.needAttitude) || !meets(bp, rule.needBehaviour)) continue

    /* How hard each of the two was endorsed, in the direction the rule needs.
       The old number was the raw distance between two POMP scores, which for a pair whose
       dimensions run in opposite directions was a measure of how much they AGREED. What makes a
       collision notable is that both sides are held firmly — so that is what gets reported. */
    const aStrength = Math.round(rule.needAttitude === 'high' ? ap : 100 - ap)
    const bStrength = Math.round(rule.needBehaviour === 'high' ? bp : 100 - bp)
    const held = Math.min(aStrength, bStrength)

    const ia = ITEM_BY_ID[rule.attitude]!
    const ib = ITEM_BY_ID[rule.behaviour]!
    const ea = itemEvidence(rule.attitude, answers)
    const eb = itemEvidence(rule.behaviour, answers)
    if (!ea || !eb) continue

    out.push({
      id: fid('attbeh'),
      kind: 'contradiction',
      statement:
        rule.write(renderAnswer(ia, a.value).replace('You chose: ', ''), renderAnswer(ib, b.value).replace('You chose: ', '')) +
        ` You held the first at ${aStrength}% and the second at ${bStrength}%, minutes apart, in the same sitting. Neither was a shrug.`,
      notability: Math.min(1, held / 100),
      baseRate: 0.14,
      finnLevel: 3,
      evidence: [ea, eb],
      sources: rule.sources,
      dimensions: [ia.dimension, ib.dimension].filter((d): d is DimensionId => d !== null),
      accepted: true,
    })
  }
  return out
}

/* ────────────────────────────  detector 4: value vs allocation  ──────────────────────────── */

function valueGap(answers: AnswerMap): Finding[] {
  const pick = answers['val_pick']
  const alloc = answers['val_alloc']
  if (!pick || !alloc || typeof alloc.value !== 'number') return []
  const share = alloc.value // 0–100, how much of a week actually goes there
  if (share > 35) return []

  /* The stored value is a key like "selfDirection". Rendering that straight into a sentence put
     raw camelCase in front of a reader — caught by reading the gate's own output. */
  const chosenKey = String(pick.value).split(',')[0] ?? ''
  const chosen = (VALUE_OPTIONS.find((v) => v.value === chosenKey)?.label ?? 'that value').toLowerCase()
  const written = answers['val_write']
  const story = written && typeof written.value === 'string' && written.value.trim().length > 20
    ? span(written.value, 170)
    : null
  const ev: Evidence[] = [
    {
      id: 'ev:item:val_pick',
      kind: 'item',
      label: 'What you said matters most',
      detail: String(pick.value).split(',').join(', '),
      itemText: ITEM_BY_ID['val_pick']!.text,
      sources: ['schwartz2012'],
    },
    {
      id: 'ev:item:val_alloc',
      kind: 'item',
      label: 'How much of your week goes there',
      detail: `${share}%`,
      itemText: ITEM_BY_ID['val_alloc']!.text,
      sources: ['miller2013'],
    },
  ]
  const write = answers['val_write']
  if (write && typeof write.value === 'string' && write.value.trim().length > 20) {
    ev.push({
      id: 'ev:quote:val_write',
      kind: 'quote',
      label: 'In your own words',
      detail: `"${write.value.trim()}"`,
      sources: ['steele1988'],
    })
  }

  return [{
    id: fid('valuegap'),
    kind: 'contradiction',
    statement: story
      ? `Out of ten values you picked “${chosen}” as the one that matters most to you, and the time you acted on it when it cost you was this: “${story}” Then you said about ${share}% of a normal week actually goes there. That distance is not hypocrisy and it is not a character flaw — it is the most common shape of a stuck life, and unlike a feeling it is measurable, which is what makes it addressable.`
      : `Out of ten values you picked “${chosen}” as the one that matters most to you, and then said about ${share}% of a normal week actually goes there. That distance is not hypocrisy and it is not a character flaw — it is the most common shape of a stuck life, and unlike a feeling it is measurable, which is what makes it addressable.`,
    notability: Math.min(1, (40 - share) / 40),
    baseRate: 0.3,
    finnLevel: 2,
    evidence: ev,
    sources: ['schwartz2012', 'miller2013', 'steele1988'],
    dimensions: ['valuesLived'],
    accepted: true,
  }]
}

/* ────────────────────────────  detector 5: the prediction gap  ──────────────────────────── */

/**
 * We ask the user to predict their partner's answer BEFORE giving their own. The gap between
 * the two is intrinsically a two-person fact — and it works in solo mode, which is the point.
 */
function predictionGaps(answers: AnswerMap): Finding[] {
  const out: Finding[] = []
  for (const i of Object.values(ITEM_BY_ID)) {
    if (i.format !== 'predict' || !i.predicts) continue
    const pred = answers[i.id]
    const own = answers[i.predicts]
    if (!pred || !own || typeof pred.value !== 'number' || typeof own.value !== 'number') continue

    const target = ITEM_BY_ID[i.predicts]!
    const predP = itemPomp(i.predicts, pred.value)
    const ownP = itemPomp(i.predicts, own.value)
    const gap = Math.abs(predP - ownP)
    if (gap < 25) continue

    const higherForThem = predP > ownP
    const evPred = { ...itemEvidence(i.id, answers)!, label: 'What you guessed they would say' }
    const evOwn = itemEvidence(i.predicts, answers)
    if (!evOwn) continue

    /* The exact words they picked, on both sides, go into the sentence. Without them this was
       byte-identical for any two people who answered the same item in the same direction — which
       the anti-generic gate caught by finding the same paragraph in two different reports. */
    const guessLabel = renderAnswer(target, pred.value).replace('You chose: ', '')
    const ownLabel = renderAnswer(target, own.value).replace('You chose: ', '')

    out.push({
      id: fid('predgap'),
      kind: 'predictionGap',
      statement: higherForThem
        ? `Before answering for yourself, you guessed they would say "${guessLabel.toLowerCase()}" to "${target.text}" — and then you answered "${ownLabel.toLowerCase()}" yourself, ${Math.round(gap)} points below your own guess about them. You are working on the belief that this relationship is going better for them than it is for you. Whether or not that is accurate, it is doing a great deal of quiet work in how you behave towards them.`
        : `You guessed they would say "${guessLabel.toLowerCase()}" to "${target.text}", and then answered "${ownLabel.toLowerCase()}" for yourself — ${Math.round(gap)} points above the guess you made about them. You are carrying an assumption that they are doing worse in this than you are, and people who believe that tend to start managing the other person instead of talking to them.`,
      notability: Math.min(1, gap / 50),
      baseRate: 0.2,
      finnLevel: 3,
      evidence: [evPred, evOwn],
      sources: i.sources,
      dimensions: target.dimension ? [target.dimension] : [],
      accepted: true,
    })
  }
  return out
}

/* ────────────────────────────  detector 6: process telemetry  ──────────────────────────── */

/**
 * How they answered, not what. Latency, revisions, skips.
 * Unfakeable, free, and untransplantable by construction — no other user changed THAT answer
 * THAT many times. Lane H called this the most under-exploited evidence source in the product,
 * and no reference product collects it at all.
 */
function telemetry(answers: AnswerMap, skipped: string[]): Finding[] {
  const out: Finding[] = []
  const all = Object.values(answers)
  if (all.length < 10) return out

  /* the most-revised answer, when it is a genuine outlier */
  const revised = all.filter((a) => a.revisions > 0).sort((x, y) => y.revisions - x.revisions)
  const top = revised[0]
  if (top && top.revisions >= 2) {
    const others = revised.filter((a) => a.itemId !== top.itemId && a.revisions >= top.revisions).length
    const i = ITEM_BY_ID[top.itemId]
    const ev = itemEvidence(top.itemId, answers)
    if (i && ev && others === 0) {
      out.push({
        id: fid('tel-revise'),
        kind: 'telemetry',
        statement: `You changed your answer to "${i.text}" ${top.revisions} times — more than any other question in the whole assessment. Whatever you first put down, you did not let it stand. That is not indecision; it is the place where the honest answer cost you something to give.`,
        notability: Math.min(1, top.revisions / 4),
        baseRate: 0.05,
        finnLevel: 3,
        evidence: [ev, { id: `ev:tel:${top.itemId}:rev`, kind: 'telemetry', label: 'Times you changed this answer', detail: `${top.revisions} — the most of any question you answered`, sources: [] }],
        sources: i.sources,
        dimensions: i.dimension ? [i.dimension] : [],
        accepted: true,
      })
    }
  }

  /* the longest pause, when it is a genuine outlier */
  const timed = all.filter((a) => a.dwellMs > 0)
  if (timed.length >= 10) {
    const times = timed.map((a) => a.dwellMs).sort((a, b) => a - b)
    const median = times[Math.floor(times.length / 2)]!
    const slowest = timed.reduce((a, b) => (b.dwellMs > a.dwellMs ? b : a))
    if (median > 0 && slowest.dwellMs > median * 4 && slowest.dwellMs > 20_000) {
      const i = ITEM_BY_ID[slowest.itemId]
      const ev = itemEvidence(slowest.itemId, answers)
      if (i && ev) {
        out.push({
          id: fid('tel-dwell'),
          kind: 'telemetry',
          statement: `You sat with "${i.text}" for ${Math.round(slowest.dwellMs / 1000)} seconds — about ${Math.round(slowest.dwellMs / median)} times longer than you spent on a typical question. You already knew this one was going to matter.`,
          notability: Math.min(1, slowest.dwellMs / median / 10),
          baseRate: 0.06,
          finnLevel: 2,
          evidence: [ev, { id: `ev:tel:${slowest.itemId}:dwell`, kind: 'telemetry', label: 'Time before you committed to an answer', detail: `${Math.round(slowest.dwellMs / 1000)}s, against a typical ${Math.round(median / 1000)}s`, sources: [] }],
          sources: i.sources,
          dimensions: i.dimension ? [i.dimension] : [],
          accepted: true,
        })
      }
    }
  }

  /* a meaningful skip cluster */
  const skippedWithDim = skipped.map((id) => ITEM_BY_ID[id]).filter((i): i is Item => !!i && !!i.dimension)
  if (skippedWithDim.length >= 3) {
    const counts = new Map<DimensionId, number>()
    for (const i of skippedWithDim) counts.set(i.dimension!, (counts.get(i.dimension!) ?? 0) + 1)
    const [worstDim, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!
    if (n >= 2) {
      const d = DIM_BY_ID[worstDim]
      out.push({
        id: fid('tel-skip'),
        kind: 'telemetry',
        statement: `You skipped ${n} questions, and ${n === skippedWithDim.length ? 'all of them' : 'most of them'} were about ${d.label.toLowerCase()}. We have left that out of your scores rather than guessing. It is worth noticing which section you walked around.`,
        notability: Math.min(1, n / 5),
        baseRate: 0.08,
        finnLevel: 2,
        evidence: [{ id: `ev:tel:skip:${worstDim}`, kind: 'telemetry', label: 'Questions you chose to skip', detail: `${n} of them, in "${d.label}"`, sources: d.sources }],
        sources: d.sources,
        dimensions: [worstDim],
        accepted: true,
      })
    }
  }

  return out
}

/* ────────────────────────────  detector 7: free text vs score  ──────────────────────────── */

/**
 * What they WROTE against what they RATED. The self-distanced friend answer is the highest-value
 * one: Solomon's paradox says people reason more wisely about others' problems than their own, and
 * self-distancing eliminates the gap (Grossmann & Kross 2014). So when someone writes advice to a
 * friend in their exact situation, they have usually already said the thing.
 */
/**
 * Pull a short, quotable span out of something the user wrote. Used to put their OWN WORDS inside
 * the finding's statement — not merely in its evidence.
 *
 * This exists because the Referee caught the defect on its first run: two findings here had
 * statements that were byte-identical across different people, with only the attached evidence
 * differing. The statement is the text that ships when the writer is unavailable, so an identical
 * statement is an identical paragraph in two people's reports. That is precisely the failure the
 * whole product is built against, and a generic sentence does not stop being generic because
 * there is a citation underneath it.
 */
const WHITESPACE_RUN = /\s+/g
const TRAILING_PARTIAL_WORD = /\s\S*$/

function span(text: string, max = 150): string {
  const clean = text.trim().replace(WHITESPACE_RUN, ' ')
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(', '), cut.lastIndexOf(' — '))
  return (lastStop > max * 0.5 ? cut.slice(0, lastStop) : cut.replace(TRAILING_PARTIAL_WORD, '')) + '…'
}

function textVsScore(answers: AnswerMap, scored: Scored[]): Finding[] {
  const out: Finding[] = []
  const friend = answers['txt_friend']
  if (friend && typeof friend.value === 'string' && friend.value.trim().length > 30) {
    const amb = scored.find((s) => s.id === 'ambivalence')
    const ded = scored.find((s) => s.id === 'ownDedication')
    const quoted = span(friend.value)
    /* The clause after the quote is built from their own numbers, so two people who write
       different advice do not receive the same paragraph with the quotation swapped. */
    const contrast = ded && amb && !ded.thin && !amb.thin
      ? ` You said that to an imagined friend while rating your own commitment at ${ded.pomp}% and your own doubt at ${amb.pomp}%.`
      : ded && !ded.thin
        ? ` You said that to an imagined friend while rating your own commitment at ${ded.pomp}%.`
        : ''
    out.push({
      id: fid('selfdistance'),
      kind: 'quote',
      statement: `Asked what you would tell your closest friend in exactly your situation, you wrote: "${quoted}"${contrast} People reason more wisely about a friend's problem than their own, and the gap closes the moment they step outside it. You have already stepped outside it once, in writing.`,
      notability: 0.9,
      baseRate: 0.04,
      finnLevel: 3,
      evidence: [
        { id: 'ev:quote:txt_friend', kind: 'quote', label: 'What you would tell a friend in your situation', detail: `"${friend.value.trim()}"`, sources: ['grossmann2014', 'kross2014'] },
        ...(amb ? [dimensionEvidence(amb)] : []),
        ...(ded ? [dimensionEvidence(ded)] : []),
      ],
      sources: ['grossmann2014', 'kross2014'],
      dimensions: ['ambivalence', 'ownDedication'],
      accepted: true,
    })
  }

  const fear = answers['txt_fear']
  if (fear && typeof fear.value === 'string' && fear.value.trim().length > 15) {
    const quoted = span(fear.value)
    /* The frame around the quote is tied to whichever of their own scores speaks to it, so two
       people writing different fears do not receive the same paragraph with the words swapped.
       Caught by the gate at 84% overlap when this was a fixed sentence. */
    const lowest = [...scored].filter((s) => !s.thin).sort((a, b) => a.pomp - b.pomp)[0]
    const nearest = lowest
      ? ` A fear written as one specific sentence stops being weather and becomes something that can be checked. This one is checkable against ${DIM_BY_ID[lowest.id].label.toLowerCase()}, which you put at ${lowest.pomp}% — the lowest single number anywhere in your answers.`
      : ' A fear written as one specific sentence stops being weather and becomes something that can be checked.'
    out.push({
      id: fid('fear'),
      kind: 'quote',
      statement: `Asked what you are most afraid is true here, you wrote: "${quoted}"${nearest}`,
      notability: 0.75,
      baseRate: 0.1,
      finnLevel: 3,
      evidence: [{ id: 'ev:quote:txt_fear', kind: 'quote', label: 'What you are most afraid is true', detail: `"${fear.value.trim()}"`, sources: ['kegan2009'] }],
      sources: ['kegan2009', 'miller2013'],
      dimensions: [],
      accepted: true,
    })
  }

  return out
}

/* ────────────────────────────  the engine  ──────────────────────────── */

export function findContradictions(
  answers: AnswerMap,
  scored: Scored[],
  skipped: string[],
  _ctx: Context,
): Finding[] {
  return [
    ...attitudeBehaviour(answers),
    ...discordance(scored, answers),
    ...predictionGaps(answers),
    ...textVsScore(answers, scored),
    ...residuals(scored, answers),
    ...valueGap(answers),
    ...telemetry(answers, skipped),
  ]
}

export const DETECTOR_COUNT = 7
