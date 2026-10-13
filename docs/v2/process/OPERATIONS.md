# Tantu Kala — Operations and long-term maintenance (agent roster over the years)

Version 0.1 · 10 Oct 2026 · Status: **approved** (owner, 10 Oct)

Every agent role exists for **recurring work after launch**, not only for building v2. This doc
maps the work you'll delegate for years to the role that does it and the trigger that starts it.
Recurring jobs are opened as GitHub issues by a monthly scheduled workflow (`CI-CD.md` §2.4), so
nothing depends on anyone remembering.

## 1. Roster (who does what, for years)

| Role                                       | Recurring maintenance work                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Owner (Suhas)                              | Release scope, product decisions, merges, Apps Script deploys, monthly review of the board and dashboard |
| Advisory desk (Cowork)                     | New-phase brainstorming, decisions log, teaching notes                                                   |
| Lead agent                                 | Turns issues into briefs, plans, assigns, keeps the board current                                        |
| `tk-architect`                             | Dependency/platform upgrades plan, tier-1 migration when signals fire, ADRs                              |
| `tk-design`                                | New pages/blocks, seasonal visual refresh, design audits                                                 |
| `tk-frontend`, `tk-data`, `tk-apps-script` | Building and fixing                                                                                      |
| `tk-content`                               | Writes product copy, page and block text, festival copy, guides                                          |
| `tk-brand`                                 | Reviews all customer-facing text **and images** for brand fit, accuracy and quality before release       |
| `tk-seo`                                   | Search intent plan, audits, monthly search report                                                        |
| `tk-qa`, `tk-reviewer`, `tk-security`      | Verification on every change; security review before every release                                       |
| `tk-docs`                                  | Keeps docs true after every merge batch                                                                  |

**Possible future role:** `tk-analyst` — monthly business review and festival retrospectives
from an **anonymised** dashboard export (no phones or addresses). Add when the dashboard exists
(R3), following §3.

## 2. Maintenance calendar

| When                          | Work                                                                                                            | Roles                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Every change                  | CI + reviews (`CI-CD.md`)                                                                                       | QA, reviewer, security (risk-tagged) |
| Every new product             | Copy + tags → brand review → publish                                                                            | content → brand → owner              |
| Weekly                        | Dependabot PRs reviewed and merged                                                                              | reviewer, owner                      |
| Monthly                       | Search report + test matrix; dashboard review; board grooming                                                   | seo, owner, lead                     |
| ~6 weeks before each festival | Campaign page + copy + images refresh; capacity cap; cutoff dates                                               | content, design, brand, data         |
| After each festival           | Retrospective: numbers vs target, what to change                                                                | owner, lead, Cowork                  |
| Quarterly                     | Dependency/platform upgrade plan; design audit of live pages; docs consistency sweep; security checklist re-run | architect, design, docs, security    |
| Yearly                        | Requirements/strategy review (tier-1 signals, new channels), account security check                             | owner, Cowork, architect             |

## 3. Adding a new agent role later

1. Name the recurring work it takes off your plate and the trigger.
2. Check it isn't a **skill** (a fixed procedure) rather than a role (needs judgment).
3. Write its definition (`tools`, `model`, `effort`, `isolation`), its file permissions in
   `guard-files`, and its row in `AGENT-WORKFLOW.md` §1–2 and this doc.
4. Run one dummy task through the hooks before real work.
