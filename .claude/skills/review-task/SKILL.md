---
name: review-task
description: 'Use after verify passes. tk-reviewer (plus tk-security for risky changes) reviews with only the brief, plan, verify report and diff — first spec fit, then quality — and returns the text the lead saves as work/<task-id>/review.md. The PR gate requires "Verdict: approve".'
---

# Review task (gate G5)

Credits: obra/superpowers two-stage review and `requesting-code-review` (MIT);
DietrichGebert/ponytail review (MIT); Anthropic `pr-review-toolkit`.

Inputs only: the task brief, `plan.md`, `verify.md`, `git diff origin/v2...` (or `gh pr diff`),
the truth files. No author explanations.

**Pass 1 — spec fit.** Each acceptance criterion: met / not met / can't tell, with file:line.
Anything built that the brief didn't ask for is a finding.

**Pass 2 — quality.**
- Correctness and safety: validation at trust boundaries, error handling, no secrets or personal
  data, UPI/prices untouched unless the task says so, accessibility and reduced motion kept.
- Smallest sufficient change: reused what exists? unused code, options nobody asked for?
- Human quality: copy and UI read as made by a careful person (`humanize`, `design-gates`).
- Cost: anything expensive to run or maintain, any new dependency.

Return:

```markdown
# Review: <task-id>
Spec fit: <n>/<N> met
Findings (ranked):
1. MUST — file:line — why — fix
2. SHOULD — …
3. OPTIONAL — …
Not reviewed: <what, why>
Verdict: approve | request changes
```

No generic praise; no "consider…" without a reason. Suhas still merges.
