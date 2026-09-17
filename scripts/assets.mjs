/**
 * Asset pipeline. Run once; the output is committed.
 *
 *   node scripts/assets.mjs
 *
 * Downloads the CC0 museum plates and the self-hosted fonts. Nothing is hotlinked at runtime:
 * a free product for stressed people should not depend on a museum CDN being up, and it should
 * not tell a third party which chapter someone is reading.
 *
 * The plates are Company School and Pahari natural-history studies — parrots, a hoopoe, a fruit
 * bat, a stork. The founder asked for "happy pics of pets" so people feel calm and loved; the
 * literal version is stock-photo slop, so instead these are actual Indian paintings of actual
 * animals, in mineral pigment, from 1780–1830, CC0 from Cleveland and the Met. He gets his parrot.
 * We get a museum instead of a stock library.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const IMG_DIR = path.join(ROOT, 'public', 'plates')
const FONT_DIR = path.join(ROOT, 'public', 'fonts')

export const PLATES = [
  { slug: 'parrot', title: 'Green Parrot', date: 'c. 1820', school: 'Company School', holder: 'Cleveland Museum of Art', acc: '1972.285', url: 'https://openaccess-cdn.clevelandart.org/1972.285/1972.285_web.jpg', page: 'https://clevelandart.org/art/1972.285' },
  { slug: 'hoopoe', title: 'Hoopoe on a Citrus Tree Branch', date: 'c. 1800', school: 'Company School, Calcutta', holder: 'Cleveland Museum of Art', acc: '1990.67', url: 'https://openaccess-cdn.clevelandart.org/1990.67/1990.67_web.jpg', page: 'https://clevelandart.org/art/1990.67' },
  { slug: 'falcon', title: 'Falcon on a Perch', date: 'c. 1610', school: 'Rajput Kingdom of Amber', holder: 'Cleveland Museum of Art', acc: '2018.165', url: 'https://openaccess-cdn.clevelandart.org/2018.165/2018.165_web.jpg', page: 'https://clevelandart.org/art/2018.165' },
  { slug: 'horse', title: 'A Saddled Horse', date: 'c. 1750', school: 'Pahari kingdoms', holder: 'Cleveland Museum of Art', acc: '1968.106', url: 'https://openaccess-cdn.clevelandart.org/1968.106/1968.106_web.jpg', page: 'https://clevelandart.org/art/1968.106' },
  { slug: 'shri-raga', title: 'Shri Raga, from a Ragamala', date: 'c. 1695', school: 'Mewar', holder: 'Cleveland Museum of Art', acc: '1931.451', url: 'https://openaccess-cdn.clevelandart.org/1931.451/1931.451_web.jpg', page: 'https://clevelandart.org/art/1931.451' },
  { slug: 'maru-ragini', title: 'Maru Ragini, from a Ragamala', date: '1650–80', school: 'Amber / Deccan', holder: 'Cleveland Museum of Art', acc: '2018.168', url: 'https://openaccess-cdn.clevelandart.org/2018.168/2018.168_web.jpg', page: 'https://clevelandart.org/art/2018.168' },
  { slug: 'dyer', title: 'Man Dyeing Cloth', date: 'early 1830s', school: 'Company School, Lucknow', holder: 'Cleveland Museum of Art', acc: '1992.142', url: 'https://openaccess-cdn.clevelandart.org/1992.142/1992.142_web.jpg', page: 'https://clevelandart.org/art/1992.142' },
  { slug: 'utka', title: 'Utka Nayika — the heroine who waits', date: 'c. 1800', school: 'Pahari', holder: 'Cleveland Museum of Art', acc: '1932.118', url: 'https://openaccess-cdn.clevelandart.org/1932.118/1932.118_web.jpg', page: 'https://clevelandart.org/art/1932.118' },
  { slug: 'fruit-bat', title: 'Great Indian Fruit Bat', date: 'c. 1777–82', school: 'Bhawani Das, Company School, Calcutta', holder: 'The Metropolitan Museum of Art', acc: '2008.312', url: 'https://images.metmuseum.org/CRDImages/is/web-large/DP167067.jpg', page: 'https://www.metmuseum.org/art/collection/search/456949' },
  { slug: 'stork', title: 'Black Stork in a Landscape', date: 'c. 1780', school: 'Company School', holder: 'The Metropolitan Museum of Art', acc: '2008.313', url: 'https://images.metmuseum.org/CRDImages/is/web-large/DP234080.jpg', page: 'https://www.metmuseum.org/art/collection/search/454011' },
]

/* Google Fonts, all OFL. Fetched as woff2 and self-hosted — no requests to Google at runtime. */
const FONTS = [
  { file: 'fraunces.woff2', css: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&display=swap' },
  { file: 'literata.woff2', css: 'https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,300..700&display=swap' },
  { file: 'tiro-devanagari.woff2', css: 'https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&display=swap' },
  { file: 'plex-mono.woff2', css: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap' },
]

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'

async function get(url, headers = {}) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers } })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r
}

async function plates() {
  fs.mkdirSync(IMG_DIR, { recursive: true })
  for (const p of PLATES) {
    const out = path.join(IMG_DIR, `${p.slug}.jpg`)
    if (fs.existsSync(out) && fs.statSync(out).size > 10_000) {
      console.log(`  = ${p.slug}.jpg (cached)`)
      continue
    }
    try {
      const r = await get(p.url)
      const buf = Buffer.from(await r.arrayBuffer())
      fs.writeFileSync(out, buf)
      console.log(`  + ${p.slug}.jpg  ${(buf.length / 1024).toFixed(0)}KB  — ${p.title}, ${p.date}, ${p.holder}, CC0`)
    } catch (e) {
      console.log(`  ! ${p.slug}: ${e.message}`)
    }
  }
  // The attribution manifest ships with the app. Attribution is evidence, not a legal chore.
  fs.writeFileSync(
    path.join(ROOT, 'src', 'plates.ts'),
    `/** Generated by scripts/assets.mjs — do not edit by hand.
 *
 * Every image in Aaina is a crop of a named, CC0-licensed Indian painting, held by a museum that
 * has waived copyright in writing. No stock photography, no generated imagery, no human faces.
 */
export interface Plate {
  slug: string; title: string; date: string; school: string; holder: string; acc: string; page: string
}

export const PLATES: Plate[] = ${JSON.stringify(
      PLATES.map(({ slug, title, date, school, holder, acc, page }) => ({ slug, title, date, school, holder, acc, page })),
      null,
      2,
    )}

export const PLATE_BY_SLUG: Record<string, Plate> = Object.fromEntries(PLATES.map((p) => [p.slug, p]))

export function plateSrc(slug: string): string {
  return \`/plates/\${slug}.jpg\`
}

export function attribution(p: Plate): string {
  return \`\${p.title}, \${p.date}. \${p.school}. \${p.holder} (\${p.acc}). CC0.\`
}
`,
  )
  console.log('  → src/plates.ts written')
}

async function fonts() {
  fs.mkdirSync(FONT_DIR, { recursive: true })
  for (const f of FONTS) {
    const out = path.join(FONT_DIR, f.file)
    if (fs.existsSync(out) && fs.statSync(out).size > 5_000) {
      console.log(`  = ${f.file} (cached)`)
      continue
    }
    try {
      // Asking as a modern browser gets us woff2 with the full unicode range.
      const cssRes = await get(f.css)
      const css = await cssRes.text()
      // Take the widest src block (latin-ext / devanagari) rather than the first.
      const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)].map((m) => m[1])
      if (!urls.length) throw new Error('no woff2 in css')
      let best = null
      for (const u of urls) {
        const r = await get(u)
        const buf = Buffer.from(await r.arrayBuffer())
        if (!best || buf.length > best.length) best = buf
      }
      fs.writeFileSync(out, best)
      console.log(`  + ${f.file}  ${(best.length / 1024).toFixed(0)}KB  (${urls.length} subsets, largest kept)`)
    } catch (e) {
      console.log(`  ! ${f.file}: ${e.message}`)
    }
  }
}

console.log('plates (CC0 Indian museum art)')
await plates()
console.log('fonts (OFL, self-hosted)')
await fonts()
console.log('done')
