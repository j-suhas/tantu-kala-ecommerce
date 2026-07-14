import { SITE } from '../config/site.mjs';

/** Format a rupee amount: 1499 -> "₹1,499". */
export function inr(amount: number): string {
  return SITE.currencySymbol + amount.toLocaleString('en-IN');
}
