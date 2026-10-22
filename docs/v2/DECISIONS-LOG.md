# Tantu Kala v2 — Decisions & Inputs Log

**Purpose:** a running, fact-only record of what Suhas has actually said/decided during the
v2 planning conversations (post-Rakhi-2026), for both of us to refer back to. This is not a
place for Claude's own suggestions or unconfirmed ideas — those stay in chat until Suhas
confirms them, at which point they get logged here. Anything marked **OPEN** is a known gap,
not yet decided.

Companion doc: `docs/PRODUCT-EVOLUTION.md` (the earlier, pre-v2 "season wind-down" plan —
still relevant, being superseded/extended by this conversation).

## Decision register (index for agents — newest decisions win)

Agents: quote the full entry below (not this summary) in task briefs. Status: D = decided,
P = provisional (owner said "for now"/intuition-based).

| ID   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Status   | Date                   | Affects                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------- | ------------------------------------------------------------------ |
| D-01 | v2 on tier 0 (static + Apps Script + Sheets/Drive); tier-1 functions = future expansion                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | D        | 6 Oct                  | ADR-001, all                                                       |
| D-02 | v1 frozen as tag `v1.0.0` + Release; v2 on its own branch, same repo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | D        | 6 Oct                  | ADR-002                                                            |
| D-03 | Two-facet catalog: Type (≥1) × Occasion (0+, none = Everyday)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | D        | Sep                    | CAT-1/2                                                            |
| D-04 | Custom orders = request, no price/payment on site                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | D        | Sep                    | REQ-1                                                              |
| D-05 | Request photos → Google Drive via Apps Script                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | D        | 6 Oct                  | REQ-2, ADR-003                                                     |
| D-06 | Standard shipping ₹89 (incl. packaging); free above ~₹500–700                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | D/P      | 6 Oct                  | CHK-2                                                              |
| D-07 | Over size class/cart limit → bulk/corporate quote (MOQ, private rates), quote valid 10 days                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | D        | 6 Oct                  | CHK-10, REQ-3                                                      |
| D-08 | Full advance payment; non-refundable unless not yet made or T&C allows                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | D        | 6 Oct                  | CHK-11                                                             |
| D-09 | Discounts = auto order-value tiers + festival codes + loyalty codes; values later                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | D        | 6 Oct                  | CHK-3                                                              |
| D-10 | Gift message ≤ 500 chars; wrap fee ~₹30                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | D/P      | 6 Oct                  | CHK-4                                                              |
| D-11 | Not GST-registered; receipts, not GST invoices                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | D        | 6 Oct                  | OPS-4                                                              |
| D-12 | India Post Speed Post default courier                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | D        | 6 Oct                  | OPS-8                                                              |
| D-13 | Brand = art from threads: crochet, macramé, pipe cleaner                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | D        | 6 Oct                  | copy, tags                                                         |
| D-14 | Diwali goal ₹1 lakh pure product sales, 6 Oct–8 Nov, not a must                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | D        | 6 Oct                  | METRICS                                                            |
| D-15 | Built by parallel Claude Code agents; delivered in phase releases                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | D        | 6 Oct                  | workflow                                                           |
| D-16 | v2 doubles as lead-engineer training; notes in git-ignored `docs/learning/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | D        | 6 Oct                  | workflow                                                           |
| D-17 | No payment gateway in v2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | D        | 7 Oct                  | CHK-9                                                              |
| D-18 | Stamp-card loyalty deferred until must-haves ship                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | D        | 8 Oct                  | PST-3a                                                             |
| D-19 | Filter behaviour must handle all six "hidden product" cases (REQUIREMENTS CX-4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | D        | 8 Oct                  | CAT-2a/b                                                           |
| D-20 | Every task brief carries its context notes and quoted decisions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | D        | 8 Oct                  | AGENT-WORKFLOW                                                     |
| D-21 | High-level design accepted: 5-layer frontend, filters in URL, cart in localStorage, Apps Script as site backend re-checking totals via `/pricing.json` (v1 pattern kept)                                                                                                                                                                                                                                                                                                                                                                                           | D        | 9 Oct                  | SYSTEM-DESIGN                                                      |
| D-22 | Upgrade Astro/Tailwind during the redesign if a verification task shows it's manageable (H-2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | D        | 9 Oct                  | F-0 (new)                                                          |
| D-23 | Filters computed client-side over a build-time product index (H-3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | D        | 9 Oct                  | CAT-2                                                              |
| D-24 | Settings pulled from the Sheet at build time; products stay in JSON for now (H-4 / ADR-005)                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | D        | 9 Oct                  | ADR-005                                                            |
| D-25 | Separate test Sheet + test Apps Script deployment for development (H-5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | D        | 9 Oct                  | env setup                                                          |
| D-26 | WhatsApp fallback in the API client for any backend failure (H-6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | D        | 9 Oct                  | integration                                                        |
| —    | H-1 island approach (plain TS vs Preact vs React) — **open**, under discussion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        | 9 Oct                  | frontend                                                           |
| D-27 | L-1: Preact (TSX) for stateful islands, plain TS for tiny ones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | D        | 9 Oct                  | frontend                                                           |
| D-28 | L-2: Vitest + Playwright, dev-only (ADR-006 to write)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | D        | 9 Oct                  | testing                                                            |
| D-29 | L-3: Apps Script written in TS, bundling shared `pricing.ts` (pending build spike)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | D        | 9 Oct                  | backend                                                            |
| D-30 | L-4: backend replies must be readable; retire v1 `no-cors` fire-and-forget (pending spike)                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | D        | 9 Oct                  | integration                                                        |
| D-31 | L-5: tier 0 reconfirmed for v2; design for Workers + D1 later                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | D        | 9 Oct                  | ADR-001                                                            |
| D-32 | L-7: device support = Android first (stakeholders use varied Android phones), Chrome/Samsung Internet + Instagram/WhatsApp in-app browsers; iOS Safari supported                                                                                                                                                                                                                                                                                                                                                                                                   | D        | 9 Oct                  | NFR, QA                                                            |
| D-33 | L-6: security owner-checklist run after HLD + LLD; threats/controls in `SECURITY.md` used as LLD design inputs                                                                                                                                                                                                                                                                                                                                                                                                                                                     | D        | 9 Oct                  | SECURITY                                                           |
| D-34 | All accounts owned by Suhas, mostly personal (B7)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | D (fact) | 9 Oct                  | SECURITY, runbooks                                                 |
| D-35 | ~~Claude Pro plan; usage-window limits acceptable; quality over consumption → role agents on strongest model, high effort (B5)~~ — **superseded by D-72 (21 Oct)**                                                                                                                                                                                                                                                                                                                                                                                                 | D        | 9 Oct                  | agents                                                             |
| D-36 | GitHub Projects board maintained by agents; lead plans/assigns within owner-approved release scope; owner watches the board (A6)                                                                                                                                                                                                                                                                                                                                                                                                                                   | D        | 9 Oct                  | workflow                                                           |
| D-37 | Add design-expert agent (`tk-design`); Claude added architect, security, docs and content roles (proposed)                                                                                                                                                                                                                                                                                                                                                                                                                                                         | D / P    | 9 Oct                  | workflow                                                           |
| D-39 | One formatting standard for owner, agents and Cowork; phase 1 config active (`.editorconfig`, `.prettierrc.json`, `.prettierignore`); phase 2 tooling on `v2` pending owner OK for dev deps                                                                                                                                                                                                                                                                                                                                                                        | D / P    | 9 Oct                  | FORMATTING.md, S-9                                                 |
| D-40 | Business goal: appear on relevant searches; SEO and content managed deliberately and verified across many query types (SEO.md, SEO-1…9, `tk-seo` agent proposed)                                                                                                                                                                                                                                                                                                                                                                                                   | D        | 9 Oct                  | SEO                                                                |
| D-41 | Location (Q-21): handmade by the founder (Suhas's sister) in Delhi; delivery only, no shop of its own; store run from Pune. **Amended by owner 21 Oct:** may later supply a few relevant shops to increase sales (stockists); this does not change the online store. No Google Business Profile (online-only brand = ineligible; stockists don't change that — they are third-party shops)                                                                                                                                                                         | D (fact) | 10 Oct; amended 21 Oct | SEO, CX-11, IN-22                                                  |
| D-42 | Domain (Q-22): stay on `tantukala.embox.in`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | D        | 10 Oct                 | SEO                                                                |
| D-43 | Languages (Q-23): English first; regional languages welcome only as real visible pages when demand is shown (SEO-10)                                                                                                                                                                                                                                                                                                                                                                                                                                               | D        | 10 Oct                 | SEO                                                                |
| D-44 | Agents are hired for years of maintenance, not just v2: new roles must map to recurring work (`OPERATIONS.md`)                                                                                                                                                                                                                                                                                                                                                                                                                                                     | D        | 10 Oct                 | workflow                                                           |
| D-45 | Roster + `OPERATIONS.md` approved: `tk-brand` (text + image reviewer) separate from `tk-content` (writer, incl. page/block text on request) and `tk-seo`; maintenance calendar                                                                                                                                                                                                                                                                                                                                                                                     | D        | 10 Oct                 | workflow                                                           |
| D-46 | Q-24: Tantu Kala = sister's business; Suhas owns embox and lends domain + merchant UPI/bank account; payee name shown to customers is embox's (CX-10)                                                                                                                                                                                                                                                                                                                                                                                                              | D (fact) | 10 Oct                 | legal pages, checkout                                              |
| D-47 | `CI-CD.md` approved for now; agents improve it as work starts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | D        | 10 Oct                 | CI/CD                                                              |
| D-48 | `SEO.md` approved for now; agents improve it as work starts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | D        | 10 Oct                 | SEO                                                                |
| D-49 | Q-18: discounts never stack (revisit only if a real case appears)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | D        | 10 Oct                 | CHK-3                                                              |
| D-50 | Q-20: sold-out products stay visible in filters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | D        | 10 Oct                 | CAT-2a, CX-4                                                       |
| D-51 | Q-10: loyalty is the last requirement; v2 launches without it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | D        | 10 Oct                 | PST-3                                                              |
| D-52 | Q-19: T&C/policy text drafted by agents (content → brand), approved by Suhas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | D        | 10 Oct                 | PG-2                                                               |
| D-53 | **HLD closed**; next phase = LLD                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | D        | 10 Oct                 | all                                                                |
| D-54 | LLD-01 routes approved: R-1 `jewellery`; R-2 permanent `/occasions/<slug>/` festival pages; R-3 occasion-first combo pages (≥ 3 products); R-4 material via collection pages (which materials: pending); R-5 sold-out live, discontinued/hidden → 301 to primary type; R-6 `/cart/` single checkout URL, noindex; R-7 keep `/shop/rakhis/` and `/occasions/raksha-bandhan/` with different content                                                                                                                                                                 | D        | 11 Oct                 | LLD-01                                                             |
| D-55 | AI-search approach accepted (`SEO.md` §7, SEO-11/12, T14/T15); crawler policy AI-1 still pending (IN-01)                                                                                                                                                                                                                                                                                                                                                                                                                                                           | D        | 12 Oct                 | SEO                                                                |
| D-57 | AI-1: allow AI search and user-triggered crawlers; block AI training crawlers (robots.txt + Cloudflare AI Crawl Control)                                                                                                                                                                                                                                                                                                                                                                                                                                           | D        | 12 Oct                 | SEO-12                                                             |
| D-58 | R-4: material collection pages for crochet, macramé and pipe cleaner, each built only with ≥ 3 products                                                                                                                                                                                                                                                                                                                                                                                                                                                            | D        | 12 Oct                 | LLD-01                                                             |
| D-60 | Location wording (owner's final say): **"Handmade in Delhi & Pune"** on brand pages and footer                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | D        | 12 Oct                 | CX-11, footer, About                                               |
| D-61 | LLD-02 components approved: C-1 shared UI pieces in Preact rendered static by default; C-2 filters work on cards already in the page; C-3 checkout = one island/state machine; C-4 zero-JS menu/drawer/gallery/FAQ/effects; C-5 keep v1 image pipeline; C-6 approved reviews pulled at publish time                                                                                                                                                                                                                                                                | D        | 12 Oct                 | LLD-02                                                             |
| D-62 | LLD-03 filters approved: F-1 "Also good for…" group for any-occasion pieces; F-2 zero-result chips dimmed with a reason; F-3 featured = file order, optional `addedOn` for Newest; F-4 build fails on missing type/unknown tag, warns on no occasion; F-5 anonymous dead-end events; F-6 combo pages count explicit tags only                                                                                                                                                                                                                                      | D        | 12 Oct                 | LLD-03                                                             |
| D-63 | Mobile first and bug-free on every screen: `MOBILE-UX-STANDARD.md` (test matrix, rules); `tk-design` designs at 360 px first; screenshot regression at 320/360/412/768/1280                                                                                                                                                                                                                                                                                                                                                                                        | D        | 12 Oct                 | design, frontend, QA                                               |
| D-64 | LLD-04 checkout approved: K-1 wait for server confirmation before the pay screen; K-2 keep whichever offer saves more; K-3 order offers apply only to full-price items; K-4 gift wrap once per order; K-5 free delivery judged after the offer; K-6 form details remembered only for the open tab; K-7 unpaid orders expire after 3 days (owner WhatsApp reminder on day 1)                                                                                                                                                                                        | D        | 12 Oct                 | LLD-04, pricing                                                    |
| D-65 | LLD-05 API client approved: A-1 all calls POST with JSON body (nothing personal in URLs); A-2 save request text first, upload photos one by one; A-3 one automatic retry for writes with the same key; A-4 WhatsApp fallback on failed orders/requests; A-5 anonymous events batched in the background. Data-in-transit security section added (§10a) at owner's request                                                                                                                                                                                           | D        | 12 Oct                 | LLD-05                                                             |
| D-66 | LLD-06 backend approved (owner "ok next", 12 Oct): B-1 random order refs `TK-YYMMDD-XXXX`; B-2 minimal owner emails; B-3 random token on pay links; B-4 separate test/prod scripts deployed by owner via clasp; B-5 owner edits only status/tracking/notes columns; B-6 minimal OAuth scopes. B-7 retention → IN-17                                                                                                                                                                                                                                                | D        | 12 Oct                 | LLD-06                                                             |
| D-68 | LLD-07 build & publish approved (owner "I approve p1-p5 all", 13 Oct): P-1 settings and approved reviews reach the site via a **Publish** button in the Sheet that triggers a Cloudflare rebuild; P-2 products, photos and page text stay in Git with review; P-3 the UPI ID never lives in the Sheet — changing it needs a reviewed code change; P-4 test Sheet publishes to the preview site first, production Sheet to the live site; P-5 every publish keeps a snapshot for one-click restore                                                                  | D        | 13 Oct                 | LLD-07, PB-1, PB-2                                                 |
| D-67 | Docs restructure (owner request, 12 Oct): design files in `docs/design/` (`mockups/`, `concepts/`); v2 docs grouped into `product/`, `architecture/`, `standards/`, `process/`; this log moved to `docs/v2/DECISIONS-LOG.md`; superseded docs in `docs/v2/archive/`; v1 tracked docs unchanged                                                                                                                                                                                                                                                                     | D        | 12 Oct                 | docs, agent paths                                                  |
| D-69 | Per-agent permission model approved (owner, 13 Oct: "looks fine… not fully confident but trusting you"): default-deny write scope per role, read-only shells for reviewer/security/docs/SEO, owner-only rules files and install kit (AGENT-WORKFLOW §2, `policy.mjs`). Because many target folders don't exist yet, it is **verified in use**: S-8 smoke tests, then the lead reports every blocked edit during the first R1 tasks and proposes scope fixes to the owner                                                                                           | D        | 13 Oct                 | agents, hooks, IN-19                                               |
| D-70 | Agents act on GitHub as a separate machine account `tantu-kala-bot` (owner created it, 13 Oct): collaborator with push access, classic token scoped `repo` + `project` only, no bypass on any ruleset; the owner reviews, approves and merges as himself. Token lives only in the git-ignored `.claude/settings.local.json`; hooks refuse GitHub commands when it isn't loaded and block printing it; only the lead updates the board                                                                                                                              | D        | 13 Oct                 | IN-21, guardrail #27, INSTALL §1b                                  |
| D-71 | Task branches are named `task/<task-id>-<slug>` (was `v2/<task-id>-<slug>`): git can't hold a branch `v2` and branches `v2/…` at the same time — found 13 Oct while testing the install. Integration branch stays `v2`. Proposed by Cowork; **owner to confirm**                                                                                                                                                                                                                                                                                                   | P        | 13 Oct                 | GIT-STRATEGY, ADR-002, INSTALL, hooks                              |
| D-73 | Packaging sticker (PK-1): one brand sticker for the clear product packs, used across the whole product experience: home deliveries **and** third-party stalls that choose to stock the products. Not our shop; D-41 ("no shop") still holds | D | 21 Oct | PK-1, CX-1, CX-11 |
| D-74 | Packs say nothing about where pieces are made. D-60 ("Handmade in Delhi & Pune") stays scoped to brand pages and footer | D | 21 Oct | PK-1, D-60 |
| D-75 | Packs carry branding only: no legal-declaration label, and no professional check of packaging; review is by the owner and the review agents. Scope: packaging only (IN-05, the website's legal pages, is unchanged) | D | 21 Oct | PK-1 |
| D-76 | Sticker content: Instagram handle `@tantu_kala_` yes; no material word; no QR on the main sticker. A separate website-QR variant may be proposed for the owner's review | D | 21 Oct | PK-1 |
| D-77 | New tagline (BR-2) replaces "Handmade crochet, knotted with love" on the website **and** packaging; it names no material. Wording: owner to choose (IN-23) | D | 21 Oct | BR-2, `site.mjs`, Footer, Seo, PK-1 |
| D-78 | No vector logo exists; it may be recreated as a vector redraw. A redraw becomes the official logo only after the owner approves it (IN-25) | P | 21 Oct | PK-1, `public/brand/` |
| D-79 | "Thread" is not a material under D-77 (IN-26). Tagline = **"Art made from threads"** (IN-23) | D | 21 Oct | BR-2, PK-1, D-77 |
| D-80 | Round seal A (40 mm) on every pack; header tag B only for stalls that hang packs on pegs (IN-24); band C dropped | D | 21 Oct | PK-1 |
| D-81 | Vector logo redraw + small mark approved **for pack printing only** (IN-25); before master use, the cords under the bands are redrawn | D | 21 Oct | PK-1, D-78 |
| D-82 | No QR on packs for now; revisit when the domain is permanent (CX-10) | D | 21 Oct | PK-1, D-76 |
| D-83 | **Seal A approved for print with the tagline in ALL CAPS** ("ART MADE FROM THREADS"). Header tag B kept on record for future use, not printed now. Deliverables: single-sticker PDF + A4 sheet PDF | D | 21 Oct | PK-1, D-80 |
| D-72 | Token budget (owner "go", 21 Oct — Opus on every agent was exhausting the usage limit): agents on Sonnet (reviewer/security high effort; builders, design, content, brand, SEO medium; docs low); `tk-architect` stays Opus/high; lead defaults to Sonnet/medium, Opus for planning/release sessions; the lead passes `model: opus` only for the Opus list (F-5, F-6S, LLD/contract changes, release security review, bug surviving two fixes) or on owner request; no Haiku; agents read the brief + named sections instead of whole docs; max two agents at once | D        | 21 Oct                 | agents, CLAUDE.md, AGENT-WORKFLOW §1, write-task-brief, TASK-BRIEF |
| D-59 | Ship-from: most parcels ship from Delhi, some from Pune; one location-independent delivery estimate kept for now                                                                                                                                                                                                                                                                                                                                                                                                                                                   | D (fact) | 12 Oct                 | CX-11, shipping copy                                               |
| D-56 | The lead agent also acts as business analyst: validates every requirement and release, owns `OWNER-INPUTS.md` and asks the owner for missing inputs, supervises `tk-docs`                                                                                                                                                                                                                                                                                                                                                                                          | D        | 12 Oct                 | workflow                                                           |
| —    | ~~Proposed 12 Oct: "Handmade in Delhi · Run from Pune" (CX-11)~~ — superseded by D-60 (owner's final say). PG-4 legal seller details still open (IN-05)                                                                                                                                                                                                                                                                                                                                                                                                            | Closed   | 12 Oct                 | CX-11, PG-4 (IN-05)                                                |
| D-38 | Cowork = advisory desk + decision/doc keeper; repo docs are the shared memory (§11 protocol)                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | D        | 9 Oct                  | workflow                                                           |

Notes (9 Oct): Claude added `SECURITY.md` (proposed); fixed a bug in its own draft file-guard hook
(it blocked edits inside Claude-managed worktrees); set `worktree.baseRef: "head"` and
`isolation: worktree` on worker subagents after checking the current Claude Code docs.

---

## Timeline context (verified, not assumed)

- Raksha Bandhan 2026 (per the site's own `rakhiDateISO` config): **Friday, 28 August 2026.**
- This planning conversation is happening **after** Rakhi (session date: Tuesday, 1 September 2026) — the rakhi sales window is over; this is the v2 scoping phase, not a pre-festival
  push.
- No new deployments are in scope while this planning happens. The live site is unchanged.

## Business / payment facts

- **Clarified 10 Oct (Q-24):** the registered proprietorship under Suhas's name and PAN is
  **embox** (Suhas's business). **Tantu Kala is his sister's business**; Suhas lends the
  `embox.in` domain and embox's merchant UPI / bank account during its early stage.
- There is an **older business bank account**, tied to the same business the domain belongs
  to, usable for merchant payment purposes.
- That account already has **multiple UPI IDs created and actively in use**.
- Previously verified (web search, this session — not assumption): UPI merchant (P2M)
  onboarding does **not** require GST below ₹40L turnover; PhonePe for Business / Paytm for
  Business accept individual/sole-proprietor onboarding with just PAN + a bank account.
- **RESOLVED (partially):** Suhas confirmed many of his UPI IDs ARE merchant-registered — on
  PhonePe Business, GPay Business, Amazon Pay Business, etc. Merchant (P2M) VPAs are not
  subject to the ₹2,000 same-device tap-to-pay cap that was hit during Rakhi season.
- **STILL OPEN:** whether the specific VPA currently configured on the live site
  (`sushama.jaybhaye@oksbi` in `site.mjs`) is one of the merchant-registered ones, or a
  personal one — that's a distinct fact from "merchant VPAs exist on this account," and
  hasn't been confirmed yet. To be checked when payment work is picked up.
- **Discounting system — ideas raised (not yet decided):** different auto-applied codes per
  season/occasion; specific codes shared on different platforms (e.g. a code just for
  Instagram); or a visible list of coupon codes with stated eligibility criteria, rather than
  the current single silent auto-applied tier. Not scoped or chosen yet — logged as raised
  ideas for when this thread is picked up.

## Product scope — v2

The catalog expands beyond rakhis to:

- General crochet + pipe-cleaner arts and crafts.
- Decorative items — home decor, car decor, office decor.
- Gifting items and combos.
- Full custom orders, and minor/major customization of listed products.
- Festival-specific lines beyond Raksha Bandhan: Ganesh Chaturthi / Ganpati Bappa (flowers,
  garlands), Navratri, Diwali (gifting, combos).
- Jewelry: crochet earrings, jhumkas, latkans, bracelets.

**Hard material constraint (explicitly stated):** every item across the entire catalog —
jewelry and everything else — is wholly handcrafted using **either crochet (thread) or pipe
cleaner**. No other materials/mediums. Everything is handmade, under the Tantu Kala brand.

## Custom order flow — design decision

The custom order flow is explicitly **not** the existing cart → fixed price → pay-exact-UPI-
amount flow used for catalog products. Instead:

1. Customer submits a **request**, not a transaction — describing what they want in text
   and/or uploading reference images.
2. The request includes the customer's **contact details**.
3. The website's role stops at **capturing/posting the request** — no price is set and no
   payment happens at this stage.
4. The **team reviews the request internally**, then reaches out to the customer directly to
   discuss specifics (feasibility, price, timeline, etc.).
   **Decided (6 Oct 2026, design review — revised same day):** reference photos are uploaded
   through the form to **Google Drive via the existing Apps Script**, linked from the request's
   Sheet row, so text and photos stay together (Suhas: separate places could create conflicts).
   Supersedes the earlier "WhatsApp for now" call. Interpreted as Drive (free) rather than a
   Google Cloud Storage bucket (needs billing) — pending Suhas's confirmation.
   **Decided (6 Oct 2026):** standard orders carry a shipping charge; it can be waived by coupon
   code or above an order-value threshold. Shipping must be final before UPI payment.

5. That follow-up conversation can happen over **any channel** — website, email, phone call,
   WhatsApp, or others — not fixed to one.

## Catalog & category structure — decisions so far

- A product **can belong to multiple categories, or just one** — not a strict single-parent
  taxonomy. The exact primary category set is still being figured out (in progress, joint).
- **Material (crochet vs. pipe-cleaner) is explicitly NOT a browsable/filterable facet for
  customers, at least for now** — even though it's a real fact about every product (see
  material constraint above), it stays internal, not customer-facing navigation.
- Full custom orders **will not live inside the catalog** — reconfirmed; it's a separate flow
  (see Custom order flow section above), not a category customers browse into.
- **Two-facet model confirmed:** categories split into **Type** (what kind of thing it is)
  and **Occasion** (what festival/event it's for), assigned independently — a product can
  carry one or both.
- Both the Type list and the Occasion list are **explicitly extensible** — Suhas expects them
  to expand or merge over time, including during ongoing brainstorming, not fixed once.
- **Every product must have at least one Type.** Occasion is optional — if unset, it's treated
  as "Everyday" **by default/absence, not as an explicit tag a product carries.**
- **"Everyday" is not a tag a product carries** — it's the fallback interpretation in the UI
  for a product with no occasion tag set. Confirmed.
- **Starting lists confirmed** (extensible later, per above):
  - Type: Rakhis, Jewelry, Home Decor, Car Decor, Office Decor, Gifting/Combos.
  - Occasion: Raksha Bandhan, Ganesh Chaturthi, Navratri, Diwali (+ implicit Everyday).
- **Status: catalog/category structure thread settled** for now, at the brainstorming level
  (data schema / implementation not yet discussed).

## Design — scope, as stated by Suhas

This is explicitly a **whole-brand-identity exercise, starting fresh** — not incremental UI
tweaks. In scope: color palette (open to full redefinition), logo, overall website
structure, and **product photography rules** (a new requirement — guidelines for what kind of
photos get posted for products). The website structure specifically needs to **accommodate
any new category or festival** without being rebuilt each time — connects to the Type/Occasion
category decision above and the pre-existing `campaign` config idea in
`docs/PRODUCT-EVOLUTION.md`. Sub-topics and their order not yet decided.

## Brand direction (design)

Tantu Kala v2 is positioned as a **premium, modern brand** — premium handcrafted gifts,
customizable on request. Festival-specific vibes are allowed **but scoped to their specific
categories/occasions**, not the whole site's baseline identity — the general, default
identity should read premium, not festive. Reference point named by Suhas: **Ferns N
Petals** and comparable brands in the premium-gifting segment, to be explored for palette,
photography style, and layout patterns (not to be copied — a reference for the segment).

**Research done:** a subagent surveyed Ferns N Petals + 3 comparable premium brands (Chumbak,
Nicobar, The Gift Studio), then a second pass closed FNP-specific gaps (Luxe rendering,
precise `getComputedStyle` color extraction — corrected an earlier visual misread that Luxe
was dark/jewel-toned; it's actually pale/cream-toned). Full findings in
`docs/design/BRAND-RESEARCH.md`.

**Design direction — CONFIRMED** (Suhas: "agree to most of the points... nothing to push
back," with one clarification noted below):

- **Palette:** warm, muted, craft-rooted — not generic navy/gold luxury. Desaturate/simplify
  the current bright saffron/maroon festive palette into muted earthy tones (terracotta/rust,
  warm ivory/cream, one restrained gold/mustard accent), anchored on the existing logo brown
  `#4D3126` (a verified, already-premium-reading color) rather than inventing an unrelated
  palette.
- **Typography:** keep Fraunces (existing display serif — already reads premium per
  research) for headlines/logo-type moments. Whether the body font (currently Mukta) should
  change to something quieter is an open exploration, not yet decided — part of the design
  agent's job, not pre-decided.
- **Photography:** two registers — styled/editorial for hero/storytelling (leaning toward
  real-use context: a rakhi actually tied on a wrist, a garland on an actual mandap, earrings
  worn — Claude's judgment call, flagged as such, not settled fact), plain/consistent
  neutral-background studio shots for the catalog grid (needed for coherence across a very
  physically varied catalog — jewelry, car decor, garlands, etc.).
- **Catalog browsing:** cross-cutting filters (Type + Occasion, already decided) rather than
  separate category-silo pages — matches the strongest structural pattern from research
  (Nicobar, The Gift Studio) and directly satisfies "must accommodate any new
  category/festival."
- **Discounting/promo presentation:** avoid heavy stacked "% OFF" badge treatment (correlated
  with a less-premium feel in the research sample) — **CLARIFICATION from Suhas:** the
  current auto-coupon setup ("Extra 20% off over ₹500") was specific to the rakhi season: the
  discounting _system itself_ (not just its visual treatment) is open to being modified for
  v2. This is a separate, not-yet-scoped thread — the design work covers visual restraint on
  promo presentation only, not a redesign of pricing/coupon logic.

**Design system produced, then Suhas: "this looks good for now."** A design agent produced a
concrete palette (8 named hex colors), a body-font proposal (Karla, replacing Mukta —
Fraunces stays as-is), a detailed photography brief, and a visual moodboard. Full spec:
`docs/design/DESIGN-SYSTEM.md`. Rendered visual: `docs/design/moodboard.html`. **Status: approved as
the working direction to proceed with** — Suhas's "for now" is treated as green-lighting it
for use, not as a formality-only sign-off, but it's still open to revision as we build it out
further rather than treated as immutable/final.

**Figma:** a real file now exists — https://www.figma.com/design/vQ6wvtTUB8BU8mOSpE0UTm —
containing the palette and typography scale, screenshot-verified working. Product card/filter
mocks not yet built there (only in the HTML moodboard so far).

## Page-level design mockups — produced, pending review

Four parallel agents each produced a full HTML mockup for one page/flow, all built on the
approved design-system palette/type variables (verified consistent across all four — same 8
hex values, same Fraunces/Karla variable names as `docs/design/moodboard.html`). **Not yet
reviewed or confirmed by Suhas — status is proposal only, per this log's standing rule.**

- `docs/design/mockups/homepage.html` — hero, a theme-first "Shop by collection" grid (6 named
  collections spanning everyday + all four festivals), a secondary flat Type pill strip, a
  dark-Umber 3-step Custom Orders callout, one scoped Rosewood festive strip, a studio-register
  bestsellers grid, and a brand-story section.
- `docs/design/mockups/catalog-nav.html` — sticky header with two separate small Type/Occasion
  dropdowns (not one mega-menu) plus a standalone Rosewood "Custom Orders" pill kept out of
  both dropdowns; catalog page with Type/Occasion filter chips (with counts), an active-filters
  bar with per-filter removal + Clear all, and an in-grid dashed-border custom-order callout
  card as a second entry point.
- `docs/design/mockups/product-detail.html` — for a sample Jewelry + Ganesh Chaturthi product:
  multi-image gallery (main + thumbnails/dots), Type/Occasion tags, a low-weight "minor tweak"
  hint pointing to the existing checkout note field, and a separate heavier Clay-Sand "full
  custom order" card — deliberately distinct from the tweak hint to avoid confusing the two.
- `docs/design/mockups/custom-order.html` — no pricing/cart UI anywhere; a "How this works"
  3-step strip, an explicit "this sends a request, not an order" note, a material-constraint
  callout, description + reference-image upload + optional occasion/date + contact fields, a
  Rosewood (not cart-colored) submit CTA, and a WhatsApp alternate-channel link.

**Note on process:** the homepage agent's own summary briefly mentioned writing then removing
a stray file — verified via `git status --porcelain` immediately after that only the
intentionally-created docs files were present; no stray file was left in the repo.

**Five more page mockups added** (Suhas: "prepare the remaining pages designs as well" —
scoped against the real `src/pages/` inventory in the repo, plus one addition of Claude's own
judgment, flagged as such at the time):

- `docs/design/mockups/cart-checkout.html` — cart review, checkout form, and a distinctly
  separated "Step 2" order-confirmation screen + UPI payment panel (mobile button / desktop
  QR placeholder) — deliberately unmissable given the earlier unresolved production issue
  where a customer didn't clearly land on the order-placed state.
- `docs/design/mockups/about.html` — brand story, the crochet/pipe-cleaner material rule as a
  craft signal, a modest founder narrative (no invented biographical specifics).
- `docs/design/mockups/contact.html` — WhatsApp/email/Instagram channels plus a lightweight
  "form" that's honestly just mailto/wa.me links client-side — no backend, per the
  no-database/no-server hard rule.
- `docs/design/mockups/shipping-returns.html` — accordion-style policy page (shipping, returns/
  exchanges, custom-order terms, payment), explicitly and repeatedly marked as illustrative
  placeholder copy pending the owner's actual policy sign-off.
- `docs/design/mockups/festival-landing.html` — Claude's addition, not explicitly requested: a
  sample Ganesh Chaturthi campaign/landing page to demonstrate the extensible multi-festival
  concept, with the Rosewood festive treatment deliberately scoped to just the hero band and
  occasion tags (not a site-wide reskin), plus a cutoff-date callout and cross-Type product grid.

Re-verified via `git status --porcelain` after writing all five files — repo still shows only
the intentionally-created docs files, nothing stray.

**Status: all 9 mockups (4 original + 5 new) pending review** — not yet confirmed by Suhas.

## Sharing mockups with the team

Suhas asked how to get team/business-partner review on the mockups. Web research (this
session) described claude.ai's consumer "Publish artifact" feature — free on every plan,
produces a public link viewable without a Claude account. **That research turned out not to
apply to this session:** the only artifact tool actually available here (Cowork's
`create_artifact`) was tested and confirmed to just write a local HTML file to Suhas's own
machine (`C:\Users\suhas\Claude\Artifacts\...`) and open it in Cowork's sidebar — no public
URL, not shareable with anyone outside his own Cowork account. This was caught and corrected
in chat rather than left as a wrong claim. **Resolution:** Suhas will share the 9 mockup files
himself (WhatsApp/Drive/email) — no hosted link is being produced for now.

## Playful/creative exploration (separate from the 9 approved mockups)

Suhas asked for fun, playful creative ideas — e.g. a 404 page, small brand-voice touches —
**explicitly as separate files, not alterations to the 9 approved mockups.** Two exploratory
files were added, both clearly flagged in-page as concept-only / not wired into the real site:

- `docs/design/concepts/playful-404.html` — a "this thread got away from us" 404 page with a
  small CSS yarn-ball/unraveling-thread animation and a hover Easter egg ("we dropped a
  stitch too").
- `docs/design/concepts/playful-ideas-sampler.html` — six small hover/micro-interaction demos
  in the existing palette: a logo hover-wiggle, an illustrative "by the numbers" handmade-stats
  strip for About, a personality-touch empty-cart line, a thread-confetti order-confirmation
  concept (not added to the real cart-checkout mockup), a pulse-dot on the "current" festival
  pill, and a hover fun-fact on the material-rule callout.
  These are exploratory/optional — not decided, not part of the 9-page review set.

## Round-1 playful ideas wired in; round-2 brainstorm added separately

Suhas liked the round-1 concept files and said to wire those specific ideas into the real
mockups, while keeping any _further_ brainstorming in a new, still-separate, unwired page.

**Wired into the approved mockups (all 9 pages + new 404):**

- Logo hover-wiggle (the two words nudge slightly on hover) — added to the topbar on all 9
  approved page mockups and the new 404 page, for consistency across the whole set.
- "By the numbers" handmade stat strip + a hover fun-fact on the material-rule line — added to
  `docs/design/mockups/about.html`.
- An empty-cart alternate state (shown as a clearly labeled second screen, not the default) +
  a brief thread-confetti burst behind the order-confirmation checkmark — added to
  `docs/design/mockups/cart-checkout.html`.
- A pulse-dot on the "current" festival pill — added to
  `docs/design/mockups/festival-landing.html`.
- The 404 concept was promoted into a full page mockup matching the other 9 (topbar, footer,
  logo-wiggle included): **`docs/design/mockups/404.html`** — now effectively a 10th approved
  page, pending review like the rest.

**Round 2 — new brainstormed ideas, explicitly NOT wired in:**
`docs/design/concepts/more-playful-ideas.html` — seven new concepts, none implemented anywhere:
a lite CSS-animated "how it's made" mini storyboard, a scrolling fun-facts ribbon, a small
maker's-mark/piece-number stamp on product pages, thread-colour name stories (hover tooltip),
a festival order-cutoff countdown ticker, a corkboard of pinned customer thank-you notes, and a
"spot the handmade variation" hover pairing (ties into the Shipping & Returns variation note).
Clearly flagged in-page as round-2 exploration, separate from both the 9 approved pages and the
round-1 ideas that are now wired in.

## Round 3 — more ambitious interactive brainstorm, still not wired in

Suhas asked for an even more creative/innovative round, explicitly as a collection of new
ideas only (not full pages, not wired into anything) — `docs/design/concepts/round3-innovative-ideas.html`.
Seven working demos, all functional (not just static mockups) but scoped to this one sampler
page: a scroll-linked "unspool the thread" story reveal; a small working gift-box builder with
a live running total; a thread-trail custom cursor effect on hero-style sections; a time-aware
greeting banner that computes a real greeting + illustrative festival countdown from the
visitor's own browser clock; a "knit-in-progress" branded loading-state animation; a click-to-
design mini stitch-pattern tool that ends in a CTA toward Custom Orders (a playful lead-gen
idea, not just decoration); and a gift-combo card where hovering "unties the ribbon" to reveal
its contents. All still inside the existing 8-color palette and Fraunces/Karla type system.
Not decided, not part of the approved page set.

## Working model (operational — how this project runs from here)

Suhas wants Claude to act as the orchestrator: exploring the repo, writing scoped prompts
for sub-agents (design research, building, testing, live-site review, etc.) rather than
doing every task directly. Documentation status: each thread's findings/status should be
captured in durable docs (this log, plus thread-specific docs as they're created), not left
only in chat. See chat for Claude's accuracy caveats on what this actually means
mechanically (sub-agents are task-scoped, not persistent; "continuous" monitoring is
realistically a scheduled recurring check, not real-time) — logged here as the intent, not
yet as a finalized mechanism.

## Sequencing note

Suhas wants to **finalize the product catalog/category structure first**, then move to the
**design/visual aspect** next. Flagged explicitly so the conversation doesn't drift into
design before catalog structure is settled.

**Reconfirmed:** design (including page/flow-level design, not just the palette/type/photo
system) happens fully **before** any changes to the actual product catalog/data/code —
"before we make any changes to the actual product catalog I would like to get the design
flows visually." No catalog/schema work until design is further along.

## Discussion threads

| Thread                                                                  | Status                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Custom order flow                                                       | Decided (design above) — implementation not yet discussed    |
| Catalog & category structure                                            | **In progress** (current discussion)                         |
| Design / visual direction                                               | **In progress** (current discussion)                         |
| Payment / merchant VPA                                                  | Open, deferred                                               |
| Tooling & data leverage (ops dashboard, QA agent, entry-source rollups) | Noted as interesting, not yet scoped                         |
| Portfolio value of this project                                         | Noted as a factor Suhas cares about, not a design constraint |

---

_Log entries below this line will be appended as later decisions are made._

## Architecture tier for v2 (6 Oct 2026)

- **Decided:** v2 is built on **tier 0** (static Astro on Cloudflare + Apps Script + Sheets/Drive).
  Run the upcoming festivals (Navratri, Diwali) on it and measure business signals before scaling.
- **Standing instruction:** tier-1 Cloudflare serverless functions (Workers + D1/KV, free plan)
  are **in scope for expansion**. Claude should recommend them whenever Suhas talks about
  expansion or "needing a server". A full server (tier 3) is not planned.
- **Deferred:** inventory management (almost everything is made to order; the few ready-made
  pieces are tracked manually).
- **Rakhi 2026 facts (from Suhas):** ~20–30 orders, 100+ products sold (target was ~500).
  Most orders came via WhatsApp, Instagram or in person, not the website. Matching UPI payments
  manually was easy at this volume.
- **Next:** finalize v2 system requirements from Suhas's 14-point feature list, then design an
  orders-Sheet dashboard tab to track the scaling signals.

## v2 documentation set and development process (6 Oct 2026)

- **Clarified:** the Rakhi "500" target was **rakhi units** (product count), not orders.
  Suhas does not want units as the default measure and asked Claude to define a practical
  system → proposed in `docs/v2/product/METRICS.md` / ADR-004 (revenue, orders, units counted at Paid;
  festival = revenue target + unit capacity cap). **Proposed, not yet confirmed.**
- **Decided:** v2 will be developed in **Claude Code by multiple parallel agents**, not Cowork,
  following a standard documented process.
- **Decided:** docs are living drafts; Claude keeps them and this log updated as brainstorming continues.
- Created `docs/v2/`: README (index), REQUIREMENTS, METRICS, ARCHITECTURE, AGENT-WORKFLOW,
  BACKLOG, `adr/` (001 tier 0 — accepted; 002 versioning — proposed; 003 Drive photos —
  accepted with Q-1 open; 004 metrics — proposed), `templates/`, and `claude-code/`
  (draft v2 CLAUDE.md + 5 subagent definitions, to install on the `v2` branch).
- Suhas's 14 points were consolidated (4+5 = one WhatsApp notify feature; 7+8+9 = one bulk/
  corporate request feature) and mapped to requirement IDs. Features Claude added (off-site
  order logging, payment-link generator, capacity cap, personalisation, privacy/terms,
  customers tab, UTM capture, product feeds) are in REQUIREMENTS as **proposed**.
- Open questions Q-1…Q-7 listed in `docs/v2/product/REQUIREMENTS.md` §8.

## Answers to Q-1…Q-7 and v1 tag (6 Oct 2026)

- **Q-1 Decided:** request photos → Google Drive via Apps Script (ADR-003 accepted).
- **Q-2 Open:** discount policy still under brainstorming.
- **Q-3 Decided:** standard orders pay **₹89 shipping + packaging**; custom and large orders get
  shipping calculated after packing; free-shipping threshold ~**₹500–700**, will change.
  "Standard order" = within some size, price and other norms (exact norms open, Q-9).
- **Q-4:** gift message max **500 characters** (decided); wrap fee **~₹30** on standard orders (provisional).
- **Q-5 Provisional:** loyalty tier 1 = **≥ ₹2,999 total order value** (single or multiple orders)
  **or 4–5 orders in a year**. Intuition-based, not final.
- **Q-6 Decided:** target **₹1,00,000 revenue by Diwali (8 Nov 2026)**, including Navratri and
  **macramé** items (now added to the product list).
- **Q-7 Decided:** v2 uses a new UPI ID; Suhas adds it to config later.
- **Done:** tag `v1.0.0` (commit `10cde35`) and Release published on GitHub — verified via the GitHub API.
- **Flagged by Claude:** macramé conflicts with the earlier hard rule "crochet or pipe cleaner
  only" (Q-8); v2 can't launch before Diwali, so the target runs on v1 (Q-16, proposed S-0).

## Second round of answers + process decisions (6 Oct 2026)

- **Correction:** "33 days" earlier was the calendar gap from 6 Oct to Diwali (8 Nov), not a
  build estimate; Claude's sentence blurred the two. No build-time estimate has been made.
- **Decided — material rule (Q-8):** macramé is part of the brand. Tantu Kala = "art made from
  threads": crochet, macramé and pipe cleaner. Supersedes the earlier crochet/pipe-cleaner-only rule.
- **Decided — Diwali goal (Q-11):** ₹1 lakh of pure product sales, from 6 Oct to 8 Nov 2026,
  all channels. A goal, not a must.
- **Decided — non-standard orders (Q-9):** size class + cart limit as owner-managed columns;
  above the limit = bulk/corporate quote with MOQ and special rates shared privately;
  negotiated quote + payment link; **quote valid 10 days**.
- **Decided — payment terms (Q-12/13):** full advance on every order; non-refundable unless not
  yet made or T&C allows. Detailed T&C later (Q-19).
- **Decided — discount types (Q-2):** loyalty codes, time-limited festival codes, auto
  order-value tiers across ranges; values entered later. Stacking rule open (Q-18).
- **Decided (Q-14):** not GST-registered; no "GST invoice" — receipts only.
- **Decided (Q-15):** India Post Speed Post by default; another courier when needed.
- **Decided:** off-site orders are already logged by Suhas; Customers tab is an add-on, later
  filled automatically by v2.
- **Decided — delivery:** build quickly with Claude Code agents, in phases of working releases.
- **Decided — teaching:** v2 doubles as lead-engineer training. Agents add "Lesson for the lead"
  to handoffs; notes kept in `docs/learning/` (git-ignored via `.git/info/exclude` now; to be
  added to `.gitignore` on `v2`).
- **Proposed by Claude (not decided):** `SYSTEM-DESIGN.md`, `GIT-STRATEGY.md` (strict),
  `AGENT-GUARDRAILS.md`, guardrail hook drafts (tested against sample commands), CODEOWNERS and
  CI drafts, ADR-005 (Sheet-managed settings, Q-17), releases R1–R4.
- **Open:** Q-10 loyalty details, Q-17 settings location, Q-18 discount stacking, Q-19 T&C text.

## Stakeholder meeting feedback (reported by Suhas, 7 Oct 2026)

- **Decided:** **no payment gateway in v2** (CHK-9 moved to "Not in v2").
- **Raised, proposed answers in REQUIREMENTS v0.4 (not yet decided):**
  1. Filters hiding products → explicit any-of/both rules, counts, no-dead-end state,
     "good for any occasion" flag, tag audit in the build (CAT-2a/b).
  2. Quantity cutoff to pitch bulk orders → soft, non-blocking bulk pitch (CHK-12), separate from
     the hard quote limit (CHK-10).
  3. "Add ₹X more for free delivery" progress in cart/checkout (CHK-13).
  4. Digital stamp-card loyalty, rewards mostly discounts (PST-3a) — feeds into Q-10.
  5. CHK-6 explained (short checkout form; phone is the key identifier).
  6. Order status with courier tracking link from a URL template; courier SMS to the customer's
     mobile (OPS-8). Speed Post deep-link format not yet verified.
- **Decided (8 Oct):** stamp card (PST-3a) **deferred** until most must-haves are delivered;
  revisit together with accounts/login vs phone-number identity.
## Packaging sticker and tagline (owner, 21 Oct 2026)

Context: the owner asked for a small brand sticker for the clear product packs (PK-1). Answers
given in the lead session on 21 Oct, recorded as said:

- **D-73:** the sticker is part of the overall product experience: packs delivered at home or
  picked up from "a few shops who decided to keep our product on shelf". These are other people's
  stalls ("Not my shop, some other stalls selling my product"); the sticker is made "irrespective of
  it". The site still never suggests a shop of our own (D-41, CX-11).
- **D-74:** "packs should not say anything about where they are made."
- **D-75:** "for these items I don't care about the legal issues… we will mostly focus on branding
  on that label and nothing else." No professional check: "just me and review agents". Recorded for
  packaging only; IN-05 is unchanged.
- **D-76:** "we can also think of adding instagram handle on the sticker"; "without mentioning
  material"; "I don't want a QR yet", but a separate website-QR proposal may be shown for review.
- **D-77:** "let's get the tagline updated for both website and actual product branding like this
  sticker", without mentioning material. Wording: owner chooses from drafted options (IN-23).
- **D-78 (P):** "I don't have logo as vector file, if needed we might need to recreate it." A
  redraw is official only once the owner approves it (IN-25).
- **D-79…D-82 (later on 21 Oct):** the owner accepted the review agents' first five recommendations
  ("I accept the first 5 recommendations"): "thread" is not a material; tagline "Art made from
  threads"; seal A on every pack, header tag B only where stalls use pegs; the logo redraw approved
  for pack printing only; no QR for now. The homepage title (IN-27) is deferred: "we will discuss
  the title later if needed". Until then the website tagline is not changed, because `Seo.astro`
  builds the homepage title from the tagline.
- **D-83 (21 Oct):** "I'm finalising the option A round sticker for now with all caps tagline, but
  also keep the fold over in our records for future as it's good as well." Asked for a single-sticker
  file and an A4 sheet filled with stickers, both print-ready.


## Owner amendment — stockist shops (21 Oct 2026)

- **What Suhas said (edited D-41 himself):** "can plan to provide the products to few relevant shops to increase sell but this would not impact the online store". Recorded as a _possible future channel_, not a decision to start.
- **Consequences agreed by the docs (no site change now):** CX-11 still never implies Tantu Kala has its own shop; Google Business Profile stays ineligible (Google requires in-person customer contact by the business itself and lists brands/artists/online-only businesses as ineligible — guideline re-checked 21 Oct); a "Where to buy" stockist page is out of scope until a shop agreement exists.
- **Open (IN-22, before the first shop deal):** shop prices vs online prices, whether shop orders count toward the revenue goal and get their own `channel`, whether they share the festival capacity cap, and invoices/GST for shop sales (professional check).

## Token budget and model policy (21 Oct 2026)

- **Why:** a design session with every agent on Opus at high effort used up the plan's usage window early and blocked work.
- **Decided (D-72, owner "go"):** match the model to the job — see AGENT-WORKFLOW §1 for the table and the Opus list. Agents stop re-reading whole docs: briefs carry the quoted requirements, acceptance criteria and decisions, plus at most three named doc sections. Supersedes D-35 (9 Oct, "quality over consumption").
- **Review point:** after the first R1 wave, check `/usage` (subagent share) and any quality problems; move a role up to Opus only with evidence.
