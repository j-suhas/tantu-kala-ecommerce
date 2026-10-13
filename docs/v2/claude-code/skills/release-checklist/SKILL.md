---
name: release-checklist
description: Prepare a Tantu Kala v2 phase release (R1–R4) for the owner — acceptance status, security review, preview checks, UPI payee check, rollback readiness, release notes. Use when all tasks of a release are merged into v2.
---

Produce a release report for the owner; the owner merges `v2` → `main` and tags.

1. Acceptance: every requirement ID in the release → pass/fail with evidence (from QA).
2. Reviews: tk-security sign-off; tk-design audit of changed pages; tk-docs sync done.
3. Preview checks (owner does these on real phones; list them as a checklist):
   - Key journeys on 2+ Android phones incl. Instagram and WhatsApp in-app browsers
   - **Scan the live UPI QR / open the UPI link and confirm the payee name and ID**
   - Place one test order against the **test** Apps Script; confirm the Sheet row and reply
4. Rollback: name the last good tag and the exact rollback steps; confirm they were rehearsed once.
5. Release notes: what changed for customers, for the owner, known issues.
6. Lessons: draft a short retrospective entry for `docs/learning/` (lead adds it).
