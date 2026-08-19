import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Isi domain produksi hanya di sini saat sudah tersedia. Biarkan kosong agar build tetap valid tanpa domain.
const SITE = '';

export default defineConfig({
  site: SITE || undefined,
  integrations: SITE ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()]
  }
});
