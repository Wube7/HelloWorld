# Isolate Tab Authentication with rel="opener" Session Inheritance

Resolve a critical inter-tab session hijacking bug where the Presenter's auto-anonymous sign-in silently signs the logged-out Player lobby tab back in as a nameless `Loading...` User due to shared origin LocalStorage.

We will enforce complete session sandboxing using `browserSessionPersistence` (Session Storage), while utilizing the HTML5 native `rel="opener"` attribute to allow the newly opened Admin Panel tab to perfectly copy and inherit the Administrator's active session from the parent lobby.

## User Review Required
Please review the HTML anchor tag updates inside `public/index.html`.

---

## Proposed Changes

### Public Assets

#### [MODIFY] [public/index.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/index.html)
- Update the Admin Panel link and Presenter Page link (lines 22-23) to explicitly set `rel="opener"`:
  ```html
  <a id="link-admin-panel" href="admin.html" target="_blank" rel="opener" class="hidden glass-panel-small user-badge" ...>👑 Admin</a>
  <a id="link-presenter-page" href="presenter.html" target="_blank" rel="opener" class="hidden glass-panel-small user-badge" ...>📺 Presenter</a>
  ```
  This instructs modern browsers to copy the parent tab's active `sessionStorage` token directly to the new tab when clicked.

#### [MODIFY] [public/script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Set auth persistence to `browserSessionPersistence` on load:
  ```javascript
  app = initializeApp(config);
  auth = getAuth(app);
  db = getDatabase(app);
  await setPersistence(auth, browserSessionPersistence).catch(console.error);
  ```

#### [MODIFY] [public/admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Set auth persistence to `browserSessionPersistence` on load:
  ```javascript
  app = initializeApp(config);
  auth = getAuth(app);
  db = getDatabase(app);
  await setPersistence(auth, browserSessionPersistence).catch(console.error);
  ```

#### [MODIFY] [public/presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Set auth persistence to `browserSessionPersistence` on load:
  ```javascript
  app = initializeApp(config);
  auth = getAuth(app);
  db = getDatabase(app);
  await setPersistence(auth, browserSessionPersistence).catch(console.error);
  ```

## Verification Plan

### Manual Verification
- Open a Google Chrome browser window.
- Open the player lobby (`index.html`). Log in with a Google administrator account (`wube8816@gmail.com`).
- Click the `👑 Admin` button in the header.
- Verify that `admin.html` opens in a **new tab**, **instantly inherits the administrator session, and authenticates successfully**!
- Go back to Tab 1 (Player lobby). Log out.
- Verify Tab 1 remains cleanly logged out and does not silently auto-log back in as a nameless user.
