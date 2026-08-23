import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:4315",
    screenshot: "only-on-failure",
    // Deterministic screenshots + exercises the prefers-reduced-motion path.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Dedicated port: 4173 can be occupied by other local projects' previews.
    command: "npx vite preview --port 4315 --strictPort",
    url: "http://localhost:4315",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
