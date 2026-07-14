import type { APIRoute } from 'astro';
import { products } from '../data/products';
import { SITE } from '../config/site.mjs';

/**
 * Authoritative pricing feed, served as a static file at /pricing.json.
 * The Apps Script order recorder fetches this to RE-COMPUTE the expected total
 * independently of whatever the browser submitted — so a tampered cart / coupon
 * is detected server-side. Prices here are already public on the site.
 */
export const GET: APIRoute = () => {
  const body = {
    products: products.map((p) => ({
      slug: p.slug,
      price: p.price,
      discountPercent: p.discountPercent ?? 0,
      status: p.status,
    })),
    coupons: SITE.coupons,
    shipping: SITE.shipping,
  };
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  });
};
