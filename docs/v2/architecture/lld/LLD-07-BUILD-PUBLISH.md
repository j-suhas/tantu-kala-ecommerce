# LLD-07 — Build and publish

Version 0.1 · 12 Oct 2026 · Status: **approved** (owner, 13 Oct — P-1…P-5 accepted, D-68)

How owner-managed values (Sheet "Settings"), approved reviews and the repo's products/content
become the live static site. Covers D-24 (settings pulled from the Sheet at build time; products stay
in JSON), C-6 (reviews at publish), CX-4 case 6 (product added but not yet live), NFR-6, `CI-CD.md`.
Implemented by `tk-data` (build scripts, validation), `tk-apps-script` (export + Publish menu).

## 1. Facts checked (12 Oct 2026)

| Fact                                                                                                                                                                                                                                               | Source                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workers Builds supports **deploy hooks**: a secret URL, one per branch; a POST starts a build; no auth header (the URL is the secret); duplicate presses while a build is pending don't create a second build; rate limit 10 builds/min per Worker | [Cloudflare deploy hooks docs](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/), [changelog](https://developers.cloudflare.com/changelog/post/2026-04-01-deploy-hooks/) |
| A failed build doesn't replace the live deployment (Workers Builds deploys only after a successful build)                                                                                                                                          | Cloudflare build behaviour — **confirm in task CI-2**                                                                                                                                        |
| Products live in `src/data/products.json`; images are pre-optimised and committed (`npm run optimize`)                                                                                                                                             | repo (v1)                                                                                                                                                                                    |

## 2. Two kinds of change, two paths

| Change                                                                                                   | Path                                                                 | Who                  | Reaches the live site                       |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------- | ------------------------------------------- |
| Code, products, images, page text                                                                        | Git: task branch → PR → `v2`/`main` → Cloudflare build               | Agents + owner merge | On merge to `main`                          |
| Settings (thresholds, fees, offers, size limits, courier templates, campaign dates) and approved reviews | Sheet → **Publish** menu → deploy hook → Cloudflare build pulls them | Owner only           | ~2–4 minutes after Publish (to be measured) |

Products stay in Git (D-24) so every product change is reviewed, versioned and covered by the
"add a product = one JSON entry + images" rule.

## 3. Build pipeline (`npm run build`)

```
1 pull       scripts/pull-site-data.mjs  → POST site.export to Apps Script (build token)
                                           → src/data/generated/{settings,reviews}.json (git-ignored)
2 validate   products + taxonomy (LLD-03 §6) · settings schema (§4) · URL registry (RT-1) · env check
3 astro build → dist/: pages · /pricing.json · /build.json · feeds · sitemap · _redirects · _headers
4 post-check SEO lint · island size budgets · "production never points at test API" · no personal data in dist
```

- **Any failure stops the build**; the current live site keeps serving (to confirm in CI-2).
- **Local development and CI tests** never call Apps Script: they use committed sample data
  (`src/data/fixtures/site-data.sample.json`) so agents never need real data or credentials.
- `/build.json` = `{ buildId, builtAt, gitSha, settingsVersion, productCount }`. The build ID is
  also stamped on every page and sent with every API call (LLD-05), so the server can detect stale
  pages (`PRICE_CHANGED`).

## 4. Settings: schema and validation (shared code)

One validator (`src/lib/settings-schema.ts`, pure TS) is used **both** by the build and by Apps
Script (bundled, D-29), so the owner sees errors in the Sheet before anything is published.

| Key                                       | Rule                                                                                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `shipping.standard`                       | integer ₹, 0–500 (decided ₹89)                                                                                                   |
| `shipping.freeAbove`                      | integer ₹, 0–10,000 (IN-06)                                                                                                      |
| `giftWrap.fee`                            | integer ₹, 0–500 (IN-07)                                                                                                         |
| `giftMessage.maxLength`                   | 500 (D-10)                                                                                                                       |
| `cart.bulkPitchQty`, `cart.quoteAboveQty` | integers, pitch < quote (IN-08)                                                                                                  |
| `offers.auto[]`                           | `{ minGoods, percentOff 1–50, label }`, sorted, no overlaps                                                                      |
| `offers.codes[]`                          | `{ code A–Z0–9 4–16, percentOff? \| freeDelivery?, minGoods?, validFrom?, validUntil? }` — exactly one benefit each; dates valid |
| `couriers[]`                              | `{ name, trackingUrlTemplate containing {number} \| trackingPageUrl }` (OPS-8)                                                   |
| `campaigns[]`                             | `{ id, occasion (known slug), start ≤ cutoff ≤ end, capacityUnits?, revenueTarget? }`                                            |
| `upi.vpa`, `upi.payeeName`                | **not in the Sheet** — kept in repo config under CODEOWNERS (T3)                                                                 |

The UPI ID deliberately stays out of the Sheet: changing where money goes must go through a
reviewed code change, never a spreadsheet edit.

## 5. Publish (owner, from the Sheet menu)

1. **Publish → Check:** runs the validator on Settings and approved Reviews; shows errors in a
   sidebar ("Free-delivery threshold must be a whole number").
2. **Publish → Publish now:** saves a snapshot row in a **Publish log** tab (time, version, JSON
   snapshot), then POSTs the production deploy hook (URL stored in Script Properties). The test
   Sheet's menu posts the **preview** branch hook instead, so settings can be tried on the preview
   site first.
3. **Live check:** about 3 minutes later the script fetches the site's `/build.json`; when
   `settingsVersion` matches, the Publish log row shows "Live ✓"; otherwise "Still building / failed —
   check Cloudflare" and an email to the owner.
4. **Undo:** "Publish → Restore a previous version" copies a snapshot back into Settings and publishes.

The site footer and the dashboard show "Last published: <time>" — the answer to "I added it, why
isn't it on the site?" (CX-4 case 6).

## 6. Security

- **Deploy hook URLs are secrets:** stored only in Script Properties (and Cloudflare); never in the
  repo, chat or docs. If one leaks, delete and recreate it in the Cloudflare dashboard. Worst case of
  a leak is extra rebuilds of the same code (rate-limited by Cloudflare), not a content change.
- **Build token:** `site.export` requires a token known to Cloudflare's build variables and Script
  Properties, so the export can't be used to hammer the Sheet. It returns only public data
  (settings, approved reviews with display names).
- **No personal data** ever enters the build: reviews carry a display name the reviewer chose, not
  phone or address; the post-check scans `dist/` for phone-number and email patterns.
- **Prices for checkout** always come from the **live site's** `/pricing.json`, never from unpublished
  Sheet edits, so customers always pay what they saw.

## 7. Tests

- Settings validator: valid sample passes; each rule in §4 has a failing case with a readable message.
- Build: missing/invalid generated data fails the build; fixture mode builds without network.
- Publish: Apps Script unit tests with a fake hook (called once, snapshot written, live check states).
- Release smoke (CI-4): `/build.json` matches the commit and settings version just published.

## 8. Decisions (approved 13 Oct, D-68)

| ID  | Decision                                                                                                                    | Recommendation                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| P-1 | Settings and approved reviews reach the site through a **Publish** button in the Sheet, which triggers a Cloudflare rebuild | **Yes** — no Git needed for everyday business values     |
| P-2 | Products, photos and page text keep going through Git and review (not the Sheet)                                            | **Yes** — keeps the product contract and history         |
| P-3 | The UPI ID never lives in the Sheet; changing it needs a reviewed code change                                               | **Yes** — protects where the money goes                  |
| P-4 | Test Sheet publishes to the preview site first; production Sheet to the live site                                           | **Yes** — try a new offer safely before customers see it |
| P-5 | Every publish keeps a snapshot so you can restore the previous settings in one click                                        | **Yes**                                                  |
