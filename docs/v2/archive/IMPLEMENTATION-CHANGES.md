# Tantu Kala v2 — Implementation changes (from the design review)

> Superseded as the working spec by `docs/v2/product/REQUIREMENTS.md` and `docs/v2/architecture/ARCHITECTURE.md`
> (6 Oct 2026). Kept as the record of what the design review produced.

Source: the v2 design review (6 Oct 2026) and Suhas's comments. Design-side changes are in
`DESIGN-CHANGES.md`. All items must respect `CLAUDE.md`: ₹0 recurring cost, no backend
server (one Apps Script max), mobile-first with zero-JS by default, and
**"add a product = one JSON entry + images"**.

Status legend: **Decided** · **Open** (needs owner decision) · **Proposed** (engineering default, can change).

## 1. Product data (`src/data/products.json`)

Today a product has: `slug, name, price, image, shortDescription, description, status, stock,
discountPercent, tags` (26 products).

| Change                                                                                                | Status   | Notes                                                                   |
| ----------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| Type and Occasion derived from existing `tags` using prefixes, e.g. `type:jewelry`, `occasion:diwali` | Proposed | No new required field; "Everyday" = no occasion tag                     |
| Every product must have ≥ 1 `type:` tag                                                               | Decided  | Validate at build time; fail the build if missing                       |
| Optional `images: []` alongside `image`                                                               | Proposed | `image` stays the required primary, so the add-a-product contract holds |
| Optional `edition` (e.g. piece numbering)                                                             | Proposed | Only for numbered limited runs                                          |

## 2. Config (`src/config/site.mjs` + one new small config)

| Change                                                                                                    | Status                             | Notes                                                                |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| `shipping`: standard charge on normal orders (`flat` > 0) + `freeAbove` threshold                         | Decided                            | Amount still to be set by owner                                      |
| Coupon codes that waive shipping (e.g. `{ code, waivesShipping: true }`) alongside `autoOrderValue` tiers | Decided (mechanism) / Open (codes) | Validated client-side; final total computed before order is recorded |
| v2 discount policy (keep, change or drop the 20%-over-₹500 auto-coupon)                                   | Open                               | Design already has a discount line slot                              |
| `campaigns`: `{ name, occasionTag, active, cutoffISO, bannerText }`                                       | Proposed                           | Drives festival landing, cutoff countdown, homepage festive strip    |
| `collections`: `{ slug, title, blurb, tagFilter }` — collections are tag queries, not hand-picked lists   | Proposed                           | Adding a product never requires touching collections                 |

## 3. Checkout and order flow (`src/pages/cart.astro`, `src/scripts/checkout.ts`, `src/lib/cart.ts`)

| Change                                                                                            | Status   | Notes                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order total = subtotal − discounts + shipping (or waived), **fixed before the order is recorded** | Decided  | UPI amount and order ref must match exactly; flow order in `CLAUDE.md` unchanged                                                                          |
| Coupon-code input with clear success/failure message                                              | Decided  |                                                                                                                                                           |
| One order note (no per-item notes)                                                                | Proposed | Keeps the Sheet columns and owner workflow unchanged                                                                                                      |
| Remove "alternate contact"; city/state from pincode lookup                                        | Proposed | Existing pincode autofill reused                                                                                                                          |
| No sticky order bar on mobile; inline "Place order"                                               | Proposed | Avoids the overlap hazard investigated earlier                                                                                                            |
| Order-placed screen per mockup (full width, large ref, UPI step after)                            | Decided  | Also helps with the unresolved "customer didn't see order-placed" report — add client-side logging of silent failures (honeypot, empty cart) during build |
| Sheet row gains `shipping`, `discount`, `couponCode` columns                                      | Proposed | Apps Script update                                                                                                                                        |

## 4. Custom orders

| Change                                                                                                                              | Status                                                     | Notes                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| Form posts text + photos to the existing Apps Script; photos saved to a Google Drive folder, Sheet row stores the folder/file links | Decided (pending confirmation that "Google Cloud" = Drive) | Free within Google quotas; no new service                     |
| Client-side limits: max photo count and size; compress images in the browser before upload                                          | Proposed                                                   | Apps Script request size limits; keeps uploads fast on mobile |
| Spam protection: honeypot + basic rate limit in Apps Script                                                                         | Proposed                                                   |                                                               |
| Owner email notification with link to the Sheet row                                                                                 | Proposed                                                   | Same pattern as orders                                        |

## 5. Front-end platform

| Change                                                                           | Status   | Notes                                               |
| -------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| Self-host / subset Fraunces + Karla (replace Mukta)                              | Proposed | Performance; no third-party font requests           |
| New Tailwind tokens for the 8-colour palette                                     | Decided  | Replace saffron/maroon/henna tokens                 |
| Shared `Header` component with mobile menu                                       | Decided  |                                                     |
| Playful features as small opt-in islands, all honouring `prefers-reduced-motion` | Decided  | Only the "Keep"/"Adapt" list in `DESIGN-CHANGES.md` |
| Build-time checks: required tags, image presence, campaign dates valid           | Proposed | Catches content mistakes before deploy              |

## 6. Content (owner-supplied before launch)

Real shipping amount and waiver rules, returns policy, founder story, any stats, permissioned
customer quotes, product photography (studio + editorial registers), Diwali campaign cutoff.

## 7. Suggested build order

1. Data + config changes (tags, campaigns, collections, shipping, coupons) with build-time validation.
2. Design tokens, fonts, shared header + mobile menu.
3. Catalog and product pages.
4. Cart/checkout totals, coupons, order-placed screen, Apps Script columns.
5. Custom-order page + Apps Script Drive upload.
6. Homepage, about, contact, shipping & returns, 404, festival landing.
7. Playful islands.

Nothing here is deployed without the owner's OK (`CLAUDE.md` rule 5).
