import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'custom',
  build: {
    outDir: 'dist/client',
    assetsDir: 'assets',
    manifest: true,
    sourcemap: false,
    cssMinify: true,
  },
});
