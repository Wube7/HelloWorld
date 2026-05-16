# Implement Admin Force-Logout and Automatic Cleanup of Offline Anonymous Accounts

Enhance user management capabilities by enabling verified administrators to forcefully disconnect/logout online users directly from the UI, and introduce an automatic database purge for orphaned offline anonymous accounts.

## User Review Required
Please review the administrative kick mechanism and the database cleanup rules for legacy anonymous profiles.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
1. **Admin Force-Logout Mechanism**:
   - In `onAuthStateChanged`, establish an active listener on `admin/kicklist/${user.uid}`.
   - When triggered, alert the user, remove their presence node, purge the kicklist entry, and immediately execute `signOut(auth)`.
   - In `renderUserList`, if the active user is a verified admin (`ADMIN_EMAILS`), append a `🚷` kick button to online participant list items (excluding the admin themselves). Attach click handler to write to `admin/kicklist/${targetUid}`.

2. **Automated Offline Anonymous Account Cleanup**:
   - In `renderUserList`, dynamically filter out any user object where `isAnonymous === true` (or name starts with 'Anonymous') AND `!onlinePresence[uid]`.
   - If the active user is an admin, automatically dispatch `remove(ref(db, 'users/' + uid))` to actively clean up orphaned database nodes created during ungraceful browser exits.

## Verification Plan

### Manual Verification
- Log in as an administrator (`wube8816@gmail.com`).
- In another browser profile or incognito window, log in as an anonymous animal account.
- On the admin view, open the user list modal and verify a `🚷` kick button appears next to the anonymous account.
- Click the kick button and verify the incognito window instantly alerts and logs out the anonymous user.
- Close an anonymous session ungracefully (close tab) and verify the offline account is automatically purged from the user list and database.
