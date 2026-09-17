/**
 * Captures the screenshots the README shows.
 *
 * Runs against the real built app with a seeded assessment, at both the desktop and phone widths
 * the design targets. Committed under docs/shots so the repository's front page shows the product
 * rather than describing it.
 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const OUT = path.join('docs', 'shots')
fs.mkdirSync(OUT, { recursive: true })

const BASE = process.env.BASE ?? 'http://localhost:4319'
const seed = fs.readFileSync(path.join('e2e', 'fixtures', 'arjun.json'), 'utf8')

const SHOTS = [
  { name: 'landing', url: '/', full: true, seed: false },
  { name: 'question', url: '/begin', full: false, seed: false, steps: 'jhalak' },
  { name: 'jhalak', url: '/begin', full: true, seed: false, steps: 'payout' },
  { name: 'report', url: '/report', full: true, seed: true, wait: 'report' },
  { name: 'receipt', url: '/report', full: false, seed: true, wait: 'report', steps: 'receipt' },
  { name: 'science', url: '/science', full: false, seed: false },
  { name: 'privacy', url: '/privacy', full: false, seed: false },
]

const VIEWPORTS = [
  { tag: 'desktop', width: 1280, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  for (const s of SHOTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    })
    if (s.seed) await ctx.addInitScript((p) => { try { localStorage.setItem('aaina-v3', p) } catch { /* ignore */ } }, seed)
    const page = await ctx.newPage()

    // The README should show the product working, not a rate-limit banner, so the writer is
    // stubbed off and the deterministic report is captured — which is also the honest worst case.
    if (s.wait === 'report') {
      await page.route('**/api/write', (r) =>
        r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"writer_unavailable"}' }))
    }

    await page.goto(BASE + s.url, { waitUntil: 'networkidle' })

    if (s.steps === 'jhalak' || s.steps === 'payout') {
      await page.getByRole('button', { name: /^Together In a relationship/ }).click()
      if (s.steps === 'payout') {
        for (const label of ['A little true', 'Mostly true', 'Completely true', 'A little true', 'Completely true']) {
          await page.getByRole('button', { name: label }).click()
        }
        await page.locator('textarea').fill(
          'I do not know if I am being loyal or if I am just scared of being the person who ruined everything. My parents will never agree and she knows it.',
        )
        await page.getByRole('button', { name: 'Save and continue' }).click()
        await page.getByRole('heading', { name: /Here is what you have already told us/ }).waitFor()
      }
    }

    if (s.wait === 'report') {
      await page.waitForSelector('.claim-open', { timeout: 90_000 })
      await page.waitForFunction(
        () => [...document.querySelectorAll('main section h2')].some((h) => h.textContent?.includes('What this cannot tell you')),
        undefined,
        { timeout: 180_000 },
      )
    }

    if (s.steps === 'receipt') {
      const r = page.locator('.claim-open').nth(2)
      await r.scrollIntoViewIfNeeded()
      await r.click()
      await page.waitForTimeout(400)
      await page.locator('.receipt').first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
    }

    await page.waitForTimeout(700)
    const file = path.join(OUT, `${s.name}-${vp.tag}.png`)
    await page.screenshot({ path: file, fullPage: s.full })
    console.log(`  ${file}`)
    await ctx.close()
  }
}

await browser.close()
console.log('done')
