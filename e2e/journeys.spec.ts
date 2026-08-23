import { test, expect, type Page } from "@playwright/test";

/** Arc-3 journeys. The full battery is ~135 items — the loop clicks through
 *  real screens, exactly as a user would. */

async function collectErrors(page: Page, sink: string[]) {
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      sink.push(`${msg.type()}: ${msg.text()}`);
    }
  });
}

async function answerCurrentQuestion(page: Page, optionIndex = 2) {
  const buttons = page
    .locator("main button:not([aria-expanded])")
    .filter({ hasNotText: /chhodein|turant niklein/i });
  const count = await buttons.count();
  const idx = Math.min(optionIndex, count - 1);
  await buttons.nth(idx).click();
}

test("jhalak: 8 items → evidenced micro-read → funnel to full Aaina", async ({ page }, testInfo) => {
  const errors: string[] = [];
  await collectErrors(page, errors);

  await page.goto("/jhalak");
  for (let i = 0; i < 8; i++) {
    await expect(page.getByText(/sawaal \d+ \/ 8/)).toBeVisible();
    await answerCurrentQuestion(page);
  }
  await expect(page.getByText(/पहली झलक/)).toBeVisible();
  await page.getByRole("button", { name: /yeh kaise pata/i }).click();
  await expect(page.getByText(/Funk, J\. L\., & Rogge/)).toBeVisible();
  await expect(page.getByRole("link", { name: /poora aaina/i })).toBeVisible();
  await page.screenshot({
    path: `e2e/screenshots/jhalak-read-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("resume: answers survive a reload and the flow continues where it left", async ({ page }) => {
  await page.goto("/jhalak");
  for (let i = 0; i < 3; i++) await answerCurrentQuestion(page);
  await expect(page.getByText(/sawaal 4 \/ 8/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/sawaal 4 \/ 8/)).toBeVisible();
});

/** Marker-driven walker: advances questions/boundaries until the safety
 *  interstitial marker appears. No screen-sniffing races. */
async function walkChaptersToSafety(page: Page, optionIndex: number) {
  const interstitial = page.getByText(/aur yeh sirf aapke liye hai/i);
  for (let guard = 0; guard < 600; guard++) {
    if (await interstitial.isVisible().catch(() => false)) return;
    const advance = page.getByRole("button", {
      name: /agla chapter|aakhri chhota section/i,
    });
    if (await advance.isVisible().catch(() => false)) {
      await advance.click().catch(() => {});
      continue;
    }
    const opts = page
      .locator("main button:not([aria-expanded])")
      .filter({ hasNotText: /chhodein|turant niklein|private jagah/i });
    const count = await opts.count();
    if (count > 0) {
      await opts.nth(Math.min(optionIndex, count - 1)).click().catch(() => {});
      continue;
    }
    await page.waitForTimeout(100);
  }
  throw new Error("walker never reached the safety interstitial");
}

/** Answer WAST until the report URL is reached. optionIndex 0 = calm end,
 *  99 = clamped to the distressed end. */
async function answerSafetyUntilReport(page: Page, optionIndex: number) {
  for (let guard = 0; guard < 100; guard++) {
    if (page.url().includes("/report")) return;
    const opts = page
      .locator("main button:not([aria-expanded])")
      .filter({ hasNotText: /chhodein|turant niklein/i });
    const count = await opts.count();
    if (count > 0) {
      await opts.nth(Math.min(optionIndex, count - 1)).click().catch(() => {});
    } else {
      await page.waitForTimeout(100);
    }
  }
  throw new Error("safety walker never reached /report");
}

test("full solo mirror: 5 chapters → boundaries with receipts → safety interstitial → report", async ({ page }, testInfo) => {
  test.setTimeout(480_000);
  const errors: string[] = [];
  await collectErrors(page, errors);

  await page.goto("/aaina");
  await expect(page.getByText(/5 chapters/i).first()).toBeVisible();
  await page.screenshot({
    path: `e2e/screenshots/intro-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: /shuru karein/i }).click();

  await walkChaptersToSafety(page, 2);

  await page.screenshot({
    path: `e2e/screenshots/safety-interstitial-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /private jagah/i }).click();

  // Quick-exit button must be present during safety questions.
  await expect(page.getByRole("button", { name: /quick exit|turant niklein/i })).toBeVisible();

  await answerSafetyUntilReport(page, 0); // calm end

  await expect(page).toHaveURL(/\/report/);
  await expect(page.getByText(/aapka aaina/i)).toBeVisible();
  await expect(page.getByText(/roshni/i).first()).toBeVisible();
  // Calm answers → NO safety branch.
  await expect(page.getByText(/pehle sabse zaroori baat/i)).toHaveCount(0);

  // Scale profile with published ranges + receipts.
  await expect(page.getByText(/aapke jawaabon ka naksha/i)).toBeVisible();
  await expect(page.getByText(/funk & rogge, 2007/i).first()).toBeVisible();

  // R6 invitation gate: verdict hidden until the reader consents.
  await expect(page.getByText(/teen raaste/i)).toHaveCount(0);
  await page.getByRole("button", { name: /main taiyaar hoon/i }).click();
  await expect(page.getByText(/teen raaste/i)).toBeVisible();
  await expect(page.getByText(/raasta 3/i)).toBeVisible();
  await expect(page.getByText(/faisla sirf aapka hai/i)).toBeVisible();

  await page.screenshot({
    path: `e2e/screenshots/report-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("danger branch: distressed WAST answers surface verified helplines FIRST", async ({ page }) => {
  test.setTimeout(480_000);
  await page.goto("/aaina");
  await page.getByRole("link", { name: /shuru karein/i }).click();

  await walkChaptersToSafety(page, 0);
  await page.getByRole("button", { name: /private jagah/i }).click();
  await answerSafetyUntilReport(page, 99); // clamped to the distressed end

  await expect(page).toHaveURL(/\/report/);
  await expect(page.getByText(/pehle sabse zaroori baat/i)).toBeVisible();
  await expect(page.getByText(/181/).first()).toBeVisible();
  await expect(page.getByText(/14416/).first()).toBeVisible();
  await expect(page.getByText(/aapki galti nahi/i)).toBeVisible();
});
