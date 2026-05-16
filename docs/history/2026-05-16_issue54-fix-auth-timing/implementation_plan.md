# Synchronize Auth State Handshake to Prevent Premature Lobby Transition and Admin Timeout

Resolve authentication state race conditions where the client application prematurely enters the interactive lobby during active Google OAuth popups, and resolve stalled loading screens on the admin control console due to browser transaction locks.

## User Review Required
Please review the auth resolving lock barrier and fallback timeout mechanisms.

## Root Cause Analysis
In `script.js`, when users click `Sign in with Google`, the Firebase Auth SDK initializes the `signInWithPopup` sequence. During this initialization, underlying IndexedDB storage state shifts frequently broadcast transitional unverified user snapshots to `onAuthStateChanged` before OAuth tokens are fully verified. Consequently, the lobby un-hides early while displaying `'Loading...'`. Furthermore, opening `admin.html` in concurrent tabs while an OAuth popup is active on the main page causes browser IndexedDB transaction locks, preventing `admin.js` from resolving its auth state and stalling permanently on `'Verifying Authentication...'`. Enforcing an execution barrier (`isGoogleAuthResolving`) in `script.js` and adding a 5-second timeout fallback in `admin.js` guarantees flawless synchronization.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Introduce `isGoogleAuthResolving` flag around `signInWithPopup`:
  ```javascript
  let isGoogleAuthResolving = false;
  btnGoogle.addEventListener('click', async () => {
      isGoogleAuthResolving = true;
      const provider = new GoogleAuthProvider();
      try {
          await signInWithPopup(auth, provider);
      } catch(err) { ... } finally {
          isGoogleAuthResolving = false;
      }
  });
  ```
- Guard `onAuthStateChanged` against premature execution:
  ```javascript
  onAuthStateChanged(auth, (user) => {
      if (isGoogleAuthResolving) return;
      ...
  });
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Add timeout fallback for stalled authentication state:
  ```javascript
  let authResolved = false;
  onAuthStateChanged(auth, (user) => {
      authResolved = true;
      ...
  });

  setTimeout(() => {
      if (!authResolved && adminStatus) {
          adminStatus.textContent = "⚠️ Authentication verification timeout. Please ensure you are logged in on the main page or F5 reload.";
      }
  }, 5000);
  ```

## Verification Plan

### Manual Verification
- Click `Sign in with Google` on `index.html`. While the account selection popup is open, verify the main page remains on the welcome screen without prematurely un-hiding the lobby.
- Open `admin.html` in a new browser tab. Verify it quickly resolves authentication or displays the timeout prompt if browser cookies/storage are restricted.
