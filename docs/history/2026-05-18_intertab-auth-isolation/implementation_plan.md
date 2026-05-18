# Isolate Tab Authentication via browserSessionPersistence

Resolve a critical inter-tab session hijacking bug where the Presenter's auto-anonymous sign-in (or Admin's session) silently signs the logged-out Player lobby tab back in as a nameless `Loading...` User due to shared origin LocalStorage synchronizations.

## User Review Required
Please review the transition from `browserLocalPersistence` to `browserSessionPersistence`.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Import `setPersistence` and `browserSessionPersistence` from the Firebase Auth module (line 2).
- Set auth persistence immediately after Firebase Auth initialization:
  ```javascript
  app = initializeApp(config);
  auth = getAuth(app);
  db = getDatabase(app);
  await setPersistence(auth, browserSessionPersistence).catch(console.error);
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Import `setPersistence` and `browserSessionPersistence` from the Firebase Auth module (line 2).
- Set auth persistence immediately after Firebase Auth initialization:
  ```javascript
  app = initializeApp(config);
  auth = getAuth(app);
  db = getDatabase(app);
  await setPersistence(auth, browserSessionPersistence).catch(console.error);
  ```

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Import `setPersistence` and `browserSessionPersistence` from the Firebase Auth module (line 2).
- Set auth persistence immediately after Firebase Auth initialization:
  ```javascript
  app = initializeApp(config);
  auth = getAuth(app);
  db = getDatabase(app);
  await setPersistence(auth, browserSessionPersistence).catch(console.error);
  ```

## Verification Plan

### Manual Verification
- Open a Google Chrome browser window.
- Open three separate tabs under the same staging origin:
  - Tab 1: `index.html` (Player)
  - Tab 2: `presenter.html` (Presenter)
  - Tab 3: `admin.html` (Host Console)
- Log in with a Google account on Tab 1.
- Log out on Tab 1.
- Verify that Tab 1 remains cleanly logged out and **does not silently auto-log back in** as a nameless `Loading...` User when Tab 2 performs its silent anonymous auth checks.
- Open another player Tab 4. Verify you can log in as a *different* anonymous user on Tab 4, confirming beautiful session isolation!
