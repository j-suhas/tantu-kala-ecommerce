/**
 * Shared types for Tantu Kala v2 (F-1). PLAIN TYPES ONLY: no runtime code and no
 * imports, so the site and `apps-script/` tooling can both reuse this file.
 * Sources: ARCHITECTURE §3, LLD-05 §2-§4, LLD-06 (order statuses).
 */

/* ------------------------------ Products ------------------------------ */

/** v2 status values (ARCHITECTURE §3.1). */
export type ProductStatus = 'available' | 'made-to-order' | 'sold-out' | 'hidden';

/**
 * Spellings still used by the current `products.json` (`sold_out`). Accepted on
 * input so the data file needs no edit; F-2 decides when to migrate them.
 */
export type LegacyProductStatus = 'made_to_order' | 'sold_out';

export type TypeTag = `type:${string}`;
export type OccasionTag = `occasion:${string}`;
/** Prefixed tags plus free tags (existing data uses free tags only). */
export type Tag = TypeTag | OccasionTag | (string & {});

export interface PersonalisationField {
  id: string;
  label: string;
  type: 'text' | 'choice';
  options?: string[];
  maxLength?: number;
}

export type ShippingClass = 'standard' | 'large';

export interface Product {
  slug: string;
  name: string;
  /** Rupees. `null` appears in current data; F-2 decides if that stays valid. */
  price: number | null;
  /** File name under `public/images/products/`. */
  image: string;
  shortDescription: string;
  description: string;
  status: ProductStatus | LegacyProductStatus;
  tags: Tag[];
  images?: string[];
  /** Slugs of included products (combos, CAT-4). */
  includes?: string[];
  /** Units per item, default 1; for combos the sum of included pieces. */
  pieces?: number;
  personalisation?: PersonalisationField[];
  /** Percent off `price`; `null` appears in current data. */
  discountPercent?: number | null;
  /** Informational only; `null` appears in current data. */
  stock?: number | null;
  leadTimeDays?: number;
  shippingClass?: ShippingClass;
}

/* --------------------------- Config shapes ---------------------------- */

export interface Campaign {
  id: string;
  name: string;
  occasionTag: OccasionTag;
  startISO: string;
  endISO: string;
  cutoffISO: string;
  bannerText: string;
  capacityUnits?: number;
  revenueTarget?: number;
}

export interface CollectionQuery {
  types?: string[];
  occasions?: string[];
  tags?: string[];
}

export interface Collection {
  slug: string;
  title: string;
  blurb: string;
  query: CollectionQuery;
}

/* ------------------------------- Cart -------------------------------- */

export interface CartLine {
  slug: string;
  qty: number;
  /** Values keyed by `PersonalisationField.id`. */
  personalisation?: Record<string, string>;
}

/* ---------------------- Apps Script API (LLD-05) ---------------------- */

export type ErrorCode =
  | 'INVALID_FIELD'
  | 'PRICE_CHANGED'
  | 'UNAVAILABLE'
  | 'QUOTE_REQUIRED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SPAM'
  | 'SERVER';

export type OrderStatus =
  | 'Placed'
  | 'Payment claimed'
  | 'Paid'
  | 'In making'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Expired';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city?: string;
  state?: string;
  email?: string;
}

export interface OrderTotals {
  itemsSubtotal: number;
  discount: number;
  delivery: number;
  wrapFee: number;
  total: number;
}

export interface ApiEvent {
  name: string;
  at: string;
  props?: Record<string, string | number | boolean>;
}

/** Action name to { payload, data } map. Every reply is HTTP 200; success is in the body. */
export interface ApiActions {
  'order.create': {
    payload: {
      items: CartLine[];
      offerCode?: string;
      giftWrap?: boolean;
      giftMessage?: string;
      customer: CustomerInfo;
      note?: string;
      clientTotals: OrderTotals;
      /** Non-personal source signals (utm, campaign, referrer). */
      source?: Record<string, string>;
    };
    data: { ref: string; total: number; status: OrderStatus };
  };
  'order.claimPaid': { payload: { ref: string }; data: { status: OrderStatus } };
  'order.status': {
    payload: { ref: string; phone: string };
    data: { status: OrderStatus; courier?: string; trackingUrl?: string; updatedAt: string };
  };
  'order.payInfo': {
    payload: { ref: string };
    data: { amount: number; payeeName: string; vpa: string };
  };
  'request.create': {
    payload: {
      type: 'custom' | 'bulk';
      description: string;
      quantity?: number;
      budget?: string;
      neededBy?: string;
      contact: { name: string; phone: string; email?: string; company?: string };
      /** Bulk requests may prefill from the cart. */
      cart?: CartLine[];
      photoCount: number;
    };
    data: { requestId: string; uploadTokens: string[] };
  };
  'request.uploadPhoto': {
    payload: { requestId: string; token: string; index: number; mime: string; base64: string };
    data: { ok: true };
  };
  'review.create': {
    payload: { ref: string; phone: string; rating: number; text: string };
    data: { ok: true };
  };
  'campaign.remaining': { payload: { campaignId: string }; data: { unitsRemaining: number } };
  'event.log': {
    /** Up to 20 events/errors, no personal data. */
    payload: { events: ApiEvent[] };
    data: { ok: true };
  };
}

export type ApiAction = keyof ApiActions;

export interface ApiRequest<A extends ApiAction = ApiAction> {
  v: 1;
  action: A;
  /** Idempotency key. */
  key?: string;
  buildId: string;
  /** Honeypot; must be empty. */
  hp: string;
  payload: ApiActions[A]['payload'];
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  field?: string;
  retryable: boolean;
}

export interface ApiSuccess<D> {
  ok: true;
  data: D;
  serverTime: string;
}

export interface ApiFailure {
  ok: false;
  error: ApiError;
}

export type ApiResponse<A extends ApiAction = ApiAction> = ApiSuccess<ApiActions[A]['data']> | ApiFailure;
