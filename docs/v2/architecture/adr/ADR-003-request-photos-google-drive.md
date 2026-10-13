# ADR-003: Custom/bulk request photos go to Google Drive via Apps Script

- Status: **Accepted** (Suhas, 6 Oct 2026; Q-1 confirmed: Google Drive)
- Context: requests need text + reference photos. Suhas first chose WhatsApp, then revised:
  text and photos in different places could conflict.
- Decision: the request form compresses photos in the browser and posts them with the text to
  Apps Script, which saves them to a Drive folder and links that folder from the request's Sheet row.
- Open: Suhas said "Google Cloud"; interpreted as Google Drive (free) rather than a Cloud Storage
  bucket (needs billing). To be confirmed.
- Consequences: enforce photo count/size limits (Apps Script payload limits); WhatsApp stays a fallback.
