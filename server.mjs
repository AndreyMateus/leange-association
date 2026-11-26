import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';
import { buildPageHtml, pages, resolvePublicOrigin, robotsTxt, sitemapXml } from './scripts/pages.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const production = process.argv.includes('--production') || process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 4173);
const publicOrigin = resolvePublicOrigin();
const types = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const compressible = /^(text\/|application\/(json|xml|javascript)|image\/svg)/;
const compressedCache = new Map();

// Em produção, responde com Brotli ou gzip quando o navegador aceita; arquivos estáticos ficam em cache.
function sendBody(request, response, body, contentType, cacheKey) {
  const buffer = typeof body === 'string' ? Buffer.from(body) : body;
  const accepted = String(request.headers['accept-encoding'] || '');
  const encoding = /\bbr\b/.test(accepted) ? 'br' : /\bgzip\b/.test(accepted) ? 'gzip' : null;
  response.setHeader('vary', 'Accept-Encoding');
  if (!production || !encoding || buffer.length < 1024 || !compressible.test(String(contentType))) {
    response.end(buffer);
    return;
  }
  const key = cacheKey && `${encoding}:${cacheKey}`;
  let compressed = key && compressedCache.get(key);
  if (!compressed) {
    compressed = encoding === 'br'
      ? brotliCompressSync(buffer, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } })
      : gzipSync(buffer, { level: 6 });
    if (key) compressedCache.set(key, compressed);
  }
  response.setHeader('content-encoding', encoding);
  response.end(compressed);
}

const vite = production
  ? null
  : await import('vite').then(({ createServer }) => createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    }));

let productionRender;
if (production) {
  const serverBundle = resolve(root, 'dist/server/entry-server.js');
  productionRender = (await import(pathToFileURL(serverBundle))).render;
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/robots.txt') {
    response.statusCode = 200;
    response.setHeader('content-type', 'text/plain; charset=utf-8');
    response.end(robotsTxt(publicOrigin));
    return;
  }

  if (requestUrl.pathname === '/sitemap.xml') {
    if (!publicOrigin) {
      response.statusCode = 404;
      response.setHeader('content-type', 'text/plain; charset=utf-8');
      response.end('Configure PUBLIC_SITE_URL para gerar o sitemap.');
      return;
    }
    response.statusCode = 200;
    response.setHeader('content-type', 'application/xml; charset=utf-8');
    response.end(sitemapXml(publicOrigin));
    return;
  }

  // A página /candidatura/serra foi removida: o formulário agora fica na própria landing.
  if (requestUrl.pathname.replace(/\/+$/, '') === '/candidatura/serra') {
    response.statusCode = 301;
    response.setHeader('location', '/serra?secao=candidatura');
    response.end();
    return;
  }

  if (requestUrl.pathname === '/') {
    response.statusCode = 302;
    response.setHeader('location', '/serra');
    response.end();
    return;
  }

  if (vite && requestUrl.pathname !== '/' && !requestUrl.pathname.endsWith('.html')) {
    vite.middlewares(request, response, async (error) => {
      if (error) {
        vite.ssrFixStacktrace(error);
        response.statusCode = 500;
        response.end('Erro ao carregar a página.');
        return;
      }
      await renderPage(requestUrl.pathname, response, request);
    });
    return;
  }

  if (production && requestUrl.pathname !== '/' && !requestUrl.pathname.endsWith('.html')) {
    const filePath = resolve(root, 'dist/client', `.${decodeURIComponent(requestUrl.pathname)}`);
    const clientRoot = resolve(root, 'dist/client') + sep;
    if (filePath.startsWith(clientRoot)) {
      try {
        const fileStats = await stat(filePath);
        if (fileStats.isFile()) {
          response.statusCode = 200;
          response.setHeader('content-type', types[extname(filePath)] || 'application/octet-stream');
          response.setHeader('cache-control', 'public, max-age=31536000, immutable');
          sendBody(request, response, await readFile(filePath), response.getHeader('content-type'), filePath);
          return;
        }
      } catch {
        // Unknown paths continue to the server-rendered landing page.
      }
    }
  }

  await renderPage(requestUrl.pathname, response, request);
});

async function renderPage(pathname, response, request) {
  try {
    const pagePath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const metadata = pages[pagePath];
    if (!metadata) {
      response.statusCode = 404;
      response.setHeader('content-type', 'text/plain; charset=utf-8');
      response.end('Página não encontrada.');
      return;
    }

    const templatePath = resolve(root, production ? 'dist/server/template.html' : 'index.html');
    let template = await readFile(templatePath, 'utf8');
    let render = productionRender;

    if (vite) {
      template = await vite.transformIndexHtml(pagePath, template);
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
    }

    const html = buildPageHtml(template, pagePath, render(pagePath), publicOrigin);
    response.statusCode = 200;
    response.setHeader('content-type', 'text/html; charset=utf-8');
    response.setHeader('x-content-type-options', 'nosniff');
    sendBody(request, response, html, 'text/html');
  } catch (error) {
    if (vite) vite.ssrFixStacktrace(error);
    console.error(error);
    response.statusCode = 500;
    response.setHeader('content-type', 'text/plain; charset=utf-8');
    response.end('Não foi possível carregar a página.');
  }
}

server.listen(port, () => {
  console.log(`Le Ange Creators disponível em http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    if (vite) await vite.close();
    server.close(() => process.exit(0));
  });
}
