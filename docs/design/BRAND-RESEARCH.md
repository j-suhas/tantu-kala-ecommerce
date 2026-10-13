# Premium Gifting Brand Research — Reference Doc

**Purpose:** Visual/brand-identity research for Tantu Kala's repositioning from a
single-festival rakhi shop into a year-round premium handcrafted-gifting brand. Owner named
**Ferns N Petals** as the reference segment. Covers FNP plus three comparable premium Indian
brands, based on live-site observation (browser screenshots + page content) captured
2026-09-01 by a research subagent. **No design decisions are proposed here — observation
only**, for Suhas and Claude to draw from when actually making palette/photography/layout
decisions later.

---

## 1. Ferns N Petals (fnp.com, and its premium sub-line fnp.com/luxe)

_Updated after a second research pass that closed the two gaps left by the first (Luxe
rendering + precise colors) — see below for exact extracted values, not visual estimates._

- **Color palette (precise, via `getComputedStyle`, not visual estimate):**
  - fnp.com main site: header/nav background is transparent (sits on plain white), H2 heading
    text `#191a0b` (warm near-black, not pure black), inline link/accent `#195ee0` (blue),
    secondary buttons white bg with `#191a0b` text/border. The primary "Explore All" CTA uses
    a `background-image`, not a solid color — its exact color **could not be captured** and
    is not claimed here.
  - fnp.com/luxe: accent gold/tan `#a98554` (used on headings and highlighted words), value-
    prop card backgrounds `#f8fff4` (mint), `#fffef3` (pale cream), `#fffcf8` (peach-cream),
    "Spotted" badge `#f9f5e8` (cream). Header/body background is the same transparent/white
    canvas as the main site — **it is not a dark/jewel-toned page overall**, contrary to the
    first pass's visual-estimate description below. The hero CTA button reads visually
    mustard/gold in screenshots but its exact value **could not be captured** (auto-rotating
    carousel advanced before it could be queried) — not claimed as confirmed.
  - _(Original first-pass visual estimate, kept for comparison, now superseded by the above
    where they conflict: "coral/peach, mustard-gold, soft pink, deep teal/forest-green;
    Luxe leans into burgundy/red, navy, gold-on-dark." The precise data shows Luxe's actual
    backgrounds are pale/cream-toned, not dark — the "opulent gold-on-dark" impression was a
    visual misread from screenshots, corrected here.)_
- **Typography:** Main site uses a clean sans-serif (Inter) throughout, rounded/friendly
  weight, no serif observed. **Luxe uses a different, serif display font (Platypi) for large
  headings**, with Fahkwang for some subheads — a real, confirmed typographic split between
  the main site and the premium sub-line, not present in the first-pass description.
- **Product photography (Luxe, now confirmed by direct observation):** a mix of clean studio
  shots on soft neutral/gradient backdrops ("Signature Pieces" row), styled/propped lifestyle
  shots on pedestals with ribbon/prop styling against grey backdrops ("Luxury In Trend" row),
  and a "Curated Elegance" section with fashion-magazine-style editorial model photography
  ("For Him"/"For Her" portraits on a peach gradient) — styled closer to a fragrance ad than
  a product catalog. Main-site catalog photography remains plain white/light studio,
  bouquets/boxes shot straight-on and tightly cropped, as in the first pass.
- **Layout/UX:** Main site is dense, e-commerce-first (icon strip, horizontal carousels,
  stacked "% OFF" badges). Luxe is visually calmer — generous whitespace, pastel value-prop
  cards, editorial section breaks — a genuinely different layout register, not just a
  recolor of the main site.
- **Production bug noted (neutral observation, not a design pattern):** on Luxe, product-name
  captions under carousel thumbnails render as vertically-stacked single characters (one
  letter per line), reproducible across reloads — a real CSS defect on their live site, worth
  knowing if FNP Luxe is being referenced as a "polish" benchmark.
- **Handling a broad catalog:** A top icon-strip of ~10 occasion/category shortcuts (Flowers,
  Cakes, Personalised, Plants, Rakhi, Hampers, Balloons, Luxe) plus occasion- and
  emotion-based carousels. FNP Luxe is a **separate, differently-styled sub-experience**
  (different palette, different type, different photography register) rather than blended
  into the main catalog.

## 2. Chumbak (chumbak.com)

- **Color palette:** Vivid and maximalist — brick-red/maroon, mustard yellow, olive/forest
  green, cobalt/navy, warm gold — often several strong colors in one hero image.
- **Typography:** Bold, all-caps, letter-spaced sans-serif for logo/headers; clean sans-serif
  for body. Confident and graphic, not delicate.
- **Product photography:** Mixed — lifestyle/editorial shots, in-hand outdoor shots, and
  plain-background grid thumbnails. Heavy reliance on illustrated/printed patterns (owls,
  animals, florals) as a recurring visual signature across unrelated product types.
- **Layout/UX:** Standard dense grid — "NEW ARRIVAL" badges, MRP/sale price, "ADD TO CART" on
  grid tiles directly, plain trust-icon row.
- **Handling a broad catalog:** Core mechanism is **named, illustrated capsule collections**
  (e.g. "Forest Folklore") spanning wildly different product types — mirror, cushion covers,
  tumblers, plate, jewellery holder, mugs, table runner, tissue box — unified by one recurring
  print/motif rather than by category. Most directly transferable pattern for a varied
  catalog: **theme-first merchandising instead of category-first.**

## 3. Nicobar (nicobar.com)

- **Color palette:** Restrained and atmospheric — deep navy/charcoal hero with pink/mustard
  accent notes; listing pages use a neutral light-grey studio background. Much lower
  saturation than Chumbak.
- **Typography:** Minimal, tracked-out sans-serif caps ("N I C O B A R ") — understated and
  editorial, not decorative.
- **Product photography:** Cinematic, styled lifestyle photography for the homepage hero;
  plain flat-lay/studio shots on light grey for catalog/listing pages, except on-model shots
  for jewelry (worn, close-up). Editorial for storytelling, plain studio for comparison
  browsing.
- **Layout/UX:** Product cards carry a **material eyebrow tag** (GLASS, STONEWARE, IRON,
  BRASS) above the name, plain price (little discount clutter), a small "comes in a gift box"
  badge. Filter sidebar: Category, Colour, Material, Price, Fragrance, Collections, Country
  of Origin.
- **Handling a broad catalog:** A single "Gifting" listing (~300 items) mixes **jewelry
  categories (Earrings, Bangles & Bracelets, Necklace, Charms & Pendants) directly alongside
  home categories (Decor, Fragrance, Drinkware, Serveware, Dinnerware, Barware, Kitchenware)**
  in one filterable grid — the closest direct precedent to Tantu Kala's jewelry + decor +
  gifting mix, solved via faceted filters (material, colour, collection) rather than separate
  sub-sites.

## 4. The Gift Studio (thegiftstudio.com)

- **Color palette:** Deep navy and warm gold dominate hero banners, soft taupe/beige backdrop
  for curated-gift photography — classic "luxury gifting" (jewel-box) aesthetic.
- **Typography:** Classic serif for the logo/section headers ("Curated Gifts"), clean
  sans-serif for UI/body — the serif is doing the "premium" signaling here, unlike the other
  three brands' all-sans approach.
- **Product photography:** Strongly styled/staged — gift boxes shown open with tissue paper,
  ribbon, props (candles, florals, branded ribbon seals) against dark/fabric-draped
  backgrounds, warm directional lighting. Product treated more like jewelry than flat catalog
  shots.
- **Layout/UX:** Occasion-icon strip at top, horizontal theme carousels ("Signature Picks,"
  "Limited Edition"), review counts per product, named designer-collaboration collections.
- **Handling a broad catalog:** Cross-cutting category tags (a single "Signature Picks"
  carousel filterable by "Jewellery"/"Home Decor"/"New Launches" as sibling tags), plus a
  "Build Your Own Hamper" tool letting a shopper assemble mixed-category items into one gift.

---

## Synthesis: common threads across these premium brands (observations, not recommendations)

1. **Theme/collection-first merchandising, not just category-first.** All four sites group
   products by narrative theme or occasion to some degree (Chumbak's capsule collections,
   Nicobar's Collections filter, The Gift Studio's designer collabs) — the mechanism each
   brand uses to make a disparate catalog feel curated rather than random.
2. **A visible split between "hero/editorial" and "catalog/grid" photography.** Nicobar and
   The Gift Studio both use cinematic/staged imagery for hero moments, but plain, neutral,
   consistent backgrounds for the actual comparison grid. FNP's main catalog stays
   plain-studio throughout; its Luxe line reaches for richer scene-setting mainly in copy.
3. **Muted/restrained palettes read as more "premium" than saturated ones, in this sample** —
   but it's a real fork, not a fixed rule. Nicobar and The Gift Studio skew toward
   "quiet luxury"; Chumbak is deliberately loud/maximalist and reads as "fun/quirky lifestyle"
   within the same broad segment.
4. **Serif vs. sans-serif tracks with "classic luxury" vs. "modern/editorial."** The Gift
   Studio's serif signals traditional luxury-hamper positioning; Nicobar's and Chumbak's
   tracked sans-serif signal modern, design-led positioning. FNP is fully sans-serif and
   reads as the most "e-commerce/mass" of the four — notably even inside its own Luxe line.
5. **Attribute-rich, low-clutter product cards correlate with the more boutique-feeling
   sites.** Nicobar's material tag + plain price, and The Gift Studio's review-count-without-
   heavy-discount-badges, both contrast with FNP's and Chumbak's busier tiles (strikethrough
   MRP, stacked "% OFF" badges). Discount-badge density tracked inversely with how "premium"
   a page felt in this sample.
6. **Jewelry-plus-decor catalogs get unified by cross-cutting filters/tags, not separate
   storefronts.** Nicobar (material/colour/collection filters spanning Earrings through
   Dinnerware in one grid) and The Gift Studio (Jewellery/Home Decor as sibling tags, plus a
   hamper-assembly tool) both solve the exact problem Tantu Kala's varied catalog will face.

## Caveats

**Resolved by a second research pass (2026-09-01):**

- FNP Luxe now fully rendered and directly observed (dismissed the location-picker modal) —
  its photography/layout/typography are confirmed, not inferred, and one real finding from
  the first pass was corrected: Luxe's palette is pale/cream-toned, not dark/jewel-toned as
  first estimated from screenshots (see §1 above for the correction and why).
- Several exact hex/rgb values were extracted via `getComputedStyle` for both fnp.com and
  fnp.com/luxe (see §1) — these are measured, not visually estimated.

**Still genuinely open:**

- Two specific elements' exact colors could not be captured despite two attempts: fnp.com's
  primary "Explore All" CTA (uses a `background-image`, not a solid color) and Luxe's hero
  CTA button (auto-rotating carousel advanced before it could be queried). Any color
  description for these two elements should be treated as unconfirmed, not fact.
- Chumbak, Nicobar, and The Gift Studio's palettes (§2-4) are still visual-estimate-only —
  the precision pass was scoped to FNP only, per Suhas's instruction. Would need the same
  `getComputedStyle` treatment if precise values are needed there too.
- All observations are from directly rendered, live pages captured 2026-09-01.

**Sources:** fnp.com, fnp.com/luxe, chumbak.com, nicobar.com, nicobar.com/collections/gifting,
thegiftstudio.com
