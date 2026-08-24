import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS, ITEM_BY_ID } from "../engine/items";
import { assess } from "../engine/score";
import { scoreRisk } from "../engine/risk";
import { buildPlan, suggestRoad, type PlanContext } from "../engine/plan";
import type { Assessment, DimensionScore, PlanStep, Road, Response } from "../engine/types";
import { responseList, useSession } from "../store/session";
import { useRisk } from "../store/risk";
import { buildDimensionBundle, buildOpeningBundle, buildPlanBundle } from "../ai/bundle";
import { composeSection, type SectionStatus } from "../ai/client";

/** Orchestrates the whole report: deterministic analysis first (instant, always
 *  present), then AI prose section by section, paced so the free-tier ceiling
 *  produces a wait rather than a failure. */

export interface ReportState {
  assessment: Assessment;
  risk: ReturnType<typeof scoreRisk>;
  road: Road;
  setRoad: (r: Road) => void;
  plan: PlanStep[];
  chapters: DimensionScore[];
  sections: Record<string, SectionStatus>;
  writing: boolean;
  progress: { done: number; total: number };
  start: () => void;
}

function echoesFor(score: DimensionScore, responses: Response[]): string[] {
  const rmap = new Map(responses.map((r) => [r.itemId, r]));
  const scored = score.itemIds
    .map((id) => ({ item: ITEM_BY_ID.get(id), r: rmap.get(id) }))
    .filter((x) => x.item && x.r && x.item.echoable);

  scored.sort((a, b) => {
    const extremity = (x: (typeof scored)[number]) => {
      const vals = x.item!.scale.map((s) => s.value);
      const mid = (Math.max(...vals) + Math.min(...vals)) / 2;
      return Math.abs(x.r!.value - mid);
    };
    return extremity(b) - extremity(a);
  });

  return scored.slice(0, 2).map((x) => {
    const label = x.item!.scale.find((s) => s.value === x.r!.value)?.label ?? "";
    return `“${label}” to: ${x.item!.text}`;
  });
}

export function useReport(): ReportState {
  const responses = useSession((s) => s.responses);
  const context = useSession((s) => s.context);
  const riskResponses = useRisk((s) => s.responses);

  const list = useMemo(() => responseList(responses), [responses]);
  const assessment = useMemo(
    () => assess(ITEMS, list, context.hasPartner),
    [list, context.hasPartner],
  );
  const risk = useMemo(() => scoreRisk(Object.values(riskResponses)), [riskResponses]);

  const [road, setRoad] = useState<Road>(() => suggestRoad(assessment, risk.positive));
  useEffect(() => {
    if (risk.positive) setRoad("safety");
  }, [risk.positive]);

  const planCtx: PlanContext = useMemo(
    () => ({
      road,
      riskPositive: risk.positive,
      partnerWilling: context.partnerWilling && context.hasPartner,
      highRumination: false,
      coParenting: false,
    }),
    [road, risk.positive, context.partnerWilling, context.hasPartner],
  );

  const plan = useMemo(() => buildPlan(assessment, planCtx), [assessment, planCtx]);

  /** Chapters: the dimensions worth reading about first — extremes lead. */
  const chapters = useMemo(() => {
    const answered = assessment.scores.filter((s) => s.answered > 0);
    return [...answered].sort(
      (a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50),
    );
  }, [assessment]);

  const [sections, setSections] = useState<Record<string, SectionStatus>>({});
  const [writing, setWriting] = useState(false);
  const started = useRef(false);

  const setSection = useCallback((key: string, status: SectionStatus) => {
    setSections((prev) => ({ ...prev, [key]: status }));
  }, []);

  const start = useCallback(() => {
    if (started.current || list.length === 0) return;
    started.current = true;
    setWriting(true);

    const run = async () => {
      const opening = buildOpeningBundle(assessment);
      setSection("opening", { state: "pending" });
      setSection(
        "opening",
        await composeSection(opening, { onStatus: (s) => setSection("opening", s) }),
      );

      for (const score of chapters.slice(0, 6)) {
        const key = `dimension:${score.dimension}`;
        setSection(key, { state: "pending" });
        const bundle = buildDimensionBundle(assessment, score, echoesFor(score, list));
        setSection(key, await composeSection(bundle, { onStatus: (s) => setSection(key, s) }));
      }

      const planBundle = buildPlanBundle(assessment, plan, road);
      setSection("plan-intro", { state: "pending" });
      setSection(
        "plan-intro",
        await composeSection(planBundle, { onStatus: (s) => setSection("plan-intro", s) }),
      );

      setWriting(false);
    };

    void run();
  }, [assessment, chapters, list, plan, road, setSection]);

  const total = 1 + Math.min(6, chapters.length) + 1;
  const done = Object.values(sections).filter(
    (s) => s.state === "done" || s.state === "failed",
  ).length;

  return {
    assessment,
    risk,
    road,
    setRoad,
    plan,
    chapters,
    sections,
    writing,
    progress: { done, total },
    start,
  };
}
