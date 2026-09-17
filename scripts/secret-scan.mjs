/**
 * Refuses to let a credential reach the repository.
 *
 * Runs as part of `npm run verify`, before build and tests, because a leaked key is the one defect
 * you cannot fix by shipping again. Scans everything git would actually commit — not the working
 * tree — so an ignored .env is correctly invisible and a staged one is correctly caught.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const PATTERNS = [
  [/\bgsk_[A-Za-z0-9]{20,}/, 'Groq API key'],
  [/\bvcp_[A-Za-z0-9]{20,}/, 'Vercel token'],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9]{20,}/, 'OpenAI-style key'],
  [/\bAIza[0-9A-Za-z_-]{30,}/, 'Google API key'],
  [/\bAQ\.[A-Za-z0-9_-]{30,}/, 'Google AI Studio key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./, 'JWT'],
]

/** Files that legitimately describe key SHAPES without containing one. */
const ALLOW = [/^\.env\.example$/, /^scripts\/secret-scan\.mjs$/]

let tracked
try {
  tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean)
} catch {
  console.error('secret-scan: not a git repository')
  process.exit(1)
}

const findings = []
for (const file of tracked) {
  if (ALLOW.some((re) => re.test(file))) continue
  let text
  try {
    const stat = fs.statSync(file)
    if (stat.size > 2_000_000) continue
    text = fs.readFileSync(file, 'utf8')
  } catch {
    continue // binary or unreadable
  }
  for (const [re, label] of PATTERNS) {
    const m = text.match(re)
    if (m) findings.push(`${file}: ${label} (${m[0].slice(0, 8)}…)`)
  }
}

// A tracked .env of any kind is a defect regardless of contents.
for (const file of tracked) {
  if (/(^|\/)\.env($|\.)/.test(file) && !/\.env\.example$/.test(file)) {
    findings.push(`${file}: env file is tracked by git`)
  }
}

if (findings.length) {
  console.error('\nSECRET SCAN FAILED\n')
  for (const f of findings) console.error(`  ✗ ${f}`)
  console.error('\nNothing was committed. Remove the secret, rotate it, and try again.\n')
  process.exit(1)
}

console.log(`secret-scan: clean (${tracked.length} tracked files)`)
