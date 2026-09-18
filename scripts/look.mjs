/**
 * Look at one screen, at a size a person can actually see.
 *
 * The journey suite takes full-page screenshots, which for a ten-thousand-word report is a
 * twenty-thousand-pixel strip that nobody can review. This takes element-sized shots of named
 * sections instead, at desktop and phone widths, which is what the art-direction check needs.
 *
 *   node scripts/look.mjs <fixture> <route> <section-id...>
 */
import { chromium, devices } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

// Git Bash rewrites a leading slash into a Windows path, so the route is passed without one.
const [who = 'rohit', rawRoute = 'report', ...wanted] = process.argv.slice(2)
const route = rawRoute.startsWith('/') ? rawRoute : '/' + rawRoute
const OUT = path.join('e2e', 'screenshots', 'look')
fs.mkdirSync(OUT, { recursive: true })

const seed = fs.readFileSync(path.join('e2e', 'fixtures', `${who}.json`), 'utf8')
const BASE = process.env.BASE ?? 'http://localhost:4319'

const browser = await chromium.launch()

for (const [label, opts] of [
  ['desktop', { viewport: { width: 1280, height: 900 } }],
  ['mobile', { ...devices['Pixel 7'] }],
]) {
  const ctx = await browser.newContext(opts)
  await ctx.addInitScript((p) => {
    try { window.localStorage.setItem('aaina-v3', p) } catch { /* private mode */ }
  }, seed)
  // The writer is deliberately offline: these shots are of the product's own text.
  await ctx.route('**/api/write', (r) =>
    r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"offline"}' }),
  )

  const page = await ctx.newPage()
  await page.goto(BASE + route)
  await page.waitForTimeout(route === '/report' ? 9000 : 1500)

  await page.screenshot({ path: path.join(OUT, `${who}-${route.replace(/\W+/g, '') || 'home'}-top-${label}.png`) })

  for (const id of wanted) {
    const el = page.locator(`section:has(h2:text-is("${id}"))`).first()
    if ((await el.count()) === 0) {
      console.log(`  (no section titled "${id}")`)
      continue
    }
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    const safe = id.toLowerCase().replace(/\W+/g, '-').slice(0, 40)
    await el.screenshot({ path: path.join(OUT, `${who}-${safe}-${label}.png`) })
    console.log(`  ${label}: ${id}`)
  }

  await ctx.close()
}

await browser.close()
console.log('→', OUT)
