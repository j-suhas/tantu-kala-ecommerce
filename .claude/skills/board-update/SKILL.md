---
name: board-update
description: Keep the Tantu Kala GitHub Projects board accurate — move cards, add status comments, post the session summary. Use at the start and end of every lead session and whenever a task changes state.
---

Board columns: Inbox → Ready → In progress → In review → Done (plus Blocked).
Fields: Release (R1–R4), Role, Risk (low/medium/high), Requirement IDs.

1. Sync: list open issues and PRs (`gh issue list`, `gh pr list`); every PR links its issue.
2. Move cards to match reality: branch pushed → _In progress_; PR open → _In review_;
   merged → _Done_; waiting on an owner answer → _Blocked_ with the question as a comment.
3. WIP limit: no more items _In progress_ than the owner's review capacity (default 2).
4. End of session: one comment on the release tracking issue —
   done today · in review (with links) · blocked (with the question) · next planned.
5. Never close an issue the owner hasn't accepted; never edit the decisions log from here.
