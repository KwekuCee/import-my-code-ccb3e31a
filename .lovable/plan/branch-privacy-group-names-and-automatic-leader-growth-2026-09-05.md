# Branch privacy, group names, and automatic leader growth

## 1. Church admins see only their own branch

Today a branch admin still gets a church picker on the members screen and the leaders screen. Even though the list itself is already limited to their branch, the extra picker suggests they can look elsewhere.

- Hide the church filter (and the "All Churches" option) from branch admins on the members list, the leaders list and the attendance list.
- Hide the church field inside the edit forms for branch admins, so a record can never be moved to another branch by them.
- Keep every one of these controls for the group pastor (superadmin), who continues to see and manage everything.

## 2. Recording attendance for people without a phone

- Add a clear "Record attendance" button on the branch admin's attendance screen: pick the person from their own branch, pick the service, and it is saved instantly, marked as recorded by that admin.
- Prevents a second record for the same person, same service, same day.

## 3. Groups are known by their name

Every leader already has a group name (Bible study class, cell or PCF name). We will use it consistently:

- A member's group name comes from their leader; the cell name comes from the leader above, and the PCF name from the leader above that.
- Show the Bible study class, cell and PCF name on the member card, member list, leaders screen and attendance list.
- Save the PCF and cell name onto every attendance record when it is taken, so exports and history keep the names.
- Groups created automatically get a default name based on the leader ("Ama Mensah's Bible Study Class"), which the pastor can rename at any time.

## 4. Automatic growth of the leader structure

New rules, replacing the current counting rule:

- A member who finishes foundation school becomes a Bible study class teacher automatically — either by choosing "Graduated" on the check-in page, or when the pastor sets their foundation status to completed.
- When a Bible study class teacher has 4 of their own people become Bible study class teachers, they become a cell leader, and those 4 sit under them.
- When a cell leader has 4 of their people become cell leaders, they become a PCF leader, and those 4 become cell leaders under them.
- The same continues upward toward church coordinator.
- Everything stays inside the branch the person belongs to.
- The pastor can still appoint anyone to any leader role by hand at any time, and a hand-made appointment is never undone by the automatic rules.
- Each automatic change is written to the activity log so the pastor can see why someone moved up.

## Technical notes

- Members screen (`MemberDatabase.tsx`), leaders screen (`LeaderDirectory.tsx`), attendance screen (`AttendanceView.tsx`): gate church filter chips/selects and the `church` field in `EditRecordModal` config behind `!isChurchAdmin`.
- New manual check-in panel in `AttendanceView.tsx` reusing the existing `onConfirmAttendance` path with `checkInMethod: 'Manual Admin'`; duplicate guard mirrors `QRScannerModal`.
- Group naming: derive from `leaders.cell_or_pcf_name` walking `parent_leader_id` upward (extend helpers in `analyticsUtils.ts`); persist `pcf_name` on attendance inserts in `supabaseService.ts`.
- Database migration:
  - Replace `trigger_leader_promotion_check` with a function driven by counts of child leaders by type (4 BSCT children -> Cell Leader, 4 Cell Leader children -> PCF Leader), never demoting and skipping rows flagged `is_appointed`.
  - New trigger on `members`: when `foundation_class >= 7` and no leader row exists for that person, insert a `leaders` row (type `BSCT`, church from the member, `parent_leader_id` = the member's `invited_by_leader_id`, default class name), then re-evaluate the parent chain.
  - Recount helper function that recomputes `downstream_count` and promotion up the chain after each insert/update; writes an `audit_logs` entry per promotion.
- Client stays read-through: promotion happens in the database, so the app only needs to refetch leaders/members after saving.
