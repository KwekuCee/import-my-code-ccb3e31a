# Smarter spreadsheet import + leaders picked from the file

## 1. The file no longer has to match the template

Any spreadsheet works as long as the first row holds column headings. The system reads the headings and figures out which is which, so people can send whatever wording they already use.

Accepted wording (any one of these works):
- Full name: Name, Full Name, Names, Member Name, Surname and Other Names
- Phone: Phone, Contact, Mobile, Telephone, WhatsApp, Phone Number
- Email: Email, E-mail, Mail, Email Address
- Date of birth: DOB, Date of Birth, Birthday
- Gender: Gender, Sex
- Location: Location, Address, Residence, Area, Town, City
- Occupation: Occupation, Job, Work, Profession
- Leader: Leader, Invited By, Who Invited You, Cell Leader, PCF Leader, Referred By, Inviter
- Also read when present: Marital Status, Education, Church, Foundation Class, Cell or PCF Name, Leader Type

Extra columns are ignored, and the order of columns does not matter. Only the full name is required. The preview screen shows which heading was matched to which field, and warns about any heading it could not place, so nothing is silently dropped.

## 2. Leaders are pulled out of the members file automatically

When a members file is imported, every name in the Leader / Invited By column is collected. Each of those names:
- becomes a leader record if that person is not already a leader in that branch (matched by name, ignoring case and extra spaces),
- is linked to every member who named them, so cell and PCF numbers count correctly,
- keeps its role blank until it is set, so nobody is silently made a Bible study class teacher, cell leader or PCF leader.

If a leader's own name also appears as a member row in the same file, that row's phone, email, date of birth and location are used to fill the leader record.

## 3. "Leaders needing details" list

New leaders created this way start with only a name, so a clear list appears after the import and stays available on the leaders screen:

- Shows each incomplete leader with the number of members already under them.
- One row per leader with boxes for phone, email, date of birth, location, role (Bible study class teacher / cell leader / PCF leader / church coordinator) and the cell or PCF name.
- Save fills in the record and removes it from the list.
- Once a phone or email is added, the "Email codes" button can send that leader their attendance code.

This is the fastest complete route: the membership sheet gives the names and the links, and the details are typed once, for leaders only, instead of for everybody.

## 4. Import summary gets clearer

The result now reads, for example: "184 members added, 6 skipped as already in the system, 2 rejected (no name), 11 leaders created from the Leader column — 9 still need details."

## Technical notes

- `src/utils/importUtils.ts`: widen `HEADER_ALIASES` (leader aliases: leader, invited by, who invited you, cell leader, pcf leader, referred by, inviter), return unmatched headings from `mapHeaders` for the preview, and add a `collectLeadersFromRows` pass that groups rows by normalised leader name, counts members per name, and merges a matching member row's contact details into the derived leader.
- `src/components/ImportDataPanel.tsx`: show the matched/unmatched heading map, and a post-import "Leaders needing details" editor. Extract that editor as `src/components/IncompleteLeadersPanel.tsx` so `LeaderDirectory` can mount it too.
- Import order: create derived leaders first (so `leaders.id` exists), then insert members with `invited_by_leader_id` set from the name-to-id map plus `invited_by_name`; existing leaders in the branch are reused via a name index instead of duplicated.
- `leaders.leader_type` is `not null default 'BSCT'`; no schema change. Derived leaders are marked incomplete by `is_appointed = false` with empty `cell_or_pcf_name`/`contact`/`email`, and the UI renders role as "Not set" for those until the admin saves details. `LDR-####` codes are generated as they are today.
- Writes continue through the `portal-db` gateway helpers in `src/lib/supabaseService.ts`, branch-scoped for church admins; new helper for updating a derived leader's details.
- No database schema changes.
