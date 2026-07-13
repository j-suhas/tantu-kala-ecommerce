import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site.mjs';

// https://astro.build
export default defineConfig({
  // Used for canonical URLs, sitemap, and absolute OG image URLs.
  // Change this to your real domain at deploy time (see README).
  site: SITE.url,
  // applyBaseStyles:false because we ship our own base layer in src/styles/global.css
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  build: { format: 'directory' },
});
