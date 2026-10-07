import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.argv[2] || '.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(`${root}${sep}`) || (!['/index.html'].includes(pathname) && pathname !== '/' && !pathname.startsWith('/src/') && !pathname.startsWith('/public/'))) {
      response.writeHead(404).end('Not found'); return;
    }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' }).end(content);
  } catch { response.writeHead(404).end('Not found'); }
});
server.listen(Number(process.env.PORT || 5173), process.env.HOST || '127.0.0.1', () => console.log(`Web Studio: http://${process.env.HOST || '127.0.0.1'}:${server.address().port}`));
