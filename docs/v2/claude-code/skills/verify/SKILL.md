---
name: verify
description: Use after building and before review or a PR. Runs every Tantu Kala check that applies and writes work/<task-id>/verify.md with real output and Result PASS or FAIL. The PR gate requires PASS. Never claim a check you didn't run.
---

# Verify (gate G4) — tk-qa or lead

Credits: affaan-m/ECC `verification-loop` (MIT); obra/superpowers
`verification-before-completion` (MIT) — "no completion claims without fresh evidence".

Run what applies, in this order; stop at the first failing group and fix it:

| Group | Command (repo root of the worktree) |
| --- | --- |
| Build | `npm run build` |
| Types | `npm run check` (or `npx astro check`) |
| Tests | `npm test` (report pass/fail counts) |
| Format | `npx prettier --check <changed files>` |
| CI checks | `node scripts/ci/check-scope.mjs`, `check-pii.mjs`, `check-deps.mjs` (F-7) |
| User-facing text | `node .claude/scripts/prose-lint.mjs <changed copy/markdown> --extra docs/truth/VOICE-never.txt` |
| Decisions | `node .claude/scripts/decision-check.mjs --register docs/v2/DECISIONS-LOG.md:D --register docs/v2/product/OWNER-INPUTS.md:IN` (if docs changed) |
| UI floor | `node .claude/scripts/ui-lint.mjs <page> --fonts "<fonts from DESIGN.md>"` (once Playwright is installed, ADR-006) |
| Scope | `git diff --stat origin/v2...` → only planned files |

The gate function, for every claim: name the command that proves it → run it fresh and in full →
read the whole output and exit code → only then state the result.

Write `work/<task-id>/verify.md`:

```markdown
# Verify: <task-id> (<date>)
| Check | Result | Evidence (trimmed real output) |
| --- | --- | --- |
Not checked: <check — why>
Result: PASS | FAIL
```

A regression test proves itself: run (pass) → revert the fix → run (must fail) → restore → pass.
