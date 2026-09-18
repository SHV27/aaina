import type { EvidencePacket, SectionPlan, ReportSection, Paragraph } from '../engine/types'
import { DIM_BY_ID, bandLabel } from '../engine/dimensions'
import { SHAPE_COPY, SELF_SHAPE_COPY, selfShapeOf } from '../engine/axes'
import { compositeOf } from '../engine/derive'
import { PRACTICE_BY_ID, markerSentence } from '../engine/practices'

/**
 * THE DETERMINISTIC REPORT.
 *
 * This is not a placeholder and it is not a "template mode". The founder was explicit that a
 * keyless template product is not what he wants — and this is not that. Every number, every
 * contradiction, every quote, and the verdict itself are computed in TypeScript; the writer's job
 * is to make them read like a person wrote them. So when the writer is at capacity, what the
 * reader loses is prose, not analysis.
 *
 * It has to be genuinely good on its own, because on a bad free-tier day it IS the report.
 * LAW 7 — whenever it is used, the UI says so, in those words.
 */

/** A paragraph break, as a constant rather than an escape. See couple.ts for why. */
const BREAK = String.fromCharCode(10)

let n = 0
const pid = () => `p:det:${(n += 1)}`
export function resetFallbackIds() { n = 0 }

function para(text: string, evidenceIds: string[], findingId: string | null = null): Paragraph {
  return { id: pid(), text, evidenceIds, findingId }
}

/** The reading for this reader, in the right register for the door they came through. */
function readingFor(packet: EvidencePacket) {
  return packet.context.lens === 'relationship'
    ? SHAPE_COPY[packet.axes.shape]
    : SELF_SHAPE_COPY[selfShapeOf(packet.dimensions)]
}

export function fallbackSection(plan: SectionPlan, packet: EvidencePacket): ReportSection {
  // What comes next, by name. Different readers get different sections, so this is theirs.
  const nextSection = packet.plan[packet.plan.findIndex((x) => x.id === plan.id) + 1]
  const findings = plan.findingIds
    .map((id) => packet.findings.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => !!f)

  const paragraphs: Paragraph[] = []

  /* sections that are argument rather than evidence get purpose-written deterministic prose */
  switch (plan.id) {
    case 'opening': {
      /* If the concern finding is rendering below, it already quotes them at length — quoting
         them again three lines above it reads as a stutter, which is what it looked like on the
         page: the same sentence twice, in two consecutive paragraphs. */
      const concernRenders = findings.some((f) => f.id.startsWith('f:con:'))
      if (concernRenders) {
        paragraphs.push(para(
          `Everything below is built from the ${countAnswers(packet)} answers you gave, and from nothing else. Where a sentence makes a claim, the answers behind it are attached to it and you can open them.`,
          packet.dimensions.slice(0, 1).map((d) => `ev:dim:${d.id}`),
        ))
        break
      }
      const why = packet.quotes.find((q) => q.id === 'ev:quote:txt_why')
      if (why) {
        paragraphs.push(para(
          `You were asked what made you open this today, and you wrote: ${why.detail} Everything below is built from that and from the ${countAnswers(packet)} answers you gave afterwards. Nothing in it comes from anywhere else.`,
          [why.id],
        ))
      } else {
        paragraphs.push(para(
          `Everything below is built from the ${countAnswers(packet)} answers you gave, and from nothing else. Where a sentence makes a claim, the answers behind it are attached to it and you can open them.`,
          packet.dimensions.slice(0, 1).map((d) => `ev:dim:${d.id}`),
        ))
      }
      break
    }

    case 'basis': {
      const scored = packet.dimensions.filter((d) => !d.thin)
      const comp = compositeOf(packet)
      paragraphs.push(para(
        `This rests on ${countAnswers(packet)} answers across ${scored.length} measured dimensions. ` +
        `Each dimension is scored as a percentage of the maximum possible — literally how far up the scale you answered — so the number is a restatement of what you did rather than a comparison against strangers. ` +
        `${packet.context.lens === 'relationship' ? 'The overall figure weights those dimensions by how strongly published research ties each one to relationship outcomes' : 'Nothing here is compared against other people — every number is read within your own profile, because what is interesting about a self-portrait is which parts of it stand out against the rest of it'}, and ${comp.excluded.length > 0 ? `${comp.excluded.length} dimension${comp.excluded.length === 1 ? '' : 's'} you left thin ${comp.excluded.length === 1 ? 'was' : 'were'} kept out rather than guessed at` : 'nothing was excluded'}.`,
        scored.slice(0, 3).map((d) => `ev:dim:${d.id}`),
      ))
      break
    }

    /* The SPIKES warning shot. Its whole job is to say what KIND of hard is coming, which means
       it cannot be the same paragraph for a person about to read a contradiction between two of
       their own answers and a person about to read what their family expects of them. */
    case 'turn': {
      const next = packet.findings.find((f) => f.accepted && f.finnLevel === 3) ?? packet.findings[0]
      const kind = !next
        ? 'it will ask you to look at your own answers together rather than one at a time'
        : next.kind === 'contradiction' || next.kind === 'configural'
          ? 'it puts two things you said next to each other, minutes apart, and lets them disagree'
          : next.kind === 'partnerGap'
            ? 'it puts what you said beside what they said, and neither version gets to be the correct one'
            : next.kind === 'telemetry'
              ? 'it is about how you answered rather than what you answered, which is a stranger thing to read about yourself than it sounds'
              : next.kind === 'exception'
                ? 'it points at one answer of yours that does not fit the rest, which is harder to look at than a weakness'
                : 'it names something your own answers point at that you have not said out loud'

      paragraphs.push(para(
        `The next part — ${nextSection ? `"${nextSection.title}"` : 'what follows'} — is harder than what you have just read, and it is worth knowing which kind of hard: ${kind}. ` +
        `There is nothing in it you did not already tell us, and none of it is a judgement about you. Take it slowly, and it is a real option to stop here — what you have read so far does not stop being true if you do.`,
        next?.evidence[0] ? [next.evidence[0].id] : packet.dimensions.slice(0, 1).map((d) => `ev:dim:${d.id}`),
      ))
      break
    }

    case 'standing': {
      const comp = compositeOf(packet)
      const shape = readingFor(packet)
      paragraphs.push(para(
        `${shape.title}. ${shape.lead}`,
        packet.dimensions.slice(0, 2).map((d) => `ev:dim:${d.id}`),
      ))
      if (packet.context.lens === 'relationship') {
        paragraphs.push(para(
          `In numbers: quality ${packet.axes.quality}%, pull ${packet.axes.pull}%, hold ${packet.axes.hold}%. ` +
          `Pull is what draws you toward this person. Hold is what would make leaving hard regardless of how it feels. ` +
          `Those two are deliberately measured apart, because research on why people stay found that what predicted staying was investment and a lack of alternatives rather than satisfaction.`,
          comp.contributions.slice(0, 4).map((c) => `ev:dim:${c.id}`),
        ))
      }
      for (const d of packet.dimensions.filter((x) => !x.thin).slice(0, 8)) {
        paragraphs.push(para(
          `${DIM_BY_ID[d.id].label}: ${d.pomp}% — ${bandLabel(d.id, d.pomp)}. ${DIM_BY_ID[d.id].meaning}`,
          [`ev:dim:${d.id}`],
        ))
      }
      break
    }

    /* Three paths, costed in this person's own numbers.
       Written generically this was the same five sentences for everybody, which is the worst
       place in the report for that: it is the section a person deciding something rereads. */
    case 'paths': {
      const worn = [...packet.dimensions]
        .filter((d) => !d.thin)
        .map((d) => ({ d, oriented: DIM_BY_ID[d.id].higherIsBetter ? d.pomp : 100 - d.pomp }))
        .sort((x, y) => x.oriented - y.oriented)[0]
      const held = packet.dimensions.find((d) => d.id === 'constraint' && !d.thin)
      const alt = packet.dimensions.find((d) => d.id === 'alternatives' && !d.thin)
      const fear = packet.quotes.find((q) => q.id === 'ev:quote:txt_fear')
      const years = packet.context.durationBucket

      /* Led by what they said they want, because three abstract options are a decision aid and
         three options weighed against a stated want are a decision. It is also the one thing in
         this section that cannot coincide with another reader's. */
      const wanted = packet.quotes.find((q) => q.id === 'ev:quote:con_change')
        ?? packet.quotes.find((q) => q.id === 'ev:quote:txt_why')

      paragraphs.push(para(
        (wanted
          ? `You said what you want is ${wanted.detail.replace(/^"|"$/g, '').replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/\.$/, '')}. Three directions from here, and the cost of each one measured against that rather than against nothing.`
          : `Three directions from here, and the cost of each in your numbers rather than in general.`) + BREAK + BREAK +
        `${worn ? `Change nothing, and what pays for it is ${DIM_BY_ID[worn.d.id].label.toLowerCase()} — already at ${worn.d.pomp}%, the lowest thing you reported.` : 'Change nothing, and what pays for it is time, in the places this report has already shown are thinnest.'} ` +
        `${years ? `You have been here ${years.replace('-', ' to ').replace('y', ' years').replace('m', ' months')} already, which is the only honest guide to how long "a bit longer" tends to be.` : 'Waiting is a decision with a cost, and it is the one people do not count.'}` + BREAK + BREAK +
        `Work on it deliberately. That costs the first few attempts going badly, which they will, and it costs being the one who raises it when you are not sure they will meet you. ${held ? `It is also the path your own answers make hardest to abandon halfway, because what would make leaving hard is at ${held.pomp}%.` : ''}` + BREAK + BREAK +
        `End it. That costs the future you had already partly built and the version of yourself who was going to be in it. ${alt ? `Your own read on whether you would be alright afterwards is ${alt.pomp}%, and that number is worth looking at twice — people are reliably wrong about it in both directions.` : ''}` + BREAK + BREAK +
        `None of the three is free, and a version of this where nothing is lost does not exist. ` +
        `${fear ? `You wrote that what you are most afraid of is ${fear.detail.replace(/^"|"$/g, '').replace(/^[A-Z]/, (c) => c.toLowerCase())} — and that fear attaches to exactly one of these three, which is worth noticing before you weigh them.` : ''} ` +
        `Which one is right is genuinely yours, and this report is not going to take it from you.`,
        [
          ...(worn ? [`ev:dim:${worn.d.id}`] : []),
          ...(held ? ['ev:dim:constraint'] : []),
          ...(alt ? ['ev:dim:alternatives'] : []),
          ...(fear ? [fear.id] : []),
          ...(wanted ? [wanted.id] : []),
        ],
      ))
      break
    }

    /* The shape copy is written per SHAPE, so two people who land on the same one get the same
       lead — correct, and not sufficient. What follows it has to be theirs. */
    case 'read': {
      const shape = readingFor(packet)
      const sharpest = packet.findings.filter((f) => f.accepted && f.finnLevel === 3).slice(0, 2)
      const why = packet.quotes.find((q) => q.id === 'ev:quote:con_story')
        ?? packet.quotes.find((q) => q.id === 'ev:quote:txt_why')

      paragraphs.push(para(
        (why
          ? `You came in saying ${why.detail.replace(/^"|"$/g, '').slice(0, 150).replace(/^[A-Z]/, (c) => c.toLowerCase())}… Here is what your own answers say back about that.` + BREAK + BREAK
          : '') +
        `${shape.lead}` + BREAK + BREAK +
        `That is the shape. What makes it yours rather than a category is underneath it: ` +
        (sharpest.length
          ? sharpest.map((f) => f.statement.slice(0, 160).trim() + '…').join(' And: ')
          : 'the specific answers this report has already shown you.') + BREAK + BREAK +
        `It is a description of a pattern, not an instruction about your life. The decision stays exactly where it was before you opened this, which is with you — and that is not modesty, it is that nobody can make it from eighty answers, including us.`,
        [
          ...sharpest.flatMap((f) => f.evidence.slice(0, 1).map((e) => e.id)),
          ...(why ? [why.id] : []),
        ],
      ))
      break
    }

    /* Falsifiable, and falsifiable about THIS reading — which means it has to name the number
       that would have to move and the exercise that would move it. Written generically, this was
       "you should be able to point at something concrete", which cannot be wrong and therefore
       cannot be right either. */
    case 'markers': {
      const first = packet.practices[0]
      const pr = first ? PRACTICE_BY_ID[first.practiceId] : undefined
      const weakest = [...packet.dimensions]
        .filter((d) => !d.thin)
        .map((d) => ({ d, oriented: DIM_BY_ID[d.id].higherIsBetter ? d.pomp : 100 - d.pomp }))
        .sort((x, y) => x.oriented - y.oriented)[0]
      const sharpest = packet.findings.find((f) => f.accepted && f.finnLevel === 3)
      const wanted = packet.quotes.find((q) => q.id === 'ev:quote:con_change')
        ?? packet.quotes.find((q) => q.id === 'ev:quote:fut_gap')

      paragraphs.push(para(
        (wanted
          ? `You said the one thing you would have different by tomorrow was ${wanted.detail.replace(/^"|"$/g, '').replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/\.$/, '')}. That is the thing to measure against, and it is more specific than anything we would have chosen for you.` + BREAK + BREAK
          : '') +
        `A reading is only worth something if it could turn out to be wrong, so here is exactly how you would know this one was.` + BREAK + BREAK +
        (pr
          ? `${markerSentence(pr.marker)} That is the first one, and it is about ${pr.title.toLowerCase()} rather than about how you feel, because how you feel in six weeks will also depend on things that have nothing to do with this.` + BREAK + BREAK
          : '') +
        (weakest
          ? `The number to watch is ${DIM_BY_ID[weakest.d.id].label.toLowerCase()}, currently ${weakest.d.pomp}%. If the reading is right, that is the one that moves first, because it is where the work is aimed. If everything else shifts and that does not, the reading located the problem in the wrong place.` + BREAK + BREAK
          : '') +
        (sharpest
          ? `And the thing that would show it wrong outright: if you go back to "${sharpest.statement.slice(0, 90).trim()}…" in six weeks and it simply does not describe you, then it did not, and you should trust that over this.`
          : `If six weeks pass and nothing is different, the reading was wrong about something, and the honest next step is the chapters you skipped rather than reading this one again.`),
        [
          ...(first ? first.evidenceIds : []),
          ...(weakest ? [`ev:dim:${weakest.d.id}`] : []),
          ...(sharpest?.evidence[0] ? [sharpest.evidence[0].id] : []),
        ],
      ))
      break
    }

    /* The one section whose absence would be felt as a broken promise. Without this case the plan
       rendered whichever finding was left over — a person who read ten thousand words about
       themselves and reached "What to actually do, in order" would have found an observation. */
    case 'plan': {
      const staged = packet.practices
        .map((sp) => ({ sp, pr: PRACTICE_BY_ID[sp.practiceId] }))
        .filter((x): x is { sp: typeof x.sp; pr: NonNullable<typeof x.pr> } => !!x.pr)
      if (staged.length === 0) break

      const order: Record<string, number> = { now: 0, week: 1, month: 2 }
      staged.sort((a, b) => (order[a.pr.stage] ?? 3) - (order[b.pr.stage] ?? 3))

      paragraphs.push(para(
        `What follows is a sequence rather than a list, and the order is the point — each one is ` +
        `only doable because of the one before it. Everything here is a named, published exercise ` +
        `with its steps written out below, and none of it takes longer than ${Math.max(...staged.map((x) => x.pr.minutes))} minutes.`,
        packet.dimensions.slice(0, 1).map((d) => `ev:dim:${d.id}`),
      ))

      const when: Record<string, string> = {
        now: 'This week',
        week: 'Once that is running',
        month: 'After a few weeks of the above',
      }
      let lastStage = ''
      let first = true
      for (const { sp, pr } of staged) {
        // The finding this step answers, so the plan points back at the analysis by name.
        const answered = packet.findings.find((f) => f.id === sp.findingId && f.accepted)
        /* Nobody's plan begins with "once that is running". If this person has nothing at the
           'now' stage — which happens whenever their whole plan is couple work — the first step is
           still the first step. */
        const lead = first ? 'Start here' : pr.stage === lastStage ? 'Alongside it' : (when[pr.stage] ?? 'Next')
        first = false
        lastStage = pr.stage
        paragraphs.push(para(
          `${lead}: ${pr.title}. ${pr.purpose} ${sp.because} ` +
          `It takes about ${pr.minutes} minutes and you do it ${pr.needsPartner ? 'together' : 'on your own'}. ` +
          `The first time, ${lowerFirst(pr.firstTime)} Where it usually goes wrong: ${lowerFirst(pr.ifItGoesBadly)} ` +
          `${markerSentence(pr.marker)}` +
          (answered ? ` It is here because of this: ${answered.statement.slice(0, 130).trim()}…` : ''),
          sp.evidenceIds.length ? sp.evidenceIds : packet.dimensions.slice(0, 1).map((d) => `ev:dim:${d.id}`),
          sp.findingId,
        ))
      }
      break
    }

    /* The anchor of the recover mode, so it may never drop for want of findings — but it also may
       never offer a decision, because there is not one pending. */
    case 'aftermath': {
      if (findings.length === 0) {
        paragraphs.push(para(
          `There is no decision in front of you, so there is not going to be one in here. What there ` +
          `is instead is a description of where you actually are, which is a harder thing to get hold ` +
          `of than it sounds — partly because everybody around you is trying to be encouraging, and ` +
          `encouragement and accuracy are different services. ` +
          `Nothing below asks you to have decided anything, or to be further along than you are.`,
          packet.dimensions.slice(0, 2).map((d) => `ev:dim:${d.id}`),
        ))
      }
      break
    }

    case 'limits':
      for (const l of packet.limits) {
        paragraphs.push(para(l, packet.dimensions.slice(0, 1).map((d) => `ev:dim:${d.id}`)))
      }
      break

    default:
      break
  }

  /* every finding assigned to this section renders its computed statement, with its receipts */
  for (const f of findings) {
    paragraphs.push(para(f.statement, f.evidence.map((e) => e.id), f.id))
  }

  return {
    id: plan.id,
    title: plan.title,
    status: 'deterministic',
    paragraphs,
    fallbackReason: 'Written directly from your answers, without the writer.',
  }
}

function lowerFirst(s: string): string {
  const t = s.trim()
  return t.length ? t[0]!.toLowerCase() + t.slice(1) : t
}

function countAnswers(packet: EvidencePacket): number {
  return packet.dimensions.reduce((a, d) => a + d.answered, 0) + packet.quotes.length
}

/** The whole report, deterministically. Used on total writer outage and by the eval harness. */
export function fallbackReport(packet: EvidencePacket): ReportSection[] {
  resetFallbackIds()
  return packet.plan.map((p) => fallbackSection(p, packet))
}
