// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Claim } from "./Claim";
import type { Evidence } from "../engine/types";

describe("Receipts law — Claim renderer", () => {
  it("refuses to render a claim without answer ids (throws in dev)", () => {
    const bad = { answerIds: [], source: "funk-rogge-2007" } as Evidence;
    expect(() =>
      render(<Claim evidence={bad}>uncited prose</Claim>),
    ).toThrowError(/without valid evidence/);
  });

  it("refuses a claim with an unknown citation id", () => {
    const bad = { answerIds: ["csi-1"], source: "made-up" } as unknown as Evidence;
    expect(() =>
      render(<Claim evidence={bad}>uncited prose</Claim>),
    ).toThrowError(/without valid evidence/);
  });

  it("accepts and renders a fully-evidenced claim (two-sided guard)", () => {
    render(
      <Claim evidence={{ answerIds: ["csi-1"], source: "funk-rogge-2007" }}>
        an evidenced sentence
      </Claim>,
    );
    expect(screen.getByText(/an evidenced sentence/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /yeh kaise pata/i })).toBeTruthy();
  });
});
