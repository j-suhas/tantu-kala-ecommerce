# Tantu Kala v2 — documentation index

**Status:** living draft (v0.2, 12 Oct 2026). Nothing here is final until marked **Decided** in
`DECISIONS-LOG.md`.

Changelog: 0.2 — docs grouped into folders by purpose (`product/`, `architecture/`, `standards/`,
`process/`); decisions log moved here from `docs/`; design files moved to `docs/design/`.

v2 turns the v1 rakhi-season site into a year-round, low/no-cost storefront for a handmade
crochet, macramé and pipe-cleaner gifting brand, built by **multiple Claude Code agents working in
parallel**, coordinated by Suhas (owner) and a lead agent.

## Folder map

```
docs/v2/
  README.md            this index
  DECISIONS-LOG.md     the only record of what the owner decided (source of truth)
  product/             what to build and why: REQUIREMENTS, METRICS, BACKLOG, OWNER-INPUTS, LEAD-QA
  architecture/        how it's built: ARCHITECTURE, SYSTEM-DESIGN, adr/, lld/
  standards/           rules every change must meet: SECURITY, SEO, MOBILE-UX-STANDARD, FORMATTING
  process/             how agents work: AGENT-WORKFLOW, GIT-STRATEGY, AGENT-GUARDRAILS, CI-CD, OPERATIONS
  templates/           task brief, handoff note, PR description
  claude-code/         install kit for the v2 branch (CLAUDE.md, agents, hooks, skills, settings, CODEOWNERS, CI)
  archive/             superseded docs, kept for history only — never a source of truth
```

Design lives in `docs/design/` (system, brand, mockups, concepts). Learning notes live in
`docs/learning/` (git-ignored).

## Read in this order

| #   | Doc                                                   | What it answers                                                       | Who must read it                              |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| 1   | `CLAUDE.md` (from `claude-code/CLAUDE.v2.md` on `v2`) | Hard rules every agent obeys                                          | Everyone                                      |
| 2   | `DECISIONS-LOG.md`                                    | What the owner decided, and why                                       | Everyone                                      |
| 3   | `product/REQUIREMENTS.md`                             | What v2 must do (IDs, priorities, acceptance criteria, context notes) | Everyone                                      |
| 4   | `architecture/ARCHITECTURE.md`                        | Components, data model, Sheets, Apps Script API                       | Everyone building                             |
| 4b  | `architecture/SYSTEM-DESIGN.md`                       | Frontend + backend choices, failure modes, tier-1 evolution           | Everyone building                             |
| 4c  | `architecture/lld/`                                   | Low-level design, one file per area                                   | Everyone building                             |
| 4d  | `architecture/adr/`                                   | Why key architecture decisions were made                              | When touching that area                       |
| 5   | `process/AGENT-WORKFLOW.md`                           | How agents take, build, review and hand off work; file ownership      | Every agent, every session                    |
| 5b  | `process/GIT-STRATEGY.md`                             | Strict branching, commit and PR rules                                 | Every agent, every session                    |
| 5c  | `process/AGENT-GUARDRAILS.md`                         | How agents can break rules and the layered controls that stop them    | Lead, reviewer, owner                         |
| 5d  | `process/CI-CD.md`                                    | PR checks, previews, E2E, release, rollback, schedules                | Lead, QA, owner                               |
| 5e  | `process/OPERATIONS.md`                               | Long-term maintenance: roster, calendar, adding a new agent role      | Owner, lead                                   |
| 6   | `standards/SECURITY.md`                               | Threat model, controls, owner security checklist                      | Everyone; reviewer checks every PR against it |
| 6b  | `standards/MOBILE-UX-STANDARD.md`                     | Mobile-first rules and test matrix                                    | Design, frontend, QA                          |
| 6c  | `standards/SEO.md`                                    | Search intents, landing pages, SEO + AI-search rules, search tests    | SEO, content, frontend, QA                    |
| 6d  | `standards/FORMATTING.md`                             | One formatting standard for owner, agents and Cowork                  | Everyone                                      |
| 7   | `product/METRICS.md`                                  | How the business is measured; dashboard spec                          | Data/Apps Script agents, owner                |
| 7b  | `product/OWNER-INPUTS.md`                             | Every input still needed from the owner, ranked, with defaults        | Owner, lead (asks from it every session)      |
| 7c  | `product/LEAD-QA.md`                                  | Answers to the owner's and Claude's lead/engineering questions        | Owner, lead                                   |
| 8   | `product/BACKLOG.md`                                  | The work, grouped into phase releases R1–R4                           | Lead, every agent before starting             |
| 9   | `templates/`                                          | Task brief, handoff note, PR description                              | Every agent                                   |
| 10  | `claude-code/` + `claude-code/INSTALL.md`             | What to install on `v2` and how                                       | Owner, lead                                   |

## Related docs outside this folder

- `docs/design/` — `DESIGN-SYSTEM.md`, `BRAND-RESEARCH.md`, `DESIGN-CHANGES.md`, `mockups/`
  (10 approved page mockups), `concepts/` (playful-idea samplers; only "Keep"/"Adapt" items are
  in scope), `moodboard.html`. `BRAND-VOICE.md` will be added there by `tk-brand` (task BR-1).
- `docs/v2/archive/IMPLEMENTATION-CHANGES.md` — folded into `product/REQUIREMENTS.md` and
  `architecture/`; where they disagree, the newer docs win.
- v1 docs (`docs/DEPLOY-cloudflare.md`, `docs/SETUP-*.md`, `docs/PRODUCT-EVOLUTION.md`) stay where
  they are because they are tracked on `main`.

## How these docs are maintained

- Requirements, architecture and backlog are updated whenever a brainstorm or review changes
  them. Each edit bumps the version line at the top of the file and adds a changelog line.
- A change only becomes **Decided** after Suhas confirms it in conversation; the lead then records
  it in `DECISIONS-LOG.md` and updates the affected docs in the same commit.
- Agents never mark their own proposals as decided.
- Paths in docs are written from the repo root (`docs/v2/product/REQUIREMENTS.md`) so they stay
  valid wherever they are quoted; a bare file name (`REQUIREMENTS.md`) is fine in prose.
