import type { CartItem } from './cart';
import { SITE } from '../config/site.mjs';

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  note?: string;
}

export interface OrderPayload {
  ref: string;
  createdAt: string; // ISO
  items: CartItem[];
  itemCount: number;
  subtotal: number;
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
  return [
    `Tantu Kala order  #${o.ref}`,
    '--------------------------------',
    lines,
    '--------------------------------',
    `Items: ${o.itemCount}   Subtotal: ${SITE.currencySymbol}${o.subtotal}`,
    '(final total incl. shipping confirmed by Tantu Kala)',
    '',
    `Name: ${o.customer.name}`,
    `Phone: ${o.customer.phone}`,
    `Address: ${o.customer.address}`,
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
