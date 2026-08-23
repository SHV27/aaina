import type { Item } from "../types";
import { agree7 } from "./scales";

/** ECR-S — Wei, Russell, Mallinckrodt & Vogel (2007). Verbatim appendix wording.
 *  7-point agree scale; subscale MEANS; reverse = 8 − raw.
 *  Anxiety: 2,4,6,8R,10,12 · Avoidance: 1R,3,5R,7,9R,11. */

const c = "wei-2007" as const;
const ch = "baat-cheet" as const;

const mk = (n: number, text: string, reverse?: boolean): Item => ({
  id: `ecr-${n}`,
  chapter: ch,
  instrument: "ecr-s",
  citation: c,
  scale: agree7,
  text,
  reverse,
});

export const ECR_ITEMS: Item[] = [
  mk(1, "It helps to turn to my romantic partner in times of need.", true),
  mk(2, "I need a lot of reassurance that I am loved by my partner."),
  mk(3, "I want to get close to my partner, but I keep pulling back."),
  mk(4, "I find that my partner(s) don't want to get as close as I would like."),
  mk(5, "I turn to my partner for many things, including comfort and reassurance.", true),
  mk(6, "My desire to be very close sometimes scares people away."),
  mk(7, "I try to avoid getting too close to my partner."),
  mk(8, "I do not often worry about being abandoned.", true),
  mk(9, "I usually discuss my problems and concerns with my partner.", true),
  mk(10, "I get frustrated if romantic partners are not available when I need them."),
  mk(11, "I am nervous when partners get too close to me."),
  mk(12, "I worry that romantic partners won't care about me as much as I care about them."),
];

export const ECR_ANXIETY_IDS = ["ecr-2", "ecr-4", "ecr-6", "ecr-8", "ecr-10", "ecr-12"];
export const ECR_AVOIDANCE_IDS = ["ecr-1", "ecr-3", "ecr-5", "ecr-7", "ecr-9", "ecr-11"];
