# Dynamic Profile Extraction in WebSocket Connected Listener to Prevent Stale Closure Overwrites

Resolve a subtle closure trap where anonymous users display as `'Connecting...'` across peer and self user lists due to stale presence payload evaluations during WebSocket state handshakes.

## User Review Required
Please review the closure analysis and the proposed dynamic presence evaluation.

## Root Cause Analysis
When anonymous users logged in, `onAuthStateChanged` executed immediately before `updateProfile` could assign their animal name. Inside `onAuthStateChanged`, the static `presencePayload` object was initialized and frozen in memory as `{ name: 'Connecting...' }`. When the WebSocket listener (`.info/connected`) subsequently fired or re-initialized upon network state fluctuations, it repeatedly wrote this frozen, stale closure payload to `/presence/${uid}`. Although `btnAnon.click` updated the presence node correctly to `'Anonymous Owl'`, any subsequent WebSocket event unceremoniously overwrote the database back to `'Connecting...'`.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Inside `onAuthStateChanged`, remove the static `presencePayload` closure variable.
- Inside the `.info/connected` listener callback, dynamically evaluate the active profile name precisely at the moment of presence dispatch:
  ```javascript
  connectedUnsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
          onDisconnect(userPresenceRef).remove().then(() => {
              const disp = (auth.currentUser && auth.currentUser.displayName) || user.displayName || 'Connecting...';
              set(userPresenceRef, { online: true, name: disp, isAnon: isAnon });
          });
      }
  });
  ```

## Verification Plan

### Manual Verification
- Log in as an administrator on `admin.html`.
- In an incognito window, log in as an anonymous account.
- Verify the user list on both windows instantly reveals the correct animal name without flashing or reverting to `'Connecting...'`.
- Press F5 in the incognito window. Verify the user list maintains perfect rendering of the animal name.
