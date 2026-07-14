import type { Product } from '../data/products';

export interface PriceInfo {
  original: number;   // listed price (MRP)
  final: number;      // price the customer actually pays
  discountPercent: number;
  hasDiscount: boolean;
  saving: number;     // original - final
}

/**
 * Compute the payable price. Discount is a percentage off `price`, rounded
 * UP to the nearest rupee (ceil) — so we never undercharge on rounding.
 *
 * The same ceil-discount math is intentionally re-implemented server-side in
 * apps-script/Code.gs (expectedTotal_) for independent tamper detection — the two
 * must stay in sync. Rules (prices/discounts) are shared via /pricing.json.
 */
export function priceInfo(p: Product): PriceInfo {
  const d = typeof p.discountPercent === 'number' && p.discountPercent > 0 ? p.discountPercent : 0;
  const final = d ? Math.ceil(p.price * (1 - d / 100)) : p.price;
  return {
    original: p.price,
    final,
    discountPercent: d,
    hasDiscount: d > 0,
    saving: p.price - final,
  };
}

/** The price the customer pays (used by cart / UPI). */
export function payablePrice(p: Product): number {
  return priceInfo(p).final;
}
