// Pré-renderização para hospedagem estática (Netlify, Vercel e similares).
// Depois do build do Vite, gera o HTML completo de cada página dentro de dist/client:
//   dist/client/serra/index.html, dist/client/mar/index.html, dist/client/candidatura/mar/index.html
// além de robots.txt, sitemap.xml (quando houver domínio) e 404.html.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildPageHtml, pages, resolvePublicOrigin, robotsTxt, sitemapXml } from './pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = resolve(root, 'dist/client');
const { render } = await import(pathToFileURL(resolve(root, 'dist/server/entry-server.js')));
// O index.html do Vite é o molde das páginas; ele é guardado em dist/server/template.html
// (usado também pelo `npm start`), porque dist/client/index.html vira o redirecionamento da raiz.
const templateCopy = resolve(root, 'dist/server/template.html');
let template = await readFile(resolve(clientDir, 'index.html'), 'utf8');
if (!template.includes('<!--ssr-outlet-->')) template = await readFile(templateCopy, 'utf8');
await writeFile(templateCopy, template, 'utf8');
const publicOrigin = resolvePublicOrigin();

async function write(relativePath, content) {
  const file = resolve(clientDir, relativePath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
  console.log(`  ✓ ${relativePath}`);
}

console.log(`Pré-renderizando páginas${publicOrigin ? ` para ${publicOrigin}` : ' (sem PUBLIC_SITE_URL: sem canonical/sitemap)'}:`);
for (const pagePath of Object.keys(pages)) {
  await write(`${pagePath.slice(1)}/index.html`, buildPageHtml(template, pagePath, render(pagePath), publicOrigin));
}

await write('robots.txt', robotsTxt(publicOrigin));
if (publicOrigin) await write('sitemap.xml', sitemapXml(publicOrigin));

// A raiz leva para /serra (o redirecionamento do host também faz isso; isto cobre hosts sem regras).
await write('index.html', `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8" /><meta http-equiv="refresh" content="0; url=/serra" /><link rel="canonical" href="/serra" /><title>Le Ange Creators</title></head><body><a href="/serra">Ir para Le Ange Creators</a></body></html>\n`);

await write('404.html', `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="robots" content="noindex" /><title>Página não encontrada | Le Ange Creators</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Urbanist,system-ui,sans-serif;background:#f3f2e9;color:#4d4d4d;text-align:center;padding:2rem}h1{font-size:2rem;margin:0 0 .5rem}a{display:inline-block;margin-top:1.2rem;padding:.8rem 1.3rem;border-radius:999px;background:#cad766;color:#202f29;font-weight:800;text-decoration:none}</style></head><body><main><h1>Página não encontrada</h1><p>O endereço pode ter mudado. Conheça a parceria para creators pet da Le Ange.</p><a href="/serra">Ir para a página inicial</a></main></body></html>\n`);
