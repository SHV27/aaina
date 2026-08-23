import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_ID__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA ?? `local-${Date.now()}`),
  },
  // @ts-expect-error vitest config key consumed by vitest, not vite
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: false,
  },
});
