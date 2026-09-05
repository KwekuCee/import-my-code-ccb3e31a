# Self-attendance: church first, leaders filtered by church

## Goal
In the self-attendance check-in form (PublicPortal), the "Select Your Church" dropdown comes before "Who Invited You / Name of Leader?", and the leader dropdown only shows leaders belonging to the selected church (e.g. choosing "GCYC Makarios" shows only Makarios leaders).

## Changes (`src/components/PublicPortal.tsx` only)

1. **Swap field order** in the form (currently leader first at ~lines 936-976): move "Select Your Church" above "Who Invited You / Name of Leader?".

2. **Filter leaders by selected church**: the leader dropdown maps `leaders.filter(l => !attChurch || (l.church || '').toLowerCase() === attChurch.toLowerCase())`, keeping the "Self Invited / Walk-In" option first. Option labels drop the redundant church suffix since they're already scoped.

3. **Reset leader when church changes**: `setAttChurch` onChange also resets `attInvitedByLeaderId` to `'self_invite'` so a leader from another church can't remain selected.

4. **Update helper text**: replace "Selecting a leader automatically sets your church branch!" with guidance like "Choose your church first, then pick your leader". Keep the auto-set-church behavior in `handleInvitedByChange` harmless (selecting a leader in the chosen church sets the same church).

## Verification
- `bunx tsgo --noEmit`
- Playwright: open self-attendance, switch churches, confirm the leader list changes and resets.
