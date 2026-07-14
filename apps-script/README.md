# Order recorder — Google Apps Script (free)

This logs every website order to a Google Sheet **and** emails you. No server, ₹0.

## One-time setup (~5 min)

1. Go to <https://sheets.google.com> → create a blank sheet, name it e.g. **Tantu Kala Orders**.
2. In that sheet: **Extensions → Apps Script**.
3. Delete any sample code, paste the contents of **`Code.gs`** from this folder.
4. At the top of the file, set `NOTIFY_EMAIL` to the address(es) that should get order alerts.
5. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, authorise when prompted (it's your own script).
6. Copy the **Web app URL** it gives you (ends in `/exec`).
7. Paste that URL into `src/config/site.mjs` → `orderWebhookUrl`.
8. Rebuild/redeploy the site.

## Test
Place a test order on the site. Within a few seconds you should see a new row in the
**Orders** tab and an email. If not, re-open the Apps Script deployment and confirm
"Who has access" is **Anyone**.

## Notes
- Gmail's daily send limit (≈100 emails/day on a free account, higher on Workspace) is
  plenty for this season; the Sheet row is always written regardless of email.
- The site sends the order with `no-cors`, so it never blocks the customer's payment
  screen even if this script is briefly unavailable — the Sheet is your source of truth.
- Column **Status** starts as `NEW`; use it to track PAID / SHIPPED as you process orders.
