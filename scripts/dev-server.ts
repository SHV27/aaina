/** Local server that serves the built app AND runs the real /api/compose handler,
 *  so end-to-end runs exercise production code paths rather than a mock.
 *  Run: npx vite-node scripts/dev-server.ts   (port 4320) */
import { createServer } from "node:http";
import { readFile, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import handler from "../api/compose";

const PORT = Number(process.env.PORT ?? 4320);
const DIST = join(process.cwd(), "dist");

// Load .env into process.env for the handler.
for (const line of readFileSync(join(process.cwd(), ".env"), "utf8").split("\n")) {
  const i = line.indexOf("=");
  if (i > 0 && !line.startsWith("#")) {
    const k = line.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = line.slice(i + 1).trim();
  }
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (url.pathname === "/api/compose") {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    let body: unknown = {};
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      /* leave empty; handler validates */
    }
    const shim = {
      status(code: number) {
        res.statusCode = code;
        return {
          json(v: unknown) {
            res.end(JSON.stringify(v));
          },
        };
      },
      setHeader(k: string, v: string) {
        res.setHeader(k, v);
      },
    };
    await handler(
      { method: req.method, body, headers: req.headers as Record<string, string> },
      shim,
    );
    return;
  }

  const safe = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(DIST, safe);
  readFile(filePath, (err, data) => {
    if (err) {
      readFile(join(DIST, "index.html"), (e2, html) => {
        if (e2) {
          res.statusCode = 500;
          res.end("no build — run npm run build");
          return;
        }
        res.setHeader("content-type", MIME[".html"]);
        res.end(html);
      });
      return;
    }
    res.setHeader("content-type", MIME[extname(filePath)] ?? "application/octet-stream");
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`aaina dev server on http://localhost:${PORT}`);
  console.log(`GROQ key: ${process.env.GROQ_API_KEY ? "loaded" : "MISSING"}`);
});
