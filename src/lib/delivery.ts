import { SITE } from '../config/site.mjs';

export interface DeliveryInfo {
  minDays: number;
  maxDays: number;
  beforeRakhi: boolean;
}

/**
 * Location-independent delivery window = dispatch time + transit range.
 * Computed at build time (SSG); we show a day-range (always valid) rather than
 * an absolute date (which would drift between rebuilds).
 */
export function deliveryEstimate(now = new Date()): DeliveryInfo {
  const { dispatchDays, transitDaysMin, transitDaysMax } = SITE.delivery;
  const minDays = dispatchDays + transitDaysMin;
  const maxDays = dispatchDays + transitDaysMax;
  const arriveBy = new Date(now.getTime() + maxDays * 86_400_000);
  const beforeRakhi = arriveBy <= new Date(SITE.rakhiDateISO);
  return { minDays, maxDays, beforeRakhi };
}
