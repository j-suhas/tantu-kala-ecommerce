import type { APIRoute } from 'astro';
import { SITE } from '../config/site.mjs';

/**
 * robots.txt as an endpoint so the Sitemap URL always tracks SITE.url
 * (no hard-coded domain to forget updating at deploy).
 */
export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap-index.xml', SITE.url).href}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain' } });
};
