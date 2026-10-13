# LLD-02 — Layouts, components and islands

Version 0.1 · 12 Oct 2026 · Status: **approved** (owner, 12 Oct — C-1…C-6 accepted, D-61)

Builds on: `SYSTEM-DESIGN.md` §4 (five frontend layers), D-27 (Preact for stateful islands, plain
TS for tiny ones), `LLD-01-ROUTES.md`, `DESIGN-SYSTEM.md`, `DESIGN-CHANGES.md`.
Implemented by `tk-frontend` (components, islands), `tk-data` (lib, types), reviewed by
`tk-architect` and `tk-design`.

## 1. What v1 has today (checked in the repo, 12 Oct 2026)

| Area          | v1 today                                                                                                                                              | v2 decision                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Layout        | One `Base.astro`: head, Google Fonts (Fraunces + Mukta), optional Cloudflare analytics beacon, Header, Footer, toast                                  | Split into four layouts (§3); self-hosted Fraunces + Karla               |
| Components    | 11 Astro components: CutoffBanner, DeliveryEstimate, Footer, Header, HowItWorks, PriceTag, ProductCard, RelatedProducts, Seo, ShareButton, StockBadge | Most rewritten to the new design; logic reused (§7)                      |
| Interactivity | Plain TS scripts; `site.ts` handles "add to cart" clicks by delegation; Header listens to a cart event; `checkout.ts` is 766 lines                    | Islands (§4); checkout becomes one Preact island with a state machine    |
| Cart state    | `localStorage` key `tk_cart_v1`, change events carrying a cause (`CartChangeCause`)                                                                   | Same pattern, key `tk_cart_v2`, one-time migration                       |
| Mobile nav    | Horizontally scrolling link row — no JavaScript                                                                                                       | Native `<details>` menu with Type / Occasion lists — still no JavaScript |
| Styling       | Tailwind tokens saffron/maroon/henna/cream/sand/ink/leaf                                                                                              | Replaced by the 8 design-system tokens                                   |
| Images        | Pre-optimised by `npm run optimize` into `public/images/products/`                                                                                    | Kept (C-5)                                                               |

## 2. Folder structure (target)

```
src/
  layouts/        BaseLayout, StoreLayout, TransactionalLayout, ContentLayout
  components/
    ui/           Button, Chip, Badge, Price, Icon, Field, Input, Textarea, Select, Checkbox (Preact TSX, see C-1)
    layout/       SiteHeader, SiteFooter, Breadcrumbs, SkipLink, AnnouncementBar
    seo/          SeoHead, JsonLd
    catalog/      ProductCard, ProductGrid, ListingHeader, CollectionCard, EmptyState
    product/      Gallery, PriceBlock, FacetChips, DeliveryEstimate, StockBadge, TweakVsCustom,
                  GoodToKnow, ComboContents, RelatedProducts, NotifyMe
    campaign/     CampaignHero, CutoffCallout, FestivalPills
    content/      Hero, Prose, StorySection, Callout, Faq, LocationLine
  islands/        FilterBar, AddToCart, CheckoutApp, RequestForm, StatusLookup, PayPage, ReviewForm (Preact)
  scripts/        cart-badge.ts, countdown.ts, share.ts, first-touch.ts (tiny plain TS)
  lib/            pure TS: types, catalog, pricing, filters, urls, cart, seo, format, upi, api (LLD-05)
  config/  data/  styles/tokens.css
```

Rule: `components/` never import from `islands/`; islands import `ui/` and `lib/` only;
`lib/` imports nothing from the browser or from components (keeps it testable and portable).

## 3. Layouts

| Layout                | Used by                                              | Contains                                                                                                                                   |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `BaseLayout`          | all                                                  | `<html lang="en">`, `SeoHead`, self-hosted font preloads, tokens CSS, `SkipLink`, first-touch script; robots meta from props               |
| `StoreLayout`         | storefront pages                                     | Base + `AnnouncementBar` (active campaign) + `SiteHeader` + `Breadcrumbs` + `<main>` + `SiteFooter` + cart badge script + analytics beacon |
| `TransactionalLayout` | `/cart/`, `/pay/`, `/order-status/`, `/reviews/new/` | Base + slim header (logo, back to shop) + `<main>`; **`noindex`, no analytics beacon, no third-party scripts** (LLD-01 §3.2)               |
| `ContentLayout`       | about, policies, guides, shipping                    | StoreLayout + readable prose column + table of contents for long policies                                                                  |
| 404 page              | unknown routes                                       | StoreLayout with search-free recovery links (shop, occasions, custom order)                                                                |

`SiteFooter` carries the location line **"Handmade in Delhi & Pune"** (D-60), contact links, policy
links and the payee note link (CX-10). Street addresses appear only on the contact/policy pages
(PG-4).

## 4. Islands (the only parts that ship JavaScript)

| Island             | Type                 | Loads            | Where                                             | Notes                                                                                                                                                            |
| ------------------ | -------------------- | ---------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FilterBar`        | Preact               | `client:idle`    | `/shop/`, type, occasion, combo, collection pages | Filters the **already-rendered** product cards (C-2); chips, counts, active filters, sort, no-dead-end message; URL contract from LLD-01 §5; algorithm in LLD-03 |
| `AddToCart`        | Preact               | `client:visible` | product page                                      | Quantity, personalisation fields (CAT-5), add; sold-out shows `NotifyMe` link instead (static)                                                                   |
| Card "Add" buttons | plain TS (delegated) | on load          | listings                                          | v1 pattern kept: one listener handles every card button                                                                                                          |
| `CheckoutApp`      | Preact               | `client:load`    | `/cart/`                                          | **One** island holding the whole cart → details → total → placed → pay state machine (C-3, LLD-04)                                                               |
| `RequestForm`      | Preact               | `client:visible` | `/custom-order/`, `/bulk-order/`                  | Variant prop `custom` / `bulk`; photo compression (REQ-2)                                                                                                        |
| `StatusLookup`     | Preact               | `client:load`    | `/order-status/`                                  | Ref + phone; prefill ref from URL                                                                                                                                |
| `PayPage`          | Preact               | `client:load`    | `/pay/`                                           | Reads amount for an unpaid ref; reuses `UpiPay` from CheckoutApp                                                                                                 |
| `ReviewForm`       | Preact               | `client:load`    | `/reviews/new/`                                   | R4                                                                                                                                                               |
| `cart-badge`       | plain TS             | on load          | header                                            | Reads cart count, listens to the cart event (v1 logic)                                                                                                           |
| `countdown`        | plain TS             | on visible       | campaign blocks                                   | Cutoff countdown from the visitor's clock (CMP-3)                                                                                                                |
| `share`            | plain TS             | on click         | product page                                      | Web Share API, fallback copy link                                                                                                                                |
| `first-touch`      | plain TS             | on load          | all (except transactional)                        | UTM + external referrer capture (v1 `site.ts` logic)                                                                                                             |

**Zero-JS by design (C-4):** mobile menu and filters drawer open with native `<details>`; gallery
uses CSS scroll-snap with thumbnail anchors; FAQ uses `<details>`; logo wiggle and other playful
touches are CSS with `prefers-reduced-motion` fallbacks.

**Budgets (NFR-1):** Preact runtime is loaded once and shared by islands on the page. Target ≤ 15 KB
gzipped of island JS per page, measured in CI on the built output; `CheckoutApp` may justify more
in its PR. Exact sizes are measured, not assumed.

**Islands talk only through the cart store** (`lib/cart.ts`): `localStorage` + a `tk:cart`
CustomEvent carrying a cause (`add`, `qty`, `remove`, `clear`, `migrate`) — the v1 pattern. No global
framework store, no island imports another island.

## 5. Component contracts (main ones)

Props are typed in `lib/types.ts` (contract task F-1). Abbreviated:

| Component                        | Props                                                                                   | Renders                                                                                                                                                                                                                                            | Requirements         |
| -------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `ProductCard`                    | `product: ProductSummary`, `headingLevel`                                               | Image, name, ₹ price (+ struck-through original if discounted), Type tag, Occasion tags, "Sold out · Notify me" label, Add button; **data attributes** `data-types`, `data-occasions`, `data-status`, `data-price`, `data-order` used by FilterBar | CAT-2, CAT-2a, Q-20  |
| `ProductGrid`                    | `products`, `emptyState`                                                                | Cards in a CSS grid; sold-out sorted last at build time                                                                                                                                                                                            | CAT-2                |
| `FilterBar` (island)             | `facets: {types, occasions}` with labels + counts, `combosBuilt: string[]`, `pageState` | Chips, active filters, sort, empty state, notice for unknown values                                                                                                                                                                                | CAT-2a/2b, LLD-01 §5 |
| `PriceBlock`                     | `price`, `discountPercent?`, `quoteOnly?`                                               | Price, discount line (no "% OFF" badges), "price on request" for quote-only items                                                                                                                                                                  | CHK-3, CHK-10        |
| `Gallery`                        | `images[]`, `alt[]`                                                                     | Scroll-snap slides + thumbnails; first image eager, rest lazy                                                                                                                                                                                      | CAT-3, SEO-5         |
| `FacetChips`                     | `types`, `occasions`                                                                    | Links to type/occasion pages via `lib/urls.ts`                                                                                                                                                                                                     | CAT-1, SEO-1         |
| `GoodToKnow`                     | `items: {q, a}[]`                                                                       | Plain-text Q&A (no hidden text)                                                                                                                                                                                                                    | SEO-11               |
| `TweakVsCustom`                  | `slug`                                                                                  | Small "tweak in the order note" hint vs "Start a custom order" card                                                                                                                                                                                | CAT-6                |
| `NotifyMe`                       | `product`                                                                               | WhatsApp link with prefilled "Notify me when X is back"                                                                                                                                                                                            | CAT-7                |
| `CampaignHero` / `CutoffCallout` | `campaign`                                                                              | Rosewood band + cutoff date; countdown script                                                                                                                                                                                                      | CMP-1…3              |
| `SeoHead`                        | `title`, `description`, `canonical`, `robots`, `og`                                     | Meta tags per LLD-01 rules                                                                                                                                                                                                                         | SEO-2/3              |
| `JsonLd`                         | typed builders from `lib/seo.ts`                                                        | Product/Offer, BreadcrumbList, Organization, ItemList                                                                                                                                                                                              | SEO-4                |
| `LocationLine`                   | —                                                                                       | "Handmade in Delhi & Pune"                                                                                                                                                                                                                         | CX-11                |

## 6. Styling, accessibility and images

- **Tokens:** the 8 colours, type scale and spacing from `DESIGN-SYSTEM.md` in `tailwind.config` +
  `styles/tokens.css`; old v1 colour names removed so nothing uses them by accident. Terracotta only
  for large/bold text (contrast). No inline styles except CSS custom properties.
- **Fonts:** Fraunces + Karla self-hosted, subset, `font-display: swap`, preload the two most used
  files; Google Fonts hosts removed from the CSP.
- **Accessibility (built into components, not added later):** landmarks and skip link; visible
  focus; 44×44 px tap targets; every hover effect has a tap/focus equivalent; `aria-live` for cart
  updates and form errors; labelled fields with an error summary; reduced-motion variants.
- **Images:** v1 pipeline kept (C-5): drop a photo in the image-masters folder → `npm run optimize`
  produces sizes in `public/images/products/` → `ProductImage` builds `srcset`/`sizes` from a naming
  convention. Adding a product stays "one JSON entry + images".

## 7. v1 → v2 mapping

| v1                                                                                            | v2                                                                                                                |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Base.astro`                                                                                  | `BaseLayout` + `StoreLayout` (+ `TransactionalLayout`)                                                            |
| `Header.astro` (+ cart-count script)                                                          | `SiteHeader` (static, `<details>` menu) + `cart-badge.ts`                                                         |
| `Footer.astro`                                                                                | `SiteFooter` (location line, policies, payee note)                                                                |
| `Seo.astro`                                                                                   | `SeoHead` + `JsonLd` (robots/canonical rules from LLD-01)                                                         |
| `ProductCard`, `PriceTag`, `StockBadge`, `DeliveryEstimate`, `RelatedProducts`, `ShareButton` | Rewritten to the new design; delivery, pricing and share logic reused from `lib/`                                 |
| `CutoffBanner` (+ script)                                                                     | `AnnouncementBar` / `CutoffCallout` + `countdown.ts`, driven by campaign config                                   |
| `HowItWorks`                                                                                  | `content/StorySection` variant                                                                                    |
| `site.ts`                                                                                     | `first-touch.ts` + delegated card "Add" handler                                                                   |
| `checkout.ts` (766 lines)                                                                     | `CheckoutApp` island + `lib/` modules (pricing, cart, upi, api) — LLD-04/05                                       |
| `lib/cart.ts`, `pricing.ts`, `coupon.ts`, `delivery.ts`, `format.ts`, `upi.ts`, `order.ts`    | Kept and extended, unit-tested; `order.ts` client-side ref generation removed (refs come from the server, LLD-06) |

## 8. Testing

- `lib/` (filters, pricing, urls, cart migration): Vitest unit tests.
- Islands and pages: Playwright on the preview at 360 and 412 px Android widths (D-28) — keyboard,
  tap, back/forward, reduced motion, no-JS rendering of listings (cards visible without JavaScript).
- No extra component-testing library for now (no new dependency); revisit if island logic grows.

## 9. Build order (feeds BACKLOG)

F-1 types → F-3 tokens, fonts, `ui/` primitives, layouts → F-4 header/footer/menu → catalog
components + `FilterBar` (L1-1) → product components + `AddToCart` (L1-2) → content pages (L8-1) →
`CheckoutApp` (R2) → request/status/pay islands (R3).

## 10. Decisions needed from the owner

| ID  | Decision                                                                                                                                                                   | Recommendation                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| C-1 | Write shared visual pieces (buttons, chips, price, form fields) **once** in Preact TSX; Astro renders them as plain HTML by default and only islands make them interactive | **Yes** — one implementation instead of an Astro copy and a Preact copy that drift apart                |
| C-2 | Filters hide/show and reorder the product cards already in the page, instead of drawing the grid with JavaScript                                                           | **Yes** — every product stays visible to search engines, AI crawlers and phones without JavaScript      |
| C-3 | Cart + checkout + order placed + pay is **one** island with one state machine                                                                                              | **Yes** — the v1 bugs came from state spread across a long script; one owner of state is easier to test |
| C-4 | Zero-JS first: menu, filter drawer, gallery, FAQ, playful effects use native HTML/CSS                                                                                      | **Yes**                                                                                                 |
| C-5 | Keep v1's image pipeline (optimise script + public folder) rather than switching to Astro's image service                                                                  | **Yes for v2** — keeps "add a product = JSON entry + images"; revisit later                             |
| C-6 | Approved reviews are pulled at build time into static HTML (no live fetch on product pages)                                                                                | **Yes** — faster pages, nothing breaks if Apps Script is slow; new reviews appear on the next publish   |
