# Walkthrough: Implement Admin Force-Logout and Automatic Cleanup of Offline Anonymous Accounts

This document records the backend and client enhancements implemented to enable verified administrators to disconnect online users forcefully and introduce an automated database cleanup for legacy anonymous profiles.

## Changes Implemented

### Active User Management (`script.js`, `admin.js`)
1. **Admin Force-Logout (Kick Mechanism)**:
   - Attached a real-time listener to `admin/kicklist/${user.uid}` during active authentication.
   - When a kick signal is detected, the client instantly alerts the user, purges their active presence, deletes the kicklist record, and executes `signOut(auth)`.
   - In `renderUserList()`, administrators now see a prominent `🚷` kick button attached to all online participant entries (excluding themselves). Clicking the button broadcasts the kick signal.
2. **Automated Offline Anonymous Profile Purge**:
   - Updated `renderUserList()` to dynamically filter out any account flagged as anonymous (`isAnonymous` or starting with 'Anonymous') when unassociated with an active WebSocket presence (`!onlinePresence[uid]`).
   - If an administrator is active, the system automatically dispatches asynchronous `remove()` calls to actively purge orphaned profile nodes from the database.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified clicking `🚷` next to an active anonymous session instantly triggers an alert and logs out the target browser.
- Verified closing an anonymous session ungracefully automatically evaporates its profile from the user list upon disconnect.
