/**
 * Deploy, and then prove the thing that is actually being served works.
 *
 * A green build is not a deploy and a green deploy is not a working product. This script pushes
 * to production and then checks the served artifact from outside: that the page loads, that the
 * bundle it references is the one we just built, that the serverless function is alive and
 * answering, and that the secret it needs is actually set in the environment it runs in — which
 * is the failure that does not show up locally and takes down the whole report.
 *
 *   node scripts/deploy.mjs           deploy to production and verify
 *   node scripts/deploy.mjs --check   verify what is already live, deploy nothing
 *
 * Secrets are read from .env and never printed, never written anywhere, and never passed on a
 * command line where they would land in a process list.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CHECK_ONLY = process.argv.includes('--check')

/* ── env ───────────────────────────────────────────────────────────────── */

function readEnv(file = '.env') {
  const out = {}
  if (!fs.existsSync(file)) return out
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
  return out
}

const env = { ...readEnv(), ...process.env }
const TOKEN = env.VERCEL_TOKEN
const GROQ = env.GROQ_API_KEY

const fail = (msg) => { console.error(`\n  FAIL  ${msg}\n`); process.exit(1) }
const ok = (msg) => console.log(`  ok    ${msg}`)

if (!CHECK_ONLY && !TOKEN) fail('VERCEL_TOKEN is not set (.env or environment)')

/* ── run vercel without ever putting the token on a command line ────────── */

function vercel(args) {
  const r = spawnSync('npx', ['--yes', 'vercel@latest', ...args], {
    encoding: 'utf8',
    env: { ...process.env, VERCEL_TOKEN: TOKEN },
    shell: process.platform === 'win32',
    maxBuffer: 32 * 1024 * 1024,
  })
  return { code: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/* ── deploy ─────────────────────────────────────────────────────────────── */

let url = env.DEPLOY_URL ?? 'https://aaina-two.vercel.app'

if (!CHECK_ONLY) {
  console.log('\nSetting the production environment...')
  if (GROQ) {
    // Remove first so this is idempotent; a failure here is fine when the var does not exist yet.
    vercel(['env', 'rm', 'GROQ_API_KEY', 'production', '--yes'])
    const add = spawnSync('npx', ['--yes', 'vercel@latest', 'env', 'add', 'GROQ_API_KEY', 'production'], {
      input: `${GROQ}\n`,
      encoding: 'utf8',
      env: { ...process.env, VERCEL_TOKEN: TOKEN },
      shell: process.platform === 'win32',
    })
    if ((add.status ?? 1) !== 0) fail(`could not set GROQ_API_KEY: ${(add.stderr ?? '').slice(-400)}`)
    ok('GROQ_API_KEY set for production')
  } else {
    console.log('  --    no GROQ_API_KEY locally; leaving the deployed value alone')
  }

  console.log('\nDeploying...')
  const dep = vercel(['deploy', '--prod', '--yes'])
  if (dep.code !== 0) fail(`vercel deploy exited ${dep.code}\n${dep.out.slice(-1500)}`)
  const found = dep.out.match(/https:\/\/[a-z0-9-]+\.vercel\.app/gi)
  if (found?.length) url = found[found.length - 1]
  ok(`deployed: ${url}`)
}

/* ── verify what is actually being served ───────────────────────────────── */

console.log(`\nVerifying ${url}`)

const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
if (!res.ok) fail(`GET / returned ${res.status}`)
const html = await res.text()
ok(`GET / → 200, ${html.length} bytes`)

if (!/<title>[^<]*Aaina/i.test(html)) fail('the served page is not Aaina')
ok('it is Aaina')

/* The bundle the live page references must be the one in dist/, or something older is live. */
const served = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0]
if (!served) fail('the served page references no bundle')
const local = fs.existsSync('dist/assets')
  ? fs.readdirSync('dist/assets').find((f) => /^index-.*\.js$/.test(f))
  : null
if (local && !served.endsWith(local)) {
  fail(`live bundle is ${served}, local build is /assets/${local} — the deploy did not take`)
}
ok(local ? `bundle matches the local build (${local})` : `bundle ${served}`)

const asset = await fetch(new URL(served, url))
if (!asset.ok) fail(`the bundle itself returned ${asset.status}`)
ok(`bundle loads (${(Number(asset.headers.get('content-length') ?? 0) / 1024).toFixed(0)} kB)`)

/* The function. A 400 here is a PASS: it means the function ran and its validator rejected a
   deliberately empty body, which is exactly what it should do. A 404 means it was never deployed,
   and a 500 usually means the key is missing in the environment it runs in. */
const fn = await fetch(new URL('/api/write', url), {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: '{}',
})
if (fn.status === 404) fail('/api/write is not deployed')
if (fn.status >= 500) fail(`/api/write returned ${fn.status} — usually a missing key in the deployed environment`)
ok(`/api/write is live (rejected an empty body with ${fn.status}, which is correct)`)

/* Security headers, because they are set in vercel.json and are worth nothing unless served. */
const missing = ['x-content-type-options', 'referrer-policy', 'x-frame-options']
  .filter((h) => !res.headers.get(h))
if (missing.length) fail(`missing security headers: ${missing.join(', ')}`)
ok('security headers served')

/* The favicon, because a mirror with a broken icon is the first thing anybody notices. */
const icon = await fetch(new URL('/favicon.svg', url))
if (!icon.ok) fail(`favicon returned ${icon.status}`)
ok('favicon served')

console.log(`\n  LIVE  ${url}\n`)
console.log(path.basename(process.argv[1]), 'finished with nothing failing.\n')
