// A static file server for the built site, for Playwright. `astro preview` detaches into the
// background when it is not attached to a terminal, which Playwright reads as an early exit.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url));
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const file = (url: string) => {
  try {
    const path = join(ROOT, normalize(decodeURIComponent(new URL(url, 'http://x').pathname)));
    if (!path.startsWith(ROOT)) return undefined;
    const found = statSync(path).isDirectory() ? join(path, 'index.html') : path;
    return statSync(found).isFile() ? found : undefined;
  } catch {
    // Malformed escapes and missing files alike.
    return undefined;
  }
};

createServer((req, res) => {
  const path = file(req.url ?? '/');
  if (!path) {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
  createReadStream(path)
    .on('error', () => res.end())
    .pipe(res);
}).listen(Number(process.env['PORT'] ?? 4321));
