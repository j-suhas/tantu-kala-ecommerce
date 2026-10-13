# Tantu Kala v2 — Measurement system and dashboard spec

Version 0.1 · 6 Oct 2026 · Status: **proposed** (Suhas asked Claude to define a practical system;
not yet confirmed)

## 1. Why three measures, not one

A single count misleads a handmade business. "500 rakhis" mixes making effort with sales.
v2 measures three different things and never adds them together:

| Measure         | Question it answers                      | Unit                                                              | Counted when                  |
| --------------- | ---------------------------------------- | ----------------------------------------------------------------- | ----------------------------- |
| **Net revenue** | Is the business earning?                 | ₹, after discounts, **excluding** shipping and gift-wrap fees     | Order status reaches **Paid** |
| **Orders**      | How many purchase decisions did we win?  | count of paid orders                                              | Order status reaches **Paid** |
| **Units**       | How much did we have to make? (capacity) | count of pieces; a combo counts as the number of pieces inside it | Order status reaches **Paid** |

Derived:

- **AOV** (average order value) = net revenue ÷ orders.
- **Units per order** = units ÷ orders.
- **Repeat rate** = customers with ≥2 paid orders ÷ customers with ≥1, over the last 12 months.
- **Request conversion** = custom/bulk requests that became paid orders ÷ requests received.
- **Lead time** = days from Paid to Shipped (median).

### Festival targets

Each campaign sets **one revenue target** (the goal) and **one unit capacity cap** (the limit
of what can be made in time). Orders are reported, not targeted. Example: "Diwali: ₹X revenue
target, capacity 150 units." Rakhi 2026's "500 rakhis" was a unit figure; under this system it
becomes a capacity number, alongside a separate revenue target.

### First target (from Suhas, 6 Oct 2026)

**Diwali 2026 run:** ₹1,00,000 of **pure product sales** (net revenue as defined above —
no shipping or wrap fees), counted **from 6 Oct 2026 to 8 Nov 2026**, all channels, including
Navratri and macramé items. A goal, not a must. No capacity cap set. Off-site orders are already
being logged by Suhas; the Customers tab and dashboard are add-ons on top of that log.

## 2. Order lifecycle (statuses)

`Requested` (custom/bulk only) → `Placed` (or `Awaiting quote` for non-standard orders) → `Paid` → `In making` → `Shipped` → `Delivered`,
plus `Cancelled` from any state before Shipped.

- Only orders that reached **Paid** count in revenue/orders/units.
- An order that is `Cancelled` after Paid is excluded and refunds are logged separately.
- Website orders start at `Placed`; off-site orders logged by the owner can start at `Placed` or `Paid`.

## 3. Data captured (Sheets)

One spreadsheet, these tabs (full column list in `ARCHITECTURE.md` §5):

| Tab          | One row per         | Key fields for metrics                                                                                                                                |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orders       | order               | ref, created, channel, source (UTM), campaign, customer phone, status, paid date, shipped date, subtotal, discount, shipping, wrap fee, total, coupon |
| OrderItems   | line item           | ref, product slug, type, occasion, qty, units (qty × pieces), unit price, line total                                                                  |
| Customers    | phone               | first order date, paid orders, net revenue, last order date                                                                                           |
| Requests     | custom/bulk request | id, type, created, status, quoted value, converted order ref                                                                                          |
| Ops (weekly) | week                | hours spent reconciling payments, payment mismatches, website visitors, checkout starts (typed in from Cloudflare Web Analytics)                      |

## 4. Channels and attribution

- `channel`: `website`, `whatsapp`, `instagram`, `in-person`, `other`. Set automatically for website orders; chosen by the owner for logged orders.
- `source`: UTM campaign/source captured from the landing URL (website) or typed by the owner (e.g. the Instagram post a customer mentioned).
- UTM convention: `utm_source=instagram|whatsapp|google`, `utm_medium=bio|post|story|broadcast|ads`, `utm_campaign=<campaign-id>` (e.g. `diwali-2026`).

## 5. Dashboard tab (layout)

Filter cells at the top: date range, campaign, channel.

1. **Headline:** net revenue, orders, units, AOV — period vs previous period.
2. **Campaign progress:** revenue vs target (bar), units vs capacity cap (bar), days to cutoff.
3. **By channel:** orders and revenue per channel; share of website vs off-site.
4. **Products:** top 10 by units and by revenue; combos vs singles; Type and Occasion splits.
5. **Customers:** new vs repeat customers, repeat rate, loyalty rewards due.
6. **Requests:** custom and bulk received, quoted, converted, conversion %.
7. **Operations:** median lead time; orders stuck >N days in a status; payment mismatches; reconciliation hours.
8. **Website funnel (weekly, typed in):** visitors → checkout starts → website orders.
9. **Quota health:** emails sent today vs Apps Script limit.

Built with plain Sheets formulas (`QUERY`, `SUMIFS`, `COUNTIFS`) and charts — no add-ons.

## 6. Scaling signals (when to recommend tier 1)

| Signal                        | Threshold (proposed)              | Recommended step                    |
| ----------------------------- | --------------------------------- | ----------------------------------- |
| Reconciliation hours          | > 2 hours/week for 2 weeks        | Razorpay + tier-1 webhook function  |
| Payment mismatches            | > 3 per month                     | Same as above                       |
| "Where is my order?" messages | frequent despite PST-1            | Tier-1 order-status function        |
| Coupon misuse                 | any leaked code abused            | Tier-1 server-side coupon check     |
| Email quota                   | > 70% of daily limit on peak days | Google Workspace or tier-1 notifier |
| Website share of orders       | rising past 50%                   | Invest in checkout features and ads |

Thresholds are starting guesses; adjust after Diwali 2026.
