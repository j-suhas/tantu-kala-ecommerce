# LLD-05 — API client (frontend ↔ backend)

Version 0.1 · 12 Oct 2026 · Status: **approved** (owner, 12 Oct — A-1…A-5 accepted, D-65)

One module, `src/lib/api.ts`, is the only code that talks to the backend. Everything else calls
typed functions (`api.createOrder(…)`). When the backend later moves to Cloudflare Workers (tier 1),
only this module and its base URL change (LEAD-QA A4). Supersedes the GET lookups in
`ARCHITECTURE.md` §6. Implemented by `tk-data` (`lib/api.ts`, `lib/whatsapp.ts`, contracts);
`tk-apps-script` implements the server side (LLD-06).

## 1. Transport facts (checked 12 Oct 2026)

| Fact                                                                                                                                | Source / status                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST with `Content-Type: application/json` triggers a browser preflight that Apps Script can't answer (no `doOptions`), so it fails | Community sources ([GreenFlux](https://blog.greenflux.us/so-you-want-to-send-json-to-a-google-apps-script-web-app/), [Apps Script community](https://groups.google.com/g/google-apps-script-community/c/zJpevovcFLA))             |
| Sending the JSON body as `text/plain;charset=utf-8` avoids the preflight; the script reads `e.postData.contents`                    | Same sources; v1 already sends `text/plain`                                                                                                                                                                                       |
| Responses from ContentService are redirected (302) to a one-time URL on `script.googleusercontent.com`; `fetch` follows it          | [Apps Script Content Service guide](https://developers.google.com/apps-script/guides/content)                                                                                                                                     |
| Whether the browser may **read** that redirected response (CORS)                                                                    | Widely used pattern, sources disagree — **must be proven in the F-6 spike** before checkout depends on it (D-30)                                                                                                                  |
| ContentService can't set HTTP status codes — every answer is 200, so success/failure must be in the JSON body                       | Not stated in the sources found; based on the ContentService API surface — confirm in the spike                                                                                                                                   |
| v1 CSP already allows `script.google.com` and `script.googleusercontent.com` in `connect-src`                                       | `public/_headers` (checked)                                                                                                                                                                                                       |
| Request size: community reports a ~50 MB ceiling, one report of failures above ~3,500 characters                                    | [tanaikech](https://tanaikech.github.io/2017/02/05/file-upload-using-dopost-on-google-web-apps/), [Google Groups](https://groups.google.com/g/google-apps-script-community/c/g4lRYw-bUHs) — conflicting; **measure in the spike** |
| Cold-start latency of Apps Script                                                                                                   | Unknown — **measure in the spike** (sets the timeouts below)                                                                                                                                                                      |

If the spike shows responses can't be read, the fallback design is: write calls still go to Apps
Script, and the browser confirms by polling a read action — decided then, not now.

## 2. Envelope (every call)

All calls are **POST**, JSON body sent as `text/plain` (A-1).

```ts
// request
{ v: 1, action: 'order.create', key?: string /* idempotency key */, buildId: string,
  hp: string /* honeypot, must be empty */, payload: { … } }

// response
{ ok: true,  data: { … }, serverTime: string }
{ ok: false, error: { code: ErrorCode, message: string, field?: string, retryable: boolean } }
```

Responses are checked with hand-written type guards (no new dependency). A malformed response is
treated as `SERVER`. Server messages are shown as text, never as HTML.

## 3. Actions

| Action                | Payload (summary)                                                                                           | Returns                                                        | Timeout         | Safe to retry?                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------- | ------------------------------- |
| `order.create`        | items (slug, qty, personalisation), offer code, gift options, customer, note, client totals, source signals | `{ ref, total, status }`                                       | 15 s            | Yes, with the same key          |
| `order.claimPaid`     | ref                                                                                                         | `{ status }`                                                   | 10 s            | Yes                             |
| `order.status`        | ref + phone                                                                                                 | `{ status, courier?, trackingUrl?, updatedAt }` — nothing else | 10 s            | Yes                             |
| `order.payInfo`       | ref (for `/pay/`)                                                                                           | `{ amount, payeeName, vpa }` only if unpaid                    | 10 s            | Yes                             |
| `request.create`      | type (custom/bulk), description, quantity, budget, needed-by, contact, cart prefill (bulk), photo count     | `{ requestId, uploadTokens[] }`                                | 15 s            | Yes, with the same key          |
| `request.uploadPhoto` | requestId, token, index, mime, base64 (≤ ~400 KB after compression)                                         | `{ ok }`                                                       | 30 s            | Yes (token makes it idempotent) |
| `review.create`       | ref, phone, rating, text                                                                                    | `{ ok }`                                                       | 10 s            | Yes, with the same key          |
| `campaign.remaining`  | campaign id                                                                                                 | `{ unitsRemaining }`                                           | 8 s             | Yes                             |
| `event.log`           | up to 20 events/errors (no personal data)                                                                   | `{ ok }`                                                       | fire-and-forget | n/a                             |

Approved reviews are **not** fetched at runtime — they're pulled at publish time (D-61, C-6).

## 4. Errors

| Code                       | Meaning                                        | What the shopper sees                                                |
| -------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| `INVALID_FIELD`            | A field failed server validation (`field` set) | Message next to that field                                           |
| `PRICE_CHANGED`            | Totals or build ID don't match current prices  | "Prices were updated — please review your total" + refreshed summary |
| `UNAVAILABLE`              | An item is sold out or hidden now              | Item flagged with "Remove"                                           |
| `QUOTE_REQUIRED`           | Cart is over the limit or has a large item     | Switch to the quote flow                                             |
| `NOT_FOUND`                | Ref + phone don't match (status/pay)           | "We couldn't find that order" — never says which part was wrong      |
| `RATE_LIMITED`             | Too many requests                              | "Please wait a minute and try again"                                 |
| `SPAM`                     | Honeypot filled                                | Generic success-looking message; nothing saved                       |
| `SERVER`, timeout, offline | Anything else                                  | Retry + WhatsApp fallback (§6)                                       |

## 5. Timeouts and retries

- Every call uses `AbortController` with the timeout above (tuned after the spike).
- **Reads** (`status`, `payInfo`, `campaign.remaining`): up to 2 automatic retries after 1 s and 3 s.
- **Writes** (`order.create`, `request.create`, `review.create`): **one** automatic retry with the
  **same idempotency key** after 2 s on network error or timeout (A-3), then the failure screen.
  The key makes duplicates impossible — the server returns the existing record.
- No retries for `INVALID_FIELD`, `PRICE_CHANGED`, `UNAVAILABLE`, `QUOTE_REQUIRED`, `NOT_FOUND`, `SPAM`.

## 6. WhatsApp fallback (`lib/whatsapp.ts`)

On a failed order or request (A-4), the shopper can send everything on WhatsApp in one tap:

- `https://wa.me/<number>?text=<message>` — the number from config; the message built from the
  same data (items, quantities, total, name, delivery city, idempotency key as a reference).
- Message kept under ~1,500 characters; long carts become "…and 4 more items".
- Requests with photos say "I'll send the reference photos here".
- This link carries the shopper's own details to WhatsApp because they chose to send them; it is
  never one of our page URLs (NFR-3 still holds for the site).

## 7. Events and client errors (CHK-8, F-5)

- Events (`checkout_start`, `order_placed`, `place_failed`, `bulk_pitch_shown`,
  `filter_dead_end`) and client errors (`{ ts, page, action, code, buildId, browser family }`) go into
  a small `localStorage` queue (max 20, oldest dropped). **No personal data, ever.**
- The queue is sent with the next API call, or with `navigator.sendBeacon` when the page is hidden
  (A-5). Not waiting for a reply is fine here — losing a few events is acceptable.

## 8. Photos (A-2)

1. `request.create` saves the request row first and returns one upload token per photo.
2. Each photo is resized in the browser (longest side 1,600 px, JPEG quality ~0.8; limits tuned in
   the spike) and uploaded with `request.uploadPhoto`, one at a time, with its own progress bar.
3. A failed photo can be retried alone; the request already exists, so text is never lost.
4. Limits: up to 5 photos; JPEG/PNG/HEIC input (HEIC converted where the browser supports it,
   otherwise the shopper is asked to send it on WhatsApp).

## 9. Environments

The API URL comes from a build variable (`PUBLIC_API_URL`, replacing v1's
`PUBLIC_ORDER_WEBHOOK_URL`): local and preview builds point to the **test** Apps Script, production
to the live one (D-25). The build fails if a production build points at the test URL or vice versa.

## 10. Tests

- **Contracts:** request/response examples for every action live in `contracts/*.json` and are
  used by both the client tests and the Apps Script tests (D-29), so both sides agree.
- **Unit (`lib/api.ts`):** envelope, type guards, timeout, retry rules, idempotency key reuse,
  error mapping, event queue limits, WhatsApp message length.
- **Playwright:** mocked server errors, timeout and offline for each write flow; one real smoke
  order + request against the test Apps Script per release.

## 10a. Data security for everything this client sends (added 12 Oct, owner asked)

**What data exists and where it goes**

| Data                                              | Sensitivity                                                    | Travels to                                                  | Stored where                                              |
| ------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| Name, phone, address, pincode, gift message, note | Personal                                                       | Apps Script (HTTPS)                                         | Orders Sheet (private), owner email (minimal, LLD-06 B-2) |
| Order items, totals, offer code                   | Business                                                       | Apps Script                                                 | Orders / OrderItems tabs                                  |
| Request text + photos                             | Personal (photos may show people/homes)                        | Apps Script → Drive                                         | Private Drive folder per request                          |
| Pincode only                                      | Low                                                            | `api.postalpincode.in` for city/state lookup (v1 behaviour) | Not stored there by us                                    |
| Events, client errors                             | None personal (enforced by a type that has no personal fields) | Apps Script                                                 | Log tab                                                   |
| WhatsApp fallback text                            | Personal, sent by the shopper's own choice                     | WhatsApp                                                    | The owner's WhatsApp                                      |

**Controls on the way**

1. **Encrypted in transit:** HTTPS only — the site already sends HSTS (`public/_headers`); Apps
   Script and Google endpoints are HTTPS-only. No plain-HTTP fallback anywhere.
2. **Nothing personal in URLs** (A-1): not in our page URLs, not in API calls, not in analytics.
   Transactional pages load no third-party scripts and use a strict referrer policy.
3. **Only allowed destinations:** the Content-Security-Policy `connect-src` lists exactly the Apps
   Script hosts and the pincode API; any other network call from our pages is blocked by the browser.
4. **Minimal requests and replies:** the client sends only what the action needs; lookups return only
   status/tracking (never name, phone or address); `/pay/` links carry a random token so order
   amounts can't be guessed by trying references (LLD-06 B-3).
5. **Photos lose hidden metadata:** resizing in the browser re-encodes the image, which drops EXIF
   data such as the GPS location where the photo was taken. A test checks this.
6. **Minimal browser storage:** cart and last-order reference only; form details live only in the
   open tab (K-6); nothing personal in `localStorage`.
7. **Abuse resistance:** honeypot, server-side rate limits, random idempotency keys (not guessable),
   server re-checks every total and field; escalation option if spam appears: Cloudflare
   Turnstile (free) verified by Apps Script — not built unless needed (T14).
8. **No secrets in the browser:** the client holds no keys; anything secret lives in Apps Script
   Script Properties (LLD-06).
9. **Errors don't leak:** messages are generic ("We couldn't find that order"), never "phone doesn't
   match", and never include stack traces or internal IDs.

Server-side protections (storage, access, scopes, retention) are in `LLD-06-BACKEND.md` §8.

## 11. Decisions needed from the owner

| ID  | Decision                                                                                                                                      | Recommendation                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| A-1 | Every call is a POST with a JSON body — including lookups — so a phone number or order details never appear in a URL (where they'd be logged) | **Yes** — corrects an earlier draft that used a URL with the phone in it                    |
| A-2 | Custom/bulk request: save the text first, then upload photos one at a time                                                                    | **Yes** — small uploads work better on mobile data, and text is never lost if a photo fails |
| A-3 | One automatic retry for orders/requests (same reference key, so no duplicates) before showing Retry/WhatsApp                                  | **Yes**                                                                                     |
| A-4 | Offer "Send on WhatsApp" whenever an order or request can't be saved                                                                          | **Yes** — a shopper is never stuck                                                          |
| A-5 | Anonymous events and error reports are batched and sent in the background, without waiting for a reply                                        | **Yes** — no personal data; occasional loss is acceptable                                   |
