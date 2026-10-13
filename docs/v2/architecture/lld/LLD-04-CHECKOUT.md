# LLD-04 — Cart and checkout

Version 0.1 · 12 Oct 2026 · Status: **approved** (owner, 12 Oct — K-1…K-7 accepted, D-64)

Covers CHK-1…CHK-8, CHK-10…CHK-13, CAT-5, CX-5, CX-6, CX-10, D-17 (no gateway), D-49 (no
discount stacking), C-3 (one island, one state machine), `MOBILE-UX-STANDARD.md`. API shapes are
detailed in LLD-05/06. Implemented by `tk-data` (`lib/pricing.ts`, `lib/checkout-machine.ts`) and
`tk-frontend` (`CheckoutApp` island); `tk-apps-script` mirrors pricing (D-29).

## 1. What v1 does today (checked in code, 12 Oct 2026)

| Behaviour           | v1                                                                                                                                 | v2                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Order recording     | `fetch(…, mode: 'no-cors')`, fire-and-forget; the pay screen shows **immediately**, so the page never knows if the order was saved | Wait for a readable confirmation (D-30, K-1)                |
| Order ref           | Made in the browser: `TK-ddMM-xxxx` (no year)                                                                                      | Made by the server inside a lock (LLD-06)                   |
| Rounding            | Product discount and auto coupon both **round the price up** (`Math.ceil`) — "never undercharge"                                   | Kept                                                        |
| Free-delivery check | On the subtotal **before** the coupon                                                                                              | After the discount (K-5)                                    |
| Quantity            | Clamped to `[1, stock]` when stock is set; empty field allowed while typing (v1 bug fix)                                           | Kept                                                        |
| Pay screen          | UPI deep link on phones (user-agent check), lazy-loaded QR on desktop, copy UPI ID and amount, WhatsApp confirm link               | Kept; QR and copy offered on phones too                     |
| "I've paid"         | Sends `claim-paid` → Sheet row shows CLAIMED PAID; owner still verifies                                                            | Kept as a status (`Payment claimed`)                        |
| After refresh       | Last order (ref + amount + time only, no personal data) restored from `localStorage`                                               | Kept                                                        |
| Honeypot            | Hidden `company` field; filled → silently stop                                                                                     | Kept (+ server check)                                       |
| Sticky total bar    | Shown on mobile via IntersectionObserver                                                                                           | **Removed on mobile** (DESIGN-CHANGES; it can cover inputs) |

## 2. State machine (`lib/checkout-machine.ts`, pure and unit-tested)

```
           add item                     tap "Continue"
 [empty] ───────────► [cart] ───────────────────────► [details]
              ▲          │  cart over limit / large item     │ tap "Place order"
              │          ▼                                    ▼  (valid form)
              │     [quoteOnly] ──► /bulk-order/ prefilled   [placing] ── timeout/error ──► [placeFailed]
              │                                              │  confirmed                    │  retry (same key)
              │                                              ▼                               │  or send on WhatsApp
              │                                          [placed] ◄──────────────────────────┘
              │                                              │  shows ref + UpiPay
              │                                              ▼  tap "I've paid"
              │                                       [paymentClaimed]  (thank you, WhatsApp confirm, share)
              └───────── "Start a new order" ◄──────────────┘
 Revisit within 7 days after [placed] → [placed] restored from last-order store
```

Rules:

- The cart is cleared **only** when the server confirms the order (`placed`), never before.
- `placing` disables the button and shows progress; a double tap does nothing.
- On `placed`, the browser history entry is replaced so Back doesn't return to a submittable form;
  refresh restores `placed` from the last-order store.
- Every transition logs nothing personal; `checkout_start`, `order_placed`, `place_failed` (with
  error code) and `bulk_pitch_shown` go to the Log tab.

## 3. Pricing pipeline (`lib/pricing.ts`, the single source; mirrored in Apps Script)

All amounts are whole rupees.

```
line unit price   = ceil(price × (1 − productDiscount%))            (v1 rule)
items subtotal    = Σ unit price × qty
offer             = ONE offer only (D-49): the auto order-value tier or an entered code (K-2, K-3)
discount          = ceil-rounded so the customer is never undercharged (v1 rule)
goods total       = items subtotal − discount
delivery          = 0 if quoteOnly (quoted later)
                    0 if goods total ≥ free-delivery threshold, or the chosen offer is a free-delivery code
                    else standard ₹89
gift wrap         = wrap fee per order if chosen (K-4)
TOTAL             = goods total + delivery + gift wrap
```

- The summary shows each line plainly: Items · Offer applied (name) · Delivery (₹89 / Free) ·
  Gift wrap · **Total to pay**. No "% OFF" badges.
- **Free-delivery progress (CHK-13):** "Add ₹X more for free delivery" with a bar, measured on the
  goods total (K-5); "You've got free delivery" once reached; hidden for quote-only carts.
- **Server check:** Apps Script recomputes the total from `/pricing.json` + settings. Mismatch →
  `PRICE_CHANGED` → "Prices were updated — please review your total" and the summary refreshes.

## 4. Screens inside `CheckoutApp` (mobile layout first)

| Section               | Contents                                                                                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your bag              | Lines (image, name, personalisation, qty stepper, remove), sold-out/unavailable notices                                                                                                                                                                        |
| Offers                | Current offer line ("20% off orders over ₹500 applied"), code field with clear success/failure; if a code is worse than the current offer: "Your current offer is better — keeping it"                                                                         |
| Free delivery         | Progress bar (above)                                                                                                                                                                                                                                           |
| Bulk pitch            | At the soft quantity threshold: "Ordering for a group? Get special bulk rates" → bulk form with cart prefilled; can be ignored (CHK-12)                                                                                                                        |
| Quote only            | Over the hard limit or containing a large-size item: no payment; "Request a quote" (prices shared after review, valid 10 days) (CHK-10)                                                                                                                        |
| Gift                  | Gift message (counter, 500 characters max), gift-wrap toggle with fee                                                                                                                                                                                          |
| Delivery details      | Name · phone (10-digit Indian mobile, used for WhatsApp, status and receipts) · address · pincode (city/state filled automatically; editable if lookup fails) · order note (500 max) · honeypot · line "By placing this order you agree to the Terms" (CHK-11) |
| Summary + Place order | Inline, at the end of the form — **not a sticky bar** on mobile; payee note: "Payments are received by embox on behalf of Tantu Kala" (CX-10)                                                                                                                  |
| Placed                | Big order ref, what was ordered, total, "full payment in advance, non-refundable once making starts" reminder                                                                                                                                                  |
| Pay (`UpiPay`)        | Phones: "Pay ₹X with UPI app" button + "Pay from another phone (QR)" + copy UPI ID + copy amount. Desktop: QR first + copy options. Payee name shown as it will appear in the UPI app. "I've paid" button. WhatsApp "confirm my payment" link                  |
| Payment claimed       | Thank you, what happens next (owner verifies, making starts, Speed Post tracking later), order-status link, share the shop                                                                                                                                     |
| Failure               | Plain reason, **Retry** (same idempotency key — can't duplicate), **Send this order on WhatsApp** (pre-filled order text), cart kept                                                                                                                           |

Mobile rules from `MOBILE-UX-STANDARD.md` apply throughout: correct keyboards (`tel`, numeric
pincode, `autocomplete`), 16 px inputs, errors next to fields plus a summary, nothing covering an
input when the keyboard is open.

## 5. Placing an order (summary; contract in LLD-05/06)

1. On first entering `details`, the island creates an **idempotency key** for this checkout (kept in
   `sessionStorage`).
2. "Place order" → `order.create` with: idempotency key, items (slug, qty, personalisation), offer
   code, gift options, customer details, note, client-computed totals, build ID, source signals.
3. Waits up to **15 s** (to be tuned after the Apps Script latency spike, F-6). Success → `{ ref,
total, status }` → `placed`.
4. Errors map to messages: `PRICE_CHANGED`, `INVALID_FIELD` (which field), `UNAVAILABLE` (item no
   longer available → offer to remove it), `QUOTE_REQUIRED`, `RATE_LIMITED`, `SERVER`, timeout,
   offline → `placeFailed`.
5. Retry reuses the same key; the server returns the existing order instead of creating another.

## 6. Local storage (privacy)

| Store                           | What                                                     | Lifetime                                             |
| ------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `localStorage tk_cart_v2`       | Cart lines (slug, qty, personalisation)                  | Until ordered/cleared; v1 `tk_cart_v1` migrated once |
| `sessionStorage`                | Form draft (name, phone, address, note), idempotency key | Until the tab closes or the order is placed (K-6)    |
| `localStorage tk_last_order_v2` | Ref, total, time — **no personal data**                  | 7 days                                               |

## 7. Edge cases (each needs a test)

Empty cart · item sold out or hidden after it was added · quantity above stock · prices changed
after publish · double tap · refresh while placing · offline or Apps Script down · email quota hit
(order still saved) · in-app browser without clipboard or UPI deep-link support · UPI app not
installed · customer pays a different amount (owner reconciles; status page shows "awaiting
verification") · order placed but never paid (stays `Placed`; owner follows up — auto-cancel rule
in K-7) · pincode lookup down or non-serviceable pincode (warn, never block) · gift message with
emoji or Hindi/Marathi text · phone typed with +91, spaces or a leading 0.

## 8. Tests

- **Unit:** state machine transitions (every arrow in §2), pricing fixtures shared with Apps Script
  (offers, rounding, thresholds, quote-only, wrap), cart migration, validation rules.
- **Playwright (preview + test Apps Script, 360/412 px):** full happy path; keyboard open on each
  field; offline and timeout (mocked); retry without duplicates; quote handoff; refresh after
  placed; Back after placed; in-app-browser fallbacks (no clipboard).

## 9. Decisions needed from the owner

| ID  | Decision                                                                                                                                                                               | Recommendation                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| K-1 | Wait for the server to confirm the order (a few seconds, with progress) before showing the pay screen — instead of v1's instant pay screen that never knew whether the order was saved | **Yes** — every paid order then has a record and a server-issued reference; revisit only if the latency spike shows long waits |
| K-2 | When both an automatic offer and an entered code apply, keep whichever saves the customer more (never both)                                                                            | **Yes** — simple, fair, matches "no combining"                                                                                 |
| K-3 | Do product sale prices count as an offer? Option A: order offers apply only to full-price items. Option B: order offers apply on top of sale prices (what v1 does today)               | **A** — the only option that fully honours "discounts are not combined"                                                        |
| K-4 | Gift wrap fee charged once per order (not per item)                                                                                                                                    | **Yes** — simpler; revisit for large orders                                                                                    |
| K-5 | Free delivery is measured on the total **after** the offer (v1 measures before)                                                                                                        | **Yes** — an offer can't push an order over the free-delivery line                                                             |
| K-6 | Form details (name, phone, address) are remembered only for the open tab, not saved on the phone                                                                                       | **Yes** — protects customers on shared family phones; trade-off: re-typing on a later visit                                    |
| K-7 | Orders placed but unpaid for N days are marked "Expired" (owner can revive) — what N?                                                                                                  | **3 days**, with a WhatsApp reminder by the owner on day 1                                                                     |
