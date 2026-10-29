---
name: improve-skills
description: Use weekly, or when Suhas asks, to turn observations in docs/learning/observations/ into proposed improvements to skills, agent instructions and truth files. Produces proposals for Suhas; rules files change only through his review.
---

# Improve skills (weekly) — lead

Credits: rebelytics `task-observer` weekly review (CC BY 4.0); obra/superpowers `writing-skills`
(MIT).

1. List every observation file; group by skill/agent.
2. Propose a change when a group has 2+ observations or 1 correction from Suhas:
   - **Improve:** smallest wording fix.
   - **Second violation of the same rule → a barrier, not louder words:** propose a hook, check
     script or gate instead of repeating the instruction.
   - **Simplify:** remove instructions nobody needed.
   - **New skill candidate:** name, trigger, steps.
3. Skill edits follow `write-skill` (a failing case first).
4. Kit files (`docs/v2/claude-code/**`, `CLAUDE.md`, `.claude/**`) are owner-only: write the
   proposal as `docs/learning/proposals/<date>.md` with exact diffs for Suhas to apply; other
   docs go through a normal PR.
5. Move handled observations to `docs/learning/observations/archive/`. Report: proposed, applied,
   still open and why.

Never weaken a guardrail to make something pass.
