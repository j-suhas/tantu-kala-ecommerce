import { SITE } from '../config/site.mjs';

/**
 * Build a UPI intent URI. On mobile this opens the user's UPI app
 * (GPay/PhonePe/Paytm) with amount + note prefilled. On desktop it won't
 * open anything, so we render it as a QR the customer scans with their phone.
 */
export function upiLink(amount: number, ref: string): string {
  const params = new URLSearchParams({
    pa: SITE.upi.vpa,
    pn: SITE.upi.payeeName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `Tantu Kala ${ref}`,
  });
  return `upi://pay?${params.toString()}`;
}

/** Crude but reliable mobile check for choosing button vs QR. */
export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}
