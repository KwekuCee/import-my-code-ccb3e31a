# PCF & Cell attendance tracking, working QR scanning, cleaner roles

## 1. Attendance grouped by PCF and cell

Every member is linked to the leader who invited them, and leaders sit in a chain: Bible study class teacher → cell leader → PCF leader → church coordinator.

- Build the leader chain from the existing "reports to" link, so each Bible study teacher rolls up into a cell, and each cell rolls up into a PCF.
- New panel on both the branch admin dashboard and the group dashboard:
  - Attendance by PCF: one row per PCF showing total people present, counting the PCF leader's own invitees plus everyone under his cell leaders and their Bible study teachers.
  - Attendance by cell: one row per cell with its own total (cell leader plus his Bible study teachers).
  - Each row expands to show the leaders that make up the total.
- Also show "people in this PCF" and "people in this cell" (registered members), next to the attendance number.
- Branch admins see only their own church; the group dashboard shows all churches with a church label on every row.

## 2. Attendance per leader visible to both roles

The existing per-leader attendance list will be shown on the branch admin dashboard and the group dashboard, with the leader's kind (Bible study teacher / cell / PCF / coordinator), their church, and today's plus total counts.

## 3. Fix the QR scanner

The scanner today only shows the camera picture — nothing actually reads the code, which is why the passes the system creates never get recognised.

- Add a real code reader that watches the camera picture and reads the pass automatically.
- Understand the pass content the system writes today (member id, name, church, phone, service) and also accept a plain member id, so old and new passes both work.
- On a successful read: record attendance instantly, show the confirmation card, and refuse a second read of the same person for the same service on the same day.
- Clear messages when the camera is blocked, the code isn't ours, or the person belongs to another church.
- Keep the existing name/ID lookup as a fallback.

## 4. Member roles simplified

Roles become only: Leader, Member, First Timer. Deacon, Visitor and Pastor are removed from the role list, the filters, the badges and the edit form. Existing records carrying an old role are shown as Member.

## 5. Church list in the self leader registration

The "select your church" list in the public leader sign-up will be filled from the churches registered by branch admins, so leaders can pick their branch and register as Bible study teacher, cell leader or PCF leader. Same list used in the admin-side leader registration.

## Technical notes

- Add a QR decoding library (`jsqr`) and wire it into `QRScannerModal.tsx` via a `requestAnimationFrame` loop over a hidden canvas from the existing `<video>`; camera starts automatically when the scanner opens.
- New helper in `src/utils/analyticsUtils.ts`: builds leader ancestry from `leaders.parentLeaderId`, resolves each member's owning cell/PCF via `invitedByLeaderId`, then aggregates `attendance_records` (church-scoped, date-filtered) into per-leader, per-cell, per-PCF totals.
- New `src/components/HierarchyAttendancePanel.tsx` rendered in `DashboardOverview.tsx` (admin) and `GroupOverview.tsx` (superadmin), fed from existing `members`, `leaders`, `attendance` props in `App.tsx`.
- `RoleType` in `src/types.ts` narrows to `'Leader' | 'Member' | 'First Timer'`; update `MemberDatabase.tsx` options/badges/edit schema and any mapping in `supabaseService.ts` that writes roles (unknown DB values normalise to `Member`).
- `PublicPortal.tsx` leader sign-up church select reads the same registered-church source already used by the self-attendance step; `LeaderRegistration.tsx` drops the members-derived church names in favour of registered churches.
