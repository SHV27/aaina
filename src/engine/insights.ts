import type { Answer, ChapterId, Evidence } from "./types";
import { scoreAssessment } from "./score";
import {
  CPQ_PARTNER_DEMAND,
  CPQ_SELF_DEMAND,
  CSI_ITEMS,
  ECR_ANXIETY_IDS,
  ECR_AVOIDANCE_IDS,
  IMS_COMMITMENT_ITEMS,
  JOEL_LEAVE_ITEMS,
  JOEL_STAY_ITEMS,
  MCC_ITEMS,
} from "./items";
import { assertCounsellorSafe } from "./counsellorGuard";

/** Chapter-boundary micro-insights: small, real, evidence-bound teasers (lane-4
 *  rule 6 — the break point is the hook point). Every insight carries receipts
 *  and passes the counsellor guard. Null when data is insufficient — honesty
 *  over decoration. */

export interface MicroInsight {
  text: string;
  evidence: Evidence;
}

export function chapterInsight(
  chapter: ChapterId,
  answers: Answer[],
): MicroInsight | null {
  const s = scoreAssessment(answers);

  switch (chapter) {
    case "dil": {
      if (s.csi16 === null) return null;
      const text = s.csi16Distressed
        ? "Aapke sukoon waale jawaab us range mein hain jahan research kehti hai rishta dil par bhaari padta hai. Aaina aage dikhayega ki yeh bhaari-pan kis pattern se aata hai."
        : "Aapke sukoon waale jawaab distress-range se upar hain — dil ki taraf se ek asli taakat. Aage dekhte hain baat-cheet ka pattern kya kehta hai.";
      assertCounsellorSafe(text);
      return {
        text,
        evidence: { answerIds: CSI_ITEMS.map((i) => i.id), source: "funk-rogge-2007" },
      };
    }
    case "baat-cheet": {
      if (s.cpqDemandWithdraw === null) {
        if (s.ecrAnxiety === null || s.ecrAvoidance === null) return null;
        const text =
          "Aapke jawaabon mein closeness aur doori ka apna ek pattern dikha — poora aaina ise naam dega.";
        assertCounsellorSafe(text);
        return {
          text,
          evidence: {
            answerIds: [...ECR_ANXIETY_IDS, ...ECR_AVOIDANCE_IDS],
            source: "wei-2007",
          },
        };
      }
      // 6 demand/withdraw items, 1–9 each → 6–54; midpoint 30.
      const high = s.cpqDemandWithdraw >= 30;
      const text = high
        ? "Behas ke waqt ek jaana-pehchaana chakkar dikhta hai — ek taraf se zor, doosri taraf se chuppi. Is chakkar ka naam hai demand-withdraw; yeh chakkar dushman hota hai, insaan nahi."
        : "Behas ke waqt zor-aur-chuppi waala chakkar aapke jawaabon mein zyada nahi dikha — yeh baat-cheet ki ek asli taakat hai.";
      assertCounsellorSafe(text);
      return {
        text,
        evidence: {
          answerIds: [...CPQ_SELF_DEMAND, ...CPQ_PARTNER_DEMAND],
          source: "christensen-1990",
        },
      };
    }
    case "jadein": {
      if (s.imsCommitment === null) return null;
      const high = s.imsCommitment >= 5;
      const text = high
        ? "Aapki jadein gehri hain — commitment aapke jawaabon mein saaf hai. Ab dekhna yeh hai ki jadein podhe ko seench rahi hain ya sirf bandhe hue hain."
        : "Commitment waale jawaab halke rahe — yeh koi ilzaam nahi, ek reading hai. Agla chapter dono taraf ke palde taulega.";
      assertCounsellorSafe(text);
      return {
        text,
        evidence: {
          answerIds: IMS_COMMITMENT_ITEMS.map((i) => i.id),
          source: "rusbult-1998",
        },
      };
    }
    case "dono-taraf": {
      if (s.stayStrength === null || s.leaveStrength === null) return null;
      const text = s.ambivalent
        ? "Aapke rehne ke palde bhi bhaari hain aur jaane ke bhi — dono ek saath. Research kehti hai yeh dosh nahi, norm hai: aadhe se zyada log jo is sawaal par khade hain, wahin khade hain. Aaina ise naam dega."
        : s.stayStrength > s.leaveStrength
          ? "Aapke jawaabon mein rehne ke palde saaf bhaari hain. Aaina dikhayega ki woh wazan kis cheez ka bana hai."
          : "Aapke jawaabon mein jaane ke palde bhaari hain. Ghabraiye mat — isko dhyaan se dekhna hi is chapter ka maqsad tha.";
      assertCounsellorSafe(text);
      return {
        text,
        evidence: {
          answerIds: [...JOEL_STAY_ITEMS, ...JOEL_LEAVE_ITEMS].map((i) => i.id),
          source: "joel-2018",
        },
      };
    }
    case "aap": {
      if (s.quality.mcC === null) return null;
      const text =
        s.quality.mcC >= 11
          ? "Aapke jawaabon mein sabko-acha-lagne ka halka rang hai — bilkul aam baat. Aaina apni reading ko isi hisaab se naram-kalam karega."
          : "Aapne seedhe, bina-sajaaye jawaab diye — aaine ke liye isse behtar roshni nahi hoti.";
      assertCounsellorSafe(text);
      return {
        text,
        evidence: { answerIds: MCC_ITEMS.map((i) => i.id), source: "reynolds-1982" },
      };
    }
    default:
      return null;
  }
}
