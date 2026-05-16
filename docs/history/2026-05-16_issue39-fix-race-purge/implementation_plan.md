# Prevent Asynchronous Race Conditions in Automated Anonymous Account Purge

Resolve a severe asynchronous race condition where newly logging in anonymous accounts (e.g., `Anonymous Owl`) are prematurely misidentified as orphaned and actively deleted by the administrator cleanup routine during the initial connection handshake.

## User Review Required
Please review the root cause discovery of the race condition and the proposed timestamp buffer (Grace Period).

## Root Cause Analysis
During anonymous authentication, client scripts asynchronously update their profile name and write to `/users/${uid}`, while simultaneously establishing their WebSocket presence node at `/presence/${uid}`. Across distributed networks, the database broadcast for `users` updates frequently arrives milliseconds before the `presence` node handshake completes. In `renderUserList()`, the active administrator script evaluated `if (isAnon && !isOnline) { remove(users/uid) }`. When the `users` broadcast arrived first, the admin script instantly executed the database deletion before the client's presence was recognized. When the presence node subsequently completed, the user was recognized as online but their profile was missing, forcing the system to crown them with `'Anonymous/Legacy User'`.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
1. **Timestamp Recording**:
   - When saving user profiles in `onAuthStateChanged` and `btnAnon.click`, include `lastActive: serverTimestamp()`.
2. **Grace Period Enforcement**:
   - In `renderUserList()`, evaluate local client age or apply a defensive cleanup delay:
     ```javascript
     const uTime = uObj.lastActive || 0;
     const isLongOffline = (Date.now() - uTime > 10000); // Enforce 10-second buffer before purging
     if (isAnon && !isOnline) {
         delete combinedUsers[uid]; // Immediately hide from UI list
         if (isAdmin && isLongOffline && uTime > 0) {
             remove(ref(db, `users/${uid}`)).catch(() => {}); // Actively purge only after grace period expires
         }
     }
     ```

## Verification Plan

### Manual Verification
- Log in as an administrator on the main site.
- In an incognito window, log in as an anonymous animal account.
- Verify the user list on the admin window correctly transitions from connection initialization directly to the assigned animal name (e.g., `Anonymous Owl`) without flashing `Anonymous/Legacy User`.
- Verify closing the incognito tab hides the user instantly and successfully purges the database node after the 10-second grace period expires.
