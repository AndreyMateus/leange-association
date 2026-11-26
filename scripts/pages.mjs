// Páginas do site e montagem do HTML final.
// Usado pelo servidor local (server.mjs) e pela pré-renderização do build (scripts/prerender.mjs),
// para que título, descrição, Open Graph, canonical, robots e sitemap sejam sempre os mesmos.

export const pages = {
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
};

export const indexablePaths = Object.keys(pages).filter((path) => !pages[path].noIndex);

// Domínio público: PUBLIC_SITE_URL; no Netlify, URL; na Vercel, VERCEL_PROJECT_PRODUCTION_URL.
export function resolvePublicOrigin(env = process.env) {
  const candidates = [
    env.PUBLIC_SITE_URL,
    env.URL,
    env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`,
  ];
  for (const value of candidates) {
    try {
      const url = new URL(value || '');
      if (['http:', 'https:'].includes(url.protocol)) return url.origin;
    } catch {
      // próximo candidato
    }
  }
  return '';
}

export function buildPageHtml(template, pagePath, appHtml, publicOrigin) {
  const metadata = pages[pagePath];
  let html = template
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
  html = html.replace('</head>', `    ${seoEnhancements}\n  </head>`);
  return html.replace('<!--ssr-outlet-->', appHtml);
}

export function robotsTxt(publicOrigin) {
  const sitemapLine = publicOrigin ? `Sitemap: ${publicOrigin}/sitemap.xml\n` : '';
  return `User-agent: *\nAllow: /\n${sitemapLine}`;
}

export function sitemapXml(publicOrigin) {
  const entries = indexablePaths.map((path) => `<url><loc>${publicOrigin}${path}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}
