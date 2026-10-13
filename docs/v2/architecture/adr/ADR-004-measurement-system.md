# ADR-004: Measure revenue, orders and units separately

- Status: **Proposed** (Suhas asked Claude to define a practical system, 6 Oct 2026)
- Context: the Rakhi 2026 target ("500 rakhis") was a unit count; units alone mix making
  effort with sales and hide revenue.
- Decision: three measures counted at **Paid** status — net revenue (goal), orders (demand),
  units (capacity). Each festival campaign sets a revenue target and a unit capacity cap.
  Details in `METRICS.md`.
- Consequences: Sheets need an OrderItems tab and a `pieces` value per product (combos sum their pieces).
