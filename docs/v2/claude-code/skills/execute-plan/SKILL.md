---
name: execute-plan
description: Use when the lead runs an approved plan. One fresh role agent per step with exactly the context it needs; small decisions logged as rulings; stops only for the four reasons below; ends with verify and review-task.
---

# Execute plan (gate G3) — lead

Credits: obra/superpowers `subagent-driven-development` (MIT); Anthropic multi-agent research
post (delegation rules).

For each step:
1. Delegate to the plan's `tk-*` agent (never a built-in agent — they can't write). Give it: the
   step text, the acceptance criteria it serves, the truth files, exact file paths, the task
   branch. Not your conversation history. Use the agent's own model (D-72) unless the plan says
   Opus.
2. The agent runs the step's Verify and reports real output. Check: only listed files changed?
   Verify passed? One retry with the failure; after two failed attempts stop and report.
3. At most two agents at once (D-72).

**Rulings, not stalls.** Small ambiguities are decided and logged in
`work/<task-id>/rulings.md`: `Ruling: <decided> — <why> — <cost if wrong>`.

**Only four things stop the run:** something irreversible; something security-sensitive; a side
effect outside the task branch (merge, push to `v2`/`main`, publish, post, message, pay); a plan
so broken every path is a guess. Everything else continues.

After the last step: `verify` (tk-qa) → `review-task` (tk-reviewer, tk-security if risky) → PR.
Suggest `/clear` or a compact checkpoint to Suhas between tasks (`compact-checkpoint`).
