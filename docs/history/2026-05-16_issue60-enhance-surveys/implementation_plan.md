# Decouple Survey End from Reset and Enforce Lobby Mutex on Controls

Refactor real-time ideation and survey rating lifecycles to decouple session termination from underlying data erasure. Implement persistent snapshot archiving into question bank nodes, introduce a `Result` button to re-project historical distributions, and enforce strict mutex locking across all bank controls during active games.

## User Review Required
Please review the snapshot archiving schema (`lastSession`) and the mutex lobby protection logic.

## Proposed Architecture

### 1. Lifecycle Decoupling & Data Archiving (`admin.js`)
- When session controllers click `End Survey` or `End Ideation`, the system will transition `active: false` in `/admin/surveyState` or `/admin/ideaState` without deleting the entire node. Screens smoothly return to the lobby while maintaining cached session data.
- When a survey is revealed or ideation is ended, finalized state payloads (`submissions`, `ideas`, `results`) are archived into persistent question bank nodes (`/admin/surveys/$sid/lastSession`).
- Starting or updating a survey explicitly clears the active session node.

### 2. Expanded Question Bank Controls (`admin.html`, `admin.js`)
- Bank items now render four distinct action buttons: `Start`, `Edit`, `Delete`, and `Result`.
- The `Result` button activates if historical `lastSession` data exists. Clicking it re-mounts the archived snapshot into active state nodes with `active: true, phase: 'result'` (or `locked: true`), instantly re-projecting past histograms and ideation boards onto presenter projection displays.

### 3. Mutex Lobby Protection Barrier
- All bank action buttons (`Start`, `Edit`, `Delete`, `Result`) are guarded against execution if `currentQuizPhase !== 'idle'`.
- If an active game, quiz, or survey is in progress, controllers are prompted to end the current session before launching another, preventing data collisions across concurrent game modes.

## Verification Plan

### Manual Verification
- Open `admin.html`. Click `Start` on a survey prompt. Submit client ratings and click `Reveal Results`.
- Click `End Survey (Return to Lobby)`. Verify screens return to the lobby without wiping database nodes.
- In the question bank, verify the `Result` button on that survey is active. Click `Result`. Verify projection screens instantly re-display the historical histogram.
- While the survey is active on screen, attempt to click `Start` on a different ideation prompt. Verify the action is blocked with tooltip guidance advising to return to the lobby first.
