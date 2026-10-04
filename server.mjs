import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const pages = new Set(['index.html', 'styles.css', 'hero.css', 'script.js', 'favicon.svg']);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.png': 'image/png', '.avif': 'image/avif', '.woff2': 'font/woff2',
};

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = resolve(root, relative);
    const isAsset = relative.startsWith('assets/') && relative.split('/').every(part => !part.startsWith('.'));
    if (!file.startsWith(root + sep) || (!pages.has(relative) && !isAsset) || !types[extname(file)]) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    const content = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[extname(file)],
      'Content-Length': content.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `A porta ${port} está em uso. Feche a outra prévia ou defina PORT com outra porta.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`Espaço Sorriso: prévia em http://localhost:${port}\nMantenha este terminal aberto. Use Ctrl+C para encerrar.`));
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
