# Verified admin emails, superadmin-only promotions, leader passes

## 1. Branch admins must verify their email before signing in

- When someone signs up as a church branch admin, their account is created but marked unverified.
- A verification email is sent straight away to the address they entered, from the connected Gmail account, containing a one-tap verification link that expires after 24 hours.
- Trying to sign in before verifying shows a clear message ("Please verify your email first") plus a "Send the link again" button — no dashboard access.
- Opening the link marks the account verified and shows a confirmation page with a button to sign in.
- The group (superadmin) account is unaffected and keeps signing in as today.

## 2. No automatic leadership; every promotion goes through the group account

- Choosing or finishing any foundation school class no longer turns anyone into a Bible study class teacher. That automatic step is removed entirely.
- The automatic four-groups growth ladder (Bible study class teacher -> cell leader -> PCF leader) is switched off.
- A branch admin can still propose that a member becomes a leader, but it is saved as "Pending approval" and gives no leader powers until the group account approves it.
- The group account gets an approvals list: approve (the person becomes that leader) or decline (the request is removed). Every decision is written to the activity log.
- The group account can still appoint anyone to any leader role directly.

## 3. Leaders get their own code and QR pass, and appear in the member list

- After a leader registers, the system generates a short leader code (for example `LDR-4821`) and a QR pass with it.
- The leader can download the pass immediately, and it is also emailed to them.
- Branch admins can scan a leader's pass in the scanner to record that leader's attendance, same as a member pass, with the once-per-service-per-day guard.
- Registering a leader also creates (or updates) their record in the member database, tagged with their leader role, so every leader is a member while not every member is a leader.

## Technical notes

- Migration:
  - Drop `trg_member_foundation_graduation` and its function body's leader-creation logic; drop `trg_leader_structure_changed`; make `apply_leader_growth_rules()` a no-op-safe counter refresh only (keeps `downstream_count` accurate).
  - `user_profiles` / `church_admin_accounts`: default `admin_verified = false` for new branch admins; add `email_verification_tokens` table (email, token_hash, expires_at, used_at) with service-role-only grants and RLS, mirroring `password_reset_tokens`.
  - `verify_user_login` returns `{ success: false, error: 'email_unverified' }` when the matched non-Superadmin profile is unverified.
  - Add `leaders.leader_code` (unique, nullable) and backfill existing leaders.
  - Promotion requests reuse `promotion_queue` (add `requested_by`, `status`) rather than a new table.
- Edge functions:
  - New `verify-email` function: `POST` issues/re-issues a token and sends the Gmail message; `GET ?token=` validates, sets `admin_verified = true`, returns a small confirmation page.
  - `portal-db` login path surfaces the `email_unverified` error verbatim so the UI can show the resend action; add a `resendVerification` action.
- Client:
  - `PublicPortal.tsx`: `handleAdminSignUp` triggers verification email and shows a "check your inbox" state; `handleAdminLogin` handles the unverified error with a resend button; new `/verify` handling if the link lands back in the app.
  - `handleLeaderSelfReg` and `LeaderRegistration.tsx`: generate the leader code, render/download the QR pass (reuse the member pass renderer), email it, and upsert the matching `members` row with `role: 'Leader'`.
  - `QRScannerModal.tsx`: accept leader codes as well as member IDs and record leader attendance.
  - `LeaderDirectory.tsx` / superadmin settings: pending approvals list with approve/decline wired to `promotion_queue`.
