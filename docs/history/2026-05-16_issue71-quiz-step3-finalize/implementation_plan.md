# Step 3/3: Finalize Quiz Multi-Bank Transition

Conclude the Quiz Master multi-bank refactoring through its final baby step. Prune all obsolete legacy single-bank static DOM buttons and their associated event listeners, and fully activate the dynamic Quiz Master active control console (`#admin-active-quiz-controls`) for live gameplay management.

## User Review Required
Please review the legacy code cleanup and the active Quiz Master control bindings.

## Proposed Changes

### 1. Legacy Pruning (`admin.html`, `admin.js`)
- In `admin.html`, delete `#legacy-quiz-controls-hidden`.
- In `admin.js`, delete legacy DOM declarations (`btnQuizStart`, `btnQuizUpload`, `btnQuizDefault`, etc.) and their associated static click listeners.
- In `admin.js` quiz listener, remove legacy `disabled` attribute toggling on obsolete buttons (`btnQuizStart.disabled = ...`).

### 2. Active Gameplay Controls (`admin.js`)
- Ensure `#admin-active-quiz-controls` visibility is bound cleanly to active quiz phases (`question` and `podium`) and hides exclusively upon returning to lobby (`idle`).

### 3. Script Version Invalidation (`admin.html`)
- Increment script query parameter to `admin.js?v=step3` to guarantee cache invalidation.

## Verification Plan

### Manual Verification
- On `admin.html`, click `Start` on any saved Quiz Bank. Verify the quiz initiates and reveals `#admin-active-quiz-controls`.
- Click `Next Question`. Verify the quiz advances to question 2.
- Click `End Game (Crown Winner)`. Verify the game immediately transitions to podium standings and archives the snapshot.
- Click `Return Lobby`. Verify the active controls hide smoothly and all bank buttons re-enable correctly.
