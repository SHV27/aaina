import { test, expect, type Page } from "@playwright/test";

/** v2 journeys. The composer is stubbed at the network boundary so these run
 *  fast and deterministically; the live model is exercised separately by
 *  scripts/anti-generic-proof.ts and scripts/live-compose-probe.mjs. */

const STUB = {
  result: {
    claims: [
      {
        text: "You scored 93 out of 100 on commitment and 21 on everyday satisfaction. Those two numbers rarely sit together.",
        evidence_ids: ["o1"],
      },
      {
        text: "You said “Agree completely” to wanting this to last a very long time, in the same sitting as rating your satisfaction near the floor.",
        evidence_ids: ["o1"],
      },
    ],
  },
};

async function stubComposer(page: Page) {
  await page.route("**/api/compose", async (route) => {
    const body = route.request().postDataJSON() as { evidenceIds: string[] };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          claims: STUB.result.claims.map((c) => ({
            ...c,
            evidence_ids: [body.evidenceIds[0] ?? "o1"],
          })),
        },
      }),
    });
  });
}

async function seedProfile(page: Page, over: Record<string, number> = {}) {
  await page.addInitScript(
    ([overrides]) => {
      const mk = (id: string, v: number) => [id, { itemId: id, value: v, tMs: 2600 }];
      const e: [string, unknown][] = [];
      const push = (prefix: string, n: number, v: number) => {
        for (let i = 1; i <= n; i++) e.push(mk(`${prefix}-${i}`, v) as [string, unknown]);
      };
      push("sat", 11, 1);
      push("com", 9, 7);
      e.push(mk("com-4", 1) as never, mk("com-5", 1) as never, mk("com-9", 1) as never);
      push("cfl", 9, 3);
      push("ppr", 10, 3);
      push("trs", 8, 1);
      push("sex", 5, 3);
      push("phb", 9, 3);
      push("dgj", 6, 4);
      push("crt", 7, 3);
      push("gst", 6, 3);
      push("fam", 8, 3);
      push("net", 5, 3);
      push("val", 8, 3);
      push("anx", 6, 4);
      push("avo", 6, 4);
      push("fbs", 7, 3);
      e.push(mk("opn-1", 3) as never, mk("opn-2", 4) as never);
      e.push(mk("att-1", 3) as never, mk("att-2", 5) as never);
      const responses = Object.fromEntries(e);
      Object.assign(responses, overrides);
      localStorage.setItem(
        "aaina-v2-session",
        JSON.stringify({
          state: {
            responses,
            skipped: [],
            context: {
              hasPartner: true,
              partnerWilling: false,
              ageBand: "22-29",
              stage: "committed",
            },
            startedAt: Date.now(),
            storageBlocked: false,
          },
          version: 1,
        }),
      );
    },
    [over],
  );
}

test("landing speaks English, with Hinglish only as the headline", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors.push(m.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dekhiye jo sach hai");

  const body = (await page.locator("main").innerText()).toLowerCase();
  // Body prose must not contain the transliterated Hindi that v1 was full of.
  for (const word of ["aapke", "jawaab", "sawaal", "rishte", "nahi ", "kyun", "bahut"]) {
    expect(body, `body copy contains Hinglish: ${word}`).not.toContain(word);
  }

  await page.screenshot({
    path: `e2e/screenshots/v2-landing-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("context screen gates partner questions for solo users", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("button", { name: /this is about me/i }).click();
  await expect(page.getByText(/would they do exercises with you/i)).toHaveCount(0);
  // The accessible name includes each button's hint line, so match on the hint.
  await page.getByRole("button", { name: /someone particular/i }).click();
  await expect(page.getByText(/would they do exercises with you/i)).toBeVisible();
});

test("assessment answers, saves, and resumes after a reload", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("button", { name: /start the questions/i }).click();

  for (let i = 0; i < 4; i++) {
    await page.locator("main button").filter({ hasNotText: /skip this one/i }).first().click();
  }
  const before = await page.getByText(/\d+ \/ \d+/).first().innerText();

  await page.reload();
  const after = await page.getByText(/\d+ \/ \d+/).first().innerText();
  expect(after).toBe(before);
});

test("report renders the dossier, the plan, and honest limits", async ({ page }, testInfo) => {
  await stubComposer(page);
  await seedProfile(page);
  await page.goto("/report");

  await expect(page.getByRole("heading", { name: /your reading/i })).toBeVisible();
  await expect(page.getByText(/\/ 100/).first()).toBeVisible();

  // The composite must show its own working.
  await page.getByText(/how this number is calculated/i).click();
  await expect(page.getByRole("table")).toBeVisible();

  // Tensions, dimension chapters, and the plan.
  await expect(page.getByRole("heading", { name: /what your answers disagree about/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /dimension by dimension/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /now the work/i })).toBeVisible();
  await expect(page.getByText(/step 1 ·/i)).toBeVisible();

  // Honest limits are not optional.
  await expect(page.getByRole("heading", { name: /what this reading cannot see/i })).toBeVisible();
  await expect(page.getByText(/not a diagnosis and it is not a prediction/i)).toBeVisible();

  await page.screenshot({
    path: `e2e/screenshots/v2-report-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("safety screen: never stored, quick exit present, plan becomes solo-only", async ({ page }) => {
  await stubComposer(page);
  await seedProfile(page);
  await page.goto("/safety");

  await expect(page.getByText(/these answers are never saved/i)).toBeVisible();
  await page.getByRole("button", { name: /i have privacy/i }).click();
  await expect(page.getByRole("button", { name: /leave now/i })).toBeVisible();

  // Answer at the most severe end throughout.
  for (let i = 0; i < 8; i++) {
    await page
      .locator("main button")
      .filter({ hasNotText: /leave now|stop this section/i })
      .last()
      .click();
  }

  await expect(page).toHaveURL(/\/report/);
  await expect(page.getByRole("heading", { name: /before the rest of the report/i })).toBeVisible();
  await expect(page.getByText(/181/).first()).toBeVisible();
  await expect(page.getByText(/14416/).first()).toBeVisible();
  await expect(page.getByText(/none of this is your fault/i)).toBeVisible();

  // The reading is still delivered.
  await expect(page.getByRole("heading", { name: /dimension by dimension/i })).toBeVisible();

  // And the plan contains only solo work.
  await expect(page.getByText(/contains only\s+things you can do alone/i)).toBeVisible();
  const planText = await page.locator("main").innerText();
  expect(planText).not.toContain("needs both of you");

  // Risk answers must never reach storage.
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  for (let i = 1; i <= 8; i++) expect(stored).not.toContain(`risk-${i}`);
});

test("science and privacy pages state the sources and the honest disclosure", async ({ page }) => {
  await page.goto("/science");
  await expect(page.getByRole("heading", { name: /the research behind this/i })).toBeVisible();
  await expect(page.getByText(/Funk, J\. L\., & Rogge/).first()).toBeVisible();
  await expect(page.getByText(/two dimensions are bespoke/i)).toBeVisible();

  await page.goto("/privacy");
  await expect(page.getByText(/some of it is sent to an AI service/i)).toBeVisible();
  await expect(page.getByText(/never sent anywhere/i)).toBeVisible();
});
