import { describe, expect, it } from "vitest";
import { assertCounsellorSafe, findBannedLanguage } from "./counsellorGuard";

describe("counsellor guard — banned language (Referee)", () => {
  it("blocks imperatives about the reader's decision", () => {
    expect(findBannedLanguage("Given this, you should leave him.")).not.toHaveLength(0);
    expect(findBannedLanguage("You must stay for the family.")).not.toHaveLength(0);
  });

  it("blocks compatibility percentages", () => {
    expect(findBannedLanguage("You are 87% compatible.")).not.toHaveLength(0);
  });

  it("blocks prophecy claims", () => {
    expect(findBannedLanguage("This model predicts your divorce.")).not.toHaveLength(0);
  });

  it("blocks lie-proof overclaims", () => {
    expect(findBannedLanguage("These questions are impossible to fake.")).not.toHaveLength(0);
  });

  it("blocks astrology register and character labels", () => {
    expect(findBannedLanguage("Your soulmate is out there.")).not.toHaveLength(0);
    expect(findBannedLanguage("He is a narcissist.")).not.toHaveLength(0);
  });

  it("accepts counsellor-grade evidence language (two-sided)", () => {
    const good =
      "You rated closeness low while also naming strong commitment. That tension is the finding. " +
      "Relationships with this pattern rarely shift without a named change. Only you can decide what to do; " +
      "here is what the evidence shows, and here are three roads, each with its own cost.";
    expect(() => assertCounsellorSafe(good)).not.toThrow();
  });
});
