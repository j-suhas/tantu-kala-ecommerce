---
name: truth-file
description: Use to create or refresh Tantu Kala's one-page truth files in docs/truth/ — PRODUCT.md, DESIGN.md, VOICE.md (+ VOICE-never.txt) — after a release, a batch of decisions, or when agents keep reading whole doc trees. Every agent reads these first.
---

# Truth files (tk-docs or lead; Suhas approves)

Credits: pbakaus/impeccable `PRODUCT.md` (Apache-2.0); Google Stitch `design-md`; BMAD project
context.

Rules: each file ≤ 120 lines; facts only; every rule cites its decision ID; a truth file never
adds a decision — new facts go to the owner inputs first.

- **PRODUCT.md** — what Tantu Kala is; who buys (situations, devices); what we sell (crafts,
  made to order, typical lead times); prices/shipping/offers as decided; how ordering and payment
  work; hard rules; current release and goal; out of scope; open inputs (IN-numbers).
- **DESIGN.md** — tokens (colours with hex, fonts, type scale, spacing, radius), components,
  photography registers, the design-gates Floor, banned defaults, allowed fonts list.
- **VOICE.md** — tone in three lines; words we use; words we never use; three before/after
  examples. **VOICE-never.txt** — one never-use word or phrase per line (read by prose-lint).

Refresh: compare against `docs/v2/DECISIONS-LOG.md` and the source docs; bump the date line; run
`decision-check`; open a PR for Suhas.
