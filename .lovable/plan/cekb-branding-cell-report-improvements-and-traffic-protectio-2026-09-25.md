# CEKB branding, cell-report improvements, and traffic protection

## Branding
- Replace the visible platform logo with the uploaded CEKBVC mark using the project asset service.
- Create a properly sized square favicon and update the browser/PWA icon references.
- Add the same logo to all account and transactional email layouts sent as `CE Korle Bu <support@gcycattendance.online>`.

## Cell report form
- Make the verified church a locked, non-editable field.
- Auto-fill the selected leader’s Cell or PCF name from their registered details.
- Use a date-and-time picker for meeting time and retain a separate report date where needed for reporting.
- Present “Members Present” as a clear subsection heading.
- Display Ghana cedi prefixes on offering fields and accept only non-negative numeric values.
- Make every count field non-negative and numeric.
- Validate Ghana phone numbers, normalize accepted `0XXXXXXXXX` and `+233XXXXXXXXX` formats, and show clear errors before submission.
- Add “Import from phonebook” where contact rows are entered, using the browser’s contact picker when supported to import both name and phone; clearly fall back to manual entry on unsupported devices.
- Apply matching server-side validation so invalid or negative submitted values cannot bypass the form.

## Custom traffic limits
- Add a private database-backed request counter with no browser access.
- Add shared server-side checks to public and sensitive actions, including sign-in/session creation, report-code verification and report submission, registration/check-in, password and email verification, and outgoing email triggers.
- Use conservative per-IP or per-identity windows, return a clear retry message, and avoid limiting normal page viewing.
- Keep scheduled jobs and authenticated administrative actions functional while preventing anonymous abuse.

## Verification
- Deploy all changed server functions.
- Check desktop and mobile layouts, phonebook fallback behavior, locked/auto-filled fields, numeric restrictions, and report submission validation.
- Confirm the uploaded logo appears in the app, favicon, and rendered email previews.
- Confirm the app build and relevant server checks pass without errors.

## Technical details
- Store the app logo as a CDN asset pointer; keep only the required 64×64 favicon/PWA raster copies in `public/`.
- Preserve existing report JSON/database compatibility while adding meeting date-time data.
- Implement limits atomically in the database and call them only from trusted server functions.
