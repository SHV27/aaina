import { create } from 'zustand'
import type { EvidencePacket, ReportSection, Reaction } from '../engine/types'
import { derive, withReaction } from '../engine/derive'
import { composeReport } from '../report/compose'
import { useAnswers } from './answers'
import { useSafety } from './safety'
import { partnerAnswersNow } from './partner'

/**
 * Report state. Memory only — a derived artefact is never persisted, because `derive()` is
 * deterministic and re-deriving is cheaper and safer than storing a stale copy of somebody's
 * worst night.
 */

interface ReportState {
  packet: EvidencePacket | null
  sections: ReportSection[]
  done: number
  total: number
  running: boolean
  degraded: string | null
  reactions: Record<string, Reaction>
  /** Findings currently being re-written after a ✗. */
  rederiving: string[]
  controller: AbortController | null

  build: () => Promise<void>
  react: (findingId: string, reaction: Reaction) => Promise<void>
  reset: () => void
}

function currentInput() {
  const a = useAnswers.getState()
  const s = useSafety.getState()
  return {
    context: a.context,
    answers: a.answers,
    safetyAnswers: s.answers,
    /* The second person's answers, when the reader has accepted a set. Undefined otherwise, and
       `derive` produces no couple findings and no couple section from undefined. */
    ...(partnerAnswersNow() ? { partnerAnswers: partnerAnswersNow() } : {}),
    skipped: a.skipped,
    startedAt: a.startedAt,
    finishedAt: a.finishedAt || Date.now(),
  }
}

export const useReport = create<ReportState>((set, get) => ({
  packet: null,
  sections: [],
  done: 0,
  total: 0,
  running: false,
  degraded: null,
  reactions: {},
  rederiving: [],
  controller: null,

  build: async () => {
    get().controller?.abort()
    const controller = new AbortController()
    const packet = derive(currentInput())

    set({
      packet,
      sections: [],
      done: 0,
      total: packet.plan.length,
      running: true,
      degraded: null,
      controller,
    })

    await composeReport(
      packet,
      {
        onSection: (section) => set((s) => ({ sections: [...s.sections, section] })),
        onProgress: (done, total) => set({ done, total }),
        onDegraded: (message) => set({ degraded: message }),
      },
      controller.signal,
    )

    set({ running: false })
  },

  /**
   * THE INNOVATION — the report argues back.
   *
   * A ✗ is not a thumbs-down that files a ticket somewhere. It is new evidence. The finding stops
   * being accepted, the plan is recomputed, and every section that was leaning on it is rewritten
   * in front of the reader. A claim the reader has rejected must not still be holding up a verdict
   * three sections later.
   */
  react: async (findingId, reaction) => {
    const { packet, sections } = get()
    if (!packet) return

    set((s) => ({ reactions: { ...s.reactions, [findingId]: reaction } }))

    // A ✓ confirms what we already assumed; nothing needs rebuilding.
    if (reaction !== 'no') {
      if (reaction === null) {
        const restored = withReaction(packet, findingId, true)
        set({ packet: restored })
      }
      return
    }

    const next = withReaction(packet, findingId, false)
    const affected = packet.plan
      .filter((p) => p.findingIds.includes(findingId))
      .map((p) => p.id)
    if (affected.length === 0) {
      set({ packet: next })
      return
    }

    set({ packet: next, rederiving: affected })

    const controller = new AbortController()
    const rebuiltPlans = next.plan.filter((p) => affected.includes(p.id))
    const rebuilt: ReportSection[] = []

    await composeReport(
      { ...next, plan: rebuiltPlans },
      {
        onSection: (section) => rebuilt.push(section),
        onProgress: () => {},
        onDegraded: (m) => set({ degraded: m }),
      },
      controller.signal,
    )

    const byId = new Map(rebuilt.map((r) => [r.id, r]))
    set({
      sections: sections.map((s) => byId.get(s.id) ?? s),
      rederiving: [],
    })
  },

  reset: () => {
    get().controller?.abort()
    set({ packet: null, sections: [], done: 0, total: 0, running: false, degraded: null, reactions: {}, rederiving: [], controller: null })
  },
}))
