# Fix KBC Result Button Inactivity and Upgrade Active End Button to Instant Game Over

Resolve KBC snapshot inactivity where early contest terminations left `/admin/kbcArchive` unpopulated, and upgrade the active contest termination button to instantly crown the current points leader.

## User Review Required
Please review the continuous snapshot archiving schema and early crowning termination logic.

## Root Cause Analysis
In `admin.js`, snapshot archiving into `/admin/kbcArchive` previously executed exclusively inside final elimination branches (`remainingActive <= 1`). If session controllers clicked `Return Lobby` or ended a contest before a final elimination occurred, no archive snapshot was recorded. Consequently, clicking `Result (Last Session)` in the lobby failed due to missing archive state (`lastKbcArchive === null`). Ensuring that snapshot archiving executes on every round resolution guarantees persistent snapshot availability. Furthermore, the active contest termination button (`btnKbcEnd`) previously triggered a standard round resolve. Upgrading its click handler to execute an instant state transition to `phase: 'ended'` with full archive storage instantly crowns the current points leader across all active projection and client displays.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Update active contest termination button label to reflect instant crowning:
  ```html
  <button id="btn-kbc-end" class="primary-btn btn-sm" style="background: rgba(244, 114, 182, 0.2); border: 1px solid #f472b6; color: white;">End Game (Crown Winner)</button>
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Move snapshot archiving to execute synchronously on every round calculation:
  ```javascript
  const currentArchiveObj = {
      round: state.round,
      players: updatedPlayers,
      lastResult: lastResult,
      history: existingHistory,
      deadlockRuleActive: nextDeadlockRuleActive
  };
  await set(ref(db, 'admin/kbcArchive'), currentArchiveObj);
  ```
- Refactor `btnKbcEnd` click handler to execute instant crowning:
  ```javascript
  if (btnKbcEnd) {
      btnKbcEnd.addEventListener('click', async () => {
          if (confirm("Are you sure you want to end the KBC game early and crown the winner based on current points?")) {
              const snap = await new Promise(resolve => {
                  onValue(ref(db, 'admin/kbcState'), resolve, { onlyOnce: true });
              });
              const state = snap.val();
              if (!state || !state.active || !state.players) return;
              
              const archiveObj = {
                  round: state.round || 1,
                  players: state.players,
                  lastResult: state.lastResult || null,
                  history: state.history || [],
                  deadlockRuleActive: !!state.deadlockRuleActive
             };
             await set(ref(db, 'admin/kbcState'), { ...state, phase: 'ended' });
             await set(ref(db, 'admin/kbcArchive'), archiveObj);
         }
     });
  }
  ```

## Verification Plan

### Manual Verification
- Start a KBC contest on `admin.html`. Submit one round of answers.
- During round 2, click `End Game (Crown Winner)`. Verify that projection screens instantly transition to the podium/ended phase and crown the current points leader without advancing to another input round.
- Click `Return Lobby (Keep Data)`. In the lobby, verify the `Result (Last Session)` button is active. Click `Result`. Verify screens instantly re-project the finalized standings and round history table.
