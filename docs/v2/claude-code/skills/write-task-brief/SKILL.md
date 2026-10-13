---
name: write-task-brief
description: Turn a Tantu Kala v2 backlog item into a Ready task brief and GitHub issue — requirement IDs, quoted decisions, context notes, files, dependencies, testable acceptance criteria. Use when the lead plans the next tasks.
---

1. Read the requirement rows in `docs/v2/product/REQUIREMENTS.md`, the context notes (§1a) and the
   decision register in `docs/v2/DECISIONS-LOG.md`.
2. Fill `docs/v2/templates/TASK-BRIEF.md`:
   - Quote the full decision entries word for word, with dates. Don't paraphrase.
   - List exact files to create/edit and files not to touch (check the ownership map in
     `docs/v2/process/AGENT-WORKFLOW.md` §2 and work in progress for overlaps). Every file must be
     inside the assigned agent's write scope — if not, split the task by role (the hooks will
     block it anyway).
   - Point to the LLD section that designs this work (`docs/v2/architecture/lld/`).
   - Acceptance criteria must be testable by the QA agent; include stakeholder concerns (e.g. CX-4 cases).
   - Label every assumption.
3. Definition of Ready check (AGENT-WORKFLOW §5). If anything fails, the task stays in _Inbox_
   with the blocking question listed.
4. Create/update the GitHub issue (title `[<ID>] <summary>`, labels: role, release, risk) and
   put it in _Ready_ on the project board.
