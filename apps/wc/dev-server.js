// Tiny dev static server for the wc.
//
// Mounts:
//   /            → ./dist          (the wc bundle + everything vite copies
//                                    from public/)
//   /sites/*     → ./dev-sites     (site JSONs the service writes here when
//                                    you click Publish in dev mode)
//
// CORS open. Replaces http-server in the dev script because http-server
// can only serve a single root, and we want a second mount for /sites/
// that lives OUTSIDE dist (vite would otherwise clobber it on rebuild).
import http from 'node:http';
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;

const ROOTS = [
  { prefix: '/sites/', dir: path.join(__dirname, 'dev-sites') },
  { prefix: '/',       dir: path.join(__dirname, 'dist') }
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon'
};

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
    ...headers
  });
  res.end(body);
};

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  for (const { prefix, dir } of ROOTS) {
    if (!urlPath.startsWith(prefix)) continue;

    const rel = urlPath.slice(prefix.length) || 'index.html';
    const filePath = path.join(dir, rel);

    // Refuse anything outside the mounted dir (path traversal guard).
    if (!filePath.startsWith(dir)) {
      return send(res, 403, 'Forbidden');
    }
    if (!existsSync(filePath)) continue; // try the next mount

    try {
      const data = await fs.readFile(filePath);
      return send(res, 200, data, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    } catch (err) {
      return send(res, 500, `Read error: ${err.message}`);
    }
  }

  send(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`dev-server: http://localhost:${PORT}`);
  for (const { prefix, dir } of ROOTS) {
    console.log(`  ${prefix.padEnd(10)} -> ${path.relative(__dirname, dir)}`);
  }
});
