# LLD-01 — Routes, URL scheme and indexing rules

Version 0.1 · 11 Oct 2026 · Status: **approved** (owner, 11 Oct) — R-1…R-7 accepted; R-4 materials = crochet, macramé, pipe cleaner (D-58)
Supersedes the route list in `../ARCHITECTURE.md` §4.

Requirements covered: CAT-2/2a/2b, CAT-3, CMP-2, REQ-1/3, PST-1/2, OPS-2, SEO-1…6, SEO-10,
NFR-3, CX-4. Implemented by: `tk-data` (URL builders, registry, redirects), `tk-frontend`
(pages), reviewed by `tk-seo` and `tk-architect`, tested by `tk-qa`.

## 1. Facts checked (11 Oct 2026)

| Fact                                                                                                                                 | Source                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| v1 canonical URLs end with a slash: `https://tantukala.embox.in/about/`                                                              | built HTML in the local `dist/` (from an earlier build)                                                                         |
| Astro builds `build.format: 'directory'` (`/about/index.html`)                                                                       | `astro.config.mjs`                                                                                                              |
| Cloudflare default `html_handling: auto-trailing-slash`: `/about` redirects to `/about/`                                             | [Cloudflare HTML handling docs](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)        |
| `_headers` and `_redirects` are supported natively by Workers static assets                                                          | [Pages → Workers migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) |
| v1 already ships `public/_headers` with a CSP, HSTS, frame and referrer rules                                                        | repo file                                                                                                                       |
| v1 sitemap: `/`, `/about/`, `/cart/`, `/contact/`, `/shipping-returns/` + 26 `/products/<slug>/`                                     | local `dist/sitemap-0.xml`                                                                                                      |
| v1 Apps Script reads `/pricing.json` to re-check totals                                                                              | `apps-script/Code.gs` (`fetchPricing_`)                                                                                         |
| v1 first-touch tracking reads `utm_source`, `utm_medium`, `utm_campaign`, external referrer host, landing path into `sessionStorage` | `src/scripts/site.ts`                                                                                                           |
| 404 page served for unknown routes (`not_found_handling: 404-page`)                                                                  | `wrangler.jsonc`                                                                                                                |

**Not verified:** the live sitemap could not be fetched today (request timed out). This working
copy has the 26 rakhi products; Navratri and macramé items added since then must be read from the
live sitemap when the URL registry is seeded (task RT-1). Also unverified: whether a `_redirects`
rule takes priority over the trailing-slash redirect — test with `wrangler dev` in RT-1.

## 2. URL principles

1. **One canonical form:** `https://tantukala.embox.in/<lowercase-hyphenated-path>/` — always a
   trailing slash, as v1 already publishes.
2. **Stable forever:** a published URL never disappears. It stays live or gets a 301 redirect.
3. **No dates in evergreen URLs:** `/occasions/diwali/`, never `/diwali-2026/`.
4. **One URL per product:** `/products/<slug>/`, never nested under a type or occasion (a product
   in three categories would otherwise have three duplicate URLs).
5. **Query strings only for shopper state** (filters, sort) and transactional references — never
   for content that should rank.
6. **Never personal data in a URL** — no phone, name, email or address (NFR-3). An order reference
   may appear only on `noindex` transactional pages.
7. **No hand-written URLs in code.** Every link comes from `src/lib/urls.ts` builders (§7); CI greps
   for hard-coded internal paths.

## 3. Route table

### 3.1 Storefront pages (indexable, in the sitemap)

| Path                                         | Page                                                                                                  | Notes                                                           | Release                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------- |
| `/`                                          | Home                                                                                                  |                                                                 | R1                     |
| `/shop/`                                     | All products + filters                                                                                | Query variants share the canonical `/shop/` (§5)                | R1                     |
| `/shop/<type>/`                              | Type landing (e.g. `/shop/jewellery/`)                                                                | Pre-built subset + unique intro                                 | R1                     |
| `/occasions/`                                | Occasion index                                                                                        |                                                                 | R1                     |
| `/occasions/<occasion>/`                     | Occasion landing, **year-round**; becomes the festival campaign page while a campaign is active (R-2) | Replaces `/festivals/<id>`                                      | R1 (campaign layer R4) |
| `/occasions/<occasion>/<type>/`              | Combo landing (e.g. `/occasions/diwali/jewellery/`)                                                   | Built only with ≥ 3 products (R-3)                              | R1                     |
| `/products/<slug>/`                          | Product                                                                                               | Sold-out pages stay live; `hidden` products are not built (R-5) | R1                     |
| `/collections/<slug>/`                       | Collection (tag query)                                                                                | Built only with an intro and ≥ 3 products                       | R1                     |
| `/custom-order/`                             | Custom order request                                                                                  |                                                                 | R3                     |
| `/bulk-order/`                               | Corporate and bulk gifting request                                                                    | Targets gifting searches                                        | R3                     |
| `/guides/`, `/guides/<slug>/`                | Evergreen guides                                                                                      |                                                                 | R4                     |
| `/about/`, `/contact/`, `/shipping-returns/` | Kept from v1                                                                                          |                                                                 | R1–R2                  |
| `/privacy/`, `/terms/`                       | Policies                                                                                              |                                                                 | R2                     |

### 3.2 Transactional pages (`noindex`, never in the sitemap)

| Path                                        | Page                                                                  | Notes                                            | Release                  |
| ------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ | ------------------------ |
| `/cart/`                                    | Cart → checkout → order placed → pay, as **states of one page** (R-6) | v1 listed `/cart/` in its sitemap; v2 removes it | R1 restyle, R2 new logic |
| `/pay/?ref=<orderRef>`                      | Pay a recorded order (owner-sent payment links)                       | Shows amount only for unpaid orders              | R3                       |
| `/order-status/` (optional `?ref=` prefill) | Status lookup: ref **and** phone required                             | Phone is never in the URL                        | R3                       |
| `/reviews/new/?ref=<orderRef>`              | Review form for a delivered order                                     |                                                  | R4                       |

Transactional pages load no third-party scripts (not even the analytics beacon), so order
references never leave our own host. `Referrer-Policy: strict-origin-when-cross-origin` (already in
v1 `_headers`) stops the full URL leaking to other sites.

### 3.3 Machine endpoints and files

| Path                                                      | Purpose                      | Rule                                                                   |
| --------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| `/pricing.json`                                           | Apps Script re-checks totals | **Path frozen** — Apps Script depends on it                            |
| `/robots.txt`, `/sitemap-index.xml`, `/sitemap-*.xml`     | Crawling                     | Generated                                                              |
| `/feeds/meta-catalog.csv`, `/feeds/google-merchant.<ext>` | Product feeds (RCH-1/2)      | Exact Google format to verify in L7-2                                  |
| `/images/products/…`, `/og/…`, icons, `site.webmanifest`  | Assets                       | Image URLs stay stable — old WhatsApp/Instagram previews point at them |
| `public/_headers`, `public/_redirects`                    | Cloudflare config, not pages | `_redirects` generated at build (§6)                                   |

### 3.4 Reserved prefixes

`/hi/`, `/mr/` and other language codes (SEO-10, only when demand is proven) · `/api/` (future
tier-1 Workers) · `/admin` is never part of the static site.

## 4. Taxonomy slugs

Slugs come from one config file (`src/config/taxonomy.mjs`), keyed by the product tags
(`type:<slug>`, `occasion:<slug>`). Once published, a slug is frozen; renaming needs a redirect.

| Facet    | Starting slugs (labels in brackets)                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Type     | `rakhis` (Rakhis), `jewellery` (Jewellery — R-1), `home-decor`, `car-decor`, `office-decor`, `gifts-combos` (Gifts & combos) |
| Occasion | `raksha-bandhan`, `ganesh-chaturthi`, `navratri`, `diwali`                                                                   |

- `occasion:any` ("good for any occasion", CAT-2b) is a tag, **not a page**.
- Material (crochet, macramé, pipe cleaner) stays **not a filter**, per the earlier catalog
  decision. Material searches like "macramé wall hanging" are served by collection pages such as
  `/collections/macrame/` (R-4).
- Each product's **primary type** is its first `type:` tag; it decides the breadcrumb and where a
  discontinued product redirects.
- Slug rules: `a-z`, `0-9`, hyphens; ≤ 60 characters; unique; none of the reserved prefixes.

## 5. Filter URLs (contract; algorithm in LLD-03)

Filter state = selected types, selected occasions, sort. The URL is derived from state by one
function, so every share button, back button and refresh agrees:

1. **If the state matches a pre-built page, use its clean URL:** one type → `/shop/jewellery/`;
   one occasion → `/occasions/diwali/`; one of each with a built combo →
   `/occasions/diwali/jewellery/`.
2. **Otherwise** `/shop/?type=a,b&occasion=c&sort=price-asc` — values lowercase, de-duplicated,
   sorted alphabetically; default sort (`featured`) omitted. Sort values: `featured`,
   `price-asc`, `price-desc`, `new`. Sold-out items are always sorted last within any sort (Q-20).
3. **Moving between pages:** if the target is `/shop/?…` and we're already on `/shop/`, the
   filter applies in place and the URL updates without a reload; otherwise the browser navigates
   to the target page (static, cached, prefetched).
4. **Unknown or invalid values** are ignored and the page says "Some filters weren't recognised";
   it never shows an empty error page.
5. **Back/forward** restore the exact filter state.

Indexing: landing pages are the pages meant to rank. `/shop/` is static, so all its query variants
carry the same canonical `/shop/`; Google consolidates them there. Trade-off accepted: a static page
can't vary its canonical per query string, and that's fine because every combination worth ranking
has its own pre-built page.

**Near-duplicate check (SEO lint):** if two landing pages show more than 80% of the same products
(likely `/shop/rakhis/` vs `/occasions/raksha-bandhan/`), the build warns. Fix with different
content (R-7) or a canonical from one to the other.

**Pagination:** none — at ~100 products every listing renders in full. Revisit above ~150 per listing.

## 6. v1 compatibility and redirects

- **Kept exactly:** `/`, `/about/`, `/contact/`, `/shipping-returns/`, `/cart/` (now `noindex`),
  every `/products/<slug>/`, `/pricing.json`, image and OG URLs.
- **URL registry** (`src/data/url-registry.json`): every URL ever published, seeded from the live
  v1 sitemap and appended after each release. **Build check:** each registry URL must be built or
  have a redirect; otherwise the build fails. This makes "a link shared on Instagram stopped
  working" impossible to ship by accident.
- **Redirect source** (`src/config/redirects.mjs`) → generated `public/_redirects` at build. Product
  renames and discontinued/hidden products (→ primary type page, 301) are added there.
- **Tracking parameters** (`utm_*`, Instagram's `igsh`, `fbclid`) are allowed on any URL, ignored
  for canonicals, and captured once by the first-touch script (v1 behaviour kept; `utm_content`
  added).

## 7. URL builders (`src/lib/urls.ts`, pure TypeScript, unit-tested)

`home()`, `shop(state?)`, `typePage(type)`, `occasionPage(occasion)`, `comboPage(occasion, type)`,
`product(slug)`, `collection(slug)`, `guide(slug)`, `cart()`, `pay(ref)`, `orderStatus(ref?)`,
`newReview(ref)`, `absolute(path)` (adds `SITE.url`), plus `parseShopQuery(search)` →
state. Builders know which combo pages exist (from the build-time product index), so rule 5.1
never links to a page that wasn't built. These builders also make the later move to Workers
(`/api/…`) a change in one file.

## 8. Acceptance tests (QA)

1. Every registry URL returns 200 or a 301 to a live page (preview deploy).
2. Every indexable page is in the sitemap; no `noindex` page is.
3. `shop(parseShopQuery(x))` round-trips: same state, normalised URL (order, case, duplicates).
4. State → URL picks the clean landing URL whenever one exists; never a combo page that wasn't built.
5. `/about` redirects to `/about/` on the preview; unknown paths return the 404 page.
6. Unknown filter values show the notice, never an empty page.
7. No internal link in `src/` is written by hand (CI grep).
8. Transactional pages: `noindex`, no third-party scripts, no personal data in any URL.

## 9. Decisions needed from the owner

| ID  | Decision                                                                                                                                                                                                                                          | Recommendation                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1 | Spelling for the type slug and label: `jewellery` (Indian/British) or `jewelry`                                                                                                                                                                   | **`jewellery`** — how Indian customers usually write and search it. Frozen once published                                                                                        |
| R-2 | Festival pages live permanently at `/occasions/<slug>/`; off-season they show related everyday pieces and the next festival date instead of disappearing                                                                                          | **Yes** — keeps search ranking built up year to year                                                                                                                             |
| R-3 | Combo pages occasion-first (`/occasions/diwali/jewellery/`), built only with ≥ 3 products                                                                                                                                                         | **Yes** — matches festival-first search intent; avoids thin pages                                                                                                                |
| R-4 | Material served by collection pages (`/collections/macrame/`), not a filter                                                                                                                                                                       | **Yes** — keeps the earlier "material isn't a facet" decision while still catching material searches. Which materials get a page: macramé only, or crochet and pipe cleaner too? |
| R-5 | Sold-out pages stay live; discontinued or hidden products 301 to their primary type page                                                                                                                                                          | **Yes**                                                                                                                                                                          |
| R-6 | `/cart/` stays the single checkout URL (states inside one page), removed from the sitemap                                                                                                                                                         | **Yes** — keeps v1 links and the order flow intact                                                                                                                               |
| R-7 | `/shop/rakhis/` and `/occasions/raksha-bandhan/` overlap almost fully. Keep both with different content (type page = all rakhis; occasion page = rakhis + gifts for siblings + delivery cutoff), or make the occasion page the only Rakhi landing | **Keep both, different content**, with the near-duplicate check guarding it                                                                                                      |
