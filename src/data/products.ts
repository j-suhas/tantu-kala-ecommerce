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
  tags?: string[];
}

export const products: Product[] = data as Product[];

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
