import data from './products.json';

export type ProductStatus = 'available' | 'made_to_order' | 'sold_out';

export interface Product {
  slug: string;
  name: string;
  price: number;
  image: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  stock?: number;
  leadTimeDays?: number;
  /** Optional discount off `price`, in percent (e.g. 15 = 15% off). */
  discountPercent?: number;
  tags?: string[];
}

const VALID_STATUS: ProductStatus[] = ['available', 'made_to_order', 'sold_out'];

/**
 * Normalize a raw JSON entry into a guaranteed-valid Product so a data typo can
 * never crash a page or the build. Anything off gets coerced to a safe default,
 * and (in dev only) logged so you can find and fix the source.
 */
function normalize(raw: Record<string, any>): Product {
  const issues: string[] = [];

  let status = String(raw?.status ?? '').trim().toLowerCase();
  if (!VALID_STATUS.includes(status as ProductStatus)) {
    issues.push(raw?.status == null ? 'missing status → available' : `status "${raw.status}" → available`);
    status = 'available';
  }

  // A product must have a positive numeric price; otherwise treat it as sold out
  // (so nothing tries to sell it at ₹0) instead of rendering broken.
  let price = typeof raw?.price === 'number' && raw.price > 0 ? raw.price : 0;
  if (price <= 0) {
    issues.push('missing/invalid price → marked sold out');
    status = 'sold_out';
  }

  const discountPercent =
    typeof raw?.discountPercent === 'number' && raw.discountPercent > 0 ? raw.discountPercent : undefined;
  const stock = typeof raw?.stock === 'number' ? raw.stock : undefined;
  const leadTimeDays = typeof raw?.leadTimeDays === 'number' ? raw.leadTimeDays : undefined;

  if (issues.length && import.meta.env.DEV) {
    console.warn(`[products.json] "${raw?.slug ?? '?'}": ${issues.join('; ')}`);
  }

  return {
    slug: String(raw?.slug ?? ''),
    name: String(raw?.name ?? ''),
    price,
    image: String(raw?.image ?? ''),
    shortDescription: String(raw?.shortDescription ?? ''),
    description: String(raw?.description ?? ''),
    status: status as ProductStatus,
    stock,
    leadTimeDays,
    discountPercent,
    tags: Array.isArray(raw?.tags) ? raw.tags : undefined,
  };
}

export const products: Product[] = (data as Record<string, any>[]).map(normalize);

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function isBuyable(p: Product): boolean {
  return p.status !== 'sold_out';
}

/** Public path to a product image (see public/images/products/). */
export function productImage(p: Product): string {
  return `/images/products/${p.image}`;
}

/** WebP variant produced by `npm run optimize` (falls back to original). */
export function productImageWebp(p: Product): string {
  return `/images/products/${p.image.replace(/\.(jpe?g|png)$/i, '.webp')}`;
}

/** Stable JPG used for social/OG previews (see public/og/). */
export function productOgImage(p: Product): string {
  return `/og/${p.slug}.jpg`;
}
