import { test, expect } from "@playwright/test";

test("walking skeleton: home → 3 answers → evidenced micro-read, zero console errors", async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleErrors.push(`${msg.type()}: ${msg.text()}`);
    }
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("sach");
  await expect(page.getByRole("status")).toBeVisible(); // mode badge — observable degradation
  await page.screenshot({
    path: `e2e/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  });

  await page.getByRole("link", { name: /jhalak/i }).click();

  for (let i = 0; i < 3; i++) {
    await expect(page.getByText(/Sawaal/)).toBeVisible();
    await page.getByRole("button").first().click();
  }

  await expect(page.getByText(/पहली झलक/)).toBeVisible();
  // Receipts: the expander must exist and reveal the citation + user's answers
  await page.getByRole("button", { name: /yeh kaise pata/i }).click();
  await expect(page.getByText(/Funk, J\. L\., & Rogge/)).toBeVisible();
  await expect(page.getByText(/Aapke apne jawaab/)).toBeVisible();
  await page.screenshot({
    path: `e2e/screenshots/microread-${testInfo.project.name}.png`,
    fullPage: true,
  });

  expect(consoleErrors, consoleErrors.join("\n")).toHaveLength(0);
});
