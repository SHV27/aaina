import { test, expect } from "@playwright/test";
import { encodeExchange } from "../src/engine/codec";
import { ALL_ASSESSMENT_ITEMS } from "../src/engine/items";
import type { Answer } from "../src/engine/types";

function fullAnswers(offset: number): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  ALL_ASSESSMENT_ITEMS.forEach((item, i) => {
    const values = item.scale.map((s) => s.value);
    out[item.id] = {
      itemId: item.id,
      value: values[(i + offset) % values.length],
      tMs: 2500,
    };
  });
  return out;
}

test("do aaine: sealed link → commit-before-see → merged gap report with receipts", async ({ page }) => {
  const mine = fullAnswers(1);
  const theirs = fullAnswers(3);
  const fragment = encodeExchange(theirs, "Priya");

  // Seed my completed assessment before the app boots.
  await page.addInitScript((state) => {
    localStorage.setItem("aaina-answers", state);
  }, JSON.stringify({ state: { answers: mine, skippedIds: [], storageBlocked: false }, version: 1 }));

  await page.goto(`/saath#${fragment}`);

  await expect(page.getByText(/Priya ka aaina pahunch gaya/i)).toBeVisible();
  // Fragment is wiped from the URL bar after decode.
  await expect(page).not.toHaveURL(/#./);

  await page.getByRole("link", { name: /milaan dekhein/i }).click();
  await expect(page).toHaveURL(/\/report/);
  await expect(page.getByText(/दो आईने/)).toBeVisible();
  await expect(page.getByText(/aap aur Priya/i)).toBeVisible();
  await expect(page.getByText(/jahan nazrein sabse alag thi/i)).toBeVisible();
});

test("do aaine sealed-commit: partner mirror stays closed until mine is complete", async ({ page }) => {
  const theirs = fullAnswers(2);
  const fragment = encodeExchange(theirs, "Rahul");

  // NO seeded answers — I haven't done my mirror.
  await page.goto(`/saath#${fragment}`);
  await expect(page.getByText(/Rahul ka aaina pahunch gaya/i)).toBeVisible();
  await expect(page.getByText(/tab khulega jab aap apna aaina poora/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /milaan dekhein/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /pehle apna aaina poora/i })).toBeVisible();
});

test("corrupt sealed link fails loudly with guidance", async ({ page }) => {
  await page.goto("/saath#not-a-real-payload");
  await expect(page.getByText(/poora nahi pahuncha/i)).toBeVisible();
});
