# Task brief: F-6S — Apps Script transport spike

- Requirement IDs: NFR-3, NFR-4
- Owner role: architect + integration (tk-architect, then tk-apps-script)
- Branch: `task/F-6S-apps-script-spike` from `v2`
- Depends on (must be Done): S-3 (Done); **owner input IN-29** (throwaway test Apps Script + Drive folder)
- Files to create/edit: `docs/v2/architecture/spikes/F-6S-result.md` (new, the written result); `apps-script/spike/` (throwaway: `Code.gs`, `appsscript.json`, `README.md` explaining how the owner pastes it); `scripts/spike-client.mjs` (throwaway browser-side test page or script)
- Files NOT to touch: `src/` site code, `public/_headers`, `.env*`, any production script or the live order webhook
- Contracts used (types / API actions): Reads LLD-05 §1 (transport facts). Produces measured answers that LLD-05 §1, LLD-06 B-6 and LLD-07 §1 can be updated from.
- Read only (max 3 doc sections, file + §): `LLD-05-API-CLIENT.md` §1 and §5; `LLD-06-BACKEND.md` B-6; `LLD-07-BUILD-PUBLISH.md` §1
- Model: Opus (F-6S is on the Opus list, AGENT-WORKFLOW §1)

## Why (context — required)

- Why it exists: Checkout shows the customer a total only after the server confirms the order (rule 5 of the project constitution: final total shown → order recorded → customer pays that exact amount). That only works if the browser can **read** Apps Script's reply. LLD-05 §1 says sources disagree. Nobody has proved it, so checkout is blocked until this spike does.
- Backlog row (verbatim):
> **F-6S** — **Spike (blocks checkout):** prove the browser can read Apps Script replies; measure cold/warm latency and max request size; confirm `drive.file` scope covers the upload folder; confirm failed Cloudflare builds keep the live site | LLD-05 §1, LLD-06 B-6, LLD-07 §1 | architect + integration | S-3
- Requirements (verbatim):
> **NFR-3**: Privacy: no customer data in the static build or in URLs; status/review lookups require ref + phone
> **NFR-4**: Abuse: honeypot + Apps Script rate limiting on all public forms
- Decisions this task implements (verbatim from `DECISIONS-LOG.md`):
> **D-30** (9 Oct, D): L-4: backend replies must be readable; retire v1 `no-cors` fire-and-forget (pending spike)
> **D-65** (12 Oct, D): LLD-05 API client approved: A-1 all calls POST with JSON body (nothing personal in URLs); A-2 save request text first, upload photos one by one; A-3 one automatic retry for writes with the same key; A-4 WhatsApp fallback on failed orders/requests; A-5 anonymous events batched in the background. Data-in-transit security section added (§10a) at owner's request
> **D-66** (12 Oct, D): LLD-06 backend approved (owner "ok next", 12 Oct): B-1 random order refs `TK-YYMMDD-XXXX`; B-2 minimal owner emails; B-3 random token on pay links; B-4 separate test/prod scripts deployed by owner via clasp; B-5 owner edits only status/tracking/notes columns; B-6 minimal OAuth scopes. B-7 retention → IN-17
> **D-68** (13 Oct, D): LLD-07 build & publish approved (owner "I approve p1-p5 all", 13 Oct): P-1 settings and approved reviews reach the site via a **Publish** button in the Sheet that triggers a Cloudflare rebuild; P-2 products, photos and page text stay in Git with review; P-3 the UPI ID never lives in the Sheet — changing it needs a reviewed code change; P-4 test Sheet publishes to the preview site first, production Sheet to the live site; P-5 every publish keeps a snapshot for one-click restore

## Goal

Written, measured answers to the unknowns in the Backlog row, so checkout (and the fallback decision) rests on evidence.

## Acceptance criteria

- [ ] Result file states, for each of the four questions, **Proven / Disproven / Inconclusive** with the evidence (request, response, browser, date): (1) a `fetch` POST from a different origin with `text/plain` can read the JSON reply, including after the 302 to `script.googleusercontent.com`; (2) cold and warm latency, at least 10 samples each, with median and worst; (3) the largest request body that succeeds, and the size where it fails (test around 3,500 characters, which one source reports as a failure point); (4) a `drive.file` scope is enough to write into a pre-made upload folder; (5) a failed Cloudflare build keeps the live site serving (test on a preview branch only).
- [ ] States whether ContentService can return a non-200 status (LLD-05 §1 expects not).
- [ ] If (1) is Disproven or Inconclusive, the result proposes the polling fallback from LLD-05 §1 and flags it as an **owner decision**; it does not build it.
- [ ] Uses only the test script and test folder from IN-29, with dummy data. No customer data, no UPI ID, no live webhook URL appears anywhere in the PR.
- [ ] Spike code is clearly marked throwaway and nothing under `src/` changes.

## Assumptions (labelled, to confirm)

- The owner (not an agent) creates and deploys the test Apps Script and the Drive folder, because deploying Apps Script is owner-only (rule 6). The agent supplies the files and a copy-paste README.
- Measuring the Cloudflare build behaviour needs a preview branch; if previews can't be created safely before CI-2, item (5) is reported as Not tested.

## Out of scope

- Building the real client, the order flow, or fallback polling.

_Status: drafted by the lead on 22 Oct 2026. Proposed only; the owner decides. Not yet on the board._
