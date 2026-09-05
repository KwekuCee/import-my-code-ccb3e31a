# Clean-up, chatbot, and richer member records

## 1. White text on white — fixed system-wide

Instead of hunting page by page again, I will sweep every screen: any text, number, or icon set to white that sits on a white or light card gets the dark slate colour, and white text is kept only where the background is actually royal blue. Screens covered: both dashboards, members, leaders, churches, admins, attendance, reports, settings, scanner, check-in station, sign-up and login pages, and every popup. I will then walk the app in the browser and check each page's rendered colours, so nothing invisible is left.

## 2. Remove demo churches everywhere

Hard-coded names (GCYC Main, GCYC 2, CE Mamprobi, CE Dansoman, CE Achimota and similar) appear as fixed dropdown choices and as fallback values in the leaders screen, attendance screen, new member form, announcements, leader registration, exports and check-in. Every one of those lists will be built from the churches actually registered in the system, and the fallbacks become blank (or "Unassigned") instead of a demo name. Example placeholders inside text boxes will be made generic.

## 3. AI support chatbot

The Support button on both dashboards opens a chat panel powered by Lovable AI. It answers questions about how to use the system: check-in, QR passes, registering leaders, foundation classes, attendance, birthdays, settings, exports. It is instructed to refuse and redirect for anything privileged — member or leader counts, individual records, passwords, credentials, emails, or database contents — and it has no access to your data, so it cannot leak it.

## 4. Check-in station: gender and marital status

The self check-in form gets a required gender choice and a marital status choice (single, married, divorced, widowed, other). Both are saved with the member and shown on the member details card and lists in the admin and superadmin views, and included in exports.

## 5. Education level "Other"

Choosing Other for education level reveals a box to type the exact level, and that typed value is what gets saved — same behaviour occupation already has.

## 6. Optional profile photo

Members can add a photo (optional) at check-in, and admins can add or replace one when editing a member. Photos are stored in the app's file storage and shown as the member's picture in the lists, member card and directories; members without one keep the initials circle.

## 7. Forgot password that really works

The link on the login page sends a reset email through the backend and opens a page in the app where the admin sets a new password, which is then saved to their account so they can sign in with it.

## 8. Birthday email reminder, one day ahead

A daily backend job checks tomorrow's birthdays and emails the admin of that member's church (and a group summary to the superadmin) with the names. The dashboard lists stay as they are.

## 9. Moving members between churches and assigning a leader

The superadmin can change a member's church; after choosing the new church, the leader list narrows to that church's leaders so the member can be assigned to one. The move updates the member's church and leader everywhere, so counts and the check-in leader list follow immediately.

## 10. Promotions reflect in the church admin view

When the superadmin promotes a member to leader, the new leader appears in that church admin's leaders list and in the check-in leader choices without any extra step. Leaders remain members too — they still have a QR pass and must be scanned for their own attendance.

## 11. Absentees and follow-up reasons

For a chosen service and date, the admin dashboard lists who was expected but not checked in, with a count. Each absent person can be given a follow-up reason and a short note after calls are made. The superadmin gets an absence report across churches: totals per church and per service, with the recorded reasons.

## Technical notes

- Migration adds to `members`: `marital_status`, `photo_url`; new table `absence_records` (member, church, service type, date, reason, note, recorded_by) with grants, RLS and an updated-at trigger. A storage bucket for member photos with read/write policies.
- Chatbot: new edge function calling Lovable AI (`openai/gpt-5.6-sol` via the Responses API) with a system prompt that whitelists product help and refuses data/credential questions; no database access from the function. Frontend chat panel wired to the existing Support button in `Sidebar`/`TopHeader`.
- Password reset: `sendPasswordResetEmail` already exists in `supabaseService`; add a `/reset-password` view that completes the recovery session and calls `updateUser`. Admin accounts stored in `church_admin_accounts` get their password field updated by an edge function using the service role when the account is not an auth user.
- Birthday reminders: scheduled edge function (pg_cron) reusing the existing Resend sender; email delivery stays limited to the verified test address until a sending domain is verified at Resend.
- Church dropdowns: replace hard-coded `<option>` blocks in `LeaderDirectory`, `AttendanceView`, `NewRegistration`, `AnnouncementModal`, `LeaderRegistration`, and fallbacks in `App.tsx`, `supabaseService.ts`, `QRScannerModal`, `exportUtils`, `DashboardOverview` with the fetched `churches` list.
- Absentees derive from members of the church minus `attendance_records` for that service/date.
