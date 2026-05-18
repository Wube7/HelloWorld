# Hybrid Dynamic Persistence Architecture

Deploys a hybrid dynamic persistence architecture to allow Google-authenticated administrators to seamlessly share and inherit sessions across new tabs (e.g., launching `admin.html`), while keeping temporary anonymous player sessions strictly sandboxed in their individual tabs to prevent silent background hijacking.

## User Review Required
Please review the dynamic persistence selectors assigned during player interaction click handlers.

---

## Dynamic Selection Rules

### 1. Google Logins (Admin / Permanent Accounts)
- **Persistence**: `browserLocalPersistence` (Shared `localStorage`).
- **Rationale**: Allows the Google authentication state to survive browser restarts and be inherited instantly when the administrator clicks `"Admin Panel"` to open `admin.html` in a new tab.

### 2. Anonymous Logins (Player Accounts)
- **Persistence**: `browserSessionPersistence` (Isolated `sessionStorage`).
- **Rationale**: Restricts the temporary anonymous login strictly to the individual tab, completely shielding the lobby from silent Presenter background hijacking, and enabling local multi-player testing.

---

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Import `browserLocalPersistence` from Firebase Auth (line 2).
- Remove default auth persistence setting from initial load (line 18).
- Inside `btnGoogle` click listener, dynamically set persistence to local:
  ```javascript
  await setPersistence(auth, browserLocalPersistence);
  await signInWithPopup(auth, provider);
  ```
- Inside `btnAnon` click listener, dynamically set persistence to session:
  ```javascript
  await setPersistence(auth, browserSessionPersistence);
  const result = await signInAnonymously(auth);
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Import `browserLocalPersistence` from Firebase Auth (line 2).
- Configure admin persistence to local:
  ```javascript
  await setPersistence(auth, browserLocalPersistence).catch(console.error);
  ```
  This ensures the Host Console instantly inherits the shared Google local storage token upon opening.

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Retain session persistence to isolate silent anonymous login:
  ```javascript
  await setPersistence(auth, browserSessionPersistence).catch(console.error);
  ```

## Verification Plan

### Manual Verification
- Log in with a Google admin account on the player lobby (`index.html`).
- Click the `"Admin Panel"` link to open `admin.html` in a new tab.
- Verify that the Host Console **instantly inherits the session and authenticates successfully** without requiring re-login!
- Log out from the lobby.
- Log in as an Anonymous player. Verify the session is isolated, local multiplayer testing remains unlocked, and no idle auto-logins occur.
