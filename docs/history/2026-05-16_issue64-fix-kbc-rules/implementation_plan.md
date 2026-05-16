# Grant Read/Write Permissions for kbcArchive in database.rules.json

Resolve fatal `PERMISSION_DENIED` exceptions by introducing explicit database security rules for the newly created snapshot archiving node `/admin/kbcArchive`, fully restoring manual round calculations and historical lobby projections.

## User Review Required
Please review the security rule definition allowing authenticated reads and host admin writes for `/admin/kbcArchive`.

## Root Cause Analysis
In Issue #61, a new Firebase Realtime Database node `/admin/kbcArchive` was introduced to store finalized contest snapshots. However, `database.rules.json` was not updated to grant explicit read or write permissions for this new path. Because Firebase Realtime Database enforces default-deny security policies, whenever `resolveKbcRound` attempted to save a round calculation via `set(ref(db, 'admin/kbcArchive'), ...)`, the server rejected the write with `PERMISSION_DENIED`. This unhandled exception aborted the round resolve function mid-execution, preventing the subsequent state transition to `phase: 'result'` and rendering the `Force Resolve` button inactive. Furthermore, the real-time archive listener in `admin.js` failed upon connection due to read rejections, permanently keeping `lastKbcArchive` null and locking out the lobby `Result` button. Adding explicit security permissions instantly clears these barriers.

## Proposed Changes

### Database Configuration

#### [MODIFY] [database.rules.json](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/database.rules.json)
- Inject `/admin/kbcArchive` security rule definitions under the `admin` node:
  ```json
  "admin": {
      "kbcArchive": {
          ".read": "auth != null",
          ".write": "auth != null && auth.token.email == 'wube8816@gmail.com'"
      },
      "kicklist": { ... }
  ```

## Verification Plan

### Manual Verification
- Start a KBC contest on `admin.html`.
- Have one participant submit an answer while a second participant remains idle. Click `Force Resolve`.
- Verify the action succeeds without console errors, instantly deducting points from the un-submitted participant and advancing the header to `"Round Resolving (3s)"`.
- Click `Return Lobby`. Verify the lobby `Result (Last Session)` button is active. Click `Result` and verify the archived standing is projected flawlessly onto presenter screens.
