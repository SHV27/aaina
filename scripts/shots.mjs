/**
 * The screenshots the repo ships with.
 *
 * Not the journey suite's full-page captures — those are twenty-thousand-pixel strips of a
 * ten-thousand-word report, which nobody can review and which nobody should be asked to download
 * from a README. These are viewport-sized, at the two widths the art direction is checked at, of
 * the screens somebody deciding whether to trust this would actually want to see.
 *
 *   node scripts/shots.mjs            (needs `npm run preview` on 4319)
 */
import { chromium, devices } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join('docs', 'shots')
const BASE = process.env.BASE ?? 'http://localhost:4319'
fs.mkdirSync(OUT, { recursive: true })

const seedFor = (who) => fs.readFileSync(path.join('e2e', 'fixtures', `${who}.json`), 'utf8')

/** The writer is deliberately offline: these show the product's own computed text. */
async function offline(ctx) {
  await ctx.route('**/api/write', (r) =>
    r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"offline"}' }),
  )
}

/** A few screens only exist part-way through the flow, so they get walked to. */
async function answer(page, n, label = 'Mostly true') {
  for (let i = 0; i < n; i++) {
    const b = page.getByRole('button', { name: label }).first()
    if (!(await b.count())) break
    await b.click()
    await page.waitForTimeout(220)
  }
}

const SHOTS = [
  { name: 'landing', route: '/', wait: 1200 },
  {
    name: 'question',
    route: '/begin?lens=relationship',
    wait: 900,
    act: async (page) => {
      await page.getByRole('button', { name: /^Together In a relationship/ }).click()
      await page.waitForTimeout(400)
      await answer(page, 2, 'A little true')
      await page.waitForTimeout(500)
    },
  },
  {
    name: 'jhalak',
    route: '/begin?lens=relationship',
    wait: 900,
    act: async (page) => {
      await page.getByRole('button', { name: /^Together In a relationship/ }).click()
      await page.waitForTimeout(300)
      await answer(page, 5, 'A little true')
      const ta = page.locator('textarea')
      if (await ta.count()) {
        await ta.fill('I keep waiting for something to change and it never does, and I am running out of years to wait with.')
        await page.getByRole('button', { name: 'Save and continue' }).click()
      }
      await page.waitForTimeout(1400)
    },
  },
  { name: 'science', route: '/science', wait: 900 },
  { name: 'privacy', route: '/privacy', wait: 900 },
  { name: 'report', seed: 'arjun', route: '/report', wait: 11000, scrollTo: 'Where this stands today' },
  { name: 'receipt', seed: 'arjun', route: '/report', wait: 11000, openReceipt: true },
  { name: 'plan', seed: 'arjun', route: '/report', wait: 11000, scrollTo: 'What to actually do, in order' },
  { name: 'self-report', seed: 'rohit', route: '/report', wait: 11000, scrollTo: 'The one assumption worth testing' },
  { name: 'self-plan', seed: 'rohit', route: '/report', wait: 11000, scrollTo: 'The pattern' },
  {
    name: 'together-invite',
    seed: 'arjun',
    route: '/together',
    wait: 1200,
  },
  {
    name: 'answer',
    route: '/answer',
    wait: 1200,
  },
  {
    /* The couple section. Seeded with a second account directly rather than walked, because the
       screenshot is of the finished report and the exchange has its own journey test. */
    name: 'report-together',
    seed: 'arjun',
    route: '/report',
    wait: 12000,
    scrollTo: 'What the two of you said',
    before: async (ctx) => {
      await ctx.addInitScript(() => {
        const ids = ['resp_1', 'amb_1', 'sat_1', 'sat_3', 'sat_5', 'app_1', 'app_2', 'resp_4',
          'con_1', 'con_2', 'con_3', 'con_4', 'tru_1', 'tru_3', 'clo_3', 'clo_4', 'amb_3',
          'ded_1', 'ded_2', 'gro_1']
        const values = [4, 2, 4, 2, 4, 3, 3, 4, 2, 4, 2, 5, 5, 5, 4, 2, 4, 5, 4, 3]
        const answers = {}
        ids.forEach((id, i) => {
          answers[id] = { itemId: id, value: values[i], revisions: 0, dwellMs: 0, order: i }
        })
        answers['partner_note'] = {
          itemId: 'partner_note',
          value: 'I never asked you to give up the trip. I would have come with you.',
          revisions: 0, dwellMs: 0, order: 99,
        }
        try {
          window.localStorage.setItem(
            'aaina-partner-v1',
            JSON.stringify({ state: { answers, addedAt: Date.now() }, version: 1 }),
          )
        } catch { /* private mode */ }
      })
    },
  },
]

const VIEWPORTS = [
  ['desktop', { viewport: { width: 1280, height: 860 } }],
  ['mobile', { ...devices['Pixel 7'] }],
]

const browser = await chromium.launch()
let n = 0

for (const [label, opts] of VIEWPORTS) {
  for (const shot of SHOTS) {
    const ctx = await browser.newContext({ ...opts, deviceScaleFactor: 1 })
    if (shot.seed) {
      await ctx.addInitScript((p) => {
        try { window.localStorage.setItem('aaina-v3', p) } catch { /* private mode */ }
      }, seedFor(shot.seed))
      await offline(ctx)
    }
    if (shot.before) await shot.before(ctx)
    const page = await ctx.newPage()
    await page.goto(BASE + shot.route)
    await page.waitForTimeout(shot.wait)
    if (shot.act) await shot.act(page)

    if (shot.scrollTo) {
      const el = page.locator(`section:has(h2:text-is("${shot.scrollTo}"))`).first()
      if (await el.count()) {
        await el.scrollIntoViewIfNeeded()
        await page.waitForTimeout(400)
      }
    }
    if (shot.openReceipt) {
      const open = page.locator('.claim-open').first()
      if (await open.count()) {
        await open.scrollIntoViewIfNeeded()
        await open.click()
        await page.waitForTimeout(500)
      }
    }

    const file = path.join(OUT, `${shot.name}-${label}.png`)
    await page.screenshot({ path: file })
    n += 1
    console.log(' ', file)
    await ctx.close()
  }
}

await browser.close()
console.log(`\n${n} screenshots -> ${OUT}`)
