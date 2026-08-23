import { chromium } from "@playwright/test";

const seed = () => {
  const mk = (id, v) => [id, { itemId: id, value: v, tMs: 2500 }];
  const entries = [];
  for (const n of [1, 5, 9, 11, 12, 17, 19, 20, 21, 22, 26, 27, 28, 30, 31, 32]) entries.push(mk("csi-" + n, 3));
  for (let i = 1; i <= 12; i++) entries.push(mk("ecr-" + i, 4));
  for (const s of ["a1", "a2", "a3a", "a3b", "b4", "b5", "b6", "b7a", "b7b", "b8a", "b8b"]) entries.push(mk("cpq-" + s, 5));
  for (const p of ["s", "a", "i"]) for (let n = 1; n <= 5; n++) entries.push(mk("ims-" + p + n, 4));
  for (let n = 1; n <= 7; n++) entries.push(mk("ims-c" + n, 4));
  for (let n = 1; n <= 27; n++) entries.push(mk("joel-s" + n, 4));
  for (let n = 1; n <= 23; n++) entries.push(mk("joel-l" + n, 5));
  for (let n = 1; n <= 13; n++) entries.push(mk("mcc-" + n, 1));
  entries.push(mk("iri-1", 3), mk("iri-2", 5), mk("iri-3", 3));
  return JSON.stringify({ state: { answers: Object.fromEntries(entries), skippedIds: [], storageBlocked: false }, version: 1 });
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.addInitScript((s) => localStorage.setItem("aaina-answers", s), seed());
await page.goto("http://localhost:4310/report");
await page.waitForTimeout(800);
await page.emulateMedia({ media: "print" });
await page.pdf({ path: "e2e/screenshots/report-print.pdf", format: "A4" });
await page.emulateMedia({ media: "screen" });
// Also screenshot print-emulated view for eyeballing
await page.emulateMedia({ media: "print" });
await page.screenshot({ path: "e2e/screenshots/report-print.png", fullPage: true });
// Verdict must be visible in print without clicking the gate
const verdictVisible = await page.getByText(/pattern|imaandaari/i).first().isVisible();
console.log("verdict-in-print:", verdictVisible);
await browser.close();
