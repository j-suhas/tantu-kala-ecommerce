import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// The canonical URL is env-driven (PUBLIC_SITE_URL), but custom env vars are NOT
// auto-injected at config-load time — so we read it explicitly with loadEnv, using
// the same value the app code sees. The fallback keeps the build safe if it's ever
// missing (prevents an undefined `site:`, which would break the sitemap).
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');

// https://astro.build
export default defineConfig({
  // Used for canonical URLs, sitemap, and absolute OG image URLs.
  site: PUBLIC_SITE_URL || 'https://tantukala.embox.in',
  // applyBaseStyles:false because we ship our own base layer in src/styles/global.css
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  build: { format: 'directory' },
  // Prefetch linked pages on hover for snappy catalog browsing (tiny runtime).
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
