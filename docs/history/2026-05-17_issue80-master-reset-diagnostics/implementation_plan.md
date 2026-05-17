# Deploy Emergency Master Reset Switch and Console Diagnostics

Resolve room lockups and ghost mutex discrepancies by introducing an absolute `Emergency Return to Lobby` master reset button, making Quiz Master controls permanently visible, and injecting rich F12 developer console snapshots across all backend room endpoints.

## User Review Required
Please review the master reset broadcast logic, UI layout on the status banner, and F12 developer console diagnostic logging.

## Root Cause & Strategy
Client UIs occasionally experience discrepancies where the host dashboard remains in `LOBBY` while client screens appear locked in a ghost session (e.g., Quiz Q1) or dashboard sections (e.g., Survey Rating) appear disabled or empty. This occurs when unhandled backend disconnects or cached state flags leave residual `active: true` booleans on a room endpoint. In the application's mutex locking architecture, an active phase on any single endpoint prevents other games from initiating. To absolutely guarantee room integrity:
1. An emergency reset button (`#btn-emergency-lobby`) is introduced directly beneath the room status banner. When triggered, it broadcasts `active: false` simultaneously across all backend room endpoints (`admin/quizState`, `admin/kbcState`, `admin/surveyState`, `admin/ideaState`), forcing all connected client screens and host dashboards back to pure lobby state instantly.
2. Active Quiz console variables (`adminActiveQuizControls`, `btnQuizNext`, etc.) are declared flawlessly in strict mode and made permanently visible so administrators can exit running sessions at any time.
3. Rich diagnostic console logs (`"[DB SNAPSHOT] quizState: ..."`, etc.) are injected into every Firebase database listener, allowing developers to instantly inspect backend states via browser developer tools (F12).

## Proposed Changes

### 1. UI Enhancements (`admin.html`)
- Inject `#btn-emergency-lobby` inside the room status banner container at the top of `admin.html`.
- Remove `class="hidden"` from `#admin-active-quiz-controls`.

### 2. Master Broadcast & Diagnostic Tracing (`admin.js`)
- Declare `adminActiveQuizControls`, `quizAdminQnum`, `quizAdminTopic`, `btnQuizNext`, `btnQuizCrown`, `btnQuizReturn`, and `btnEmergencyLobby` in the top DOM declarations section (line 85).
- Attach `#btn-emergency-lobby` click handler to execute simultaneous backend inactivations:
  ```javascript
  await set(ref(db, 'admin/quizState/active'), false);
  await set(ref(db, 'admin/kbcState/active'), false);
  await set(ref(db, 'admin/surveyState/active'), false);
  await set(ref(db, 'admin/ideaState/active'), false);
  ```
- Inject diagnostic trace snapshots into all major Firebase state listeners (`quizState`, `kbcState`, `surveyState`, `ideaState`):
  ```javascript
  console.log("[DB SNAPSHOT] quizState:", state);
  ```
- Expose `window.currentQuizPhase` to allow direct inspection in the console.

### 3. Cache Busting (`admin.html`)
- Increment script query parameter to `admin.js?v=master_reset_diagnostics`.

## Verification Plan & F12 Collection Guide

### Manual Verification & F12 Guide
1. Open `admin.html` in Chrome. Press **F12** and switch to the **Console** tab.
2. **Initial Load Check**: Verify console output displays `"admin.js started initializing..."` and prints four diagnostic snapshots:
   - `[DB SNAPSHOT] quizState: ...`
   - `[DB SNAPSHOT] kbcState: ...`
   - `[DB SNAPSHOT] surveyState: ...`
   - `[DB SNAPSHOT] ideaState: ...`
   Inspect these snapshots to verify which endpoint holds residual `active: true` flags.
3. **Emergency Master Reset**: Click the red `"🚨 Force Unlock All Modes"` button.
   - Verify console outputs `"Broadcasting global master reset..."`.
   - Verify all four DB snapshot listeners re-trigger and confirm `active: false`.
   - Check Survey Rating Master section. Verify stored questions bank list renders perfectly.
4. **Quiz Controls**: Check Quiz Master section. Verify `#admin-active-quiz-controls` is permanently visible and controls function flawlessly.
