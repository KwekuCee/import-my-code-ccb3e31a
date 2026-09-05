# Simpler dashboards, verified check-in walk, richer birthday and class views

## What already works (checked)

- Edit and Delete controls are already present and wired on the member, leader, branch, church-admin and attendance screens, with save and delete handlers.
- The member list already has a foundation-school filter (class 1-7, not enrolled, not yet finished, finished).
- The admin dashboard already shows an "Upcoming Birthdays" list for the current month.

So this work extends and tidies those, rather than building them from nothing.

## 1. Simpler look, same royal blue and white

One calm card style across both dashboards and every list screen:

- White cards, soft border, gentle rounding, light shadow. No dark gradient blocks.
- Drop the small all-caps typewriter-style micro-labels and the coloured caption lines under numbers; each number card becomes label, number, one short plain line.
- Fewer badges per card; keep only the one that carries meaning (for example a status).
- Tables get more breathing room, fewer lines, and the same Edit/Delete button styling everywhere.
- Mobile: bigger tap targets, less crowding.
- Wording pass on anything still jargon-heavy in headings, table headers and buttons (plain words like "Leaders", "Members", "Attendance", "Churches", "Ready for promotion").

Nothing is removed from the pages; only the styling and labels change.

## 2. Birthdays section, upgraded

On the church admin dashboard (and matching the group dashboard):

- Group members by birth month, with the current month opened first.
- Mark anyone whose birthday falls within the next 30 days with a clear "coming up" tag and days-away count.
- Keep the existing wish action.

## 3. Class groups panel on the admin dashboard

- A panel listing classes 1 to 7 plus "not enrolled" and "finished", each with a count.
- Clicking a class opens the list of those students, with the students who have not finished shown first.
- Each student row shows the leader they belong to, and tapping the leader opens that leader's people.

## 4. Real check-in walk-through

After the changes I will run the full path in the live preview and report what I see at each step:

1. Sign in as the group account, create a church branch admin.
2. Register a leader for that church.
3. Register a first-timer through the public sign-up choosing that church and that leader, and download the pass.
4. Open the branch admin's scanner and record the pass.
5. Confirm the record appears in that branch's attendance, in the per-leader attendance figures, and in the group totals; confirm a second scan for the same service says already recorded.

I will report each step's outcome, including anything that fails.

## Technical notes

- Styling pass touches `DashboardOverview`, `GroupOverview`, `MemberDatabase`, `LeaderDirectory`, `ChurchAdminsDirectory`, `AttendanceView`, `AnalyticsView`, `SettingsView`, `Sidebar`, `TopHeader`, `MobileAppHeader`, `MobileBottomNav`. Tailwind classes and label text only; no data or logic changes.
- Birthday grouping extends `src/utils/analyticsUtils.ts` with a month-bucket helper and a "days until next birthday" helper (year-agnostic, wraps across December to January).
- Class groups derive from `members.foundationClass` (0 = not enrolled, 7 = finished) and link through `members.invitedByLeaderId`, reusing the leader-members modal already in `LeaderDirectory`.
- Verification runs via Playwright against localhost, including a database read of `attendance_records` to confirm the row lands under the correct `church_id`.
