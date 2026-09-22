import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Domain produksi. Diisi agar canonical, Open Graph absolut, dan sitemap terbentuk (mencegah indeks ganda http/https).
const SITE = 'https://siringmenara.com';

export default defineConfig({
  site: SITE || undefined,
  integrations: SITE ? [sitemap({ filter: (page) => !page.includes('404') })] : [],
  vite: {
    plugins: [tailwindcss()]
  }
});
