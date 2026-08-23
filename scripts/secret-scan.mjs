#!/usr/bin/env node
// Secret scan over staged files. Blocks commit on hit. Cross-platform (Node).
import { execSync } from "node:child_process";

const patterns = [
  /vcp_[A-Za-z0-9]{20,}/, // Vercel tokens
  /gsk_[A-Za-z0-9]{20,}/, // Groq keys
  /sk-[A-Za-z0-9_-]{20,}/, // generic sk- keys
  /gh[pousr]_[A-Za-z0-9]{20,}/, // GitHub tokens
  /AIza[0-9A-Za-z_-]{30,}/, // Google API keys
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}/, // JWTs
  /(api[_-]?key|token|secret|password)\s*[:=]\s*['"][^'"\s]{16,}['"]/i,
];

let staged;
try {
  staged = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" })
    .split("\n").filter(Boolean);
} catch { process.exit(0); }

let hit = false;
for (const file of staged) {
  if (/\.(png|jpg|jpeg|gif|webp|woff2?|ttf|ico|pdf)$/i.test(file)) continue;
  let content;
  try {
    content = execSync(`git show :"${file}"`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  } catch { continue; }
  for (const p of patterns) {
    const m = content.match(p);
    if (m) {
      console.error(`SECRET-SCAN BLOCK: ${file} matches ${p} (…${String(m[0]).slice(0, 8)}…)`);
      hit = true;
    }
  }
}
if (hit) {
  console.error("Commit blocked. Move secrets to .env and reference by name.");
  process.exit(1);
}
process.exit(0);
