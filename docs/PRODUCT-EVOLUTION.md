# Product evolution — beyond Raksha Bandhan

Living doc for turning the seasonal rakhi site into a year-round crochet store.
Nothing here is in v1 scope; it's the plan for when the season ends.

## A. Season wind-down → general catalog

When rakhi season ends, the site shifts from "one festive drop" to a standing catalog.
Concrete touch-points, roughly in order of effort:

**Content / catalog**
- `src/data/products.json` — replace rakhi entries with the new range (bags, coasters,
  amigurumi, home décor, etc.). The schema already supports it; no code change to add products.
- Add a **category** field to products (`"category": "bags"`) and group the catalog by
  category on the home page. (New: a small grouping component + optional category pages.)

**Promotions**
- `src/config/site.mjs → coupons` — retire the festive "20% over ₹500" tier or replace with
  standing offers. The promo banner and server verification both read from here, so one edit
  propagates everywhere.
- `shipping` — revisit free-shipping threshold for non-festive pricing.

**Theme / visual appeal**
- `tailwind.config.mjs` palette (`saffron`/`maroon`/`henna`/`cream`) — soften from festive
  to an everyday brand palette; every component reads these tokens, so it re-skins globally.
- Fonts in `Base.astro` if the brand voice changes.
- `src/components/HowItWorks.astro`, hero copy in `index.astro` — de-festive the language.

**Seasonal chrome to remove/generalise**
- `CutoffBanner.astro` — the Raksha Bandhan cutoff + festive promo strip. Make it generic
  (or drive it from a `campaign` config block so future festivals reuse it: Diwali, etc.).
- `delivery` estimate copy ("Arrives before Raksha Bandhan") in `DeliveryEstimate.astro`.
- `rakhiDateISO` / `orderCutoffISO` in config → generalise to a `campaign` object.

**SEO / social**
- Update `SITE.description`, per-page titles, and OG default image (`public/og/default.jpg`)
  away from rakhi-specific wording so shared links reflect the full store.

**Suggested refactor:** introduce a `campaign` config block —
`{ name, active, cutoffISO, bannerText, promoTiers }` — so festivals become data, not code
edits. This is the single biggest lever for making seasonal switches painless.

## B. Multiple images per product (v2)

Today each product has one `image`. Plan:
- Change schema to `images: ["a.jpg", "b.jpg", ...]` (keep `image` as a fallback/first).
- Product detail page (`[slug].astro`) → a small gallery/carousel island (thumbnails +
  main image; keep it a tiny JS island to stay fast).
- `ProductCard` uses the first image; optional hover-to-second-image.
- Image pipeline (`scripts/optimize-images.mjs`) already globs the folder — extend it to
  handle per-product image sets and generate the OG image from the first.
- OG stays single-image (first) for link previews.

## C. Other parked ideas (from MVP-SCOPE v2 list)
Automated payment gateway (Razorpay) · admin/CMS · accounts & order history · server DB ·
Meta Pixel + ad tracking · search / filter / sort · reviews · wishlist · inventory automation ·
multi-language · blog. Prioritise **Razorpay** (automated payment confirmation) and
**search/filter** once the catalog grows past ~20 products.

## D. Rough sequencing when the season ends
1. Snapshot the rakhi site (git tag, e.g. `v1-rakhi-2026`) so it's reproducible next year.
2. Introduce the `campaign` config refactor (A) — small, unlocks reuse.
3. Swap catalog + categories (A).
4. Re-skin theme (A).
5. Add multi-image galleries (B).
6. Then tackle the highest-value parked item (likely Razorpay or search).
