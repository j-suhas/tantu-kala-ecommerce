# Tantu Kala v2 — Low-level design (LLD)

Status: **in progress** (started 11 Oct 2026). One file per area. Each file ends with the
decisions it needs from the owner; once decided they move to `docs/v2/DECISIONS-LOG.md`.
Owner of these docs in Claude Code: `tk-architect` (Cowork drafts them before agents start).

| #   | Doc                                                                                                                               | Status             |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 01  | `LLD-01-ROUTES.md` — routes, URL scheme, canonical/index rules, v1 URL compatibility, redirects                                   | Approved 11–12 Oct |
| 02  | `LLD-02-COMPONENTS.md` — layouts, components, islands, shared contracts                                                           | Approved 12 Oct    |
| 03  | `LLD-03-FILTERS.md` — product index, matching, counts, sorting, the six hidden-product cases, tag audit                           | Approved 12 Oct    |
| 04  | `LLD-04-CHECKOUT.md` — state machine, pricing pipeline, offers, free delivery, quote handoff, pay screen                          | Approved 12 Oct    |
| 05  | `LLD-05-API-CLIENT.md` — envelope, actions, errors, timeouts/retries, WhatsApp fallback, events, photos, data security in transit | Approved 12 Oct    |
| 06  | `LLD-06-BACKEND.md` — Apps Script pipeline, handlers, Sheet schema, refs/locking, owner tools, jobs, server security, migration   | Approved 12 Oct    |
| 07  | `LLD-07-BUILD-PUBLISH.md` — build pipeline, settings schema, Publish button + deploy hook, live check, rollback                   | Approved 13 Oct    |
