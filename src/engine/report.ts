import type { Answer, Evidence, ScaleScores } from "./types";
import { scoreAssessment, scoreSafety, type SafetyScreen } from "./score";
import { computeConfidence, type ConfidenceMeter } from "./quality";
import { assertCounsellorSafe } from "./counsellorGuard";
import {
  CPQ_PARTNER_DEMAND,
  CPQ_SELF_DEMAND,
  CSI_ITEMS,
  ECR_ANXIETY_IDS,
  ECR_AVOIDANCE_IDS,
  IMS_ALTERNATIVES_ITEMS,
  IMS_COMMITMENT_ITEMS,
  IMS_INVESTMENT_ITEMS,
  IMS_SATISFACTION_ITEMS,
  JOEL_LEAVE_ITEMS,
  JOEL_STAY_ITEMS,
  itemById,
} from "./items";

/** THE VERDICT REPORT GENERATOR — deterministic, template-driven, receipts-bound.
 *  Implements the R1–R20 master sequence (research/lane2-counsellor-craft.md):
 *  affirm off-domain → Level-1 confirmations (own words) → name the cycle →
 *  warning shot + invitation (UI gate) → verdict in chunks + empathy → three
 *  paths with costs → time-boxed experiment → own-contribution → autonomy.
 *  Every sentence carries Evidence; assertCounsellorSafe runs on all prose.
 *  The danger gate branches INSIDE this function — callers cannot skip it. */

export interface Sentence {
  text: string;
  evidence: Evidence;
  answersShown?: string[];
}

export interface PathOption {
  title: string;
  body: Sentence;
  cost: Sentence;
}

export type VerdictArchetype =
  | "warm-rooted"
  | "strained-rooted"
  | "ambivalent-centre"
  | "leaning-out"
  | "constrained-staying"
  | "unclear";

export interface Report {
  danger: boolean;
  archetype: VerdictArchetype;
  confidence: ConfidenceMeter;
  affirmation: Sentence;
  confirmations: Sentence[];
  cycle: Sentence | null;
  warningShot: string;
  verdict: Sentence[];
  empathy: string;
  paths: PathOption[];
  experiment: Sentence | null;
  ownContribution: Sentence | null;
  autonomy: string;
  scores: ScaleScores;
  safety: SafetyScreen;
}

const s = (
  text: string,
  answerIds: readonly string[],
  source: Evidence["source"],
  answersShown?: string[],
): Sentence => {
  assertCounsellorSafe(text);
  return { text, evidence: { answerIds, source }, answersShown };
};

function echoAnswers(answers: Map<string, Answer>, ids: string[], max = 3): string[] {
  const out: string[] = [];
  for (const id of ids) {
    const a = answers.get(id);
    const item = itemById(id);
    if (!a || !item) continue;
    const label = item.scale.find((p) => p.value === a.value)?.label;
    if (label) out.push(`"${label}"`);
    if (out.length >= max) break;
  }
  return out;
}

function pickArchetype(sc: ScaleScores): VerdictArchetype {
  const { csi16Distressed, imsCommitment, imsSatisfaction, imsAlternatives, imsInvestment, ambivalent, stayStrength, leaveStrength } = sc;
  if (csi16Distressed === null || imsCommitment === null) return "unclear";

  const committed = imsCommitment >= 5;
  const satisfiedIms = (imsSatisfaction ?? 4) >= 4;
  const leaveHeavy =
    stayStrength !== null && leaveStrength !== null && leaveStrength > stayStrength + 0.5;

  // Rusbult: commitment fed by investment + poor alternatives rather than
  // satisfaction = staying because leaving feels impossible, not because
  // staying feels good.
  const constrained =
    committed &&
    !satisfiedIms &&
    csi16Distressed &&
    (imsInvestment ?? 0) >= 5 &&
    (imsAlternatives ?? 9) <= 3;

  if (constrained) return "constrained-staying";
  if (ambivalent) return "ambivalent-centre";
  if (!csi16Distressed && committed && !leaveHeavy) return "warm-rooted";
  if (csi16Distressed && committed) return "strained-rooted";
  if (leaveHeavy || (!committed && csi16Distressed)) return "leaning-out";
  return "unclear";
}

export function generateReport(rawAnswers: Answer[], safetyAnswers: Answer[]): Report {
  const scores = scoreAssessment(rawAnswers);
  const safety = scoreSafety(safetyAnswers);
  const answers = new Map(rawAnswers.map((a) => [a.itemId, a]));
  const confidence = computeConfidence(scores.quality, "solo");
  const danger = safety.wastPositive;
  const archetype = pickArchetype(scores);

  const allIds = rawAnswers.map((a) => a.itemId);

  /* R10 — affirm first, off-domain (the act of looking, not the relationship). */
  const affirmation = s(
    `Aapne ${scores.quality.answeredCount} sawaalon ka saamna kiya — jaldbaazi ke bina, apne jawaabon se. Saaf dekhne ki yeh koshish apne aap mein ek taakat hai, aur yahi is padhai ki roshni hai.`,
    allIds,
    "meade-craig-2012",
  );

  /* R9 + R4 — Level-1 confirmations: reflect their strongest signals in their words. */
  const confirmations: Sentence[] = [];
  if (scores.csi16 !== null) {
    const csiIds = CSI_ITEMS.map((i) => i.id);
    confirmations.push(
      scores.csi16Distressed
        ? s(
            `Aap pehle se jaante the ki sukoon kam hai — aapke jawaabon ne wahi kaha. Satisfaction ke solah sawaalon par aapka score ${Math.round(scores.csi16!)}/81 raha, jo research ke distress-cutoff (51.5) se neeche hai.`,
            csiIds,
            "funk-rogge-2007",
            echoAnswers(answers, ["csi-1", "csi-22", "csi-31"]),
          )
        : s(
            `Rishte mein sukoon aapke jawaabon mein asli hai — satisfaction ke solah sawaalon par ${Math.round(scores.csi16!)}/81, distress-range se upar.`,
            csiIds,
            "funk-rogge-2007",
            echoAnswers(answers, ["csi-1", "csi-22"]),
          ),
    );
  }
  if (scores.imsCommitment !== null) {
    const ids = IMS_COMMITMENT_ITEMS.map((i) => i.id);
    confirmations.push(
      scores.imsCommitment >= 5
        ? s(
            `Commitment aapke jawaabon mein gehri hai (${scores.imsCommitment.toFixed(1)}/8). Aap is rishte ko halke mein nahi le rahe — yeh baat aaina saaf dikhata hai.`,
            ids,
            "rusbult-1998",
            echoAnswers(answers, ["ims-c1", "ims-c2"]),
          )
        : s(
            `Commitment waale jawaab halke rahe (${scores.imsCommitment.toFixed(1)}/8). Yeh ilzaam nahi hai — yeh ek sacchi reading hai jo aapne khud di.`,
            ids,
            "rusbult-1998",
            echoAnswers(answers, ["ims-c1", "ims-c5"]),
          ),
    );
  }

  /* R12/R13 — name the cycle (pattern, never person). */
  let cycle: Sentence | null = null;
  if (scores.cpqDemandWithdraw !== null && scores.cpqDemandWithdraw >= 30) {
    const selfD = CPQ_SELF_DEMAND.reduce((acc, id) => acc + (answers.get(id)?.value ?? 0), 0);
    const partnerD = CPQ_PARTNER_DEMAND.reduce((acc, id) => acc + (answers.get(id)?.value ?? 0), 0);
    const dir =
      selfD > partnerD + 3
        ? "zyada baar aap baat uthate hain aur saamne se chuppi aati hai"
        : partnerD > selfD + 3
          ? "zyada baar saamne se zor aata hai aur aap chup ho jaate hain"
          : "kabhi ek taraf se zor, kabhi doosri taraf se chuppi";
    cycle = s(
      `Aapki behas ka ek naam hai: demand–withdraw ka chakkar — ${dir}. Research mein yeh chakkar rishton ko sabse zyada ghisne waala pattern hai. Dushman yeh chakkar hai; aap mein se koi nahi.`,
      [...CPQ_SELF_DEMAND, ...CPQ_PARTNER_DEMAND],
      "christensen-1990",
      echoAnswers(answers, ["cpq-b7a", "cpq-b7b"]),
    );
  } else if (
    scores.ecrAnxiety !== null &&
    scores.ecrAvoidance !== null &&
    (scores.ecrAnxiety >= 4.5 || scores.ecrAvoidance >= 4.5)
  ) {
    const which =
      scores.ecrAnxiety >= 4.5 && scores.ecrAvoidance >= 4.5
        ? "paas aane ki chaah aur door hatne ki aadat — dono ek saath"
        : scores.ecrAnxiety >= 4.5
          ? "kho dene ka dar baar-baar reassurance maangta hai"
          : "bahut paas aana bechaini deta hai, isliye doori aaram lagti hai";
    cycle = s(
      `Aapke jawaabon mein closeness ka ek pattern dikhta hai: ${which}. Yeh koi kami nahi — attachment research ise ek samajh mein aane waala, badla ja sakne waala pattern maanti hai.`,
      [...ECR_ANXIETY_IDS, ...ECR_AVOIDANCE_IDS],
      "wei-2007",
      echoAnswers(answers, ["ecr-12", "ecr-8"]),
    );
  }

  /* R5 — warning shot (fixed copy; UI renders the R6 invitation gate). */
  const warningShot =
    "Ab aaina apna sabse seedha sach dikhayega. Jo likha hai woh aapke apne jawaabon se bana hai — aur ho sakta hai padhna halka na ho. Jab taiyaar hon, tab dekhiye.";

  /* R7/R14 — the verdict: short chunks, confident about pattern, silent about command. */
  const verdict: Sentence[] = [];
  const joelIds = [...JOEL_STAY_ITEMS, ...JOEL_LEAVE_ITEMS].map((i) => i.id);
  const commitIds = [
    ...IMS_COMMITMENT_ITEMS,
    ...IMS_SATISFACTION_ITEMS,
    ...IMS_ALTERNATIVES_ITEMS,
    ...IMS_INVESTMENT_ITEMS,
  ].map((i) => i.id);

  switch (archetype) {
    case "warm-rooted":
      verdict.push(
        s(
          `Pattern saaf hai. Sukoon distress-range se upar hai. Commitment gehri hai. Jaane ke palde halke hain.`,
          CSI_ITEMS.map((i) => i.id),
          "funk-rogge-2007",
        ),
        s(
          `Research mein yehi profile sabse mazboot maana jaata hai — commitment aur satisfaction ka saath. Iska matlab kaam khatam nahi; iska matlab hai neev sahi hai.`,
          commitIds,
          "le-2010",
        ),
      );
      break;
    case "strained-rooted":
      verdict.push(
        s(
          `Pattern do hisson ka hai. Sukoon abhi distress-range mein hai — yeh aapke solah jawaabon ka sach hai. Aur commitment phir bhi gehri hai.`,
          CSI_ITEMS.map((i) => i.id),
          "funk-rogge-2007",
        ),
        s(
          `Is jodi ka matlab research mein hota hai: rishta thaka hua hai, toota nahi. Aise profile aksar tabhi badalte hain jab pattern ko naam de kar, waqt baandh kar, dono ya ek taraf se asli badlaav aazmaya jaye.`,
          commitIds,
          "karney-bradbury-1995",
        ),
      );
      break;
    case "ambivalent-centre":
      verdict.push(
        s(
          `Pattern ka naam ambivalence hai. Rehne ke palde bhaari hain (${scores.stayStrength?.toFixed(1)}/7) aur jaane ke bhi (${scores.leaveStrength?.toFixed(1)}/7) — dono ek saath, ek hi dil mein.`,
          joelIds,
          "joel-2018",
        ),
        s(
          `Research kehti hai yeh koi uljhan ki galti nahi — jo log is sawaal par khade hote hain, unme aadhe se zyada theek yahin khade hote hain. Ambivalence ka ilaaj aur sochna nahi hota; use naam de kar ek waqt-baandha faisla-tareeka chahiye hota hai.`,
          joelIds,
          "joel-2018",
        ),
      );
      break;
    case "leaning-out":
      verdict.push(
        s(
          `Pattern jhukav dikhata hai — bahar ki taraf. Jaane ke palde bhaari hain, aur commitment ke jawaab halke. Yeh aapke apne shabdon ka wazan hai, kisi aur ka nahi.`,
          joelIds,
          "joel-2018",
        ),
        s(
          `Research mein commitment hi rehne-jaane ka sabse bada single signal hai. Jab woh halka ho aur sukoon distress-range mein, toh rishte aksar isi disha mein jaate hain — jab tak koi naya, naam-diya-hua badlaav na ho.`,
          commitIds,
          "le-2010",
        ),
      );
      break;
    case "constrained-staying":
      verdict.push(
        s(
          `Pattern ka naam hai bandha hua rehna. Commitment dikh rahi hai — par woh sukoon se nahi, lagaayi hui mehnat aur "aur kahan jaayenge" ke ehsaas se khadi hai.`,
          commitIds,
          "rusbult-1998",
        ),
        s(
          `Research is profile ko alag pehchaanti hai: jab rehna satisfaction se nahi, investment aur alternatives ki kami se aata hai. Yeh jaanna zaroori hai, kyunki is neev par khada rishta waisa hi mehsoos hota hai jaisa aapne bataya — bhaari.`,
          commitIds,
          "rusbult-1998",
        ),
      );
      break;
    default:
      verdict.push(
        s(
          `Aaina is baar poora nahi bhara — kuch zaroori sections ke jawaab adhoore rahe, isliye seedha verdict dena imaandaari nahi hoti. Jo dikha, woh upar ke sections mein hai.`,
          allIds.length > 0 ? allIds : ["none"],
          "meade-craig-2012",
        ),
      );
  }

  /* R8 — named-emotion empathy line (fixed copy). */
  const empathy =
    "Agar yeh padh kar seene mein kuch bhaari utra hai — woh ek theek, insaani jawaab hai. Ruk jaiye. Saans lijiye. Aage ka hissa raaste dikhata hai, akela nahi chhodta.";

  /* R15 — three paths, each with an honest cost (Doherty). */
  const paths: PathOption[] = [
    {
      title: "Raasta 1 — Jaise hai, waise hi",
      body: s(
        "Kuch na badalna bhi ek chunaav hai. Kabhi-kabhi sahi bhi — jab waqt chahiye hota hai.",
        allIds,
        "doherty-2016",
      ),
      cost: s(
        "Iski keemat: jo pattern aaine mein dikha, research kehti hai woh apne aap nahi badalta. Isi raaste par wahi jawaab agle saal bhi likhe jaane ki sambhaavna sabse zyada hai.",
        allIds,
        "karney-bradbury-1995",
      ),
    },
    {
      title: "Raasta 2 — Alag hona",
      body: s(
        "Rishtey ka ant hamesha haar nahi hota. Kabhi-kabhi yeh dono zindagiyon ki hifaazat hota hai. Agar yeh raasta chuna jaye, toh use bhi izzat aur tayyari se chalna hota hai — akele nahi.",
        joelIds,
        "doherty-2016",
      ),
      cost: s(
        "Iski keemat: jo palde rehne ki taraf bhaari hain — woh asli hain, aur unka dukh bhi asli hoga. Aaina yeh nahi kehta ki yeh aasaan hai; yeh kehta hai ki yeh survivable hai.",
        JOEL_STAY_ITEMS.map((i) => i.id),
        "joel-2018",
      ),
    },
    {
      title: "Raasta 3 — Sab kuch laga kar dekhna, waqt baandh kar",
      body: s(
        "Chhe mahine. Naam-diye-hue badlaav. Aur ant mein ek tay tareekh par dobara yehi aaina. Discernment counselling ka yehi dhaancha hai — hamesha ke liye nahi, ek faisle ke liye.",
        allIds,
        "doherty-2016",
      ),
      cost: s(
        "Iski keemat: aadhi-adhoori koshish is raaste ko jhootha bana deti hai. Yeh raasta sirf tab gina jaata hai jab dono taraf se — ya kam se kam aapki taraf se — poora diya jaye.",
        allIds,
        "doherty-2016",
      ),
    },
  ];

  /* R16 — the time-boxed experiment, tied to their weakest measured patterns. */
  let experiment: Sentence | null = null;
  if (archetype === "strained-rooted" || archetype === "ambivalent-centre" || archetype === "warm-rooted") {
    const targets: string[] = [];
    if (scores.cpqDemandWithdraw !== null && scores.cpqDemandWithdraw >= 30) {
      targets.push(
        "behas shuru hone par chakkar ko naam dena (\"yeh phir wahi demand–withdraw hai\") aur 20 minute ka thanda break le kar wapas aana",
      );
    }
    if (scores.cpqConstructive !== null && scores.cpqConstructive < 20) {
      targets.push("hafte mein ek baar, bina phone ke, ek mushkil baat ko sirf sunne ke liye baithna");
    }
    if (scores.ecrAnxiety !== null && scores.ecrAnxiety >= 4.5) {
      targets.push("reassurance seedhe shabdon mein maangna — ishaaron se nahi");
    }
    if (scores.ecrAvoidance !== null && scores.ecrAvoidance >= 4.5) {
      targets.push("door hatne ka mann ho toh keh kar hatna (\"mujhe thodi der chahiye\"), gayab ho kar nahi");
    }
    if (targets.length === 0) {
      targets.push("har hafte ek baar woh cheez naam lena jo saamne waale ne sahi ki — specific, taazi, sacchi");
    }
    experiment = s(
      `Agar Raasta 3 chuna jaye, toh yeh raha uska naksha: chhe mahine, sirf ${Math.min(targets.length, 2)} badlaav — ${targets.slice(0, 2).join("; ")} — aur chhathe mahine ki tareekh aaj hi tay kar ke phir se yehi aaina.`,
      allIds,
      "doherty-2016",
    );
  }

  /* R17 — own-contribution mirror. */
  let ownContribution: Sentence | null = null;
  if (scores.cpqDemandWithdraw !== null) {
    const selfD = CPQ_SELF_DEMAND.reduce((acc, id) => acc + (answers.get(id)?.value ?? 0), 0);
    const partnerD = CPQ_PARTNER_DEMAND.reduce((acc, id) => acc + (answers.get(id)?.value ?? 0), 0);
    ownContribution = s(
      selfD >= partnerD
        ? "Aur ek baat, kyunki aaina dono taraf dekhta hai: chakkar mein zor waala hissa aksar aapki taraf se aata hai — aapke apne jawaabon ke mutaabik. Yeh dosh nahi; yeh woh hissa hai jo aapke haath mein hai."
        : "Aur ek baat, kyunki aaina dono taraf dekhta hai: chuppi waala hissa aksar aapki taraf se aata hai — aapke apne jawaabon ke mutaabik. Yeh dosh nahi; yeh woh hissa hai jo aapke haath mein hai.",
      [...CPQ_SELF_DEMAND, ...CPQ_PARTNER_DEMAND],
      "christensen-1990",
    );
  }

  /* R1 — autonomy clause (fixed copy). */
  const autonomy =
    "Faisla sirf aapka hai — aaina raasta nahi chunta, roshni deta hai. Yahan jo likha hai woh aapke apne jawaabon ka wazan hai, published research ke tarazu par. Aap ise jitni baar chahein, phir se dekh sakte hain.";

  assertCounsellorSafe(warningShot);
  assertCounsellorSafe(empathy);
  assertCounsellorSafe(autonomy);

  /* R13 exception, enforced at the engine: when the safety gate fires, coercion
   *  is never reframed as a mutual cycle, and joint-repair experiments are not
   *  prescribed. The report is still delivered (founder decision 7). */
  if (danger) {
    return {
      danger,
      archetype,
      confidence,
      affirmation,
      confirmations,
      cycle: null,
      warningShot,
      verdict: [
        s(
          "Suraksha waale jawaabon ke baad aaina apna tareeka badalta hai. Jo dar ya chot aapne batayi, woh kisi 'aapsi pattern' ka hissa nahi hai — uski zimmedari us behaviour ki hai jo use karta hai, aapki nahi.",
          safetyAnswers.length > 0 ? safetyAnswers.map((x) => x.itemId) : rawAnswers.map((x) => x.itemId),
          "brown-1996",
        ),
        ...verdict,
      ],
      empathy,
      paths,
      experiment: null,
      ownContribution: null,
      autonomy,
      scores,
      safety,
    };
  }

  return {
    danger,
    archetype,
    confidence,
    affirmation,
    confirmations,
    cycle,
    warningShot,
    verdict,
    empathy,
    paths,
    experiment,
    ownContribution,
    autonomy,
    scores,
    safety,
  };
}
