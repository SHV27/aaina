import type { EvidencePacket, SectionPlan, ReportSection, Paragraph } from '../engine/types'
import { DIM_BY_ID, bandLabel } from '../engine/dimensions'
import { SHAPE_COPY } from '../engine/axes'
import { compositeOf } from '../engine/derive'

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

let n = 0
const pid = () => `p:det:${(n += 1)}`
export function resetFallbackIds() { n = 0 }

function para(text: string, evidenceIds: string[], findingId: string | null = null): Paragraph {
  return { id: pid(), text, evidenceIds, findingId }
}

export function fallbackSection(plan: SectionPlan, packet: EvidencePacket): ReportSection {
  const findings = plan.findingIds
    .map((id) => packet.findings.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => !!f)

  const paragraphs: Paragraph[] = []

  /* sections that are argument rather than evidence get purpose-written deterministic prose */
  switch (plan.id) {
    case 'opening': {
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
        `The overall figure weights those dimensions by how strongly published research ties each one to relationship outcomes, and ${comp.excluded.length > 0 ? `${comp.excluded.length} dimension${comp.excluded.length === 1 ? '' : 's'} you left thin ${comp.excluded.length === 1 ? 'was' : 'were'} kept out of it rather than guessed at` : 'nothing was excluded'}.`,
        scored.slice(0, 3).map((d) => `ev:dim:${d.id}`),
      ))
      break
    }

    case 'turn':
      paragraphs.push(para(
        `The next part is harder than what you have just read. It is not a judgement about you, and there is nothing in it you did not already tell us — but it will put two things you said next to each other, and that is an uncomfortable thing to look at. Take it slowly.`,
        packet.findings[0] ? [packet.findings[0].evidence[0]!.id] : [],
      ))
      break

    case 'standing': {
      const comp = compositeOf(packet)
      const shape = SHAPE_COPY[packet.axes.shape]
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

    case 'paths':
      paragraphs.push(para(
        `There are three directions available from here, and each has a cost that is worth naming out loud rather than discovering later. ` +
        `The first is to change nothing and let the situation continue as it is — which costs you time, and the specific things this report has shown are being worn down by the wait. ` +
        `The second is to work on it deliberately, which means naming the pattern to the other person and accepting that the first few attempts will go badly. ` +
        `The third is to end it, which costs the future you had already partly built and the version of yourself that was going to be in it. ` +
        `None of these is free, and a version of this decision where nothing is lost does not exist. Which one is right is genuinely yours to decide, and this report is not going to take that from you.`,
        packet.dimensions.slice(0, 2).map((d) => `ev:dim:${d.id}`),
      ))
      break

    case 'read': {
      const shape = SHAPE_COPY[packet.axes.shape]
      paragraphs.push(para(
        `${shape.lead} That is the reading your own answers produce. It is a description of a pattern, not an instruction about your life — and the decision stays exactly where it was before you opened this, which is with you.`,
        packet.findings.slice(0, 2).flatMap((f) => f.evidence.slice(0, 1).map((e) => e.id)),
      ))
      break
    }

    case 'markers':
      paragraphs.push(para(
        `A reading is only worth something if it could turn out to be wrong, so here is how you would know. ` +
        `If this is right, then within about six weeks you should be able to point at something concrete that changed when you acted on it — not a feeling, a thing that happened. ` +
        `If six weeks pass and nothing is different, the reading was wrong about something and it is worth coming back and answering the sections you skipped.`,
        packet.findings.slice(0, 1).flatMap((f) => f.evidence.slice(0, 1).map((e) => e.id)),
      ))
      break

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

function countAnswers(packet: EvidencePacket): number {
  return packet.dimensions.reduce((a, d) => a + d.answered, 0) + packet.quotes.length
}

/** The whole report, deterministically. Used on total writer outage and by the eval harness. */
export function fallbackReport(packet: EvidencePacket): ReportSection[] {
  resetFallbackIds()
  return packet.plan.map((p) => fallbackSection(p, packet))
}
