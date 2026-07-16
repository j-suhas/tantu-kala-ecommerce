import type { CartItem } from './cart';
import { SITE } from '../config/site.mjs';

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city?: string;
  state?: string;
  note?: string;
}

export interface OrderCoupon {
  percentOff: number;
  label: string;
  discount: number;
}

export interface OrderPayload {
  ref: string;
  createdAt: string; // ISO
  items: CartItem[];
  itemCount: number;
  subtotal: number;          // after per-product discounts, before coupon/shipping
  coupon?: OrderCoupon | null;
  shipping: number;
  payable: number;           // what the customer is asked to pay via UPI
  customer: CustomerDetails;
}

/** Human-readable, unique-ish ref: #TK-<ddMM>-<4hex>. */
export function makeOrderRef(d = new Date()): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hex = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
  return `TK-${dd}${mm}-${hex}`;
}

/**
 * Plain-text order block — used for the notification email, the sheet,
 * and the optional WhatsApp fallback. Fixed labels = easy to scan/parse.
 */
export function orderText(o: OrderPayload): string {
  const lines = o.items
    .map((i) => `${i.qty}x  ${i.name}  @ ${SITE.currencySymbol}${i.price}`)
    .join('\n');
  const sym = SITE.currencySymbol;
  return [
    `Tantu Kala order  #${o.ref}`,
    '--------------------------------',
    lines,
    '--------------------------------',
    `Items: ${o.itemCount}   Subtotal: ${sym}${o.subtotal}`,
    o.coupon ? `Coupon (${o.coupon.percentOff}% off): -${sym}${o.coupon.discount}` : '',
    `Shipping: ${o.shipping === 0 ? 'Free' : sym + o.shipping}`,
    `To pay: ${sym}${o.payable}`,
    '',
    `Name: ${o.customer.name}`,
    `Phone: ${o.customer.phone}`,
    `Address: ${o.customer.address}`,
    o.customer.city ? `City: ${o.customer.city}` : '',
    o.customer.state ? `State: ${o.customer.state}` : '',
    `Pincode: ${o.customer.pincode}`,
    o.customer.note ? `Note: ${o.customer.note}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * POST the order to the Google Apps Script webhook (sheet + email).
 * Fire-and-forget with `no-cors` so it never blocks the UI; the sheet is
 * the source of truth, the customer flow continues regardless.
 */
export async function recordOrder(o: OrderPayload): Promise<void> {
  if (!SITE.orderWebhookUrl) return;
  try {
    await fetch(SITE.orderWebhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(o),
    });
  } catch {
    /* best-effort; the customer still gets their pay screen */
  }
}
