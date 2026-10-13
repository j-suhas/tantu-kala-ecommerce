# ADR-002: Freeze v1 as a tag; build v2 on a branch in the same repo

- Status: **Accepted, partly executed.** Tag `v1.0.0` on `10cde35` and Release
  "v1.0.0 — Rakhi 2026 MVP (static catalog + Direct UPI)" published 6 Oct 2026 (verified via
  the GitHub API). Still to do: tag ruleset, `v2` branch, `main` protection.
- Context: v1 is live and must stay recoverable; v2 changes are large but the product and goal
  are the same. Repo: `j-suhas/tantu-kala-ecommerce`; v1 head on `origin/main` = `10cde35`
  (as of last local fetch).
- Decision:
  1. Annotated tag `v1.0.0` on the v1 head + GitHub Release "v1.0.0 — Rakhi 2026 MVP".
  2. Tag ruleset on `v*`: block deletion and updates.
  3. `main` remains production (v1) until v2 launch; protected (PRs only).
  4. `v2` long-lived integration branch; task branches `task/<task-id>-<slug>` (amended 13 Oct, D-71: git can't hold `v2` and `v2/…` branches at once); agents use git worktrees.
  5. v1 hotfixes: on `main`, tagged `v1.0.x`, merged into `v2`.
  6. At launch: optional protected `release/v1` from the last v1 tag; merge `v2` → `main`; tag `v2.0.0`.
- Update (6 Oct 2026): v2 ships in phase releases R1–R4 (`v2.0.0`…`v2.3.0`) rather than one
  big merge; the strict rules are in `docs/v2/process/GIT-STRATEGY.md`.
- Rejected: a new repository (loses history, PRs, issues and deploy setup for the same product).
