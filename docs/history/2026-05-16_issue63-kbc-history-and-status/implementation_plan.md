# Synchronize KBC Round History Projection and Expose Phase Status in Console

Ensure historical KBC round distributions project flawlessly onto presenter displays during archived result projections, and provide clear real-time phase indicators within the host administrator console during manual calculations.

## User Review Required
Please review the KBC phase status indicator mapping (`input` -> `Waiting for Submissions`, `result` -> `Round Resolving (3s)`, `ended` -> `Contest Over (Standings)`).

## Root Cause Analysis
When session controllers clicked `Result (Last Session)` in `admin.html`, Firebase state nodes successfully transitioned to `phase: 'ended'`. However, inside `presenter.js`, the `ended` branch of the KBC state listener omitted calling `renderKbcHistory()`, leaving the historical round table completely unpopulated on projection screens. Furthermore, inside `admin.html`, `#admin-active-kbc-controls` only displayed the round number without indicating the current sub-phase. When controllers clicked `Force Resolve`, the database transitioned from `input` to `result`, but because the round number remained unchanged and no phase indicator existed, the host console UI appeared completely static (apart from button disabling), leading controllers to believe the action had failed. Invoking `renderKbcHistory` on projection displays and exposing exact phase indicators in the host console provides absolute visual feedback.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Inject `#kbc-admin-status` into the active KBC title header:
  ```html
  <div style="color: #f472b6; font-weight: bold; margin-bottom: 8px;">🎲 Active KBC in Progress (Round <span id="kbc-admin-round">1</span>)<span id="kbc-admin-status"></span></div>
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Map current sub-phase to `#kbc-admin-status`:
  ```javascript
  const phaseDisplayMap = { input: 'Waiting for Submissions', result: 'Round Resolving (3s)', ended: 'Contest Over (Standings)' };
  const phaseStr = phaseDisplayMap[state.phase] || state.phase;
  const kbcAdminStatusEl = document.getElementById('kbc-admin-status');
  if (kbcAdminStatusEl) kbcAdminStatusEl.textContent = ` - Phase: ${phaseStr}`;
  ```

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Invoke `renderKbcHistory` during the `ended` phase:
  ```javascript
  } else if (state.phase === 'ended') {
      currentQuizPhase = 'kbc-ended';
      updateVisibilityState();
      ...
      renderKbcScoreboard(document.getElementById('kbc-final-score-list'), players);
      renderKbcHistory(state.history, players); // Synchronize historical table
  }
  ```

## Verification Plan

### Manual Verification
- Start a KBC contest on `admin.html`. Verify the console header displays `"Phase: Waiting for Submissions"`.
- Have one participant answer. Click `Force Resolve`. Verify the console header instantly changes to `"Phase: Round Resolving (3s)"`.
- After 3 seconds, verify it returns to `"Phase: Waiting for Submissions"` on round 2.
- Click `Return Lobby`. Click `Result (Last Session)`. Verify projection displays instantly reveal the finalized scoreboard and the complete round history table.
