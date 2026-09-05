# Clean up, clearer wording, and a simpler look

## 1. Remove zones everywhere

Zones ("Zone 1 (Korle Bu)" and the Zone 1-4 picker) come out of:

- The church branch list and the admin accounts list in the group view
- The "Add church branch" form
- Settings (both the group settings and the church settings)
- The exported spreadsheets/CSV files and the database view page
The stored zone field stays in the database untouched so nothing breaks, it simply stops being shown or asked for.

## 2. First-timer details actually get used

Everything collected on the public sign-up (email, date of birth, occupation, education, foundation school class, who invited them) is already saved. What changes:

- **Birthdays:** the birthday list on the group dashboard and the church dashboard is driven by the saved date of birth, so anyone who signed up appears in that month's list.
- **Occupation and education:** shown on the member's record and in the member list.

## 3. Foundation school classes visible and filterable

- New "Foundation school" panel on both the group dashboard and the church dashboard: how many people are in each class (1-7), how many not enrolled, how many finished.
- New filter on the member list: pick a class, "not enrolled", or "not yet finished" and the list narrows to those people. Works with the existing church and status filters, and the export follows the filter.

## 4. Leaders and their members

When someone picks a leader (Bible study class teacher (BSCT), cell leader, PCF leader, or church coordinator) as the person who invited them, they are attached to that leader.

- The leaders list gains a "Members" count per leader, plus a click-through to see that leader's people.
- The count updates automatically when new people sign up under that leader, and when someone is promoted their people stay with them.

## 5. Attendance: one record per person per service

- The scanner records a person once for the same service on the same day; a second scan shows "already recorded today" instead of adding a duplicate.
- The downloaded pass is reusable: it stays valid for every service, it is not one-time.
- Each pass is tied to the person's own church, so a scan lands in that church's records only; the group account sees all churches together.

## 6. Simpler wording

Rename the jargon-y labels, same meaning:

- "Group Leaders Directory" → "Leaders Database"
- "Member Database" → "Member Database"
- "Downstream Members" → "Members"
- "Promotion Queue / Auto-flagged growth engine" → "Ready for promotion"
- "Attendance Records / Check-in verification" → "Attendance"
- "Analytics Engine / Demographics" → "Insights"
- "First Timers Conversion" → "First Timers"
- "Church branches / Group consolidated" → "Churches" / "All churches"
Applies to menus, page headings, table headers, and buttons.

## 7. Simpler look, same royal blue and white

Keep the colours and all content, reduce the visual noise:

- One consistent card style: white, soft border, gentler rounding, lighter shadow. Drop the dark gradient blocks and the coloured mini-badges stacked on every card.
- Fewer type sizes; the small all-caps monospaced micro-labels go away in favour of plain readable labels.
- Calmer number cards: label, number, one short line — no extra coloured captions.
- Tables get more breathing room, fewer borders, and consistent action buttons.
- Same for mobile: bigger tap targets, less crowding.

## Order of work

1. Zones removed
2. Foundation school panels and member filter
3. Leader member counts and their member lists
4. Attendance one-per-service and pass routing
5. Wording pass
6. Visual simplification pass

## Technical notes

- Zone removal is presentation-only; `churches.zone`, `church_admin_accounts.zone`, and `user_profiles.zone` columns remain, defaults untouched.
- Foundation grouping derives from `members.foundation_class` (0 = not enrolled, 7 = complete); no schema change.
- Leader member counts derive from `members.invited_by_leader_id`; `leaders.downstream_count` keeps feeding the existing promotion trigger, and the directory shows the live derived count.
- Duplicate check on scan: look up `attendance_records` by `member_id` + `service_type` + `attendance_date` before insert (client-side guard now; a unique index can be added later if wanted).
- QR routing uses the member's `church_id`/`church_name` already embedded in the pass payload; the scanner writes those values so records land under the correct church.
- UI pass touches Tailwind classes and labels in the dashboard, directory, attendance, settings, sidebar, and mobile nav components; no data or business-logic changes.