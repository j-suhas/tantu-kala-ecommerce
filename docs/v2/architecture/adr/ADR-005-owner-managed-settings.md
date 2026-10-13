# ADR-005: Where owner-managed values live (settings, size classes, coupons)

- Status: **Proposed** (Q-17)
- Context: Suhas wants to enter size class, cart limit, discount values and coupon codes in
  the Sheet ("system/sheet"). Products and config currently live in repo files, and the site is
  static (content changes need a rebuild).
- Options: (A) repo files edited via GitHub; (B) Sheet "Settings"/"Products" tabs pulled at
  build time, validated, written to JSON; (C) Sheet read live at runtime via Apps Script.
- Proposal: **B for Settings** (shipping, thresholds, size classes, cart limit, coupons, wrap fee);
  keep **A for Products** until v2 is stable, then reconsider. Rebuild trigger: a manual
  "Publish" step by the owner (exact mechanism to design; must not give agents deploy rights).
- Consequences: validation must reject bad Sheet rows before they reach the site; anything in a
  published Sheet is public (fine for coupon codes at tier 0, as they're client-visible anyway).
- Revisit: when settings change more than weekly, or at tier 1 (D1-backed settings).
