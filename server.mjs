import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('.', import.meta.url));
const production = process.argv.includes('--production') || process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 4173);
const publicOrigin = (() => {
  try {
    const configuredUrl = new URL(process.env.PUBLIC_SITE_URL || '');
    return ['http:', 'https:'].includes(configuredUrl.protocol) ? configuredUrl.origin : '';
  } catch {
    return '';
  }
})();
const pages = {
  '/serra': {
    title: 'Le Ange Serra para creators pet | Parcerias remuneradas',
    description: 'Crie conteúdo com seu pet na Le Ange Serra, em meio às montanhas e cachoeiras do Vale das Videiras. Conheça a parceria remunerada para creators pet.',
    image: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/25b0380d-b983-4a67-eac2-36a003dfa600/public',
  },
  '/mar': {
    title: 'Le Ange Mar em Búzios | Parcerias para creators pet',
    description: 'Conheça a Le Ange Mar em Búzios: Praia Rasa a cerca de 150 metros, piscina com vista para o oceano e uma parceria remunerada para creators pet.',
    image: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/e0715e71-0836-4817-640d-a92472a02600/public',
  },
  '/candidatura/mar': {
    title: 'Candidatura Le Ange Mar | Programa Creators',
    description: 'Apresente seu perfil e converse com a equipe sobre uma parceria remunerada com a Le Ange Mar.',
    image: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/e0715e71-0836-4817-640d-a92472a02600/public',
    noIndex: true,
  },
};
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
    const sitemapLine = publicOrigin ? `Sitemap: ${publicOrigin}/sitemap.xml\n` : '';
    response.statusCode = 200;
    response.setHeader('content-type', 'text/plain; charset=utf-8');
    response.end(`User-agent: *\nAllow: /\n${sitemapLine}`);
    return;
  }

  if (requestUrl.pathname === '/sitemap.xml') {
    if (!publicOrigin) {
      response.statusCode = 404;
      response.setHeader('content-type', 'text/plain; charset=utf-8');
      response.end('Configure PUBLIC_SITE_URL para gerar o sitemap.');
      return;
    }
    const sitemapEntries = ['/serra', '/mar']
      .map((path) => `<url><loc>${publicOrigin}${path}</loc></url>`)
      .join('');
    response.statusCode = 200;
    response.setHeader('content-type', 'application/xml; charset=utf-8');
    response.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</urlset>`);
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

    const templatePath = resolve(root, production ? 'dist/client/index.html' : 'index.html');
    let template = await readFile(templatePath, 'utf8');
    let render = productionRender;

    if (vite) {
      template = await vite.transformIndexHtml(pagePath, template);
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
    }

    template = template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${metadata.title}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/, `<meta name="description" content="${metadata.description}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?\s*>/, `<meta property="og:title" content="${metadata.title}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?\s*>/, `<meta property="og:description" content="${metadata.description}" />`)
      .replace(/<meta property="og:image" content="[^"]*"\s*\/?\s*>/, `<meta property="og:image" content="${metadata.image}" />`);

    const canonicalUrl = publicOrigin ? `${publicOrigin}${pagePath}` : '';
    const seoEnhancements = [
      canonicalUrl && `<link rel="canonical" href="${canonicalUrl}" /><meta property="og:url" content="${canonicalUrl}" />`,
      metadata.noIndex && '<meta name="robots" content="noindex, follow" />',
      `<meta name="twitter:title" content="${metadata.title}" /><meta name="twitter:description" content="${metadata.description}" /><meta name="twitter:image" content="${metadata.image}" />`,
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Pousada Le Ange',
        url: 'https://www.pousadaleange.com.br/',
        sameAs: ['https://www.instagram.com/pousadaleange/'],
      })}</script>`,
    ].filter(Boolean).join('\n    ');
    template = template.replace('</head>', `    ${seoEnhancements}\n  </head>`);

    const html = template.replace('<!--ssr-outlet-->', render(pagePath));
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
