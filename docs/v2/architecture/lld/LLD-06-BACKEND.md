# LLD-06 — Backend (Apps Script + Google Sheets/Drive)

Version 0.1 · 12 Oct 2026 · Status: **approved** (owner, 12 Oct — B-1…B-6 accepted, D-66; B-7 → IN-17)

Server side of LLD-05. Covers OPS-1…OPS-8, CHK-1/9/10/11, REQ-1…4, PST-1/2, CMP-4, METRICS,
SECURITY T1–T15, D-25 (test environment), D-29 (Apps Script in TypeScript, shared pricing), D-30
(readable replies), K-1…K-7. Implemented by `tk-apps-script`; reviewed by `tk-architect` and
`tk-security`; deployed **only by the owner**.

## 1. Project layout and deployments

```
apps-script/
  src/             TypeScript: router, handlers, adapters (Sheet, Drive, Mail, Cache, Lock, Clock), owner menu
  dist/Code.js     esbuild bundle (includes shared src/lib/pricing.ts and validation) — generated
  appsscript.json  time zone Asia/Kolkata, explicit OAuth scopes (B-6), web-app settings
  .clasp.test.json / .clasp.prod.json   two script IDs, one per Sheet (B-4)
```

- **Two copies of the same code:** one script bound to the **test** Sheet, one to the **production**
  Sheet. Each has its own Script Properties (`ENV`, `SITE_URL`, `DRIVE_FOLDER_ID`, `OWNER_EMAIL`,
  `PAY_TOKEN_SECRET`). The owner pushes and deploys with `clasp` from his own machine; agents never
  hold Google credentials (guardrails).
- Web app setting: runs as the owner, accessible to anyone (needed for a public shop). Because it
  runs with the owner's permissions, its OAuth scopes are kept to the minimum (B-6).
- Handlers are written against small adapter interfaces so the same logic runs in Node with fakes
  for unit tests (no Google account needed in CI).

## 2. Request pipeline (`doPost`)

1. Reject bodies over a size cap (set after the spike) → `SERVER`.
2. Parse JSON; check `v`, known `action`, payload shape → `INVALID_FIELD` / `SERVER`.
3. Honeypot `hp` filled → reply as if successful, save nothing, count in Log (`SPAM`).
4. Rate limit with `CacheService`: per action + phone hash (writes) or per ref (lookups), plus a
   global per-minute ceiling → `RATE_LIMITED`.
5. For writes: take the **script lock** (`LockService`, wait up to ~10 s); everything that reads
   counters or checks duplicates happens inside the lock.
6. Run the handler; append one Log row (`time, action, result code, ms, buildId` — no personal data).
7. Reply with the LLD-05 envelope. Unexpected exceptions → `SERVER` with a generic message; details
   only in the Log tab's error column (still no personal data).

## 3. Handlers

| Action                | Key steps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `order.create`        | Idempotency: key → existing ref? return it. Load prices from the site's `/pricing.json` (cached ~5 min) and settings; build-ID check. Validate items (exist, visible, available, qty ≤ stock), customer fields, gift message ≤ 500, note ≤ 500. Recompute totals with the bundled `pricing.ts`; any difference → `PRICE_CHANGED`. Quote rules (size class / cart limit) → `QUOTE_REQUIRED`. Generate ref (B-1). Write Orders row + OrderItems rows; upsert Customers row. Owner email (B-2; quota-aware). Return `{ ref, total, status: 'Placed' }` |
| `order.claimPaid`     | Ref must exist and be `Placed` → `Payment claimed` + time. Idempotent                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `order.status`        | Ref + normalised phone must both match (else `NOT_FOUND`, same message either way); return status, courier, tracking URL from the courier template, last update — nothing personal                                                                                                                                                                                                                                                                                                                                                                  |
| `order.payInfo`       | Ref + pay-link token (B-3) must match and order must be unpaid; return amount, payee name, VPA                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `request.create`      | Validate; create Requests row (status `New`) and a private Drive sub-folder; return requestId + one upload token per photo                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `request.uploadPhoto` | Token valid and unused; MIME JPEG/PNG; size cap; save to the request folder; mark token used                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `review.create`       | Ref + phone match and order is `Delivered`; one review per order; stored with `approved = FALSE`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `campaign.remaining`  | Capacity minus units in non-cancelled, non-expired orders tagged with the campaign; cached 1 min                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `event.log`           | Append up to 20 rows to Log; daily cap to protect the Sheet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Every value written from user input passes through `safeCell()`: values starting with `=`, `+`, `-`
or `@` are stored as text so Sheets never runs them as formulas (T5).

## 4. Sheet schema (production and test identical)

| Tab                 | Key columns                                                                                                                                                                                                                                                                                                                                  | Notes                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Orders              | ref · key (idempotency) · createdAt · channel · source · campaign · name · phone (+91…) · address · pincode · city · state · note · giftMessage · giftWrap · itemsSubtotal · offerLabel · discount · delivery · wrapFee · total · **status** · paidAt · shippedAt · deliveredAt · courier · consignment · receiptUrl · labelUrl · ownerNotes | Owner edits only the bold/editable columns (B-5)                                                                    |
| OrderItems          | ref · slug · name · type · occasion · qty · pieces · units · unitPrice · lineTotal · personalisation                                                                                                                                                                                                                                         | One row per line (METRICS units)                                                                                    |
| Customers           | phone · name · firstOrderAt · paidOrders · netRevenue · lastOrderAt · channelFirst                                                                                                                                                                                                                                                           | Built from Orders; loyalty fields later (D-51)                                                                      |
| Requests            | id · key · type (custom/bulk) · createdAt · name · phone · email · company · quantity · budget · neededBy · description · photosFolderUrl · photoCount · **status** · quotedValue · quoteValidUntil · orderRef                                                                                                                               | Quote valid 10 days (D-07)                                                                                          |
| Reviews             | id · ref · createdAt · rating · text · displayName · **approved**                                                                                                                                                                                                                                                                            | Approved rows are pulled at publish (C-6)                                                                           |
| Settings            | key · value · notes                                                                                                                                                                                                                                                                                                                          | Owner-managed values pulled at build (D-24): threshold, wrap fee, offers, size limits, couriers' tracking templates |
| Log                 | time · action · code · ms · buildId · error                                                                                                                                                                                                                                                                                                  | No personal data                                                                                                    |
| Ops, Dashboard, SEO | Per `METRICS.md` and `SEO.md`                                                                                                                                                                                                                                                                                                                | Formulas only on Dashboard                                                                                          |

**Order statuses:** `Placed` → `Payment claimed` → `Paid` → `In making` → `Shipped` → `Delivered`;
`Cancelled` from any state before Shipped; `Expired` after 3 unpaid days (K-7, owner can revive).
**Request statuses:** `New` → `Quoted` → `Accepted` (→ order created with the quote) / `Declined` /
`Expired` (quote older than 10 days). Status columns use dropdown validation.

## 5. References, keys and locking

- **Order ref (B-1):** `TK-YYMMDD-XXXX`, where `XXXX` is 4 random characters from an unambiguous
  alphabet (no 0/O/1/I). Generated inside the lock and checked unique. Random rather than
  sequential, so refs can't be guessed and don't reveal order volume. v1 refs (`TK-ddMM-xxxx`) stay
  valid as `channel = legacy`.
- **Idempotency:** the key is stored on the row; `CacheService` maps key → ref for 6 hours as a fast
  path; a column search is the fallback. Replays return the original result.
- **Lock discipline:** short critical sections only (check key → make ref → append rows). Email and
  Drive work happen after the lock is released.

## 6. Owner tools (Sheet menu, runs as the owner — not reachable from the web)

| Menu item                        | Does                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Log off-site order               | Sidebar form → same validation and pricing as `order.create`, with channel WhatsApp/Instagram/in-person (OPS-1) |
| Make payment link                | `https://tantukala.embox.in/pay/?ref=…&t=<token>` + a ready WhatsApp message to copy (OPS-2)                    |
| Mark paid                        | Status `Paid` + paidAt; adds to Customers totals                                                                |
| Mark shipped                     | Courier + consignment → tracking link from the courier template (OPS-8); status `Shipped`                       |
| Receipt PDF / Shipping label PDF | From Docs templates into Drive; link saved on the row; receipt is not a GST invoice (OPS-4/5)                   |
| Request a review                 | Opens a WhatsApp message with the review link for delivered orders                                              |
| Quote a request                  | Sets quoted value, valid-until (+10 days), makes the payment link                                               |

## 7. Scheduled jobs (time-driven triggers)

| When            | Job                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Daily 9:00 IST  | Expire orders unpaid for 3 days; email the owner a digest: day-1 unpaid orders to remind, quotes expiring, requests waiting |
| Nightly         | Sanity scan (bad statuses, missing totals, rows edited into invalid values) → one summary email if anything is wrong        |
| Weekly          | Copy the spreadsheet to a private dated backup folder; keep the last 8                                                      |
| Each email send | If today's sends approach the consumer limit (100 recipients/day), switch to the daily digest                               |

## 8. Security (server side)

1. **Access:** the Sheet, Drive folders and backups are shared only with named owners — never
   "anyone with the link". 2-factor login on the owner's Google account (SECURITY checklist).
2. **Least privilege (B-6):** explicit OAuth scopes in `appsscript.json`; Drive access limited to
   files the script creates (`drive.file`) if the spike confirms it covers the upload folder;
   spreadsheets limited to the bound Sheet; mail send only.
3. **Secrets:** pay-link token secret and IDs live in Script Properties, never in the repo.
4. **Input safety:** strict validation and length limits on every field; formula-injection escaping
   (`safeCell`); MIME and size checks on photos.
5. **Output minimisation:** lookups return status/tracking only; generic "not found" messages; no
   personal data in Log rows or `console` output.
6. **Abuse:** honeypot, rate limits, idempotency, nothing made or shipped before the owner verifies
   payment (the strongest control of all).
7. **Environments:** test and production never share a Sheet, folder or script; agents only ever
   touch test data, and never real customer data (guardrails).
8. **Retention (B-7 input):** how long full addresses and phone numbers are kept after delivery —
   needs the owner and a professional (DPDP Act). Until decided, nothing is deleted automatically.

## 9. Migration from v1

A one-time owner-run menu item maps v1 order rows and the existing off-site log (column layout:
IN-12) into Orders/OrderItems with `channel = legacy` and builds Customers. It runs on a **copy**
first; the original v1 Sheet is kept unchanged.

## 10. Tests

- **Unit (Node, Vitest, fake adapters):** every handler's success and error paths; pricing fixtures
  shared with the site; formula escaping; idempotent replay; lock-protected ref uniqueness under
  simulated concurrency; status transitions; expiry job.
- **Contract:** the same `contracts/*.json` examples as the client (LLD-05).
- **Manual on the test Sheet** (owner, per release): the integration agent supplies a step list with
  expected rows.

## 11. Decisions needed from the owner

| ID  | Decision                                                                                                         | Recommendation                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| B-1 | Order references with a random part (`TK-261012-7KQ4`) instead of a running number                               | **Yes** — can't be guessed; doesn't reveal how many orders you get                 |
| B-2 | Order emails to you carry only ref, items, total and city; full address and phone stay in the Sheet              | **Yes** — less personal data sitting in email; you open the Sheet for full details |
| B-3 | Payment links you send include a random token, so nobody can look up an order amount by guessing references      | **Yes**                                                                            |
| B-4 | Two script copies, each bound to its own Sheet (test and production), pushed with `clasp` by you only            | **Yes**                                                                            |
| B-5 | You edit only the status, tracking and notes columns; ID, price and formula columns are protected with a warning | **Yes** — prevents accidental damage to the records the dashboard depends on       |
| B-6 | The script asks Google for the smallest set of permissions it needs                                              | **Yes**                                                                            |
| B-7 | Data retention period for addresses and phone numbers (see §8)                                                   | Add to your inputs list; decide with a professional                                |
