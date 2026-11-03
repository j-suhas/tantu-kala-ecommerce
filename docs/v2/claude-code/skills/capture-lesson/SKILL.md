---
name: capture-lesson
description: Use at the end of any Tantu Kala task, and whenever Suhas corrects an agent, a check or hook catches something, or the work took a non-obvious turn. Records one observation so skills and instructions improve over time.
---

# Capture lesson

Credits: rebelytics/one-skill-to-rule-them-all `task-observer` (CC BY 4.0, Eoghan Henn and
contributors); EveryInc compound `ce-compound` (MIT).

**Workers:** add a block to your handoff (`work/<task-id>/handoff.md` or your final message):

```markdown
### Observation
kind: correction | repeated-pattern | judgement-call | check-caught | new-skill-candidate
skill/agent: <name | none>
what happened: <2–3 lines, facts only>
what should change: <one line>
evidence: <file:line, command output, or Suhas's words>
```

**Lead:** save each block as `docs/learning/observations/<yyyy-mm-dd>-<slug>.md` (git-ignored,
outside worktrees, survives sessions), and keep the existing "Lesson for the lead" journal entry.

Durable project knowledge (a non-obvious fix future agents need, not visible from code or docs)
goes to `docs/v2/learnings/<slug>.md` via tk-docs — one learning per file.

Skip routine work. Never record customer data or secrets. Suhas's corrections are always logged,
word for word where possible.
