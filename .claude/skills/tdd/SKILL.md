---
name: tdd
description: Use when writing or changing logic in Tantu Kala — pricing, validation, URL builders, filters, Apps Script handlers, CI scripts — or fixing any bug. Write the failing test first, watch it fail, then the smallest code that passes.
---

# Test-driven change

Credits: obra/superpowers `test-driven-development` (MIT); DietrichGebert/ponytail (MIT).

**Rule: no logic without a test that failed first.** Pure markup and copy are exempt; anything
with a branch, loop, money, parsing, dates or security is not.

1. **Red:** write one test for the behaviour (Vitest, `tests/…`; fixtures like
   `tests/fixtures/pricing-cases.json`). Run it — it must fail for the right reason.
2. **Green:** the smallest code that passes. Reuse `src/lib` helpers; no new dependency.
3. **Run the whole suite**, not just your file. Other failures are yours to fix now.
4. **Refactor** only with the suite green.

Bug fix: first a test that reproduces the bug (fails), then the fix (passes).
Stop and start over if you wrote code before the test, or the test passed on first run.
Never cut: validation at trust boundaries, data-loss handling, accessibility.
