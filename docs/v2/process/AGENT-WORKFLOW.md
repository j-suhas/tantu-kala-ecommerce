# Tantu Kala v2 — How agents work on this repo

Version 0.4 · 12 Oct 2026 · Status: **draft**

Changelog:

- 0.4 — §2 rewritten as the enforced permission model (default-deny per role, read-only shells
  for review roles and SEO, owner-only install kit); paths updated for the docs restructure.
- 0.3 — Added design, architect, security, docs and content roles; GitHub Projects board as the
  live tracker, maintained by agents; lead plans and assigns within an owner-approved release
  scope; model/effort policy; Cowork ↔ Claude Code docs protocol (§11); roles enforced by
  `agent_type` in hooks; Android test widths.
- 0.2 — branching moved to `GIT-STRATEGY.md` (strict); guardrails in
  `AGENT-GUARDRAILS.md`; backlog status edited by the lead only; added the teaching duty (§9).

v2 is built in **Claude Code** by several agents working in parallel, like a small team.
This document is the operating manual. Every agent reads it at the start of every session.

## 1. Roles

| Role                    | Who                                     | Owns                                                                                                                                                                                                                                                                                                                                                            | Does not                                                                        |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Owner**               | Suhas                                   | Product decisions, release scope, merges to `v2`/`main`, deploys, Apps Script deployment                                                                                                                                                                                                                                                                        | —                                                                               |
| **Advisory desk**       | Claude in Cowork (outside Claude Code)  | Brainstorming, requirements, HLD, decisions log drafting, teaching — see §11                                                                                                                                                                                                                                                                                    | Run or direct Claude Code agents                                                |
| **Lead agent**          | Main Claude Code session (no `--agent`) | Plans and assigns work **within the owner-approved release scope**; **acts as business analyst** — validates every requirement and release (`validate-requirement`), owns `OWNER-INPUTS.md` and asks the owner for missing inputs (`owner-inputs`), supervises `tk-docs`; writes briefs, maintains the board, integrates, keeps backlog + decisions log current | Change scope or product decisions; merge or deploy                              |
| **Architect**           | `tk-architect`                          | Low-level design, shared contracts, ADR drafts, spikes, cross-layer PR review                                                                                                                                                                                                                                                                                   | Feature code outside contract tasks                                             |
| **Design expert**       | `tk-design`                             | New designs, audits of the design plan and built pages against UI/UX standards, improvement proposals                                                                                                                                                                                                                                                           | Edit `src/` (frontend implements)                                               |
| **Frontend agent(s)**   | `tk-frontend`                           | Astro pages, components, styles, client islands                                                                                                                                                                                                                                                                                                                 | Change data schema, pricing logic or Apps Script                                |
| **Data & config agent** | `tk-data`                               | `products.json` schema, config files, `lib/` (pricing, tags, validation), build scripts, feeds                                                                                                                                                                                                                                                                  | Visual design                                                                   |
| **Integration agent**   | `tk-apps-script`                        | `apps-script/`, Sheet schema, client fetch contracts                                                                                                                                                                                                                                                                                                            | Page layout                                                                     |
| **Content agent**       | `tk-content`                            | Product copy, alt text, SEO text, catalog tagging — from owner-supplied facts only                                                                                                                                                                                                                                                                              | Invent facts, stats or quotes                                                   |
| **QA agent**            | `tk-qa`                                 | Tests, Lighthouse/a11y checks, acceptance-criteria verification                                                                                                                                                                                                                                                                                                 | Fix features (it files findings)                                                |
| **Reviewer**            | `tk-reviewer`                           | PR review against requirements, rules and this workflow                                                                                                                                                                                                                                                                                                         | Write feature code                                                              |
| **Security reviewer**   | `tk-security`                           | Review of risk-tagged PRs and releases against `SECURITY.md`                                                                                                                                                                                                                                                                                                    | Write feature code                                                              |
| **SEO specialist**      | `tk-seo`                                | Search intents, landing-page plan, SEO audits, search test matrix and monthly report                                                                                                                                                                                                                                                                            | Promise rankings; use manipulative SEO tactics                                  |
| **Brand editor**        | `tk-brand`                              | Reviews all customer-facing text and images (brand fit, accuracy, tone, photo quality and theme); drafts `BRAND-VOICE.md`                                                                                                                                                                                                                                       | Write final copy (`tk-content` does); approve AI/stock images as product photos |
| **Docs keeper**         | `tk-docs`                               | Keeps docs in sync with merged code and decisions; traceability and contradiction checks                                                                                                                                                                                                                                                                        | Create or change decisions                                                      |

One task = one agent = one branch. The lead may run several agents at once on independent tasks.
Not every role runs every day: architect, design, security, docs and content agents are called
when a task needs them. Repeatable procedures are **skills**, not agents
(`claude-code/skills/`: `write-task-brief`, `board-update`, `release-checklist`,
`validate-requirement`, `owner-inputs`).

**Model policy (owner, 9 Oct):** quality over consumption. All role agents run on the strongest
model with high effort (`model: opus`, `effort: high` in their definitions — change to
`inherit` if your plan doesn't offer that model in Claude Code). Usage is naturally capped by the
WIP limit (review capacity) and the plan's usage windows.

**Starting sessions:** the lead is a plain `claude` session. Any hand-started worker session must
use `claude --agent tk-<role> --worktree <task-id>` so hooks know its role (`agent_type`).

## 2. Permissions and file ownership (enforced)

Machine-readable source: `.claude/hooks/policy.mjs` (from `claude-code/hooks/policy.mjs`). This
table is its human copy — change both together (owner-only). Every `tk-*` agent is **default-deny**:
it may write only inside its scope. Shared paths are further limited to the roles listed.

| Role                                                    | Tools                                                    | Write scope                                                                                                                                     | Shell     |
| ------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Lead (main)                                             | all                                                      | everything except owner-only paths                                                                                                              | guarded   |
| `tk-architect`                                          | Read, Grep, Glob, Edit, Write, Bash                      | `docs/v2/architecture/**`, `src/lib/types.ts`, `spikes/**`, `public/_headers`, `astro.config.mjs`, `tsconfig.json`                              | guarded   |
| `tk-data`                                               | Read, Grep, Glob, Edit, Write, Bash                      | `src/lib/**`, `src/config/**`, `src/data/**`, `scripts/**` (not `ci/`), `tests/**`, `public/images/products/**`, `package.json`/lock            | guarded   |
| `tk-frontend`                                           | Read, Grep, Glob, Edit, Write, Bash                      | `src/{pages,components,layouts,islands,scripts,styles}/**`, `public/**` (not `_headers`, `images/products/`), `tests/**`, `tailwind.config.mjs` | guarded   |
| `tk-apps-script`                                        | Read, Grep, Glob, Edit, Write, Bash                      | `apps-script/**`, `tests/**`                                                                                                                    | guarded   |
| `tk-qa`                                                 | Read, Grep, Glob, Edit, Write, Bash                      | `tests/**`, `e2e/**`, `scripts/ci/**`, test-tool configs, `package.json`/lock                                                                   | guarded   |
| `tk-design`                                             | Read, Grep, Glob, Edit, Write, Bash                      | `docs/design/**` (not `BRAND-VOICE.md`), `docs/v2/standards/MOBILE-UX-STANDARD.md`                                                              | guarded   |
| `tk-brand`                                              | Read, Grep, Glob, Edit, Write                            | `docs/design/BRAND-VOICE.md`                                                                                                                    | none      |
| `tk-content`                                            | Read, Grep, Glob, Edit, Write                            | `src/data/products.json`, `src/content/**`                                                                                                      | none      |
| `tk-seo`                                                | Read, Grep, Glob, Edit, Write, Bash, WebSearch, WebFetch | `docs/v2/standards/SEO.md`, `docs/v2/reports/seo/**`                                                                                            | read-only |
| `tk-docs`                                               | Read, Grep, Glob, Edit, Write, Bash                      | `docs/**` (minus the lead-only and owner-only docs below), root `README.md`                                                                     | read-only |
| `tk-security`                                           | Read, Grep, Glob, Edit, Write, Bash                      | `docs/v2/standards/SECURITY.md`                                                                                                                 | read-only |
| `tk-reviewer`                                           | Read, Grep, Glob, Bash                                   | none                                                                                                                                            | read-only |
| Built-in agents (Explore, Plan, general-purpose, forks) | as Claude Code gives them                                | none                                                                                                                                            | read-only |

**Shared paths** (only these roles, even if inside someone's scope):

| Path                                                                                                                    | Roles                                    |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `docs/v2/DECISIONS-LOG.md`, `product/BACKLOG.md`, `product/OWNER-INPUTS.md`, `templates/`, `archive/`, `docs/learning/` | lead                                     |
| `docs/v2/architecture/**`                                                                                               | lead, architect, docs                    |
| `docs/v2/standards/SECURITY.md` · `SEO.md` · `MOBILE-UX-STANDARD.md`                                                    | lead, security · seo · design; + docs    |
| `docs/design/**` · `docs/design/BRAND-VOICE.md`                                                                         | lead, design · brand; + docs             |
| `src/data/products.json`                                                                                                | lead, data (schema), content (copy/tags) |
| `src/lib/types.ts` (shared contract)                                                                                    | lead, architect, data                    |
| `src/config/**` (UPI ID, prices) · `public/images/products/**`                                                          | lead, data                               |
| `public/_headers` (CSP/HSTS) · `astro.config.mjs` · `tsconfig.json`                                                     | lead, architect                          |
| `scripts/ci/**` (guardrail checks)                                                                                      | lead, QA                                 |
| `apps-script/**`                                                                                                        | lead, integration                        |
| `package.json` / `package-lock.json`                                                                                    | lead, data, QA                           |

**Owner-only** (nobody through Claude Code, lead included): `CLAUDE.md`, `AGENTS.md`, `.claude/`,
`.github/`, `.git/`, `.env*`, `wrangler.jsonc`, `docs/v2/claude-code/`, and
`docs/v2/process/{AGENT-WORKFLOW,AGENT-GUARDRAILS,GIT-STRATEGY}.md`. Also blocked by deny rules in
`.claude/settings.json`. CODEOWNERS additionally requires the owner's review for `src/config/`,
`public/_headers`, `scripts/ci/`, `apps-script/`, `package.json`/lock and the decisions log.

**Shell levels.** _Guarded_: the shell works, but `guard-bash` blocks pushes to `main`/`v2`, tags,
merges, deploys, remote/settings changes, history rewrites, `.env` access, dependency installs by
workers, and shell writes to protected files. _Read-only_: only commands on the read-only list in
`policy.mjs` (git log/diff/show/status/fetch, `gh pr view/diff/checks`, grep/find/cat, `npm test`,
`npm run lint|check|test…`, `npm audit|ls`); no redirection or command substitution.

**No agent spawns agents.** Worker tool lists leave out `Agent`, so only the lead delegates.

**Limits (be honest about them):** hooks see only Edit/Write/NotebookEdit and Bash/PowerShell calls.
A guarded shell can still write files with a script the hook can't read; the CI scope check and
CODEOWNERS catch that at PR time (`AGENT-GUARDRAILS.md` #23). Unknown or misnamed `agent_type`
values are treated as read-only. A hand-started worker without `--agent` is treated as the lead (#21).

Shared contracts (types in `src/lib/types.ts`, API shapes in `architecture/lld/LLD-05-API-CLIENT.md`) change only
through a dedicated contract task, merged before dependent tasks start.

## 3. Branches and worktrees

Defined strictly in `GIT-STRATEGY.md`. In short: never commit to `main` or `v2`; one task =
one `task/<task-id>-<slug>` branch in its own git worktree; PR into `v2`; the owner merges.

## 4. Task lifecycle

1. **Ready** — the lead writes a task brief (`templates/TASK-BRIEF.md`) as a GitHub issue (skill `write-task-brief`): requirement IDs, quoted decisions, files, dependencies, acceptance criteria. A task is Ready only when all dependencies are merged and no open question blocks it.
2. **Claimed** — the lead assigns it to a role agent and moves the card to _In progress_ with the branch name (skill `board-update`).
3. **Plan** — before coding, the agent writes a short plan in the PR description draft: approach, files touched, risks. Stop and ask if the plan needs a file outside the brief.
4. **Build** — small commits, conventional messages (`feat(CHK-1): …`, `fix(…)`, `docs(…)`, `test(…)`).
5. **Self-check** — run what the Definition of Done requires (§6). Paste real command output, not a summary of it.
6. **PR** — open against `v2` using `templates/PR.md`; link requirement IDs; include screenshots (mobile 360–412 px Android + desktop) for UI.
7. **Review** — `tk-reviewer` reviews; `tk-qa` verifies acceptance criteria. Findings go back to the author.
8. **Merge** — owner merges. The lead updates `BACKLOG.md` (Done), and docs if anything changed.
9. **Handoff** — the agent leaves `templates/HANDOFF.md` notes in the PR: what's done, what's not, surprises, follow-ups.

## 5. Definition of Ready / Done

**Ready:** requirement IDs linked · **context notes (CX-…) and the exact decision-log entries quoted in the brief** · acceptance criteria testable · dependencies merged · files listed · open questions answered or explicitly assumed (and labelled).

**Context rule:** an agent must be able to explain _why_ its requirement exists. If the brief
doesn't say, the agent asks before coding. The reviewer rejects PRs that meet the letter of a
requirement but miss its context (e.g. filters that pass a test but still hide products in a CX-4 case).

**Done:**

- [ ] Acceptance criteria met and demonstrated (test, screenshot or command output)
- [ ] `astro check` / TypeScript clean; build passes; content validation passes
- [ ] Unit tests for any `lib/` logic; pricing changes run the shared pricing fixture
- [ ] Mobile (360–412 px Android) checked; tap equivalents for hover; reduced motion respected
- [ ] Formatted with the repo's Prettier (`npm run format:check` passes); no formatting-only changes mixed into logic changes (`FORMATTING.md`)
- [ ] SEO lint passes for any page template touched (SEO-8)
- [ ] No new dependency, paid service or server (else an ADR approved by the owner)
- [ ] "Add a product = one JSON entry + images" still true
- [ ] Docs updated if behaviour, schema or config changed
- [ ] Handoff note written

## 6. Rules every agent follows

1. Read `CLAUDE.md`, `docs/v2/README.md`, the relevant requirement IDs and ADRs before starting.
2. **Accuracy:** state only what you read, ran or measured. Label assumptions as assumptions. Never claim a test passed without running it. If you're unsure, say so in the handoff.
3. **Scope:** do only the task. Spot something else? Add it to the handoff as a follow-up; don't fix it in passing.
4. **Decisions:** you may propose; only the owner decides. Never write "Decided" in docs or the log.
5. **No deploys, no pushes to `main`, no Apps Script deployments, no secrets in the repo.**
6. **Cost:** nothing that adds a recurring cost or a server. Tier-1 functions are out of scope for v2.0.
7. **Customer data:** never put real customer data in code, tests, fixtures or screenshots.
8. Stuck for more than one attempt on the same error? Stop, write what you tried, and hand back.

## 7. Communication

- The lead is the single point of contact with the owner. Agents ask questions through their handoff note or PR, not by editing decisions.
- Cross-agent dependencies are stated in `BACKLOG.md`; if a contract must change, the lead creates a contract task.
- Daily (or per session) the lead posts a short status in `BACKLOG.md` → "Status log".

## 8a. Branching and guardrails

Follow `GIT-STRATEGY.md` exactly and read `AGENT-GUARDRAILS.md` once per session. If a hook
blocks you, do **not** look for another way to run the command — report it in the handoff.

## 9. Teaching duty (the owner is learning to lead)

Suhas is using v2 to grow as a lead engineer. Therefore:

- Every handoff note includes a short **"Lesson for the lead"**: one concept this task
  illustrates, what a lead should check, and any mistake made (including the agent's own).
- The lead agent turns the useful ones into dated entries in `docs/learning/LEAD-ENGINEER-JOURNAL.md`
  (git-ignored, never committed) at each checkpoint: decisions, ADRs, merged PRs, incidents,
  phase releases.
- When asking the owner to decide something, explain the trade-off in plain words first.
- Never hide or soften a mistake to look good; mistakes are the best teaching material.

## 10a. Planning and tracking (owner decision, 9 Oct)

- **Live tracker:** a GitHub Projects board (Inbox → Ready → In progress → In review → Done,
  plus Blocked), maintained by agents through the `gh` CLI. The owner checks it like a Jira board.
  `BACKLOG.md` is the release plan, not live status.
- **Owner approves the release scope** (which requirement IDs are in R1, R2…). Within that scope
  the **lead decides** task breakdown, order and assignment, using the `write-task-brief` skill
  and the WIP limit.
- **Human gates:** release scope · product/decision questions (lead asks, owner answers) · merges.
- **Status cadence:** the lead runs `board-update` at the start and end of every session and
  posts a summary on the release tracking issue.
- **Access:** agents use a GitHub token limited to this repo (issues, PRs, project board, push
  to `task/*` branches). No admin rights. Identity: machine account `tantu-kala-bot` with a classic
  `repo` + `project` token (D-70, `claude-code/INSTALL.md` §1b).

## 11. Cowork advisory desk ↔ Claude Code (docs protocol)

The owner also works with Claude in Cowork for brainstorming, requirements, design discussion and
teaching. To keep one source of truth:

- **The repo's docs are the shared memory.** Cowork doesn't see Claude Code sessions; Claude Code
  doesn't see Cowork chats. Anything decided in Cowork exists for agents only once it is in
  `docs/v2/DECISIONS-LOG.md` and the affected docs on the `v2` branch.
- **Before agents start (now):** Cowork edits docs directly in the working copy; the owner commits them (S-2).
- **After agents start:** Cowork writes doc changes on a `v2/docs-<topic>` branch (or hands the
  owner a patch); the owner opens a PR into `v2`. Cowork never edits files an agent's open PR is
  changing. The lead agent pulls `v2` before planning, so new decisions reach the next briefs.
- **Each Cowork session starts** by reading `git log` on `v2`, the board summary and the decisions
  log — so advice reflects what agents actually built.
- `tk-docs` keeps docs in sync with _code_; Cowork keeps docs in sync with _decisions_. Conflicts
  go to the owner.

## 12. Changing this process

Process changes are proposed by the lead, approved by the owner, recorded in the decisions log,
and this file's version bumped.
