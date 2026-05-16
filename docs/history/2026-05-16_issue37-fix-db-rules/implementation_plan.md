# Resolve Database Rules Permission Denied on Kicklist and Orphaned Cleanup

Fix database permission gaps in `database.rules.json` that rejected administrative kicks (`admin/kicklist`) and automated database removal of orphaned offline accounts (`users`).

## User Review Required
Please review the security rules additions for admin kicklist and administrator override rights on user profile nodes.

## Root Cause Analysis
When the admin force-logout (kick) feature was introduced in Issue #34, client scripts wrote to `admin/kicklist/${targetUid}`. However, `database.rules.json` lacked any definition for `kicklist` under `admin`, causing Firebase to reject writes with `PERMISSION_DENIED`. Additionally, automated background cleanup of offline anonymous accounts (`remove(ref(db, 'users/' + uid))`) failed because write access under `/users/${uid}` was strictly restricted to `auth.uid == $uid`.

## Proposed Changes

### Public Assets

#### [MODIFY] [database.rules.json](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/database.rules.json)
- Grant administrator (`wube8816@gmail.com`) override write access on `/users/$uid`.
- Grant administrator override write access on `/presence/$uid`.
- Add rules for `/admin/kicklist`:
  ```json
  "kicklist": {
      ".read": "auth != null",
      "$uid": {
          ".write": "auth != null && (auth.token.email == 'wube8816@gmail.com' || auth.uid == $uid)"
      }
  }
  ```

## Verification Plan

### Manual Verification
- Log in as an administrator (`wube8816@gmail.com`).
- In an incognito window, log in as an anonymous account.
- On the admin view, click `🚷` next to the anonymous account.
- Verify the operation completes successfully without throwing `Kick failed: PERMISSION_DENIED`. Verify target incognito window logs out instantly.
