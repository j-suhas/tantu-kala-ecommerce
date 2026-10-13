# Tantu Kala v2 — Design changes (from the design review)

Source: the v2 design review (6 Oct 2026) and Suhas's comments on it. This file lists what
changes in the **mockups/design** before build. Code-side work is in
`IMPLEMENTATION-CHANGES.md`. Decisions are also logged in `DECISIONS-LOG.md`.

**Out of scope for this list:** mockup data (contact details, prices, delivery ranges, stats,
quotes) is dummy by design and is not treated as a defect. Real values come from config and
the owner at build time.

## What stays as-is

- 8-colour palette, Fraunces + Karla, photography brief (`DESIGN-SYSTEM.md`).
- Festive styling (Rosewood) scoped to festival moments only.
- Custom orders as a request flow, visually separate from cart/checkout.
- Full-width, unmistakable "Order placed" screen with the UPI step after it.
- No stacked "% OFF" badges.

## Site-wide changes

| #   | Change                                                                                                   | Why                                                                     |
| --- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| D1  | **One shared header** on every page (today there are three variants)                                     | Consistency; one component to build                                     |
| D2  | **Mobile menu** for Shop by Type / Shop by Occasion / Custom Orders (bottom sheet or menu button)        | Catalog nav currently disappears below 780px; most buyers are on phones |
| D3  | **Tap states** for every hover-only element (fun-fact tooltips, ribbon reveal, 404 joke, colour stories) | Hover doesn't exist on touch screens                                    |
| D4  | **Reduced-motion variants** for all animations                                                           | Respect the phone's "reduce motion" setting                             |
| D5  | Terracotta only for bold/large text (prices, CTAs), never small body copy                                | Contrast ~4.05:1 on ivory                                               |
| D6  | Delivery/shipping copy shown as a **slot filled from config**, not hard-coded text                       | One source of truth                                                     |

## Page-by-page changes

| Page               | Change                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage           | Cut to **2–3 collections** to match a ~26-product catalog; bring products into the first mobile scroll; grow collections later                                                                                                                                                                                                                                                                                 |
| Catalog + nav      | Apply D1/D2; filter counts come from data                                                                                                                                                                                                                                                                                                                                                                      |
| Product detail     | Add a **quiet discount line** (if a discount applies) and a **shipping note** slot; keep tweak-vs-custom split                                                                                                                                                                                                                                                                                                 |
| Custom order       | Keep the photo upload (decided: Google Drive via Apps Script — see below); add upload limits copy ("up to N photos, X MB each"); phone/WhatsApp as the required contact                                                                                                                                                                                                                                        |
| Cart & checkout    | **Order summary shows: subtotal, discount line, shipping (standard charge or "waived"), final total** — before "Place order". Remove "calculated by owner, added later". Coupon-code field for shipping-waiver codes. One order note (not per-item). Drop "alternate contact". City/state auto-filled from pincode. **No sticky summary on mobile** — static summary, inline "Place order". Copy in "we" voice |
| About              | Slots for real stats, founder story and quotes (owner to supply)                                                                                                                                                                                                                                                                                                                                               |
| Contact            | No change beyond D1                                                                                                                                                                                                                                                                                                                                                                                            |
| Shipping & returns | Owner writes real policy; delivery estimate from config; add shipping-charge and waiver rules                                                                                                                                                                                                                                                                                                                  |
| Festival landing   | Rebuild the example as **Diwali (8 Nov 2026)**; cutoff and countdown read from campaign config                                                                                                                                                                                                                                                                                                                 |
| 404                | Add tap fallback for the hidden "dropped stitch" joke                                                                                                                                                                                                                                                                                                                                                          |

## Playful ideas — final call

| Keep                                                                                                                                                                                                              | Adapt                                                                                                                                                     | Drop                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Stitch-pattern designer → custom order; colour stories; "spot the variation"; cutoff countdown; time-aware greeting; logo wiggle; pulse dot; confetti; knit loader; gift-box builder (later, needs combo pricing) | Maker's mark (only for numbered limited runs); thank-you corkboard (real, permissioned quotes only); unspool story / storyboard (tiny JS, reduced motion) | Thread-trail cursor (desktop-only); fun-facts marquee (hard to read on phones) |

## Decisions feeding the design

- **Shipping:** standard charge on normal orders; waived by coupon code or above an order-value
  threshold. Must be final before UPI payment.
- **Custom-order photos:** uploaded via the form to Google Drive through the existing Apps
  Script, linked from the request's Sheet row (text and photos stay together). _Interpreted as
  Drive, not a paid Cloud Storage bucket — pending Suhas's confirmation._
- **Discount policy for v2:** still open. Design includes the discount line; the rules are decided separately.
