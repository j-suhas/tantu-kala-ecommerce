# Tantu Kala v2 — Design System (PROPOSAL, pending Suhas's review)

**Status: not yet confirmed.** This is the output of a design agent briefed on the confirmed
direction in `docs/v2/DECISIONS-LOG.md`. The overall direction (muted/craft-rooted palette
anchored on the existing logo brown, Fraunces headline font, dual-register photography,
Type+Occasion filtering) was already confirmed by Suhas — but the _specific_ choices below
(exact hex values, the Karla body-font proposal, precise photography rules) are new and have
not been reviewed yet. Move anything confirmed into `DECISIONS-LOG.md` once Suhas signs
off; don't treat this file as decided.

See also: `docs/design/moodboard.html` — a rendered visual version of everything below.

---

## 1. Color palette

Anchored on the existing logo brown `#4D3126` (unchanged), evolved from the current
`tailwind.config.mjs` saffron/maroon/henna/cream tokens toward muted/earthy tones.

| Name               | Hex       | Role                                                                                                                                          | Contrast notes                                                                                                                                                         |
| ------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Umber**          | `#4D3126` | Primary — brand anchor (unchanged from current logo). Headlines, primary buttons                                                              | On Warm Ivory: ~10.7:1 — passes AAA for body text                                                                                                                      |
| **Terracotta**     | `#B5603A` | Secondary — CTAs, price, hover states                                                                                                         | On Warm Ivory: ~4.05:1 — fine for large/bold text and UI; as small body text it's borderline, so use filled (white-on-terracotta) rather than terracotta-on-ivory copy |
| **Mustard**        | `#C99A44` | Accent only — badges/dividers/icons, occasion tags                                                                                            | On Warm Ivory: ~2.3:1 — **not for text**, decorative/border/icon use only                                                                                              |
| **Warm Ivory**     | `#FAF3E7` | Background — page background                                                                                                                  | Base for the above contrast checks                                                                                                                                     |
| **Clay Sand**      | `#EDE1CC` | Surface — cards, panels                                                                                                                       | Charcoal Umber text on this: ~11.5:1                                                                                                                                   |
| **Charcoal Umber** | `#33241E` | Primary body text                                                                                                                             | On Warm Ivory: ~13.6:1 (well past AAA)                                                                                                                                 |
| **Sage**           | `#6B7A5E` | Muted accent — availability/"in stock" labels                                                                                                 | On Warm Ivory: ~4.17:1 — fine for large text/labels, not dense small copy                                                                                              |
| **Rosewood**       | `#6E2E33` | Deep accent — reserved for festival-scoped moments (Raksha Bandhan/Diwali), kept OUT of the default/everyday identity per the brand direction | On Warm Ivory: ~9.1:1                                                                                                                                                  |

Practical rule: Umber and Charcoal Umber are the only colors safe as small body text on
light backgrounds. Terracotta and Sage are safe for large/bold text and UI labels. Mustard
is decoration-only, never text. (Contrast figures are rough WCAG-sense checks, not a formal
audit.)

## 2. Typography — proposal

**Display/headline: Fraunces** (unchanged, already confirmed) — high-contrast serif, keep
for logo-type, H1/H2, hero moments.

**Body: Karla (proposed, replacing Mukta)** — humanist sans with warm, slightly irregular
letterforms. Reasoning:

- Pairs with Fraunces' high-contrast strokes without competing; both carry warmth and a
  slight handmade quality, avoiding a generic "SaaS" feel.
- Wide weight range (Light–ExtraBold) covers body copy through UI labels with one typeface.
- Mukta's current weight/width reads heavier/more utilitarian — appropriate for a functional
  multi-language UI, less so for a "quiet premium" editorial tone.
- If Devanagari/Hindi copy becomes a real requirement later, Mukta (or Noto Sans Devanagari)
  can be layered back in as a script-specific fallback — this is a body-Latin-typeface swap,
  not a rejection of Mukta's utility.
- **Alternative if Karla feels too soft in testing: Work Sans** — cleaner, more neutral,
  still warmer than Inter.

Type scale:

| Step        | Font / weight                              | Size                  | Use                                      |
| ----------- | ------------------------------------------ | --------------------- | ---------------------------------------- |
| Display     | Fraunces SemiBold                          | 56–64px               | Hero headline                            |
| H1          | Fraunces SemiBold                          | 36–40px               | Page/section titles                      |
| H2          | Fraunces Regular/SemiBold                  | 26–28px               | Sub-sections, category headers           |
| H3          | Karla SemiBold                             | 18–20px               | Card titles, product names               |
| Body        | Karla Regular                              | 16px, 1.6 line-height | Paragraph copy, descriptions             |
| Small/label | Karla Medium, +1–1.5px tracking, uppercase | 12–13px               | Eyebrows, tags, filter chips, price meta |

## 3. Photography brief

**Studio register (catalog grid — critical for coherence across jewelry/decor/car-decor/garlands):**

- Backdrop: seamless warm off-white/ivory paper matching the `#F7EFE1`–`#EDE1CC` range (not
  stark white) — same family as the site's own background/surface tones.
- Lighting: single large soft, diffused light source, soft single-direction shadow, **consistent
  angle and softness across every product** — this consistency matters more than any specific
  lighting recipe, since it's what makes wildly different objects read as one brand.
- Framing: roughly square (1:1), product centered with ~10–15% margin; straight-on for flat
  items, slight 3/4 top-down for dimensional items (keychains, car decor, jewelry stands).
- Fixed white balance/gray-card calibration per shoot session so hues don't drift between batches.
- No props, no styling elements — this register is for comparability, not storytelling.
- Minimum 2000×2000px before compression.

**Editorial/hero register (storytelling — real-use context, not fashion-ad styling):**

- Mood: natural daylight, warm/golden tones matching the palette, candid rather than posed,
  shallow depth of field. Avoid hard flash, pure-white seamless, agency-model posing, heavy
  retouching.
- Rakhis: tied on an actual wrist, candid crop.
- Jewelry: worn in naturally lit indoor settings, close crop, soft bokeh — not a studio
  backdrop, not fashion-magazine posing.
- Home decor: styled in situ (shelf/console/entryway) with real surrounding texture.
- Car decor: hanging from an actual rearview mirror/dashboard, softly blurred real car interior.
- Office decor: on an actual desk with everyday blurred context.
- Garlands (Ganesh Chaturthi etc.): on a real home mandap/idol setup, warm ambient light.
- Gifting combos: mid-handover or unboxed with tissue/ribbon, hands visible, warm domestic setting.
- Aspect ratio: mobile-first — prioritize 4:5 or 1:1 crops for mobile hero banners.

## 4. Figma — status

A real Figma file now exists (not a simulation): **https://www.figma.com/design/vQ6wvtTUB8BU8mOSpE0UTm**
— contains the full palette (all 8 swatches, named, hex-labeled) and a working typography
scale built with the actual Fraunces + Karla fonts, screenshot-verified by the agent after
each step. The product card and filter-chip mocks were **not** built in Figma — they exist
only in the HTML moodboard (`docs/design/moodboard.html`) for now. No errors were hit; this
is a genuinely usable authoring path if more of the moodboard should be built out there too.
