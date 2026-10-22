# Tantu Kala v2 — Backlog

Version 0.4 · 21 Oct 2026 · Status: **draft**

Changelog: 0.4 — added "Brand & packaging" (PK-1 sticker, BR-2 tagline; D-73…D-78). 0.3 — S-2/S-3 done by the owner by hand (`claude-code/INSTALL.md`); S-8 is now the
per-role smoke test; paths updated for the docs restructure. 0.2 — work grouped into **phase releases** (each one is a working, shippable site);
added guardrail setup (S-6); S-0 narrowed to Customers tab + dashboard on Suhas's existing log.

Statuses: `Blocked` · `Ready` · `In progress (<branch>)` · `In review (#PR)` · `Done`.
Only the lead edits this file. Timelines are deliberately not estimated yet: agents speed up
coding, but decisions, content, photos, the owner's reviews and real-phone testing don't speed up.

## Phase 0 — setup (owner + lead)

| ID   | Task                                                                                                                                                                                                                                           | Owner                                      | Depends on                           | Status                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| S-1a | Tag `v1.0.0` + Release                                                                                                                                                                                                                         | Owner                                      | —                                    | **Done**                                                                                             |
| S-1b | Tag ruleset `v*`; create `v2` branch; rulesets on `main` and `v2` (GIT-STRATEGY §1)                                                                                                                                                            | Owner                                      | S-1a                                 | In progress — tag + `main`/`v2` rulesets done, local `v2` created (owner, 13 Oct); push `v2` pending |
| S-2  | Commit `docs/design/`, `docs/v2/`, `docs/README.md` to `v2` (never `docs/learning/`) — steps in `claude-code/INSTALL.md` §2                                                                                                                    | Owner (by hand)                            | S-1b                                 | Blocked                                                                                              |
| S-3  | Install the agent kit on `v2`: `CLAUDE.md`, `.claude/{settings.json,agents,hooks,skills}`, `.github/{CODEOWNERS,pull_request_template.md}`, `.gitignore` lines — `claude-code/INSTALL.md` §3; owner reviews the permission model first (IN-19) | Owner (by hand)                            | S-2                                  | Blocked                                                                                              |
| S-4  | Confirm Cloudflare production deploys only from `main`; preview behaviour for other branches                                                                                                                                                   | Owner                                      | —                                    | Open                                                                                                 |
| S-6  | Test the hooks on the owner's Windows machine; enable "Require review from Code Owners"; add CI (`claude-code/ci.v2.yml`) once F-2/F-7 scripts exist                                                                                           | Owner + lead                               | S-3                                  | Blocked                                                                                              |
| S-7  | GitHub Projects board (columns, fields: Release, Role, Risk, Requirement IDs); repo-scoped token for agents; verify which token type can manage a user-owned project                                                                           | Owner + lead                               | S-1b                                 | Blocked                                                                                              |
| S-8  | Smoke-test every role: one dummy task per agent, confirm an in-scope edit works and an out-of-scope edit is blocked (`INSTALL.md` §5)                                                                                                          | Owner + lead                               | S-3                                  | Blocked                                                                                              |
| S-9  | Formatting phase 2 (`FORMATTING.md`): pin Prettier + Astro plugin, baseline format commit + `.git-blame-ignore-revs`, `.vscode` settings, PostToolUse format hook, CI check                                                                    | Lead (owner approves the dev dependencies) | S-3                                  | Blocked                                                                                              |
| CI-1 | PR CI workflow (`claude-code/ci.v2.yml` + format check + SEO lint + CodeQL default setup) as required checks in the `v2`/`main` rulesets                                                                                                       | Lead (owner approves)                      | S-3, F-7                             | Blocked                                                                                              |
| CI-2 | Cloudflare preview builds for non-production branches wired to the **test** Apps Script; decide on Cloudflare Access for previews (CI-Q1)                                                                                                      | Owner + lead                               | S-4                                  | Blocked                                                                                              |
| CI-3 | Playwright E2E + Lighthouse on preview URLs                                                                                                                                                                                                    | qa                                         | CI-2                                 | Blocked                                                                                              |
| CI-4 | Post-deploy smoke test incl. UPI payee check; rollback rehearsal                                                                                                                                                                               | qa + owner                                 | CI-1                                 | Blocked                                                                                              |
| CI-5 | Scheduled workflows: nightly production health, monthly maintenance issues from `OPERATIONS.md`                                                                                                                                                | lead                                       | CI-1                                 | Blocked                                                                                              |
| BR-1 | `BRAND-VOICE.md` drafted by `tk-brand` from the design system + owner input; owner approves                                                                                                                                                    | brand + owner                              | S-8                                  | Blocked                                                                                              |
| DZ-1 | **Design audit:** `tk-design` reviews the full design plan (system + all mockups + design-change list) against UI/UX standards and the requirements; findings to owner before R1 build                                                         | design                                     | S-8                                  | Blocked                                                                                              |
| S-0  | **Diwali tracking add-ons to the existing order log:** Customers tab (auto from orders), dashboard for the ₹1 lakh goal. No site change                                                                                                        | integration                                | owner shares the log's column layout | Proposed                                                                                             |

## Brand & packaging (outside the site releases)

| ID   | Task                                                                                                                       | Owner                         | Depends on         | Status                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------ | -------------------------- |
| PK-1 | Pack sticker for clear packs (round seal A; header tag B if pegs, IN-24); website-QR variant for review; vector logo draft | design + brand                | D-79…D-83          | In progress (print PDFs; A approved, caps) |
| BR-2 | New tagline for site + packs (no material, no location): options → brand + SEO review → owner picks (IN-23); then `site.mjs` | content + brand + seo, data | IN-27 (site only)  | Packs: done (D-79). Site: waits for IN-27 |

## Release R1 → `v2.0.0`: new brand + catalog (checkout logic unchanged from v1)

| ID    | Task                                                                                                                                                                                                                                  | Req                              | Owner                   | Depends on  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------- | ----------- |
| F-1   | Shared types (Product v2, Campaign, Collection, Cart, API shapes)                                                                                                                                                                     | ARCH §3/§6                       | data                    | S-3         |
| F-2   | Content validation (tags, includes, size class, minimal-product build)                                                                                                                                                                | NFR-6, CAT-1/4                   | data                    | F-1         |
| RT-1  | URL builders (`src/lib/urls.ts`), URL registry seeded from the **live** v1 sitemap, redirects generator → `_redirects`, build check; spike: `_redirects` vs trailing-slash precedence (`wrangler dev`)                                | LLD-01, SEO-2                    | data                    | F-1         |
| F-6S  | **Spike (blocks checkout):** prove the browser can read Apps Script replies; measure cold/warm latency and max request size; confirm `drive.file` scope covers the upload folder; confirm failed Cloudflare builds keep the live site | LLD-05 §1, LLD-06 B-6, LLD-07 §1 | architect + integration | S-3         |
| PB-1  | Build data pull (`site.export` + build token), settings validator shared with Apps Script, fixtures for local/CI, `/build.json`, post-build checks                                                                                    | LLD-07                           | data                    | F-1, F-6    |
| PB-2  | Publish menu: check, publish (deploy hook), live check, Publish log + restore                                                                                                                                                         | LLD-07                           | integration             | PB-1        |
| F-3   | Design tokens, self-hosted fonts, base layout                                                                                                                                                                                         | DESIGN-SYSTEM                    | frontend                | S-3         |
| F-4   | Shared Header + mobile menu + Footer                                                                                                                                                                                                  | PG-1                             | frontend                | F-3         |
| F-7   | Test harness + CI scripts (scope, deps, PII checks)                                                                                                                                                                                   | NFR, GUARDRAILS                  | qa                      | S-3         |
| L1-1  | Catalog + Type/Occasion filters                                                                                                                                                                                                       | CAT-2                            | frontend                | F-1, F-4    |
| L1-2  | Product page (gallery, tags, tweak vs custom, notify-me)                                                                                                                                                                              | CAT-3/6/7                        | frontend                | F-1, F-4    |
| L1-4  | Collections                                                                                                                                                                                                                           | CAT-8                            | data + frontend         | F-2         |
| L7-1  | OG previews, sitemap, structured data, UTM capture                                                                                                                                                                                    | RCH-3/4, NFR-7, SEO-4            | frontend                | F-4         |
| SEO-A | Search-intent map → landing-page list, titles/descriptions plan                                                                                                                                                                       | SEO-1/3                          | seo + content           | Q-21, Q-23  |
| SEO-B | Type/Occasion landing pages + filter canonical/noindex rules                                                                                                                                                                          | SEO-1/2                          | frontend                | L1-1, SEO-A |
| SEO-C | SEO lint script + Lighthouse SEO in CI                                                                                                                                                                                                | SEO-8                            | qa + seo                | F-7         |
| L8-1  | Home, About (crochet + macramé + pipe cleaner), Contact, 404                                                                                                                                                                          | PG-1                             | frontend                | F-4         |
| C-1   | Tag existing + new products (Type, Occasion, pieces, size class)                                                                                                                                                                      | CAT-1                            | owner + data            | F-2         |

## Release R2 → `v2.1.0`: new checkout

| ID   | Task                                                                          | Req          | Owner                  | Depends on |
| ---- | ----------------------------------------------------------------------------- | ------------ | ---------------------- | ---------- |
| F-5  | Pricing engine + shared fixture (₹89 shipping, threshold, tiers, codes, wrap) | CHK-1…4      | data                   | F-1, Q-18  |
| F-6  | Apps Script router, Sheet schema, idempotency, LockService, Log tab           | ARCH §5–6    | integration            | F-1        |
| L3-1 | Cart + order summary + coupons + gift options + T&C line                      | CHK-1…6, 11  | frontend               | F-5        |
| L3-2 | `order.create` with total re-check; OrderItems; Customers                     | CHK-1, OPS-6 | integration            | F-5, F-6   |
| L3-3 | Order-placed screen + UPI pay + client error log                              | CHK-7/8      | frontend               | L3-1, L3-2 |
| L3-4 | Over-limit cart → quote request                                               | CHK-10       | frontend + integration | L3-1, L4-2 |
| L8-2 | Shipping & Returns, Privacy, Terms pages                                      | PG-1/2, Q-19 | frontend               | owner text |

## Release R3 → `v2.2.0`: requests + owner operations

| ID   | Task                                                        | Req          | Owner                  | Depends on |
| ---- | ----------------------------------------------------------- | ------------ | ---------------------- | ---------- |
| L4-1 | Custom-order form + photo compression + Drive upload        | REQ-1/2/4    | frontend + integration | F-6        |
| L4-2 | Bulk/corporate request (MOQ, quote, 10-day validity)        | REQ-3        | frontend + integration | L4-1       |
| L6-1 | Log off-site order (menu) + payment-link generator + `/pay` | OPS-1/2      | integration + frontend | F-5, F-6   |
| L5-1 | Order-status page (Speed Post consignment + tracking link)  | PST-1, OPS-8 | frontend + integration | F-6        |
| L6-2 | Receipt and label PDFs (no GST fields)                      | OPS-4/5      | integration            | F-6        |
| L6-3 | Dashboard (full METRICS spec)                               | OPS-7        | integration            | L3-2, L6-1 |

## Release R4 → `v2.3.0`: growth

| ID    | Task                                                                                                                                                   | Req         | Owner                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------- |
| L2-1  | Campaign config + festival page + countdown + cart warning                                                                                             | CMP-1…3     | frontend + data        |
| L2-2  | Capacity remaining                                                                                                                                     | CMP-4       | integration            |
| L1-3  | Combos + personalisation                                                                                                                               | CAT-4/5     | frontend + data        |
| L5-2  | Reviews + customer photos                                                                                                                              | PST-2       | frontend + integration |
| L7-2  | Meta / Google product feed (Google free listings now Should)                                                                                           | RCH-1/2     | data                   |
| SEO-D | Evergreen guides (3–5) + festival page refresh                                                                                                         | SEO-6       | content + seo          |
| SEO-E | Launch: Search Console + Bing Webmaster Tools, sitemap submit; first monthly search test matrix                                                        | SEO-7/9     | owner + seo            |
| SEO-F | AI crawlers: owner checks Cloudflare AI Crawl Control on the `embox.in` zone; robots.txt groups per AI-1; "Good to know" blocks; AI referral reporting | SEO-11/12   | owner + seo + frontend |
| PST-3 | Loyalty tier-1 flag + reward codes                                                                                                                     | PST-3, Q-10 | integration            |
| PG-3  | Playful "Keep" items                                                                                                                                   | PG-3        | frontend               |

Each release: QA acceptance pass → owner UAT on a real phone → PR `v2` → `main` → tag.

## Active worktrees

| Task | Path | Branch | Agent |
| ---- | ---- | ------ | ----- |
| —    | —    | —      | —     |

## Status log

- 12 Oct 2026 — Docs restructured (D-67); permission model drafted (IN-19); install guide added.
- 6 Oct 2026 — Backlog drafted. v1 tag + Release done. Answers to Q-2, Q-8, Q-9, Q-11…Q-16 folded in. Restructured into releases R1–R4.
