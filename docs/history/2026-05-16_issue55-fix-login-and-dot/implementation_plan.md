# Synchronize Promise Microtasks in Google Sign-In and Standardize Presence Metadata Extraction

Resolve an authentication synchronization race condition where Google OAuth logins stall on the welcome screen upon success due to Promise microtask ordering, and resolve inactive green online indicators across user lists for newly connected accounts.

## User Review Required
Please review the decoupled `enterLobby` async function and standardized `checkIsOnline` helper.

## Root Cause Analysis
When users authenticate via Google popup, Firebase Auth SDK resolves the internal token and triggers all registered `onAuthStateChanged` listeners before the outer `signInWithPopup` Promise completes resolving and enters its `finally` block. Consequently, when `onAuthStateChanged` executed, `isGoogleAuthResolving` was still `true`, causing the listener to abort immediately without transitioning the interface into the lobby. Decoupling lobby initialization into an explicit `enterLobby(user)` async function called directly upon `signInWithPopup` success eliminates this race condition. Furthermore, in active user list rendering, presence verifications relied on simple boolean assertions (`!!onlinePresence[uid]`). Because presence nodes contain metadata objects (`{ online: true }`), offline or disconnected metadata payloads evaluated to `true`, while rendering loops occasionally missed newly synced presence structures. Standardizing `checkIsOnline` across all presence evaluations ensures flawless indicator accuracy.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Decouple lobby entry into standalone async function:
  ```javascript
  async function enterLobby(user) {
      document.body.classList.add('logged-in-white');
      loginSection.classList.add('hidden');
      mainContent.classList.remove('hidden');
      onlineCounter.classList.remove('hidden');
      userProfilePanel.classList.remove('hidden');
      if (btnLogout) btnLogout.classList.remove('hidden');
      userNameDisplay.textContent = user.displayName || 'Loading...';
      ... // Existing listener, profile, and presence attachments
  }
  ```
- Standardize `checkIsOnline` helper across user list verifications:
  ```javascript
  function checkIsOnline(pData) {
      return pData && (pData === true || pData.online);
  }
  ```

## Verification Plan

### Manual Verification
- Open `index.html`. Click `Sign in with Google`. Verify upon popup authorization that the screen instantly transitions from the welcome banner to the active interactive lobby.
- Open an incognito window and sign in anonymously. Verify the active user list correctly displays the newly created ninja account accompanied by a bright green indicator dot.
