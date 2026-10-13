# Tantu Kala v2 — System design (frontend + backend, tier 0 → tier 1)

Version 0.1 · 6 Oct 2026 · Status: **draft for discussion**. `ARCHITECTURE.md` holds the
concrete schemas; this doc explains the design choices, trade-offs and how it evolves.

## 1. Requirements that shape the design

- **Functional:** see `REQUIREMENTS.md` (catalog, campaigns, checkout, requests, status,
  reviews, owner ops, dashboard).
- **Non-functional:** ₹0 recurring cost; mobile-first; fast on 4G; no server to patch;
  owner can run everything from a phone and a Google Sheet.
- **Constraints:** one owner + AI agents; Google consumer-account quotas; Cloudflare free plan.

## 2. Load estimate (why tier 0 is enough)

| Quantity                | Rakhi 2026 actual          | Planning ceiling for v2 (10×)                   |
| ----------------------- | -------------------------- | ----------------------------------------------- |
| Orders per season       | ~20–30 (most off-site)     | ~300                                            |
| Orders per peak day     | a few                      | ~30                                             |
| Backend calls per order | ~3 (create, status, pay)   | ~100/day at peak                                |
| Page views              | not measured (to be added) | static, served free and unlimited by Cloudflare |

Apps Script handles ~100 backend calls/day comfortably. The tight limit is **email:
100 recipients/day** on a consumer Google account — owner notifications only, so ~30/day is
safe. Customer messages go by WhatsApp (manual) in tier 0.

## 3. High-level design

```
            ┌────────────────────── Cloudflare (free) ───────────────────────┐
 Browser ──►│ Static assets: HTML/CSS/images (Astro build)                   │
   │        │ [tier 1 later] /api/* Worker functions ──► D1 (cache/queue)    │
   │        └────────────────────────────────────────────────────────────────┘
   │ fetch JSON (orders, requests, status, reviews)
   ▼
 Google Apps Script web app ──► Sheets (Orders, OrderItems, Customers, Requests, Reviews, Log, Settings*)
   │                         └─► Drive (photos, receipts, labels)   └─► Gmail (owner alerts)
   ▼
 Owner: Sheet + Apps Script menu (log off-site order, payment link, receipt, label, status)
 * Settings tab: proposed owner-managed values (ADR-005, open)
```

## 4. Frontend design

| Concern       | Choice                                                                                                           | Why / trade-off                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Rendering     | Astro static generation; every product/campaign page pre-built                                                   | Fastest possible pages, zero server. Trade-off: content changes need a rebuild |
| Interactivity | Astro islands only where needed: cart, checkout, filters, forms, status lookup                                   | Keeps JS small; each island loads on its own                                   |
| State         | Cart in `localStorage` (v1 pattern) + `CartChangeCause` events; checkout draft saved locally                     | Survives reloads; no accounts needed                                           |
| Filtering     | Client-side over a small pre-built JSON index of products                                                        | ~100 products fit in a few KB; no search service                               |
| Styling       | Tailwind + design tokens from `DESIGN-SYSTEM.md`; self-hosted fonts                                              | Consistency; no third-party font calls                                         |
| Pricing       | One pure module `lib/pricing.ts`, unit-tested, mirrored in Apps Script                                           | Single source of truth; the backend re-checks                                  |
| Forms         | Progressive: work with plain fetch; disable submit while sending; idempotency key                                | Prevents duplicates; clear errors                                              |
| Images        | Pre-optimised (existing `npm run optimize`), responsive sizes, lazy-loaded                                       | Mobile data cost                                                               |
| Errors        | Every island shows a human message + "Send this on WhatsApp instead" fallback that pre-fills the cart/order text | Shopper never gets stuck if Apps Script is down                                |
| Observability | Client error log queued in `localStorage` and sent with the next request; Cloudflare Web Analytics               | Finally diagnose "didn't see order placed" cases                               |
| Accessibility | Tap/focus for every hover; reduced motion; AA contrast                                                           | Mobile users                                                                   |

**Component map (main):** `Header`(+`MobileMenu`) · `Footer` · `ProductCard` · `FilterBar` ·
`Gallery` · `PriceBlock` · `CampaignBanner` · `Countdown` · `CartList` · `OrderSummary` ·
`CheckoutForm` · `OrderPlaced` · `UpiPay` · `RequestForm` (custom|bulk) · `StatusLookup` ·
`ReviewList`.

## 5. Backend design (tier 0: Apps Script + Sheets)

### 5.1 Request handling

- One web app, router by `action`. Every write: validate → honeypot → rate limit
  (`CacheService`, per phone/fingerprint) → `LockService` (serialise writes so two orders can't
  get the same ref) → write → log → respond.
- **Order refs:** `TK-YYMMDD-NNN`, generated inside the lock from a counter cell.
- **Idempotency:** client sends `idempotencyKey`; stored in the Orders row; a repeat returns
  the same ref.
- **Total check:** recompute with mirrored pricing; reject on mismatch (client may be tampered
  or stale config).
- **Responses:** `{ ok, data | error: { code, message } }`; codes are stable for the UI.

### 5.2 Data integrity in a spreadsheet

- Sheets has no constraints, so the script enforces them: required fields, enums for status/
  channel, numeric checks. Owner edits by hand are allowed; a nightly trigger scans for bad
  rows and emails one summary.
- Dropdown validation on Status/Channel columns in the Sheet itself.
- Weekly backup: time trigger copies the spreadsheet into a dated Drive folder (keep 8).

### 5.3 Security

- The web app URL is public; treat every input as hostile. No customer data in GET responses
  except to ref + matching phone.
- Owner-only actions run from the Sheet menu (runs as the owner, not via the public URL).
- No secrets in the repo; Apps Script properties hold anything sensitive.

### 5.4 Failure modes

| Failure                            | Effect               | Handling                                                                                        |
| ---------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| Apps Script slow/down              | Can't record order   | UI falls back to "Send order on WhatsApp" with pre-filled text; error logged locally            |
| Quota hit (email)                  | Owner alert not sent | Order still saved; dashboard shows quota; daily digest instead of per-order email if near limit |
| Two simultaneous orders            | Ref clash            | `LockService`                                                                                   |
| Double tap / retry                 | Duplicate order      | Idempotency key                                                                                 |
| Stale config in an old cached page | Price mismatch       | Backend rejects with a "refresh" message                                                        |

## 6. Product and settings data (open — ADR-005)

You plan to keep size class, cart limits and coupon values in the Sheet. Today products live in
`products.json`. Options:

| Option              | How                                                                                                                                                  | Pros                                   | Cons                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| A. Repo files       | Owner edits JSON/config (GitHub web editor) → rebuild                                                                                                | Simple, versioned, matches v1 contract | Owner edits code-like files                                                    |
| B. Sheet → build    | "Products" and "Settings" tabs; a build step pulls them (published CSV/Apps Script) and writes JSON; rebuild via a manual "Publish" or scheduled job | Owner works only in the Sheet          | Needs a rebuild trigger; a bad row can break the build (validation catches it) |
| C. Sheet at runtime | Site fetches settings live from Apps Script                                                                                                          | Instant changes                        | Slower pages, breaks if Apps Script is down, weaker caching                    |

**Recommendation:** B for **Settings** (shipping, thresholds, coupons, size classes) and keep
A for **Products** until v2 is stable, then decide. B must keep "add a product" to one row/entry.

## 7. Tier-1 evolution (when signals fire)

1. Add Worker routes under `/api/*` in the same Cloudflare project (free plan: 100k calls/day).
2. Start with **read paths**: order status, capacity remaining, approved reviews — cached in KV/D1, refreshed from Sheets.
3. Then **write paths**: `order.create` in a Worker that validates, writes to D1, then forwards to the Sheet (Sheet stays the owner's view).
4. Then **payments**: Razorpay order + webhook → mark Paid automatically.
   The frontend only changes its API base URL; contracts stay the same — which is why the
   contracts in LLD-05 (formerly `ARCHITECTURE.md` §6) are versioned.

## 8. Trade-offs accepted

- Coupon codes visible in client config (tier 0). Revisit: tier 1 server check.
- Rebuild needed for content changes. Revisit: option B/C above.
- Manual payment verification. Revisit: Razorpay + webhook when reconciliation time rises.
- Email limits on a consumer Google account. Revisit: Workspace or tier-1 notifier.

## 9. What to revisit as it grows

Order volume past ~30/day; website share of orders past 50%; any lost order due to Apps Script
downtime; any duplicate or mismatched payment; owner time on admin > 2 h/week.
