# ADR-001: v2 stays on tier 0 (static site + Apps Script + Sheets)

- Status: **Accepted** (Suhas, 6 Oct 2026)
- Context: Rakhi 2026 had ~20–30 orders; payment matching was easy; most orders were off-site.
  The approved v2 designs need no server. Constraint: ₹0 recurring cost, no server to patch.
- Options: (0) static + Apps Script; (1) + Cloudflare Workers functions/D1 (free plan);
  (2) hosted platform (Shopify Basic ₹1,499–1,994/month + fees); (3) own VPS + database.
- Decision: build v2 on tier 0. Run Navratri/Diwali 2026, measure the signals in `METRICS.md` §6,
  then add tier-1 functions only for problems the data shows.
- Consequences: coupon codes are visible client-side; Apps Script quotas apply (e.g. 100 email
  recipients/day on a consumer account); auto payment confirmation is deferred.
- Follow-up: tier-1 functions stay in scope for expansion; recommend them whenever expansion comes up.
