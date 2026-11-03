---
name: compact-checkpoint
description: Use at natural breakpoints in a long Tantu Kala session — after research, after a plan is written, after a task merges, after a failed approach — to decide whether to suggest /compact or /clear to Suhas, and what must be written down first.
---

# Compact checkpoint (token budget, D-72)

Credits: affaan-m/ECC `strategic-compact` (MIT).

| Moment | Suggest | Why |
| --- | --- | --- |
| Research → plan written | `/compact` | The plan file holds what matters |
| Plan → building | `/compact` | Free room for code |
| Task merged → next task | `/clear` | Unrelated context costs on every message |
| After a failed approach | `/compact` | Drop the dead end |
| Mid-step | No | Paths and partial state would be lost |

Before suggesting: make sure decisions are in files (brief, plan, rulings, handoff, owner
inputs). Then tell Suhas in one line, e.g. "Good point to /clear — the F-9 plan and rulings are
saved." He runs the command; agents can't.
