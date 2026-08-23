import type { Item } from "../types";
import { likely9 } from "./scales";

/** CPQ-SF — Christensen & Heavey (1990); revised scoring Crenshaw et al. (2017).
 *  Verbatim from the circulated instrument ("I"/"Partner" gender-neutral standard).
 *  9-point likelihood scale. Stems shown in the UI as section intros. */

const c = "christensen-1990" as const;
const ch = "baat-cheet" as const;

const mk = (id: string, text: string): Item => ({
  id,
  chapter: ch,
  instrument: "cpq-sf",
  citation: c,
  scale: likely9,
  text,
});

/** Stem A: "When this issue or problem arises…" */
export const CPQ_ITEMS: Item[] = [
  mk("cpq-a1", "When an issue or problem arises, both of us avoid discussing the problem."),
  mk("cpq-a2", "When an issue or problem arises, both of us try to discuss the problem."),
  mk("cpq-a3a", "When an issue or problem arises, I try to start a discussion while my partner tries to avoid a discussion."),
  mk("cpq-a3b", "When an issue or problem arises, my partner tries to start a discussion while I try to avoid a discussion."),
  mk("cpq-b4", "During a discussion of an issue or problem, both of us express our feelings to each other."),
  mk("cpq-b5", "During a discussion of an issue or problem, both of us blame, accuse, and criticize each other."),
  mk("cpq-b6", "During a discussion of an issue or problem, both of us suggest possible solutions and compromises."),
  mk("cpq-b7a", "During a discussion, I pressure, nag, or demand while my partner withdraws, becomes silent, or refuses to discuss the matter further."),
  mk("cpq-b7b", "During a discussion, my partner pressures, nags, or demands while I withdraw, become silent, or refuse to discuss the matter further."),
  mk("cpq-b8a", "During a discussion, I criticize while my partner defends himself/herself."),
  mk("cpq-b8b", "During a discussion, my partner criticizes while I defend myself."),
];

/** Crenshaw et al. (2017) mapping onto the SF. */
export const CPQ_CONSTRUCTIVE = { positive: ["cpq-a2", "cpq-b4", "cpq-b6"], reversed: ["cpq-a1"] };
export const CPQ_SELF_DEMAND = ["cpq-a3a", "cpq-b7a", "cpq-b8a"];
export const CPQ_PARTNER_DEMAND = ["cpq-a3b", "cpq-b7b", "cpq-b8b"];
