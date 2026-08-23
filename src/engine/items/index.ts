import type { ChapterId, Item } from "../types";
import { CSI_ITEMS } from "./csi";
import { ECR_ITEMS } from "./ecr";
import { CPQ_ITEMS } from "./cpq";
import { IMS_ITEMS } from "./ims";
import { JOEL_LEAVE_ITEMS, JOEL_STAY_ITEMS } from "./joel";
import { MCC_ITEMS } from "./mcc";
import { IRI_ITEMS } from "./iri";
import { WAST_ITEMS } from "./wast";

export * from "./csi";
export * from "./ecr";
export * from "./cpq";
export * from "./ims";
export * from "./joel";
export * from "./mcc";
export * from "./iri";
export * from "./wast";

const iri = (n: number) => IRI_ITEMS.find((i) => i.id === `iri-${n}`)!;

export interface ChapterMeta {
  id: ChapterId;
  title: string;
  hindi: string;
  minutes: number;
  intro: string;
  items: Item[];
}

/** The five visible chapters, in order. Safety (suraksha) is separate — it is
 *  presented after chapter 2 behind a privacy interstitial, memory-only. */
export const CHAPTERS: ChapterMeta[] = [
  {
    id: "dil",
    title: "Dil Ki Baat",
    hindi: "दिल की बात",
    minutes: 8,
    intro: "Pehle woh sawaal jo seedha dil se poochhe jaate hain — aap apne rishte mein kitna sukoon paate hain.",
    items: [
      ...CSI_ITEMS.slice(0, 8),
      iri(1),
      ...CSI_ITEMS.slice(8),
    ],
  },
  {
    id: "baat-cheet",
    title: "Baat-Cheet",
    hindi: "बात-चीत",
    minutes: 12,
    intro: "Ab dekhte hain aap dono baat kaise karte hain — jab sab theek ho, aur jab behas ho.",
    items: [
      ...CPQ_ITEMS,
      ...ECR_ITEMS.slice(0, 6),
      iri(2),
      ...ECR_ITEMS.slice(6),
    ],
  },
  {
    id: "jadein",
    title: "Jadein",
    hindi: "जड़ें",
    minutes: 10,
    intro: "Rishte ki jadein — aapne kitna lagaya hai, kitna bandhe hain, aur bahar ki duniya kaisi dikhti hai.",
    items: IMS_ITEMS,
  },
  {
    id: "dono-taraf",
    title: "Dono Taraf",
    hindi: "दोनों तरफ़",
    minutes: 14,
    intro: "Har rishte mein rehne ki wajahein bhi hoti hain aur jaane ki bhi — dono ko imaandaari se taulna hi asli clarity hai.",
    items: [
      ...JOEL_STAY_ITEMS,
      iri(3),
      ...JOEL_LEAVE_ITEMS,
    ],
  },
  {
    id: "aap",
    title: "Sirf Aap",
    hindi: "सिर्फ़ आप",
    minutes: 5,
    intro: "Aakhir mein kuch sawaal sirf aapke baare mein — yeh aaina ko aapki reading aur imaandaari se calibrate karne mein madad karte hain.",
    items: MCC_ITEMS,
  },
];

/** All persisted assessment items in presentation order (safety NOT included). */
export const ALL_ASSESSMENT_ITEMS: Item[] = CHAPTERS.flatMap((c) => c.items);

/** The 2-minute Jhalak: 8 validated items spanning satisfaction, attachment,
 *  conflict, commitment, alternatives. Answers carry into the full Mirror. */
export const JHALAK_ITEM_IDS = [
  "csi-1",
  "csi-9",
  "csi-20",
  "csi-22",
  "ecr-12",
  "cpq-b7a",
  "ims-c2",
  "ims-a3",
] as const;

export const JHALAK_ITEMS: Item[] = JHALAK_ITEM_IDS.map(
  (id) => ALL_ASSESSMENT_ITEMS.find((i) => i.id === id)!,
);

/** Legacy walking-skeleton slice (Arc 1) — retired in Arc 3. */
export const SKELETON_ITEMS: Item[] = ["csi-1", "csi-9", "csi-5"].map(
  (id) => CSI_ITEMS.find((i) => i.id === id)!,
);

export function itemById(id: string): Item | undefined {
  return ALL_ASSESSMENT_ITEMS.find((i) => i.id === id) ?? WAST_ITEMS.find((i) => i.id === id);
}
