# Tantu Kala v2 — R1 design audit (DZ-1)

Status: **proposal to the owner**. Nothing here changes an approved design; the owner decides.
Requirements touched: NFR-1, NFR-2, NFR-9. Decisions checked against: D-61, D-63.

## How this was measured

- Method: the 10 approved mockups in `docs/design/mockups/` were opened as static HTML in headless
  Chromium (mobile emulation) at 320, 360 and 412 px (height 740). A script measured, for every
  visible element: bounding-box size of links/buttons/inputs, computed font size, computed text
  colour against the nearest opaque background (WCAG relative-luminance ratio; large text = 24 px,
  or 18.66 px bold, needs 3:1, otherwise 4.5:1), input attributes, and page scroll width.
- Raw output: 134 KB JSON (not committed; temporary file removed before commit).
- **Not measured** (labelled where it matters): real Android devices, Instagram/WhatsApp in-app
  browsers, 200% text size, keyboard-open behaviour, `:hover` equivalents beyond reading the CSS,
  Lighthouse scores, text sitting on photographs/gradients (a gradient/image background makes the
  script's ratio unreliable), landscape.
- Observation: measured tap-target and contrast results were identical at 320, 360 and 412 px
  (sizes do not depend on width), so findings below apply to all three unless a viewport is named.
- Target size caveat: WCAG 2.2 AA (2.5.8) minimum is 24x24 px; this project's standard
  (`MOBILE-UX-STANDARD.md` §3 Touch) is stricter at 44x44 px, so the 44 px rule is used.
  Inline links inside a paragraph of text are exempt under WCAG, but not from the project rule
  for stand-alone links; both are noted where relevant.

## Severity legend

- **Must fix before R1** — breaks a rule in `MOBILE-UX-STANDARD.md`, WCAG AA or a decision, on a
  page buyers use.
- **Should fix** — real defect, but workaround exists or page is low-traffic.
- **Nice** — polish.

## 1. Ranked summary

Finding IDs (M = Must fix before R1, S = Should fix, N = Nice). Evidence is in section 2.

### Must fix before R1

| ID | Finding | Rule | Req |
| -- | ------- | ---- | --- |
| M1 | Header nav links, Cart pill and footer links are 14–22 px tall (nav 22 px, Cart 37–42 px, footer links 320x22). Fails the 44x44 rule on 9 of 10 mockups at 320/360/412. | MOBILE-UX §3 Touch | NFR-9, NFR-2 |
| M2 | No mobile menu is drawn. `catalog-nav.html` hides the nav below 780 px with the comment "mobile would use a hamburger — out of scope"; the other 9 show a row of 22 px inline links. Change D2 is therefore not designed yet. | DESIGN-CHANGES D1/D2; §3 Touch | NFR-9 |
| M3 | Form fields: font 14 px (textarea 12.5 px in cart), below 16 px. Field height 41–43 px (< 44). No `inputmode`, `autocomplete` or `enterkeyhint` on any of 17 fields; pincode is `type=text`; custom-order phone is `type=text`; cart "Alt. contact" is `type=tel` (and D-change says drop it). The cart order-note textarea at the top of the page has no label. | §3 Forms and keyboard | NFR-9 |
| M4 | Body copy below 16 px: paragraphs measure 12.5–14 px on the 10 pages (e.g. about 13.5 px, homepage 13.5 px, shipping 12.5 px). | §3 Readability | NFR-9, NFR-2 |
| M5 | Contrast failures from an **undocumented muted text colour** `#A08D7C` / `#9C8A76` (2.89–3.33:1; needs 4.5). Used for hints, "(optional)", fine print, order reference label, "Remove", breadcrumb separators, nav notes. Not one of the 8 palette colours. Affects 8 of 10 pages. | WCAG 1.4.3 | NFR-2 |
| M6 | Terracotta `#B5603A` (4.05:1 on ivory, 4.47:1 on white) used for small text: "Browse the catalog", "View all", "Clear all", breadcrumb "Home", active nav (12.5–14 px, regular weight), prices at 16 px, and white-on-terracotta buttons ("Pay ₹1,326 via UPI app" 15 px = 4.47:1; "Send an email" 12.5 px). Design change D5 says terracotta is for bold/large only; mockups do not follow it. Sage `#6B7A5E` is 4.02–4.17:1 for 11.5–13.5 px labels (availability, hero trust line, "Order recorded"). Fix needs either a darker terracotta/sage for text or bold >= 18.66 px. | WCAG 1.4.3; D5 | NFR-2 |
| M7 | Quantity steppers in the cart are 26x26 px (6 buttons); product page steppers 36x36 px; filter-chip remove "x" is 16x16 px. Quantity change and filter removal are core actions. | §3 Touch | NFR-9 |
| M8 | `cart-checkout.html` overflows horizontally at 320 px (content 331 px wide in a 320 px viewport). Cause not isolated (likely the `min-width:280px` checkout aside plus padding; **assumption**). No overflow at 360 or 412 px; other 9 mockups clean at all three widths. | §3 Layout | NFR-9 |
| M9 | Not one of the 10 mockups contains `prefers-reduced-motion` (0 matches), although 404, cart (confetti, script) and festival landing define `@keyframes`. Design change D4 is not yet drawn. | §3 Readability; D4 | NFR-2 |
| M10 | Hover rules remain (`:hover`: 2–4 per mockup) and the mockups show no tap/focus equivalent; the 404 "dropped stitch" joke and fun-fact tooltips still rely on hover. D3 not yet drawn. (Per-element hover-only status **not measured**; counted from CSS.) | §3 Touch; D3 | NFR-2 |
| M11 | No custom `:focus-visible` style in any mockup (focus/outline rules: 0 in 7 files, 2 in cart/festival, which style form fields/pills only). Browser default will apply, but on terracotta/rosewood buttons default ring contrast is **not measured**. Needs a defined focus token. | WCAG 2.4.7, 2.4.11 | NFR-2 |

### Should fix

| ID | Finding | Rule | Req |
| -- | ------- | ---- | --- |
| S1 | Text below 12 px is common: about 10.5/11, cart 10/11/11.5, catalog filter labels 10/10.5/11.5, custom-order thumb filename 9 px, homepage 10.5/11, festival 10.5/11.5, product 11. | §3 Readability | NFR-9 |
| S2 | `404.html` uses `min-height:100vh` (1 match). No `dvh`/`svh`, no `env(safe-area-inset-*)` and no `color-scheme` in any mockup. | §3 Layout; §2 Preferences | NFR-9 |
| S3 | Sticky headers in 6 mockups (cart, about, catalog, festival, homepage, shipping) and a sticky checkout aside (`position: sticky; top: 90px`). Header heights vs. keyboard-open not **measured**. Sticky aside must be desktop-only (D-change says no sticky summary on mobile; media-query scope not verified). | §3 Forms | NFR-9 |
| S4 | Section 4 of the design system says Figma holds only palette and type; product card and filter chip exist in HTML only. No separate state sheet (pressed, disabled, error, busy) exists, so spec for "feedback within 100 ms" and "disabled while busy" is missing. | §3 Feedback | NFR-9 |
| S5 | No 200% text-size or keyboard-open frame was drawn for any form (cart, custom order, contact). **Not measured.** | §2 Test matrix | NFR-9 |
| S6 | "Illustrative" and "coming next" copy is real contrast risk: festival pills (3.18:1 for "coming next"), cutoff fine print (4.39:1) are intentionally low emphasis but still fail AA text. | WCAG 1.4.3 | NFR-2 |
| S7 | Mustard on Rosewood eyebrows ("This Season", `#C99A44` on `#6E2E33`) measure 3.64–3.9:1 for 12–13.5 px text. The design system says Mustard is never for text. | DESIGN-SYSTEM §1 | NFR-2 |

### Nice

| ID | Finding | Req |
| -- | ------- | --- |
| N1 | Contact and custom-order pages could use the same "tap-to-copy fallback" pattern as UPI (WhatsApp number as selectable text) for in-app browsers. | NFR-9 |
| N2 | Body font Karla has no Devanagari; if Hindi copy is added, fallback stack must be fixed up front. | NFR-9 |
| N3 | Mockups use no `<img>` (placeholders via CSS, `aspect-ratio` on 5 files), so image space reservation for real photos is **not measured**. Specify `width`/`height` in the build. | NFR-1 |

## 2. Conflicts with D-61 (Preact islands, zero-JS default) and NFR-1 (Lighthouse >= 90, island <= ~15 KB gz)

1. **Google Fonts, two render-blocking requests per page** (`fonts.googleapis.com` stylesheet, Fraunces 4 styles + Karla 4 weights, 10/10 mockups). Third-party hosts add connection cost under Lighthouse mobile throttling and conflict with the "keep v1 image pipeline / static" posture. Proposal: self-host a subset of two families (Latin), preload one weight each. Sizes **not measured**. (NFR-1)
2. **Playful ideas need JS the design system does not budget**: stitch-pattern designer (large island, likely > 15 KB), cutoff countdown (needs build-time cutoff or small island), time-aware greeting (JS, or build-time static), spot-the-variation, knit loader, confetti, unspool story, gift-box builder. DESIGN-CHANGES keeps all of them. Each needs a per-island budget and a zero-JS fallback, otherwise it conflicts with the zero-JS-by-default rule and the 15 KB cap. Only one mockup carries script today (cart confetti inline `<script>`, which D-61 C-3 would replace with a single checkout island). (D-61, NFR-1)
3. **Stateful UI shown but not tagged as islands**: cart count in header ("Cart (3)"), quantity steppers, filter chips and counts, coupon field, UPI step with copy buttons. Mockups do not mark which are static (C-1) and which are islands (C-2/C-3). Needs an island map before build so C-4 (zero-JS menu, drawer, gallery, FAQ) is used wherever possible. (D-61)
4. **Menu/drawer** (D2) is not drawn, so it is not yet possible to confirm it can be built with `<details>`/CSS only (C-4). (D-61)
5. **Photography brief**: minimum 2000x2000 source and 4:5/1:1 mobile crops; the image pipeline (C-5) must output responsive sizes; the LCP hero image is the main NFR-1 risk. Lighthouse itself **not run** (mockups are static, not the built site).

## 3. Per-mockup evidence (360 px unless stated; values identical at 320 and 412 except where noted)

Overflow (page scroll width vs viewport): all mockups equal viewport at 320/360/412 **except cart-checkout 331 px at 320 px**.

| Mockup | Tap targets under 44 px (count, worst) | Contrast fails (count / worst) | Text < 12 px | Notable |
| ------ | -------------------------------------- | ------------------------------ | ------------ | ------- |
| 404 | 6; nav links 22 px tall; Cart 84x42 | 2 / 2.89:1 ("drop a stitch" hint, 12 px) | none | `100vh`; hover joke; `@keyframes` without reduced-motion |
| about | 20; nav 22 px; footer 320x22; Cart 77x37 | 5 / 2.89:1 (stat note 11 px) | 9 nodes (10.5–11 px) | terracotta 4.05:1 on "Our Story", "Browse the catalog"; body on Clay Sand 4.01:1 (13.5 px) |
| cart-checkout | 41; steppers 26x26; inputs 278x41; labels 20 px high; footer links 22 | 23 / 3.33:1 (hint, fine print, ref label, "Remove") | 12 nodes (10–11.5 px) | 331 px at 320; inputs 14 px; textarea 12.5 px unlabelled; no inputmode/autocomplete; white on terracotta 4.47:1 (Pay button, 15 px); inline `<script>`; sticky aside; confetti |
| catalog-nav | 7; filter chip x 16x16; "Clear all" 49x20; Cart pill 83x42; Custom Orders pill 132x42 | 18 / 2.89:1 (nav note 11.5 px); counts 3.18:1 | 15 nodes (10–11.5 px) | nav hidden below 780 px, no menu; prices 4.47:1 at 16 px |
| contact | 9; channel CTAs 38 px high; inputs 262x43; "Custom Orders page" link 15 px | 4 / 2.89:1 ("Or send a note"); white on terracotta 4.47:1 (12.5 px) | none | inputs 14 px; opens user's own email app (in-app browsers may not have a mail client — **not measured**) |
| custom-order | 11; inputs 262x43; WhatsApp link 192x37 | 9 / 3.18:1 ((optional), submit note 12 px, 9 px thumb name) | 5 nodes (9–11.5 px) | phone is `type=text`; upload limits copy needs 16 px; sage note 4.02:1 |
| festival-landing | 25; breadcrumb 14 px high; pills 41; footer 22 | 15 / 1.73:1 (breadcrumb "/" separators); mustard on rosewood 3.9:1; "coming next" 3.18:1; fine print 4.39:1 | 13 nodes (10.5–11.5 px) | countdown/cutoff data is dummy (out of scope per DESIGN-CHANGES) |
| homepage | 26; nav 22; "Explore the edit" 110x15 (x6); footer 22 | 19 / 3.64:1 (mustard numeral on umber); sage hero line 4.17:1; terracotta links 4.05:1; Clay Sand body 4.01:1 | 12 nodes (10.5–11 px) | 6 collections in mockup; DESIGN-CHANGES says cut to 2–3 (not yet applied) |
| product-detail | 7; steppers 36x36; breadcrumb 14 px; custom link 193x41 | 5 / 2.89:1 (breadcrumb "/", tweak hint 12.5 px); sage availability 4.17:1 | 3 nodes (11 px) | Add-to-cart tap size not flagged (>= 44); discount and shipping-note slots (DESIGN-CHANGES) not yet drawn |
| shipping-returns | 21; "Shipping & Returns" 130x22; footer 22 | 8 / 3.74:1 (crumbs); body on Clay Sand 4.01:1 (12.5 px) | none | 9 `<details>`-style matches (good, zero-JS FAQ per C-4); footer links 22 px |

All 10: viewport meta and `<html lang>` present; 0 `<img>` tags; no `title=`-only tooltips.

## 4. Things that pass (checked)

- No horizontal scroll at 360 and 412 px on any mockup, and at 320 px on 9 of 10.
- `viewport` meta and `lang` present on all 10.
- Page structure uses `<details>` for FAQ (shipping-returns): zero-JS, per C-4.
- Cart: tel type on phone, labels on all inputs except the first textarea.
- Umber and Charcoal Umber body text pass AA (design system quotes ~10.7 and ~13.6; not re-measured separately except where an element used them).

## 5. Suggested order of work for the owner

1. Decide the contrast fix (M5, M6, S7): add one documented "muted" token at >= 4.5:1 on ivory and white, and a darker text-safe terracotta/sage, or restrict them to bold >= 18.66 px.
2. Approve a mobile-menu design (M2) and the tap-size rule for header/footer links (M1, M7): this is the main redraw.
3. Update form spec (M3, M8) with attributes, 16 px fields, 48 px height.
4. Add a short "states and motion" page: focus ring, pressed, disabled, tap equivalents for hover, reduced-motion (M9–M11).
5. Add an island map and JS budget per playful feature (section 2) before R1 build.

