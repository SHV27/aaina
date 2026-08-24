#!/usr/bin/env node
/** Deploy: sets the model key as a Vercel env var (from .env, never printed),
 *  then ships to production and verifies what is actually served.
 *  Run: node scripts/deploy.mjs */
import { execFileSync, execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const TOKEN = env.VERCEL_TOKEN;
const SCOPE = "god-shaurya";
const base = ["--token", TOKEN, "--scope", SCOPE];

function run(args, opts = {}) {
  return execFileSync("npx", ["--yes", "vercel", ...args], {
    encoding: "utf8",
    shell: true,
    stdio: opts.silent ? ["pipe", "pipe", "pipe"] : ["pipe", "pipe", "inherit"],
    input: opts.input,
  });
}

// 1. Ensure GROQ_API_KEY exists in production. Remove-then-add keeps it current
//    without ever echoing the value.
try {
  run(["env", "rm", "GROQ_API_KEY", "production", "--yes", ...base], { silent: true });
  console.log("· removed previous GROQ_API_KEY");
} catch {
  console.log("· no previous GROQ_API_KEY");
}
run(["env", "add", "GROQ_API_KEY", "production", ...base], {
  input: `${env.GROQ_API_KEY}\n`,
  silent: true,
});
console.log("· GROQ_API_KEY set for production");

// 2. Deploy.
const out = run(["deploy", "--prod", "--yes", ...base], { silent: true });
const url = (out.match(/https:\/\/[a-z0-9-]+\.vercel\.app/g) ?? []).pop();
console.log(`· deployed: ${url}`);

// 3. Verify what is actually served, not just that the build went green.
const ALIAS = "https://aaina-two.vercel.app";
await new Promise((r) => setTimeout(r, 4000));

const home = await fetch(ALIAS);
const html = await home.text();
console.log(`· ${ALIAS} -> ${home.status}`);
console.log(`· title present: ${/Dekhiye jo sach hai|Aaina/.test(html)}`);

for (const path of ["/start", "/assessment", "/report", "/science", "/privacy"]) {
  const r = await fetch(ALIAS + path);
  console.log(`· ${path} -> ${r.status}`);
}

const compose = await fetch(`${ALIAS}/api/compose`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    section: "smoke",
    evidenceIds: ["e1"],
    prompt:
      "SECTION: smoke\nPURPOSE: smoke test.\n\nEVIDENCE (the only facts you may use):\n[e1] Commitment: 78/100 and everyday satisfaction: 29/100.\n\nTHIS SECTION MUST:\n1. State both numbers.",
  }),
});
const body = await compose.json().catch(() => ({}));
console.log(`· /api/compose -> ${compose.status}`);
if (body.result?.claims?.length) {
  console.log(`· live generation OK (${body.result.claims.length} claims, model ${body.model})`);
  console.log(`  "${body.result.claims[0].text.slice(0, 140)}…"`);
} else {
  console.log(`· compose body: ${JSON.stringify(body).slice(0, 200)}`);
}
