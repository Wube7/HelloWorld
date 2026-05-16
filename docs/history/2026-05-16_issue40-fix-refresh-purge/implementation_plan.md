# Implement Disconnect State Tracker to Prevent Premature Purge on Browser Refresh

Resolve a critical timing anomaly where anonymous users refreshing their browser tab (F5) after prolonged activity are downgraded to `'Anonymous/Legacy User'` due to premature database profile purging.

## User Review Required
Please review the memory-backed disconnect state tracker designed to measure true offline duration.

## Root Cause Analysis
In Issue #39, we protected logins by checking `Date.now() - lastActive > 10000`. However, `lastActive` was only recorded once during initial login. If a user stayed in the room for 30 seconds and then refreshed their browser (F5), their WebSocket presence disconnected briefly. When the active administrator script ran `renderUserList()`, it evaluated `now - lastActive (30s) > 10s`, instantly concluding the user was long-offline and purging their profile from `/users/${uid}` before the browser refresh completed. Reconnecting milliseconds later, the user lacked a database profile and was crowned `'Anonymous/Legacy User'`.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Declare an in-memory disconnect tracking map: `let disconnectMap = {};`.
- In `renderUserList()`, track exact disconnection events:
  ```javascript
  const now = Date.now();
  for (const [uid, uObj] of Object.entries(combinedUsers)) {
      const isOnline = !!onlinePresence[uid];
      const isAnon = uObj.isAnonymous || (uObj.name && uObj.name.startsWith('Anonymous'));
      
      if (isOnline) {
          delete disconnectMap[uid]; // Clear disconnect record on active presence
      } else if (isAnon) {
          if (!disconnectMap[uid]) disconnectMap[uid] = now; // Record exact disconnect moment
          const offlineDuration = now - disconnectMap[uid];
          
          delete combinedUsers[uid]; // Hide from UI immediately
          if (isAdmin && offlineDuration > 15000) { // Purge database only if offline > 15s
              remove(ref(db, `users/${uid}`)).catch(() => {});
          }
      }
  }
  ```

## Verification Plan

### Manual Verification
- Log in as an administrator on `admin.html`.
- In an incognito window, log in as an anonymous account (e.g., `Anonymous Owl`). Wait for 20 seconds in the room.
- Press F5 (Refresh) on the incognito window.
- Verify the user list transitions smoothly back to `Anonymous Owl` without showing `Anonymous/Legacy User`.
- Close the incognito window completely. Verify the database node is automatically purged after 15 seconds.
