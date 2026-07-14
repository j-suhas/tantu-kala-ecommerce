# Setup: order email notifications (+ the Google Sheet)

Orders are recorded by the Google Apps Script in **`apps-script/Code.gs`** → it writes a
row to your **Orders** sheet and emails you. Full deploy steps are in
**`apps-script/README.md`**; this file is just *which values go where*.

| Field | Where | What to put |
|---|---|---|
| `NOTIFY_EMAIL` | top of `apps-script/Code.gs` | One or more addresses to alert on every order. **Comma-separated** for multiple, e.g. `orders@tantukala.com, suhas@gmail.com` |
| `SITE_URL` | top of `apps-script/Code.gs` | Your deployed site URL, e.g. `https://tantukala.pages.dev`. Lets the script re-verify each order total against the live price list and flag tampering. Leave `''` to skip. |
| `orderWebhookUrl` | `src/config/site.mjs` | The Apps Script **Web app URL** (ends in `/exec`) you get after deploying. Paste it here so the site starts sending orders. Leave `''` to disable recording. |
| Sheet tab name | your Google Sheet | Must be **`Orders`** (the script creates it if missing) |

The order email + sheet include a **Verified Total** column: the script independently recomputes the price from slug+qty using your live `/pricing.json`, so if someone tampers with prices/coupons in their browser, the row shows **MISMATCH** and the email warns you — don't ship those until you confirm the amount received.

### "Different emails for different cases"
Right now every order goes to `NOTIFY_EMAIL`. If you want role-based routing, tell me the rule and I'll add it — common ones:

- **Orders vs. support:** order alerts → `orders@…`; nothing else is emailed today.
- **High-value orders** (e.g. subtotal ≥ ₹1000) cc a second address.
- **Send the customer a confirmation email too** (needs their email — currently we collect phone, not email; say the word and I'll add an optional email field at checkout).

### What I need from you to wire these
Send me: the **notification email(s)**, and — once you've deployed the script — the **Web app URL**. If you want any of the routing rules above, tell me which.

> Gmail free-tier sends ~100 emails/day (plenty for the season); the Sheet row is always written even if email is throttled.
