# Tantu Kala v2 — CI/CD design

Version 0.1 · 10 Oct 2026 · Status: **approved for now** (owner, 10 Oct); agents refine it as work starts

Why it matters more than usual here: agents produce changes faster than a person can check by
hand, and the site will be maintained for years. CI/CD is the part of the system that checks
every change the same way, every time, for free.

## 1. Facts checked (10 Oct 2026)

- **GitHub Actions:** free and unlimited on standard GitHub-hosted runners for **public** repos
  (ours is public); larger runners always cost money — we don't use them.
- **Code scanning (CodeQL) and secret scanning:** available for all public repos; enabled by
  default for public repos. Push protection (blocks commits containing secrets) is offered for
  public repos — confirm the toggle in the repo's Advanced Security settings.
- **Cloudflare Workers Builds:** one build trigger for the production branch and one for all
  other branches; non-production pushes create **preview URLs**, including a stable branch alias
  (`<branch>-<worker>.<subdomain>.workers.dev`). Previews are **public** unless protected with
  Cloudflare Access. Exact preview command and per-trigger build variables to confirm in S-4.
- Today (v1) there is no CI workflow in the repo; only Dependabot is configured.

## 2. Pipelines

```
 PR opened/updated ──► [CI: fast checks] ──► [Preview deploy] ──► [E2E on preview] ──► review ──► owner merges to v2
 v2 → main (release PR) ──► [CI again] ──► owner merges ──► [Cloudflare production build] ──► [post-deploy smoke] ──► owner tags vX.Y.Z
 Schedules ──► nightly prod health · weekly dependency PRs (Dependabot) · monthly maintenance issues
```

### 2.1 CI on every pull request (GitHub Actions, required checks)

| Step               | What it proves                                                                       |
| ------------------ | ------------------------------------------------------------------------------------ |
| Format check       | Prettier formatting matches (`FORMATTING.md`)                                        |
| Type check         | `astro check` / TypeScript clean                                                     |
| Content validation | Products, campaigns, collections valid; minimal-product build works                  |
| Unit tests         | Pricing fixture, filters (all six CX-4 cases), cart limits, API client               |
| Apps Script tests  | Bundled pure logic (pricing, validation, formula-escaping) tested in Node            |
| Build              | Site builds                                                                          |
| SEO lint           | Titles, descriptions, canonicals, H1, alt text, sitemap, JSON-LD validity            |
| Guardrail checks   | Scope check vs task owner area, dependency-change check (needs ADR), PII/secret scan |
| CodeQL             | Code scanning for JS/TS (GitHub default setup)                                       |

Fast checks target **under ~5 minutes** so agents get quick feedback.

### 2.2 Preview deploy + end-to-end

- Every non-production branch gets a Cloudflare preview URL, built to call the **test** Apps
  Script and test Sheet (D-25) — never production data.
- Playwright runs the key journeys on Android-sized viewports against the preview:
  browse → filter → product → cart → checkout → order placed (test Apps Script) → status lookup;
  custom request; bulk pitch; free-delivery progress.
- Lighthouse (mobile) on home, catalog, product: performance, accessibility, SEO budgets (NFR-1/2, SEO-8).
- The preview link is posted on the PR so you and the design/brand agents can check it on a phone.

### 2.3 Release (CD)

1. Release PR `v2` → `main` runs the full CI again.
2. **Owner merges** — that triggers the Cloudflare production build (Workers Builds).
3. Post-deploy smoke test (GitHub Action on production URLs): key pages return 200,
   `/pricing.json` valid, sitemap reachable, **UPI payee ID equals the expected value** (T3).
4. Owner tags `vX.Y.Z`; the `release-checklist` skill prepares notes.
5. **Rollback:** promote the previous Cloudflare deployment or rebuild the previous tag —
   rehearsed once before R1 (B9).

**Apps Script** is deployed **manually by the owner** with `clasp` from the owner's machine,
after its CI tests pass. Google credentials never go into CI.

### 2.4 Scheduled jobs (free, deterministic — no AI usage)

| Schedule | Job                                                                                       | Output                                 |
| -------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| Nightly  | Production health: pages up, links unbroken, `/pricing.json` valid, payee ID unchanged    | Issue opened on failure                |
| Weekly   | Dependabot dependency PRs (already configured)                                            | PRs through normal CI                  |
| Monthly  | Open maintenance issues from `OPERATIONS.md` (SEO report, design audit, content refresh…) | Issues on the board for the lead agent |

## 3. Secrets and environments

| Environment | Branch         | Apps Script / Sheet | Who deploys                                     |
| ----------- | -------------- | ------------------- | ----------------------------------------------- |
| Local       | any            | test                | developer/agent                                 |
| Preview     | `task/*`, `v2` | test                | Cloudflare (automatic)                          |
| Production  | `main`         | production          | Cloudflare on owner merge; Apps Script by owner |

No secrets are needed in CI for tier 0: the Apps Script URLs are public by design and set as
build variables per environment. Previews stay public unless Cloudflare Access is added.

## 4. Tasks

Added to `BACKLOG.md` as CI-1…CI-5 (Phase 0/R1). Open: CI-Q1 — protect preview URLs with
Cloudflare Access (free tier, to verify) or accept that previews are public but use test data only.
