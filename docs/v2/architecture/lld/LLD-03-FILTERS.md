# LLD-03 — Filters and listings

Version 0.1 · 12 Oct 2026 · Status: **approved** (owner, 12 Oct — F-1…F-6 accepted, D-62)

Covers CAT-1, CAT-2, CAT-2a, CAT-2b, CAT-8, Q-20/D-50 (sold-out visible), CX-4 (the six ways a
product can seem to "disappear"), SEO-1/2. Builds on LLD-01 §4–5 (taxonomy, filter URLs) and
LLD-02 C-2 (filters work on cards already in the page). Implemented by `tk-data` (`lib/catalog.ts`,
`lib/filters.ts`, validation) and `tk-frontend` (`FilterBar`, listing pages).

## 1. The six "disappearing product" cases → how each is handled

| #   | Case (CX-4)                        | Mechanism in this design                                                                                                                           |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Several occasions matched with AND | Within a group, values combine with **any-of** (§3)                                                                                                |
| 2   | Type + occasion combined           | Across groups **both** must match; the result line says it ("Jewellery for Diwali — 6 pieces"); chip counts show what each extra choice would give |
| 3   | Missing or wrong tags              | Build **fails** on a missing type or an unknown tag; a tag audit **warns** about weak tagging (§6)                                                 |
| 4   | Everyday pieces with no occasion   | `occasion:any` items appear under every occasion, in their own group (F-1); untagged items are flagged by the audit                                |
| 5   | Status rules                       | Sold-out stays visible, labelled, sorted last (D-50); only `hidden` is excluded                                                                    |
| 6   | Added but not yet published        | Publish step shows "last published" time and product count (LLD-07); a build ID is stamped on every page                                           |

## 2. Product index (build time)

`lib/catalog.ts` reads `products.json`, validates it, and produces one `ProductSummary` per product:

| Field                   | From                                             | Notes                                                                                 |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `slug`, `name`, `image` | product                                          |                                                                                       |
| `price`, `payable`      | product + `discountPercent` via `lib/pricing.ts` | `payable` (₹, integer) is used for price sorting; coupons never affect listing prices |
| `types[]`               | `type:<slug>` tags                               | ≥ 1 required; first one = **primary type**                                            |
| `occasions[]`           | `occasion:<slug>` tags                           | `occasion:any` sets `anyOccasion: true` instead                                       |
| `materials[]`           | `material:<slug>` tags                           | Used only by collection pages (D-58), never a filter                                  |
| `status`                | product                                          | `available` · `made_to_order` · `sold_out` · `hidden`                                 |
| `featured`              | position in `products.json`                      | Owner reorders the file to feature pieces (F-3)                                       |
| `addedOn`               | optional `addedOn` date                          | Enables "Newest" sort (F-3)                                                           |

Visible set **V** = every product whose status isn't `hidden`.

## 3. Matching, counts, sorting

**Match** (T = selected types, O = selected occasions):

```
matchType(p)     = T is empty  OR  p.types ∩ T ≠ ∅
matchOccasion(p) = O is empty  OR  p.occasions ∩ O ≠ ∅  OR  p.anyOccasion
result           = { p ∈ V : matchType(p) AND matchOccasion(p) }
```

**Grouping (F-1):** when O isn't empty, results show the occasion-tagged pieces first, then a
heading "Also good for Diwali" with the `occasion:any` pieces.

**Chip counts** (standard "what would I get if I tapped this" counting):

```
count(type t)     = |{ p ∈ V : t ∈ p.types        AND matchOccasion(p) }|
count(occasion o) = |{ p ∈ V : (o ∈ p.occasions OR p.anyOccasion) AND matchType(p) }|
```

A chip whose count is 0 stays visible but dimmed and can't be selected; tapping it explains why
("No car decor for Navratri yet — try a custom order") (F-2).

**Sorting:** `featured` (default) · `price-asc` · `price-desc` · `new` (newest `addedOn` first;
option hidden if no product has a date). Ties fall back to featured order. In **every** sort,
sold-out pieces come after available and made-to-order ones (D-50). Sorting is stable.

**Empty results** (only reachable through an edited or old URL, since zero-count chips can't be
picked): message + one button per active filter ("Remove Diwali — 14 pieces") + "Clear all" +
custom-order link. Never a blank page.

All of the above lives in `lib/filters.ts` as pure functions shared by the build (pre-sorted
pages, counts in the HTML) and the `FilterBar` island.

## 4. Page rendering and the island

1. Each listing page renders **every card in its scope** as HTML, in featured order, sold-out last:
   - `/shop/` → all of V; type page → V with that type; occasion page → occasion-tagged pieces, then
     the "Also good for…" group; combo page → both tags; collection page → its query.
2. Each card carries data attributes: `data-slug`, `data-types`, `data-occasions`, `data-any`,
   `data-status`, `data-payable`, `data-added`, `data-featured`.
3. **Without JavaScript** (and for crawlers), chips are plain links to the landing pages
   (`/shop/jewellery/`, `/occasions/diwali/`), so every product is reachable and crawlable.
4. **With JavaScript**, `FilterBar` (Preact, `client:idle`) reads the cards, applies the match by
   toggling the `hidden` attribute, and **re-orders the cards in the page** for sorting (not CSS
   order, so screen readers read them in the order shown). A polite live region announces "12 pieces".
5. **Scope:** the island filters only within the page's scope. A choice outside it navigates to the
   URL from LLD-01 §5 (e.g. adding Home decor on `/shop/jewellery/` goes to
   `/shop/?type=home-decor,jewellery`).
6. State ↔ URL uses `lib/urls.ts` (`shop(state)`, `parseShopQuery`); back/forward restore state.

Performance: ~100–150 cards, a few data attributes each; filtering is a simple loop — no network
requests, no product JSON download.

## 5. Landing page composition

| Page                                | Shows                                                                                         | Built when                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Type (`/shop/<type>/`)              | Intro, occasion chips, cards                                                                  | Type has ≥ 1 visible product                                                     |
| Occasion (`/occasions/<occasion>/`) | Campaign band if active, intro, type chips, occasion pieces, "Also good for…" group (up to 8) | Always (year-round, D-54 R-2)                                                    |
| Combo (`/occasions/<o>/<t>/`)       | Intro, cards                                                                                  | ≥ 3 products tagged with **both** explicitly; `occasion:any` doesn't count (F-6) |
| Collection (`/collections/<slug>/`) | Intro, cards; optional filter bar                                                             | Query returns ≥ 3 and an intro exists                                            |
| Home                                | 2–3 collection rows + featured pieces                                                         | Always                                                                           |

Near-duplicate check (LLD-01 §5) compares only the **primary** sets (explicitly tagged pieces).

## 6. Build validation and tag audit (task F-2)

**Build fails on:** missing `type:` tag · unknown type/occasion/material slug (not in
`taxonomy.mjs`) · duplicate slug · missing image file · combo `includes[]` pointing to an unknown
slug · a collection query with no match.

**Audit report (warnings, printed and saved with each build):**

- Products with no occasion tag and no `occasion:any` — "won't appear under any occasion filter"
- Occasions or types with fewer than 3 visible products
- Landing pages overlapping more than 80%
- Products marked `hidden` (so a hidden piece is never a surprise)
- Products whose primary type page would be their only listing

`tk-content` and `tk-seo` read this report when tagging; the lead adds anything needing the owner
to `OWNER-INPUTS.md`.

## 7. Learning from dead ends (F-5)

When a shopper reaches an empty result (old link) or taps a dimmed chip, the island sends one
anonymous event (`filter_dead_end` with the filter combination, no personal data) to the Log tab.
The monthly review turns frequent dead ends into tagging fixes or new product ideas.

## 8. Tests

- **Unit (Vitest, `lib/filters.ts`)** on a fixture catalog containing: a product tagged Diwali +
  Navratri; an `occasion:any` product; a sold-out product; a hidden product; a product with no
  occasion; two types × two occasions. Asserts every CX-4 case, counts, sort order with sold-out
  last, empty-state suggestions, and URL round-trips.
- **Build tests:** each "fails on" rule in §6 makes the build fail with a readable message.
- **Playwright (preview, 360/412 px):** listings readable with JavaScript off; chips, counts,
  dimmed chips, back/forward, scope navigation, live-region announcement, keyboard use.

## 9. Decisions needed from the owner

| ID  | Decision                                                                                                                                   | Recommendation                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| F-1 | "Good for any occasion" pieces appear under every occasion, but in a separate "Also good for Diwali" group after the occasion's own pieces | **Yes** — nothing hidden, and festival pages still feel festive         |
| F-2 | A filter choice that would give 0 results stays visible but dimmed and unselectable, with a short reason on tap                            | **Yes** — stops dead ends without hiding options                        |
| F-3 | "Featured" order = the order of products in the product file (reorder to feature); an optional `addedOn` date enables a "Newest" sort      | **Yes** — no new required field                                         |
| F-4 | Build fails on a missing type or unknown tag; only warns about products without any occasion tag                                           | **Yes** — hard errors only for things that would hide or break products |
| F-5 | Log anonymous "dead end" filter events to learn tagging gaps                                                                               | **Yes** — no personal data, tiny volume                                 |
| F-6 | Combo pages count only products explicitly tagged with both the occasion and the type toward the "≥ 3 products" rule                       | **Yes** — keeps combo pages genuinely about that occasion               |
