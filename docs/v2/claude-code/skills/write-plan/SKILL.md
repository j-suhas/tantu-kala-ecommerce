---
name: write-plan
description: Use after the task brief is approved, before any worker edits code. The lead writes work/<task-id>/plan.md — small steps an agent with no project context can follow, each with exact files and a verify command. Worker code edits are blocked by the gate hook until the plan has an Approved line.
---

# Write plan (gate G2) — lead only

Credits: obra/superpowers `writing-plans` (MIT), EveryInc compound `ce-plan` (MIT).

Write `work/<task-id>/plan.md` for a capable agent who has never seen this repo:

```markdown
# Plan: <task-id> — <title>
Brief: <GitHub issue link>   Agent: <tk-role>   Model: default | Opus (Opus-list reason)

## Step 1 — <verb + object>   (≈ 2–5 min)
Files: <exact paths, create | edit>  (all inside the agent's write scope)
Change: <what changes; key code/text when it matters; no "TODO", "etc." or "similar to above">
Verify: <exact command> → expected: <result>

## Step 2 — …

## Done when
- Every step verified; `verify` → Result: PASS; acceptance criteria 1–N of the brief met.

Approved: <Suhas | lead>, <date>
```

Rules:
- One step = one checkable change; tests before or with the code (`tdd`).
- Name every file the change must reach (callers, tests, fixtures, exports) — ponytail's rule:
  lazy about the solution, never about finishing the change.
- Small task → a one-step plan is fine, but the file and the `Approved:` line are still required.
- The lead writes `Approved:` only after Suhas approved the brief (or delegated approval for this
  kind of task in the decisions log).
