# CEKB Group rebrand + Cell Report submissions

## 1. Rename the whole site

Replace every "GCYC Group / Grace City Youth Church" name with **CEKB Group — Christ Embassy Korle Bu Attendance System**:

- Page title, description and social preview text
- Homepage header and hero text, sidebar, dashboard headers
- QR pass file names and email wording
- Existing branch names in the database are untouched (those are your real branches)

## 2. New homepage button: "Submit Cell Report"

Added alongside Cell Attendance, Leader Sign Up, Register a Church and Admin Login.

Clicking it opens a **code gate** before the report form is shown:

- The leader picks their church, then enters the access code for that church
- Codes are generated and managed by each church administrator in their dashboard (Settings), and the group account can see/generate codes for any church
- A code can be regenerated at any time; the old one stops working
- Wrong or missing code: the form stays hidden with a clear message

## 3. The Cell Report form

Rebuilt exactly from your two sheets, every field editable, with a **Church** selector added first.

**Header:** Church (new), Name of Leader (dropdown of leaders registered at the selected church), Cell Name, Outreach Centre, week/report date.

**Report table** — two columns (Cell Meeting / Outreach Centre) for each row:
Venue, Date & time of meeting, Total attendance, Total first timers, Total leaders, Number got saved, Number filled with the Spirit, Members present, Midweek, Prayer Service, Sunday Service, Total offering received.

**Evangelism & soulwinning:** outreaches organized this week, location, type, total people reached, number led to Christ, number filled with the Spirit, plus a repeatable list of names + contacts of those led to Christ.

**Cell attendance sheet:** add-a-row list of Name, Contact, First timer (tick), Soul won (tick) — starts with 15 rows, rows can be added or removed.

**Sunday service register:** add-a-row list of Members present, Contact/signature, Absentees, Absentee contact — starts with 20 rows.

Submit saves the whole report. Multiple submissions per leader per week are allowed, each saved with its own date and time.

## 4. Where admins see the reports

A new **Cell Reports** section in the dashboard:

- Church admins see only reports from leaders of their own branch
- The group account sees all reports, filterable by branch, leader and date
- List shows church, leader, cell name, date, total attendance, first timers, souls won, offering
- Opening a report shows the full sheet, read-only, laid out like the paper form
- Export a single report to PDF and a filtered list to Excel/CSV

## Technical notes

- New tables: `cell_reports` (header + report grid + evangelism block, JSON for the repeating lists) and `church_report_codes` (one active code per church, hashed, with created/rotated timestamps). Both with grants and RLS; all public access goes through the existing `portal-db` gateway plus a new `cell-report-access` function that validates the code and returns a short-lived submission token.
- Branch scoping: `cell_reports` joins the existing `BRANCH_SCOPED` list in `portal-db`, so branch admins can only read their own branch's rows.
- Public submission path: code verification and insert happen server-side in the edge function (service role), never with a client key, so the code cannot be bypassed.
- Report codes are shown in Settings for church admins (generate / rotate / copy link).
- "Link to a subdomain": the report form also gets its own route (`/cell-report`) so you can point a subdomain at it later; the button links there.
- Rebrand is a text/metadata change only — no schema or logic changes.
