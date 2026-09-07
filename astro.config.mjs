// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://stikersvault.com',
  // Genera drop.html en vez de drop/index.html — coincide con cómo GitHub
  // Pages ya resolvía /drop en el sitio estático (fallback de extensión),
  // y evita cualquier ambigüedad de barra final en el dominio propio.
  build: {
    format: 'file',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
