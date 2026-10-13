# Tantu Kala v2 — Architecture (tier 0)

Version 0.1 · 6 Oct 2026 · Status: **draft**

## 1. Components

```
 Shopper (mobile)                         Owner
      │                                     │
      ▼                                     ▼
 Cloudflare (Workers Static Assets)     Google Sheet (admin + dashboard)
   Astro static build (dist/)              ▲   │ Sheet menu / sidebar (Apps Script)
   + small JS islands (cart, checkout,     │   ▼
     forms, status lookup)            Google Apps Script web app (one project)
      │  fetch (JSON)                      │   │
      └──────────────────────────────────►─┘   ├─► Google Drive (request photos, invoices, labels)
                                               └─► Gmail (owner notifications)
 UPI apps ◄── deep link / QR (amount + ref) ── built on the client from the recorded total
 Meta Commerce Manager / Google Merchant ◄── product feed file generated at build time
```

No server, no database. The Sheet is the system of record. Tier-1 Cloudflare functions can
later sit in front of Apps Script without changing the static site.

## 2. Repository layout (v2 branch, target)

```
src/
  data/products.json          # the only product content file
  config/site.mjs             # contact, UPI, shipping, coupons, gift wrap, loyalty
  config/campaigns.mjs        # festival campaigns
  config/collections.mjs      # tag-query collections
  lib/                        # pure TS: cart, pricing, tags, validation (unit-tested)
  components/                 # Astro components (Header, ProductCard, Filters, …)
  pages/                      # routes (see §4)
  scripts/                    # client islands (checkout, request-form, status, pay)
  styles/                     # tokens from DESIGN-SYSTEM.md
apps-script/                  # Code.gs split into modules + appsscript.json
scripts/                      # build-time: validate content, generate feeds, optimize images
tests/                        # unit tests for lib/, e2e smoke for key flows
docs/                         # this documentation
```

## 3. Data model

### 3.1 Product (`products.json`)

Required (unchanged from v1): `slug, name, price, image, shortDescription, description, status, tags`.
Optional (new): `images[]`, `includes[]` (combo contents, slugs), `pieces` (units per item, default 1;
for combos = sum of included pieces), `personalisation[]` (`{ id, label, type: text|choice, options?, maxLength? }`),
`discountPercent`, `stock` (informational only).

Tags: `type:<slug>` (≥1 required), `occasion:<slug>` (0+), free tags allowed.
`status`: `available | made-to-order | sold-out | hidden`.

### 3.2 Config

- `site.mjs`: `shipping { standard: 89, freeAbove: 500–700 (TBD), standardOrder: { maxSubtotal?, maxItems?, allowedClasses[] } }`
  (products may carry `shippingClass: standard | large`; a cart outside `standardOrder` becomes `Awaiting quote`),
  `loyalty { tier1: { minSpend: 2999, minOrders: 4|5, window: "12m"|"year" } }`, `coupons { autoOrderValue[], codes[] }`
  where a code is `{ code, percentOff?, flatOff?, waivesShipping?, minSubtotal?, validUntil? }`,
  `giftWrap { enabled, fee: 30 (provisional) }`, `giftMessage { maxLength: 500 }`,
  `appsScriptUrl`, `upi`, contact details.
- `campaigns.mjs`: `{ id, name, occasionTag, startISO, endISO, cutoffISO, bannerText, capacityUnits?, revenueTarget? }`.
- `collections.mjs`: `{ slug, title, blurb, query: { types?, occasions?, tags? } }`.

Note: coupon codes in client config are visible to anyone who inspects the site. Accepted for
tier 0; moving codes server-side is a tier-1 trigger (METRICS §6).

## 4. Routes

> **Superseded by `lld/LLD-01-ROUTES.md`** (11 Oct 2026) — e.g. festival pages moved to
> `/occasions/<slug>/`, `/cart/` is `noindex`, all links come from `src/lib/urls.ts`.

`/`, `/shop` (catalog + filters), `/products/[slug]`, `/collections/[slug]`, `/festivals/[id]`,
`/custom-order`, `/bulk-order`, `/cart` (cart + checkout + order placed + pay),
`/order-status`, `/pay` (`?ref=`), `/reviews/new` (`?ref=`), `/about`, `/contact`,
`/shipping-returns`, `/privacy`, `/terms`, `/404`. Build outputs `feeds/meta-catalog.csv`.

## 5. Google Sheet schema

| Tab        | Columns                                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orders     | ref, createdAt, channel, source, campaign, name, phone, address, pincode, city, state, note, giftMessage, giftWrap, subtotal, discount, couponCode, shipping, wrapFee, total, status, paidAt, shippedAt, deliveredAt, trackingUrl, invoiceUrl, labelUrl, reviewRequested |
| OrderItems | ref, slug, name, type, occasion, qty, pieces, units, unitPrice, lineTotal, personalisation                                                                                                                                                                               |
| Customers  | phone (key), name, firstOrderAt, paidOrders, netRevenue, lastOrderAt, rewardDue                                                                                                                                                                                          |
| Requests   | id, type (custom/bulk), createdAt, name, phone, email, company, quantity, budget, neededBy, description, photosFolderUrl, status, quotedValue, orderRef                                                                                                                  |
| Reviews    | id, ref, createdAt, rating, text, photoUrl, displayName, approved                                                                                                                                                                                                        |
| Ops        | weekStart, reconcileHours, mismatches, visitors, checkoutStarts                                                                                                                                                                                                          |
| Log        | timestamp, action, ref, result, error (for debugging silent failures)                                                                                                                                                                                                    |
| Dashboard  | formulas only (METRICS §5)                                                                                                                                                                                                                                               |

## 6. Apps Script web app API

> **Superseded by `lld/LLD-05-API-CLIENT.md`** (12 Oct 2026): every call is a POST with a JSON
> body (no phone or order data in URLs), approved reviews are pulled at publish time, photos upload
> separately after the request is saved.

One deployment; `doPost` routes by `action`, `doGet` serves read-only lookups. All requests
carry a honeypot field; the script rate-limits by phone/IP hint using `CacheService`.

| Action               | Method | Input                                               | Output                                                              |
| -------------------- | ------ | --------------------------------------------------- | ------------------------------------------------------------------- |
| `order.create`       | POST   | cart lines, customer, pricing breakdown, utm        | `{ ref, total }` (total re-computed and compared; mismatch = error) |
| `request.create`     | POST   | type, fields, photos (base64, compressed, ≤ limits) | `{ id }`; photos saved to Drive folder                              |
| `review.create`      | POST   | ref, phone, rating, text, photo?                    | `{ ok }`                                                            |
| `order.status`       | GET    | ref, phone                                          | `{ status, trackingUrl }` or not-found                              |
| `order.pay`          | GET    | ref                                                 | `{ amount, payeeVpa, ref }` for unpaid orders only                  |
| `reviews.approved`   | GET    | —                                                   | approved reviews (no personal data)                                 |
| `campaign.remaining` | GET    | campaignId                                          | `{ unitsRemaining }`                                                |

Owner-side (Sheet menu, not public): log off-site order, mark paid, generate payment link,
generate invoice PDF, generate label PDF, request review (opens WhatsApp with link).

## 7. Pricing logic (single source)

`src/lib/pricing.ts` computes: line totals → subtotal → product discounts → auto tier → coupon
→ shipping (standard / free above / waived by coupon) → gift wrap → total. Apps Script holds a
mirror of the same function and verifies the client's total on `order.create`. A shared test
fixture (`tests/fixtures/pricing-cases.json`) is run against both.

## 8. Environment notes for agents

- `node_modules` installed on Windows does not run in a Linux sandbox (rollup native binary).
  Agents in Linux sandboxes must `npm ci` in their own worktree or limit themselves to type checks.
- Apps Script is deployed manually by the owner (clasp optional); agents edit `apps-script/` only.
