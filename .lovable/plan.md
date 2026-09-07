# iPhone QR passes + spreadsheet import with emailed codes

## 1. Fix the QR pass on iPhone/Safari

Right now the pass is handed to the browser as a long inline image link. Safari on iPhone refuses to save that, so people get a "View or Download" dialog that does nothing.

Changes:
- Save the pass as a real image file (a blob) instead of an inline link, and use the browser's own share/save sheet on iPhone so the user gets "Save Image" / "Save to Files" / "Share".
- If the share sheet isn't available, open the pass in a new tab with a clear on-screen instruction: "Press and hold the image, then choose Save to Photos."
- Show the pass image on screen right after check-in and after leader registration, so it can always be long-pressed and saved even if nothing else works.
- Also email the pass to the person automatically when they gave an email address, so there is always a copy in their inbox.

Applies to both the self check-in pass and the leader registration pass.

## 2. Import members and leaders from Excel or CSV

A new "Import from Spreadsheet" section appears in both the group (super admin) dashboard and the church admin dashboard.

Flow:
1. Choose whether the file contains members or leaders.
2. Pick an .xlsx or .csv file (drag and drop supported).
3. The system reads the column headings and matches them to the right fields, tolerating common variations (Full Name / Name, Phone / Contact, Date of Birth / DOB, and so on).
4. A preview table shows every row with a green tick or a red flag, plus a plain-English reason for each problem (missing name, missing email, bad date, duplicate).
5. Email address is required on every row; rows without one are rejected and listed so they can be corrected and re-imported.
6. Confirm to import. Rows already in the system (same email, or same phone) are skipped rather than duplicated, and the result summary says how many were added, skipped, and rejected.

Church admins can only import into their own branch. The group account picks the branch for each import.

Leaders imported this way also get their member record and leader code, exactly like the registration form creates.

## 3. "Email codes" buttons

After a successful import (and also available any time from the members and leaders directories):
- "Email codes to all members"
- "Email codes to all leaders"

Each button generates the person's QR pass and emails it to them, one message per person, with a progress indicator and a final summary ("48 sent, 2 had no email address"). Sending is throttled so the mail provider doesn't reject the batch, and re-running it is safe.

## Technical notes

- QR saving: replace the `a.download` + data-URL approach in `PublicPortal.tsx` with a canvas `toBlob` → `File`, then `navigator.share({ files })` when `navigator.canShare` supports files (iOS Safari), else blob-URL download, else open-in-new-tab fallback. Reuse the existing pass-drawing code; extract it to `src/utils/qrPass.ts` so import/email flows can render identical passes server-agnostically.
- Import parsing: `xlsx` (already used by `exportUtils.ts`) for .xlsx, and a small CSV parser for .csv. New `src/utils/importUtils.ts` for header mapping + row validation; new `src/components/ImportDataPanel.tsx` mounted in the super admin and church admin dashboards.
- Writes go through the existing `portal-db` gateway helpers in `src/lib/supabaseService.ts` (batched inserts, existing-email/phone pre-check, `LDR-####` code generation reused for leaders, member mirror row with the Leader tag).
- Bulk email: new edge function `send-qr-passes` that takes a list of member/leader IDs, renders each pass PNG server-side (QR image API + fetch, PNG assembled without canvas by embedding the QR image directly in the email body plus attaching it), and sends via the existing Resend-first `_shared/mailer.ts`. Service-role only; caller identity and branch scope validated against `portal_sessions` like `portal-db` does.
- No schema changes needed.
