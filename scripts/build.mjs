import { build } from 'vite';

await build();
await build({
  build: {
    ssr: 'src/entry-server.jsx',
    outDir: 'dist/server',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: { format: 'es' },
    },
  },
});

console.log('Client and server-rendered builds created in dist/.');

// Gera as páginas estáticas em dist/client para Netlify/Vercel.
await import('./prerender.mjs');
