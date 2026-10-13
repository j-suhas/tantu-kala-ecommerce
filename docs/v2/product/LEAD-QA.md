# Tantu Kala v2 — Lead & engineering Q&A (proposed answers)

Version 0.1 · 9 Oct 2026 · Status: **proposed answers for discussion** — nothing here is decided
until logged in `DECISIONS-LOG.md`.

Labels: **[verified]** = checked in code/docs this session · **[estimate]** = reasoned guess with
assumptions · **[to verify]** = must be checked in a spike before relying on it · **[your call]**.

---

## Part A — Suhas's questions (owner / lead)

### A1. How long can v2 survive?

**[estimate]** Technically, **3–5 years with light upkeep**; the business will probably outgrow
it before the tech wears out.

- A static site has no server to rot: built pages keep working even if nobody touches the code.
- What decays: build-tool dependencies (only matters when you rebuild), Google Apps Script/Sheets
  policy changes, the free pincode API, and browser changes (slow, rarely breaking).
- Upkeep: dependency updates each quarter (Dependabot already runs), a yearly check of Apps
  Script quotas/policies, rebuild-and-test before each festival.
- What really ends v2: needing accounts/login, automated payments, or order volume beyond Apps
  Script — i.e. business triggers in `METRICS.md` §6, not code age.

### A2. How does the stack choice affect longevity?

- **Output matters more than framework.** Plain HTML/CSS/JS output (Astro) ages best; SPAs that
  need a framework runtime in the browser age worst.
- **Every dependency is a future upgrade.** Fewer, mainstream dependencies = longer life.
- **The weakest link is Apps Script + a consumer Google account** (proprietary, quota-bound,
  account-dependent). Keep it a thin adapter so it can be replaced.
- **Business logic in portable TypeScript** (pricing, validation, filters) survives any move of
  frontend or backend.

### A3. Best-value stack for longevity, low maintenance and your learning

| Layer               | Pick                                                          | Why (longevity / maintenance / learning)              |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| Site                | **Astro** (static) + TypeScript                               | Static output lasts; you already know it; widely used |
| Styling             | Tailwind                                                      | Already in use; stable; common in jobs                |
| Interactive islands | **Preact** (TSX) for stateful islands; plain TS for tiny ones | Tiny runtime; React skills transfer directly          |
| Logic               | Pure TS modules + **Vitest**                                  | Portable to any backend; testing is a core job skill  |
| E2E tests           | **Playwright** (dev-only)                                     | Industry standard; catches real-phone flows           |
| Backend now         | Apps Script (thin) + Sheets/Drive                             | ₹0; owner-friendly                                    |
| Backend later       | **Cloudflare Workers + D1 (SQLite) in TypeScript**            | Same TS, free tier, teaches serverless + SQL          |
| Tooling             | GitHub (Actions, rulesets), Claude Code agents                | Matches your agentic-engineering goal                 |

Rejected for this project: Next.js/SSR on Vercel (needs servers/functions you don't need, cost
risk), Shopify (monthly fees, little learning), Angular (wrong fit for islands).

### A4. Moving to a real backend + database later — what to decide today

1. **One API client module** in the frontend, behind a **versioned contract** (`/v1/order.create`
   shapes in LLD-05, which superseded `ARCHITECTURE.md` §6). Later you change the base URL, not the pages.
2. **Business logic in shared TypeScript**, not in Apps Script. Write Apps Script in TS and
   **bundle the shared `pricing.ts` into it** (esbuild + clasp) — removes today's duplicated
   pricing code and moves straight into a Worker later. **[to verify] build setup**
3. **Model the Sheet like database tables:** Orders, OrderItems, Customers, Requests — stable
   IDs, one row per entity, ISO dates, money as integer rupees, enums for status/channel.
   Formulas only on the Dashboard tab, never as the source of truth.
4. **Server-generated order refs and idempotency keys** (not client-generated as in v1).
5. **An export script** (Sheet → CSV/JSON) from day one; it becomes the migration script.
6. **Strangler pattern later:** put Workers in front of Apps Script route by route
   (`SYSTEM-DESIGN.md` §7), so there's never a big-bang migration.

### A5. Best stack for this site and these customers

Customers are on phones, often mid-range Android, arriving through Instagram/WhatsApp in-app
browsers on mobile data. That means: **static pages + small islands, no SPA**, strict image
budget, works in in-app browsers, WhatsApp as the always-available fallback. The A3 stack fits;
React itself would add weight every visitor pays for.

### A6. How is work tracked, picked and managed when agents do most of it?

**Proposal [your call]:**

- **Tracker:** GitHub Issues + a GitHub Projects board (free), columns _Inbox → Ready → In
  progress → In review → Done_. `BACKLOG.md` becomes the release plan only (no live status).
- **Creating the backlog:** requirement area → epic issue → task issues written from
  `templates/TASK-BRIEF.md` (with CX notes and quoted decisions). The lead agent drafts them;
  you approve them into _Ready_.
- **Picking the next item:** the lead agent proposes, by rule: (1) current release only,
  (2) dependencies done, (3) highest priority, (4) no file overlap with work in progress,
  (5) within the WIP limit. You approve the plan for the session.
- **Rhythm per release:** plan (you + lead) → build (parallel tasks) → review → UAT on phones →
  release → short retro in `docs/learning/`.
- **Agent access:** worker agents may comment on their own issue; only the lead moves cards
  (scoped GitHub token, no admin).

### A7. How can you review work produced faster than you can read it?

Change _what_ you review, not how fast you read:

1. **WIP limit = your review capacity** (start at 2 parallel tasks).
2. **Small PRs:** one task, guideline ≤ ~300 changed lines.
3. **Review the brief and the tests more than the code.** If acceptance criteria are encoded
   as tests that you approved, the code needs a lighter read.
4. **Layered review:** CI → reviewer agent → QA agent → you. You only start once the first three are green.
5. **Risk-weighted depth:** deep read for pricing, Apps Script, customer data, guardrail files
   (CODEOWNERS forces you); skim + phone check on the preview URL for UI.
6. **Fixed review slots** (e.g. twice a day), not constant interruption.
7. **Spot audits:** once per release, read one "low-risk" PR in full to check the reviewer agent.

The lesson: with agents, the bottleneck moves to **spec quality and review**. That _is_ the lead's job.

### A8. How is work divided, and by whom?

The lead agent splits each release by **layer and file ownership** (`AGENT-WORKFLOW.md` §2):
contracts first (types, API shapes, pricing), then parallel lanes whose file sets don't overlap.
You approve the split. Each task goes to one role agent (frontend, data, integration, QA).

### A9. Can one agent trigger others (lead → developers → reviewer)?

**Yes [verified in Claude Code docs].** Options:

- **Subagents:** the main (lead) session spawns role subagents, several in parallel; current
  docs allow nesting up to three levels by default (configurable with
  `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`; the docs/changelog disagree on the historical default,
  so check your version) and cap concurrent subagents at 20 per session.
- **Agent teams:** experimental lead + teammates mode, off by default; no nested teams.
- **Headless runs / Agent SDK:** scripts that run `claude -p` or the SDK — e.g. a pipeline that
  runs developer → reviewer automatically.
- **GitHub Action:** `@claude review` on a PR triggers a review agent in CI.

**Proposed flow:** you start the lead session → lead proposes the plan → **you approve** →
lead spawns developer subagents, each in its own worktree → on completion lead spawns reviewer
and QA subagents → lead opens the PR with evidence → **you merge**. Two human gates (plan, merge).
Set spawn depth to 1 (flat tree): easier to control and cheaper. **[your call]**

---

## Part B — Claude's lead questions (proposed answers)

| #   | Question                       | Proposed answer                                                                                                                                                                                                |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | What is v2 success in numbers? | **[your call]** e.g. by the first festival after R2: ≥ 30% of orders through the site; ≥ 50% of checkout starts end in an order; owner admin ≤ 2 h/week; zero lost or duplicate orders                         |
| B2  | Cut list if a release slips    | Drop in this order: playful extras → reviews → product feeds → collections → countdown → receipts/labels. Never cut: catalog, filters, checkout, status, requests                                              |
| B3  | Mid-release ideas              | Go to _Inbox_; triaged at the next release plan; only bugs/blockers enter the current release                                                                                                                  |
| B4  | Review capacity                | WIP 2 at R1; adjust using the scorecard                                                                                                                                                                        |
| B5  | Agent cost                     | Track Claude usage per release; monthly cap **[your call]**; flat agent tree; cheaper model for simple tasks if your plan allows                                                                               |
| B6  | Single point of failure (you)  | Runbooks: publish, Apps Script deploy, rollback; one stakeholder trained on Sheet ops; credentials in a password manager with recovery                                                                         |
| B7  | Account ownership              | List GitHub, Cloudflare, Google, domain (`tantukala.embox.in` — who owns `embox.in`?), UPI; move to business-owned accounts                                                                                    |
| B8  | Top risks                      | Content/photos late (owner) · test data in real Sheet (lead; separate test env D-25) · pricing bug (data agent + fixtures) · customer-data leak (reviewer + PII scan) · broken old links (frontend; keep URLs) |
| B9  | Rollback                       | Keep previous Cloudflare deployment or redeploy tag `v1.0.0`/last v2 tag; **rehearse once before R1** **[to verify] exact Cloudflare rollback steps**                                                          |
| B10 | Who tests, on what             | You + one stakeholder; your phones + one low-end Android + one iPhone + Instagram and WhatsApp in-app browsers; release checklist                                                                              |
| B11 | Customer data rules            | Access: owners only; consent line at checkout; privacy page; retention period **[your call — get advice]**; no PII in repo, logs or screenshots                                                                |
| B12 | Demos                          | One per release on the preview URL; stakeholders sign off against REQUIREMENTS acceptance criteria                                                                                                             |

---

## Part C — Claude's engineering questions (proposed answers)

| #   | Question                     | Proposed answer                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Old URLs                     | Keep `/products/[slug]` exactly as v1 **[verified route]**; new routes only add; any rename gets a redirect; test against the v1 sitemap                                                                                                                                                                    |
| C2  | v1 carts                     | v1 key is `tk_cart_v1` **[verified]**; v2 uses `tk_cart_v2` and migrates once (drop unknown slugs, keep quantities)                                                                                                                                                                                         |
| C3  | Devices                      | Recent Chrome/Samsung Internet on Android 8+, Safari on iOS 15+, Instagram/WhatsApp in-app browsers **[your call; refine with analytics]**                                                                                                                                                                  |
| C4  | Stale prices                 | Hashed assets cached long; HTML short; `/pricing.json` uncached; each order carries the build ID; Apps Script rejects a mismatch with "prices updated — refresh"                                                                                                                                            |
| C5  | Images                       | AVIF/WebP at 400/800/1200 px via the existing optimiser; ≤ 6 images per product; only the first loads eagerly                                                                                                                                                                                               |
| C6  | Analytics events             | 4 events (add to cart, checkout start, order placed, bulk pitch shown) sent to Apps Script's Log tab — tiny volume, ₹0. Cloudflare Web Analytics for page views. **[to verify] whether Cloudflare Web Analytics supports custom events**                                                                    |
| C7  | Apps Script latency          | Instant "placing your order…" state; after ~15 s offer the WhatsApp fallback; measure real latency in the F-6 spike **[to verify]**                                                                                                                                                                         |
| C8  | Cross-origin calls           | **Finding [verified]:** v1 sends orders with `fetch(…, { mode: 'no-cors' })`, fire-and-forget — the browser **cannot read the response, so the page never knows whether the order was saved**. v2 must read a real JSON response (plain-text POST pattern to Apps Script). **[to verify] in the F-6 spike** |
| C9  | Photo upload size            | Compress in browser to ~1600 px JPEG (~300 KB each), max 5 per request **[estimate; verify Apps Script payload limits]**                                                                                                                                                                                    |
| C10 | Order refs                   | v1 refs are client-made `TK-ddMM-xxxx` (no year) **[verified]**. v2: server-made `TK2-YYMMDD-NNN`; v1 rows migrated with `channel=legacy`                                                                                                                                                                   |
| C11 | Money rules                  | Integer rupees; percentages rounded per line (rule to pick: round down vs half-up **[your call]**); order: product discount → auto tier → code → shipping → wrap; shared fixture                                                                                                                            |
| C12 | Pincode API down             | Keep v1's timeout; on failure let the customer type city/state; never block submit **[verified v1 uses `api.postalpincode.in`]**                                                                                                                                                                            |
| C13 | Sheet unreachable at publish | Publish fails; the current live site keeps serving; last good settings snapshot kept for diagnosis                                                                                                                                                                                                          |
| C14 | Preview for `v2`             | Cloudflare preview URL for non-production branches, wired to the **test** Apps Script **[to verify in S-4]**                                                                                                                                                                                                |
| C15 | Shipping Apps Script code    | TypeScript + esbuild bundle + `clasp`; owner deploys; CI tests the bundled pure logic                                                                                                                                                                                                                       |
| C16 | E2E tool                     | Playwright, mobile viewports, against the preview + test Apps Script (new dev dependency → ADR-006)                                                                                                                                                                                                         |
| C17 | Site ↔ backend agreement     | Shared pricing fixtures run against `pricing.ts` and the bundled Apps Script logic, plus one smoke order to the test Apps Script per release                                                                                                                                                                |

---

## Part D — What needs the owner's input, and when

### D1. Lock now to finalise the HLD

| #   | Decision                                                                      | Recommendation                                                |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| L-1 | Islands approach (H-1)                                                        | Preact for stateful islands, plain TS for tiny ones           |
| L-2 | Test stack (A3, C16)                                                          | Vitest + Playwright, dev-only (ADR-006)                       |
| L-3 | Apps Script written in TS, bundling shared `pricing.ts` (A4.2, C15)           | Yes, subject to a build spike                                 |
| L-4 | Backend replies must be readable — retire v1's `no-cors` fire-and-forget (C8) | Yes, subject to the F-6 spike                                 |
| L-5 | Reconfirm tier 0 for v2 after the D1 discussion                               | Tier 0 + design for D1 (A4); optional D1 learning spike later |
| L-6 | Security baseline (`SECURITY.md`)                                             | Accept                                                        |
| L-7 | Supported devices (C3)                                                        | Accept proposed default                                       |

**Inputs that help lock these:** your order-log column layout; who owns `embox.in` and the
Cloudflare account; Google account type (personal or Workspace); which Claude plan you use and
the monthly usage you're comfortable with; the phones you and stakeholders actually use.

### D2. Lock before agents start (setup phase)

A6 tracker · A9 orchestration flow + spawn depth · B1 success metrics · B4 WIP limit · B5 agent
budget · B6 runbooks · B7 account ownership.

### D3. Settle during low-level design

C1, C2, C4–C7, C9–C13, C16, C17; order-ref format; rounding rule; Q-18 discount stacking; Q-20.

### D4. Before each release / launch

B2 cut list · B8 risk owners · B9 rollback rehearsal · B10 test devices + checklist · B11
retention · B12 demos · C14 preview environment.

### D5. Parked for later phases

Stamp card (PST-3a), accounts/login, tier-1 Workers + D1, payment gateway, courier APIs,
marketplaces, multi-language.

## Sources (for verified agent-orchestration facts)

- Claude Code subagents: https://code.claude.com/docs/en/sub-agents
- Agent teams: https://code.claude.com/docs/en/agent-teams
- Parallel sessions with worktrees: https://code.claude.com/docs/en/worktrees
- Headless mode: https://code.claude.com/docs/en/headless
- GitHub Actions: https://code.claude.com/docs/en/github-actions
- Agent SDK: https://code.claude.com/docs/en/agent-sdk/overview
