# Firebase Security Rules Hardening Plan

The objective is to resolve Firebase security warnings by tightening access controls for the Realtime Database. Currently, multiple paths have public read access (`".read": true`) or even root-level public read.

## Proposed Changes

### [MODIFY] [database.rules.json](file:///c:/Users/jrben/.gemini/antigravity/HelloWorld/database.rules.json)

- **Remove root-level** `".read": true`.
- Change `".read": true" to `".read": "auth != null"` for the following paths to ensure only logged-in users (including anonymous ones) can see data:
  - `users`
  - `presence`
  - `messages`
  - `quizScores`
  - `admin/globalView`
  - `admin/quizState`
  - `admin/currentQuizData`
  - `admin/kbcState`
- **Preserve existing write rules**, ensuring only owners can write to their respective `$uid` sub-paths, and the admin (`wube8816@gmail.com`) can manage global configurations.

## Verification Plan

### Automated Tests
- Run `firebase_validate_security_rules` to ensure syntax correctness.
- Deploy rules using `firebase deploy --only database`.

### Manual Verification
- Log in as an anonymous user and verify messages and leaderboard still load.
- Log out and verify (via Firebase Console or manual test) that reading `/messages` or `/quizScores` is rejected.
