import { SITE } from '../config/site.mjs';

export interface CouponResult {
  percentOff: number;
  label: string;
  discount: number; // rupees off the order value
}

/**
 * Auto-applied order-value coupon. Runs on the subtotal AFTER per-product
 * discounts (so both stack). The highest matching tier wins. Rounded so the
 * customer pays the ceil (we never undercharge on rounding), mirroring pricing.ts.
 *
 * NOTE: this is the *display* calculation. It is re-derived independently on the
 * server (Apps Script) from the authoritative price list so a tampered client
 * can't quietly change what we expect to receive. See apps-script/Code.gs.
 */
export function autoCoupon(subtotal: number): CouponResult | null {
  const tiers = (SITE.coupons?.autoOrderValue ?? [])
    .filter((t) => subtotal >= t.minSubtotal)
    .sort((a, b) => b.minSubtotal - a.minSubtotal);
  if (tiers.length === 0) return null;

  const t = tiers[0];
  const finalGoods = Math.ceil(subtotal * (1 - t.percentOff / 100));
  return { percentOff: t.percentOff, label: t.label, discount: subtotal - finalGoods };
}
