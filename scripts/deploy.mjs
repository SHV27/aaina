/**
 * Ship, and then prove that the thing actually being served works.
 *
 * A green build is not a deploy and a green deploy is not a working product. This sets the
 * production environment, waits for the deployment Git triggered, and then checks the served
 * artifact from outside: that the page is Aaina, that the bundle it references is the one we just
 * built, that the function is alive and answering, that the headers in vercel.json are actually
 * served, and that the favicon loads. When a build fails it prints the part of the log that says
 * why, rather than a dashboard link.
 *
 *   node scripts/deploy.mjs           wait for the deployment of HEAD, then verify
 *   node scripts/deploy.mjs --check   verify what is live now, wait for nothing
 *
 * WHY THE REST API AND NOT THE CLI: the token here is project-scoped (`vcp_`). Those authorise
 * operations on one project and carry no user, so every CLI command that wants a user — whoami,
 * env add, deploy — fails with "User not found" no matter how the token is supplied. The REST
 * endpoints under /projects/{id} accept it, and the deployment itself comes from the GitHub
 * integration, which is a better trigger anyway: what ships is what is on the branch.
 *
 * The token is never printed, never written anywhere, and never put on a command line.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const CHECK_ONLY = process.argv.includes('--check')

const fail = (msg) => { console.error(`\n  FAIL  ${msg}\n`); process.exit(1) }
const ok = (msg) => console.log(`  ok    ${msg}`)
const note = (msg) => console.log(`  --    ${msg}`)

/* ── config ─────────────────────────────────────────────────────────────── */

function readEnvFile(file = '.env') {
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

const env = { ...readEnvFile(), ...process.env }
const TOKEN = env.VERCEL_TOKEN
if (!TOKEN) fail('VERCEL_TOKEN is not set (.env or environment)')

let project
try {
  project = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'))
} catch {
  fail('.vercel/project.json is missing — link the project once with `npx vercel link`')
}
const { projectId, orgId } = project
const qs = orgId ? `teamId=${orgId}` : ''

async function api(path, init = {}) {
  const url = `https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}${qs}`
  const r = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
  })
  const text = await r.text()
  let body
  try { body = text ? JSON.parse(text) : {} } catch { body = { raw: text } }
  return { ok: r.ok, status: r.status, body }
}

/* ── the production environment ─────────────────────────────────────────── */

if (!CHECK_ONLY && env.GROQ_API_KEY) {
  const r = await api(`/v10/projects/${projectId}/env?upsert=true`, {
    method: 'POST',
    body: JSON.stringify({
      key: 'GROQ_API_KEY',
      value: env.GROQ_API_KEY,
      type: 'encrypted',
      target: ['production', 'preview'],
    }),
  })
  if (!r.ok) fail(`could not set GROQ_API_KEY (${r.status}): ${JSON.stringify(r.body).slice(0, 300)}`)
  ok('GROQ_API_KEY set for production and preview')
} else if (!CHECK_ONLY) {
  note('no GROQ_API_KEY locally; leaving the deployed value alone')
}

/* ── the deployment Git triggered ───────────────────────────────────────── */

const head = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout?.trim()

/* The production domain, asked for rather than guessed.
   Guessing `${projectName}.vercel.app` produced aaina.vercel.app, which belongs to somebody else
   and serves a 644-byte placeholder — so the verification passed its fetch and then correctly
   reported that the page was not Aaina. A deploy check that can be satisfied by a stranger's
   domain is not a deploy check. */
let live = env.DEPLOY_URL ?? null
{
  const r = await api(`/v9/projects/${projectId}/domains`)
  const names = (r.body.domains ?? []).map((d) => d.name).filter(Boolean)
  // Prefer a real custom domain; fall back to the project's own vercel.app alias.
  const custom = names.find((n) => !n.endsWith('.vercel.app'))
  live = live ?? (custom ? `https://${custom}` : names[0] ? `https://${names[0]}` : null)
  if (!live) fail('the project has no production domain')
}

async function latestProduction() {
  const r = await api(`/v6/deployments?projectId=${projectId}&target=production&limit=10`)
  if (!r.ok) fail(`could not list deployments (${r.status})`)
  return r.body.deployments ?? []
}

async function buildLog(uid) {
  const r = await fetch(`https://api.vercel.com/v3/deployments/${uid}/events?${qs}&limit=500`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  const text = await r.text()
  const lines = []
  for (const chunk of text.split('\n')) {
    if (!chunk.trim()) continue
    try {
      const e = JSON.parse(chunk)
      const t = e.text ?? e.payload?.text
      if (t) lines.push(t)
    } catch {
      try {
        for (const e of JSON.parse(text)) {
          const t = e.text ?? e.payload?.text
          if (t) lines.push(t)
        }
        break
      } catch { /* not JSON at all */ }
    }
  }
  return lines
}

if (!CHECK_ONLY) {
  console.log(`\nWaiting for the production deployment of ${head?.slice(0, 7)}...`)
  const deadline = Date.now() + 12 * 60_000
  let target = null

  while (Date.now() < deadline) {
    const all = await latestProduction()
    target = all.find((d) => d.meta?.githubCommitSha === head) ?? null

    if (!target) {
      const newest = all[0]
      if (newest && Date.now() - newest.created > 10 * 60_000) {
        fail(`no production deployment for ${head?.slice(0, 7)}. Push the branch, or the Git integration is not connected.`)
      }
      await new Promise((r) => setTimeout(r, 6000))
      continue
    }

    const state = target.state ?? target.readyState
    if (state === 'READY') { ok(`build ready (${target.url})`); break }
    if (state === 'ERROR' || state === 'CANCELED') {
      const lines = await buildLog(target.uid)
      console.error(`\n  the build ${state.toLowerCase()}. Last of the log:\n`)
      console.error(lines.slice(-30).map((l) => `    ${l}`).join('\n'))
      fail(`deployment ${target.uid} did not build`)
    }
    process.stdout.write('.')
    await new Promise((r) => setTimeout(r, 6000))
  }

  if (!target) fail('timed out waiting for the deployment')
  const state = target.state ?? target.readyState
  if (state !== 'READY') fail(`deployment is still ${state} after 12 minutes`)
}

/* ── verify the served artifact ─────────────────────────────────────────── */

console.log(`\nVerifying ${live}`)

const res = await fetch(live, { headers: { 'cache-control': 'no-cache' } })
if (!res.ok) fail(`GET / returned ${res.status}`)
const html = await res.text()
ok(`GET / → 200, ${html.length} bytes`)

if (!/<title>[^<]*Aaina/i.test(html)) fail('the served page is not Aaina')
ok('it is Aaina')

const served = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0]
if (!served) fail('the served page references no bundle')
const local = fs.existsSync('dist/assets')
  ? fs.readdirSync('dist/assets').find((f) => /^index-.*\.js$/.test(f))
  : null
if (local && !served.endsWith(local)) {
  fail(`live bundle is ${served}, local build is /assets/${local} — something older is being served`)
}
ok(local ? `bundle matches the local build (${local})` : `bundle ${served}`)

const asset = await fetch(new URL(served, live))
if (!asset.ok) fail(`the bundle itself returned ${asset.status}`)
ok(`bundle loads (${(Number(asset.headers.get('content-length') ?? 0) / 1024).toFixed(0)} kB)`)

/* A 400 here is a PASS: the function ran and its validator rejected a deliberately empty body,
   which is exactly what it should do. 404 means it was never deployed. 500 usually means the key
   is missing in the environment it actually runs in, which is the failure local tests cannot see. */
const fn = await fetch(new URL('/api/write', live), {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: '{}',
})
if (fn.status === 404) fail('/api/write is not deployed')
if (fn.status >= 500) fail(`/api/write returned ${fn.status} — usually a missing key in the deployed environment`)
ok(`/api/write is live (rejected an empty body with ${fn.status}, which is correct)`)

const missing = ['x-content-type-options', 'referrer-policy', 'x-frame-options']
  .filter((h) => !res.headers.get(h))
if (missing.length) fail(`missing security headers: ${missing.join(', ')}`)
ok('security headers served')

const icon = await fetch(new URL('/favicon.svg', live))
if (!icon.ok) fail(`favicon returned ${icon.status}`)
ok('favicon served')

console.log(`\n  LIVE  ${live}\n`)
