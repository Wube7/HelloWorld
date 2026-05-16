# Decouple Active KBC Controls from hideAll and Unlock End Game Button

Resolve a host console deadlock where reloading during active KBC sessions caused active control panels to vanish or lock up, ensuring administrators maintain absolute session override capabilities across all states.

## User Review Required
Please review the permanent unlocking of `End Game` and `Return Lobby` buttons during active KBC sessions.

## Root Cause Analysis
In Issue #61, `#admin-active-kbc-controls` was appended to the global `hideAll()` DOM visibility helper in `admin.js`. When host administrators reloaded `admin.html` while a KBC session was active, the state listener correctly un-hid `adminActiveKbcControls` but immediately invoked `updateVisibilityState()`. Because `updateVisibilityState()` executed `hideAll()` across active phases (`kbc-input`, `kbc-result`, `kbc-ended`), the active control panel was instantly hidden again. With `btnKbcStart` correctly disabled due to `active === true` and active controls hidden by `hideAll()`, host administrators were trapped in a deadlock without any clickable flow buttons. Furthermore, `btnKbcEnd` was previously restricted to `input` phases. Decoupling active host control boxes from `hideAll()` and keeping `btnKbcEnd` and `btnKbcReturn` permanently unlocked across all active phases completely eliminates this deadlock.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Remove `adminActiveKbcControls` from `hideAll()` helper and move cleanups exclusively to the `idle` branch:
  ```javascript
  const hideAll = () => {
      if (cardsGrid) cardsGrid.classList.add('hidden');
      ... // Keep game containers only, remove active control boxes
  };
  ...
  } else {
      // Idle Phase
      hideAll();
      if (adminActiveKbcControls) adminActiveKbcControls.classList.add('hidden');
      if (adminActiveSurveyControls) adminActiveSurveyControls.classList.add('hidden');
      if (adminActiveIdeaControls) adminActiveIdeaControls.classList.add('hidden');
  ```
- Keep `btnKbcEnd` and `btnKbcReturn` permanently enabled during active phases:
  ```javascript
  if (state && state.active) {
      if (adminActiveKbcControls) adminActiveKbcControls.classList.remove('hidden');
      if (btnKbcStart) btnKbcStart.disabled = true;
      if (btnKbcRes) btnKbcRes.disabled = true;
      if (btnKbcEnd) btnKbcEnd.disabled = false; // Permanently unlocked
      if (btnKbcReturn) btnKbcReturn.disabled = false; // Permanently unlocked
      if (btnKbcForce) btnKbcForce.disabled = (state.phase !== 'input');
  ```

## Verification Plan

### Manual Verification
- Start a KBC contest on `admin.html`.
- Press `F5` to simulate a host browser reload or system update.
- Verify that upon reload, `#admin-active-kbc-controls` reliably appears displaying active round info.
- Verify `End Game (Crown Winner)` and `Return Lobby (Keep Data)` buttons are fully enabled. Click `End Game` and verify the contest successfully terminates and crowns the points leader.
