import { describe, expect, it } from "vitest";
import { assertVoice, findVoiceViolations, looksGeneric } from "./voice";

describe("voice guard — AI tells", () => {
  it("catches the machine-written phrases", () => {
    const bad = [
      "It's important to note that your commitment is high.",
      "Let's delve into what this means.",
      "You will navigate the complexities of this together.",
      "In today's fast-paced world, relationships take work.",
      "This is a game-changer for your relationship.",
      "In conclusion, you have options.",
      "Remember, you are not alone.",
      "Every relationship is unique.",
    ];
    for (const t of bad) {
      expect(findVoiceViolations(t).some((v) => v.law === "ai-tell"), t).toBe(true);
    }
  });

  it("passes writing that sounds like a person (two-sided)", () => {
    const good = [
      "You rated satisfaction 31 out of 100 and commitment 78. Those two numbers do not usually sit together.",
      "You said “rarely” to whether arguments get resolved, and “almost always” to whether you start them.",
      "That gap is the finding. It is not a character flaw and it is not permanent.",
    ];
    for (const t of good) expect(() => assertVoice(t), t).not.toThrow();
  });
});

describe("voice guard — English body copy", () => {
  it("rejects Hinglish prose in the body", () => {
    expect(
      findVoiceViolations("Aapke jawaabon mein strain dikhta hai.").some(
        (v) => v.law === "hinglish-body",
      ),
    ).toBe(true);
    expect(
      findVoiceViolations("Yeh sirf ek jhalak hai, poora report baaki hai.").some(
        (v) => v.law === "hinglish-body",
      ),
    ).toBe(true);
  });

  it("allows Hinglish where it is deliberately permitted (headline registry)", () => {
    expect(
      findVoiceViolations("Dekhiye jo sach hai", { allowHinglish: true }),
    ).toHaveLength(0);
  });
});

describe("voice guard — forbidden claims", () => {
  it("blocks commands, percentages, prophecy, lie-proofing, astrology, labels, diagnosis", () => {
    const bad = [
      "Given all this, you should leave him.",
      "You are 84% compatible.",
      "This pattern predicts your divorce.",
      "These questions are impossible to fake.",
      "He is your soulmate.",
      "You're a narcissist.",
      "This suggests a diagnosis of depression.",
    ];
    for (const t of bad) {
      expect(findVoiceViolations(t).some((v) => v.law === "forbidden-claim"), t).toBe(true);
    }
  });

  it("allows a confident read of the pattern that leaves the choice open", () => {
    const good =
      "Relationships with this profile rarely change without one specific thing changing first. What you do with that is yours to decide.";
    expect(() => assertVoice(good)).not.toThrow();
  });
});

describe("Barnum detection", () => {
  it("flags sentences that would fit almost anyone", () => {
    const generic = [
      "You sometimes feel unsure about where things are going.",
      "Most couples struggle with communication at some point.",
      "You value honesty in a relationship.",
      "Deep down, you know what you want.",
    ];
    for (const s of generic) expect(looksGeneric(s), s).toBe(true);
  });

  it("does not flag sentences anchored to this person's data (two-sided)", () => {
    const specific = [
      "You sometimes feel unsure about where things are going — you rated certainty 22 out of 100.",
      "You said “never” to whether arguments end with both of you understood.",
      "Your commitment sits at 78 while satisfaction sits at 31.",
    ];
    for (const s of specific) expect(looksGeneric(s), s).toBe(false);
  });
});
