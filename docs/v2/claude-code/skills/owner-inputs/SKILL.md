---
name: owner-inputs
description: Keep docs/v2/product/OWNER-INPUTS.md current and ask the owner for what's missing — at the start of each lead session, whenever a task is blocked on the owner, and after each release.
---

1. **Collect:** blocked board cards, `validate-requirement` findings, open ADRs, agents' handoff
   questions → one row each in `docs/v2/product/OWNER-INPUTS.md` (no duplicates; link the blocking task).
2. **Rank:** what blocks the current release first, then the next release, then later.
3. **Ask:** at most 3 questions per session, each with: why it matters, what it blocks, options,
   a recommended default. Plain language; one question per item.
4. **Record:** answer → decision entry in `docs/v2/DECISIONS-LOG.md` → row moves to "Recently
   answered" with the decision ID → affected docs updated (via `tk-docs`) → blocked cards unblocked.
5. **Chase:** an item past its "needed by" point is raised first next session; never apply a default
   the owner hasn't accepted.
