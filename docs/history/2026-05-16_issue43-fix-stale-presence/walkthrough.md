# Walkthrough: Dynamic Profile Extraction in WebSocket Connected Listener to Prevent Stale Closure Overwrites

This document records the dynamic presence evaluation implemented to eliminate closure memory traps during WebSocket connection handshakes.

## Changes Implemented

### Dynamic Presence Dispatch (`script.js`)
- Removed the statically bound `presencePayload` closure variable from `onAuthStateChanged`.
- Inside the `.info/connected` WebSocket status listener, the payload now dynamically interrogates `auth.currentUser.displayName` precisely at the moment the socket finishes binding:
  ```javascript
  const activeDispName = (auth.currentUser && auth.currentUser.displayName) || user.displayName || 'Connecting...';
  set(userPresenceRef, { online: true, name: activeDispName, isAnon: isAnon });
  ```
- Prevents stale initial login closures from repeatedly overwriting `/presence/${uid}` back to `'Connecting...'` upon socket state fluctuations.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified new anonymous accounts seamlessly reflect assigned animal names without reverting to `'Connecting...'` across self and peer sessions.
