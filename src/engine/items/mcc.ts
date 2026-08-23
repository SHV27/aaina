import type { Item } from "../types";
import { trueFalse } from "./scales";

/** Marlowe–Crowne Form C — Reynolds (1982). 13 True/False items; standard
 *  canonical wording; True-keyed: 5, 7, 9, 10, 13. Score = count of answers in
 *  the socially-desirable direction (0–13). Used only to SOFTEN interpretation. */

const c = "reynolds-1982" as const;
const ch = "aap" as const;

/** keyedTrue: answering True scores the socially-desirable point; else False does. */
const mk = (n: number, text: string, keyedTrue: boolean): Item & { keyedTrue: boolean } => ({
  id: `mcc-${n}`,
  chapter: ch,
  instrument: "mc-c",
  citation: c,
  scale: trueFalse,
  text,
  keyedTrue,
});

export const MCC_ITEMS = [
  mk(1, "It is sometimes hard for me to go on with my work if I am not encouraged.", false),
  mk(2, "I sometimes feel resentful when I don't get my way.", false),
  mk(3, "On a few occasions, I have given up doing something because I thought too little of my ability.", false),
  mk(4, "There have been times when I felt like rebelling against people in authority even though I knew they were right.", false),
  mk(5, "No matter who I'm talking to, I'm always a good listener.", true),
  mk(6, "There have been occasions when I took advantage of someone.", false),
  mk(7, "I'm always willing to admit it when I make a mistake.", true),
  mk(8, "I sometimes try to get even rather than forgive and forget.", false),
  mk(9, "I am always courteous, even to people who are disagreeable.", true),
  mk(10, "I have never been irked when people expressed ideas very different from my own.", true),
  mk(11, "There have been times when I was quite jealous of the good fortune of others.", false),
  mk(12, "I am sometimes irritated by people who ask favors of me.", false),
  mk(13, "I have never deliberately said something that hurt someone's feelings.", true),
];
