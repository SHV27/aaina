import { DIMENSION_BY_ID } from "../engine/dimensions";
import { SOURCES } from "../engine/sources";
import type { Assessment, Contradiction, DimensionScore, PlanStep } from "../engine/types";

/** THE EVIDENCE BUNDLE — everything the writer is allowed to know.
 *
 *  Deliberately small (token budget is 8,000/min) and deliberately specific:
 *  scores, this person's own quoted answers, and the tensions the engine found.
 *  No names, no free text, no identifiers. If a fact is not in here, the writer
 *  may not state it — and verifyClaims() enforces that afterwards. */

export interface EvidenceItem {
  id: string;
  /** What this piece of evidence says, as plain fact. */
  fact: string;
  source?: string;
}

export interface SectionBundle {
  section: string;
  /** What this section of the report is for. */
  brief: string;
  evidence: EvidenceItem[];
  /** Instance-specific rubric: what THIS section must address for THIS person. */
  rubric: string[];
}

function pct(n: number): string {
  return `${Math.round(n)}/100`;
}

function dimEvidence(s: DimensionScore, idx: number): EvidenceItem {
  const dim = DIMENSION_BY_ID.get(s.dimension);
  return {
    id: `d${idx}`,
    fact: `${dim?.label ?? s.dimension}: ${pct(s.normalized)} (${s.band}). Measures: ${dim?.measures ?? ""} Low end means "${dim?.lowLabel}", high end means "${dim?.highLabel}".`,
    source: SOURCES[s.citation]?.short,
  };
}

function contradictionEvidence(c: Contradiction, idx: number): EvidenceItem[] {
  const out: EvidenceItem[] = [
    {
      id: `c${idx}`,
      fact: `TENSION — ${c.headline} One side: ${c.aSide.label} at ${pct(c.aSide.value)}. Other side: ${c.bSide.label} at ${pct(c.bSide.value)}. Why this matters: ${c.significance}`,
      source: SOURCES[c.citation]?.short,
    },
  ];
  const echoes = [...c.aSide.echoes, ...c.bSide.echoes].slice(0, 3);
  echoes.forEach((e, i) => {
    out.push({ id: `c${idx}e${i}`, fact: `THEIR OWN ANSWER — they answered ${e}` });
  });
  return out;
}

export function buildOpeningBundle(a: Assessment): SectionBundle {
  const top = a.contradictions.slice(0, 2);
  const evidence: EvidenceItem[] = [
    { id: "o1", fact: `Overall reading across 14 dimensions: ${pct(a.overall)}.` },
    ...a.strengths.map((s, i) => dimEvidence(s, i)),
    ...a.pressures.map((s, i) => dimEvidence(s, i + 90)),
    ...top.flatMap((c, i) => contradictionEvidence(c, i)),
    {
      id: "q1",
      fact: `They answered ${a.quality.answered} questions${a.quality.skipped > 0 ? `, skipped ${a.quality.skipped}` : ""}.`,
    },
  ];

  return {
    section: "opening",
    brief:
      "The first thing they read. Orient them: what this reading found overall, and what the single most important tension is. Do not give advice here.",
    evidence,
    rubric: [
      top[0]
        ? `Must name this tension explicitly: ${top[0].headline}`
        : "Must name the highest and lowest dimensions by their real numbers.",
      "Must quote at least one of their own answers verbatim.",
      "Must not tell them what to do — that comes later in the report.",
      a.overall >= 65
        ? "The overall reading is relatively strong; say so plainly without flattery."
        : a.overall <= 40
          ? "The overall reading is low; say it directly and without drama."
          : "The overall reading is mixed; name what is holding it up and what is pulling it down.",
    ],
  };
}

export function buildDimensionBundle(
  a: Assessment,
  score: DimensionScore,
  echoes: string[],
): SectionBundle {
  const dim = DIMENSION_BY_ID.get(score.dimension);
  const related = a.contradictions.filter(
    (c) => c.aSide.label === score.dimension || c.bSide.label === score.dimension,
  );

  const evidence: EvidenceItem[] = [
    dimEvidence(score, 0),
    ...echoes.map((e, i) => ({
      id: `e${i}`,
      fact: `THEIR OWN ANSWER — they answered ${e}`,
    })),
    ...related.flatMap((c, i) => contradictionEvidence(c, i + 50)),
    {
      id: "ctx",
      fact: `For context, their overall reading is ${pct(a.overall)} and this dimension sits at ${pct(score.normalized)}.`,
    },
  ];

  return {
    section: `dimension:${score.dimension}`,
    brief: `One chapter about "${dim?.label}". Say where they stand, what it means given the specific answers they gave, and what follows from it. Two short paragraphs maximum.`,
    evidence,
    rubric: [
      `Must state the number ${pct(score.normalized)} and what it means in plain words.`,
      echoes.length > 0
        ? "Must quote at least one of their own answers verbatim from the evidence."
        : "Must reference the specific band this score falls in.",
      related.length > 0
        ? `Must address this tension: ${related[0].headline}`
        : "Must connect this dimension to their overall reading.",
      "Must not repeat sentences that would fit any other reader.",
    ],
  };
}

export function buildPlanBundle(a: Assessment, plan: PlanStep[], road: string): SectionBundle {
  const evidence: EvidenceItem[] = [
    { id: "r", fact: `The road they are on: ${road}.` },
    ...plan.map((s, i) => ({
      id: `p${i}`,
      fact: `ACTIVITY ${i + 1}: "${s.activity.title}". How it works: ${s.activity.mechanism} It was chosen because ${s.becauseContradiction ? `of the tension "${s.becauseContradiction}"` : s.becauseDimension ? `their ${DIMENSION_BY_ID.get(s.becauseDimension)?.label} score is low` : "it is core to this road"}. Evidence grade ${s.activity.evidence}.`,
      source: SOURCES[s.activity.citation]?.short,
    })),
    ...a.contradictions.slice(0, 2).flatMap((c, i) => contradictionEvidence(c, i + 70)),
  ];

  return {
    section: "plan-intro",
    brief:
      "Introduce their plan. Explain why these specific activities, in this order, for them. One short paragraph. The activities themselves are already written — do not restate their steps.",
    evidence,
    rubric: [
      "Must explain the ordering logic in terms of their own scores.",
      "Must name at least one activity and tie it to a specific finding.",
      "Must not invent activities that are not in the evidence.",
    ],
  };
}

/** Compact wire format. Kept small on purpose — token budget is the constraint. */
export function bundleToPrompt(b: SectionBundle): string {
  const ev = b.evidence
    .map((e) => `[${e.id}] ${e.fact}${e.source ? ` (Source: ${e.source})` : ""}`)
    .join("\n");
  const rubric = b.rubric.map((r, i) => `${i + 1}. ${r}`).join("\n");
  return `SECTION: ${b.section}\nPURPOSE: ${b.brief}\n\nEVIDENCE (the only facts you may use):\n${ev}\n\nTHIS SECTION MUST:\n${rubric}`;
}

export function evidenceIdsOf(b: SectionBundle): Set<string> {
  return new Set(b.evidence.map((e) => e.id));
}
