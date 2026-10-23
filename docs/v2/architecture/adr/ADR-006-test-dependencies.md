# ADR-006: Test dependencies (Vitest now, Playwright later)

- Status: **Proposed**, for the owner to approve (drafted by the lead, 23 Oct 2026)
- Context: D-28 (9 Oct, decided) says "L-2: Vitest + Playwright, dev-only (ADR-006 to write)".
  `SECURITY.md` T9 says new dependencies need an ADR, and that installs use a lockfile and
  `npm ci`. F-7 (PR #29) adds `vitest` to `package.json` for the CI check scripts, but
  `package-lock.json` is not regenerated and the guardrail hooks block `npm install` for agents.
  So `npm ci` fails on that branch until the owner approves and regenerates the lockfile.
  Today `package.json` has no test runner at all.
- Options:
  - (A) **Vitest now; Playwright added with the first end-to-end task** (proposed).
  - (B) Vitest and Playwright both now.
  - (C) No test dependency: Node's built-in test runner (`node --test`). This has no install step
    but, as far as the lead knows, lacks the TypeScript and watch ergonomics the A3 stack chose
    Vitest for (assumption, not measured here).
- Proposal: **A.**
  - **Vitest** (dev-only) runs the pure-logic unit tests: pricing, tags, validation, and the F-7
    check scripts. F-7 pins `^2.1.9`; the owner or lead may choose another version when
    regenerating the lockfile.
  - **Playwright** (dev-only) is approved in principle (D-28, `LEAD-QA.md` C16: mobile viewports
    against the preview and the test Apps Script). It is **not** installed until a task needs it
    and the preview setup (S-4 / CI-2) exists, so the lockfile stays small until then.
  - Neither ships to customers: both are `devDependencies` and add no JavaScript to the site
    (hard rule 4).
- Not decided here: **Prettier** and its Astro plugin (IN-15, still open), and `typescript` /
  `@astrojs/check` (not yet proposed). Each needs its own approval. `format:check` in F-7 will
  fail until Prettier is approved.
- Consequences:
  - ₹0 recurring cost (rule 2). Cost is maintenance: more packages to update, with Dependabot PRs
    reviewed (T9).
  - Supply-chain exposure grows by Vitest's dependency tree (size not measured here). Mitigation
    from T9: committed lockfile, `npm ci` in CI, exact versions through the lockfile, reviewed
    updates.
  - F-7's `npm test` and CI install step work once the lockfile is regenerated.
  - Playwright will download browser binaries when first installed (size not measured here).
- Owner steps if approved (agents cannot do these):
  1. On `task/F-7-test-harness`, run `npm install` and commit the updated `package-lock.json`.
  2. Record the decision as the next free ID in `docs/v2/DECISIONS-LOG.md` (the lead does this;
     D-84 if PR #22 merges first, because it uses D-73…D-83) and set this ADR to **Accepted**.
- Revisit: when the first end-to-end task is written (install Playwright), or if Vitest
  maintenance becomes a burden (fall back to option C).
