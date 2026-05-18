# Configure Realtime Database Security Rules for equationsState

Resolve the `PERMISSION_DENIED` write failure on staging when launching the Cooperative Equations Game Mode by securely registering the `/admin/equationsState` node inside `database.rules.json`.

## User Review Required
Please review the secure read/write permissions injected for the Equations Game Mode.

## Proposed Changes

### Firebase Rules

#### [MODIFY] [database.rules.json](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/database.rules.json)
- Add secure node entry under `admin` block (line 100):
  ```json
  "equationsState": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.email == 'wube8816@gmail.com'"
  }
  ```

## Verification Plan

### Automated Rule Deployment
- Deploy security rules using the Firebase CLI:
  ```bash
  firebase deploy --only database
  ```

### Manual Verification
- Click `Start Equations Game` on the host dashboard.
- Verify no `PERMISSION_DENIED` exceptions appear in Chrome F12 developer console.
- Verify the game successfully launches and broadcasts the status transition.
