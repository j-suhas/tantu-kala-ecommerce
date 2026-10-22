/** Compile-time checks, run by `npx tsc --noEmit`. No runtime code. */
import type { ApiAction, ApiRequest, ApiResponse, Product } from './types';

export const ok: Product = {
  slug: 'a', name: 'A', price: 10, image: 'a.jpg', shortDescription: '', description: '',
  status: 'made-to-order', tags: ['type:jewelry', 'occasion:diwali', 'free'], stock: null,
};
// @ts-expect-error status must be one of the allowed values
export const badStatus: Product = { ...ok, status: 'gone' };
// @ts-expect-error required field missing
export const missing: Product = { slug: 'a' };

export const req: ApiRequest<'order.claimPaid'> = {
  v: 1, action: 'order.claimPaid', buildId: 'x', hp: '', payload: { ref: 'TK-261023-ABCD' },
};
// @ts-expect-error payload must match the action
export const badReq: ApiRequest<'order.claimPaid'> = { ...req, payload: { phone: '1' } };

export const res: ApiResponse<'campaign.remaining'> = {
  ok: true, data: { unitsRemaining: 3 }, serverTime: 't',
};
export const fail: ApiResponse = { ok: false, error: { code: 'SERVER', message: 'm', retryable: true } };
export const actions: ApiAction[] = [
  'order.create', 'order.claimPaid', 'order.status', 'order.payInfo', 'request.create',
  'request.uploadPhoto', 'review.create', 'campaign.remaining', 'event.log',
];
