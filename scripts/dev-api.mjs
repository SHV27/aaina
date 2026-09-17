/**
 * Local stand-in for the Vercel function, so `npm run dev` and Playwright exercise the REAL
 * writer path rather than a mock. Loads .env, imports the actual handler, and serves it.
 *
 *   node scripts/dev-api.mjs        → http://localhost:3001/api/write
 *
 * Vite proxies /api to it. The point is that nothing about the request path differs between
 * development and production except who is holding the port.
 */
import http from 'node:http'
import fs from 'node:fs'
import { createServer } from 'vite'

for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith('#')) continue
  const i = line.indexOf('=')
  if (i < 0) continue
  process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim()
}

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const mod = await vite.ssrLoadModule('/api/write.ts')
const handler = mod.default

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/api/write')) {
    res.writeHead(404).end('not found')
    return
  }
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks).toString('utf8')

  const shimReq = {
    method: req.method,
    headers: req.headers,
    body: raw ? JSON.parse(raw) : undefined,
  }
  const shimRes = {
    statusCode: 200,
    _headers: {},
    setHeader(k, v) { this._headers[k] = v },
    status(code) { this.statusCode = code; return this },
    json(obj) {
      res.writeHead(this.statusCode, { ...this._headers, 'Content-Type': 'application/json' })
      res.end(JSON.stringify(obj))
      return this
    },
  }

  try {
    await handler(shimReq, shimRes)
  } catch (e) {
    console.error('dev-api error:', e.message)
    if (!res.headersSent) res.writeHead(500).end(JSON.stringify({ error: 'dev_api_crash' }))
  }
})

server.listen(3001, () => {
  console.log(`dev api on http://localhost:3001  (GROQ key ${process.env.GROQ_API_KEY ? 'loaded' : 'MISSING'})`)
})
