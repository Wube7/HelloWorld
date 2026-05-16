# Step 2/3: Implement Multi-Bank List Rendering and Archiving

Execute the second baby step of Quiz Master multi-bank refactoring. Establish a real-time Firebase listener for `/admin/quizBanks` and render list items dynamically with `Start`, `Delete`, and `Result` buttons guarded by lobby mutex locks. Implement historical snapshot archiving (`lastSession`) upon quiz completion.

## User Review Required
Please review the list rendering mechanics and the historical podium re-projection logic.

## Proposed Changes

### 1. Real-Time Bank List Rendering (`admin.js`)
- Declare `storedQuizBanks` and establish a Firebase listener for `/admin/quizBanks`.
- Implement `renderQuizBankList()` to generate dynamic list items inside `#quiz-bank-list`.
- Attach `Start`, `Delete`, and `Result` button handlers guarded by `currentQuizPhase === 'idle'` lobby mutex locks.

### 2. Active Launch & Historical Re-projection (`admin.js`)
- Clicking `Start` commits the bank questions to `/admin/currentQuizData` and initiates `/admin/quizState` (`phase: 'question'`).
- Clicking `Result` reads archived snapshots from `/admin/quizBanks/${bankId}/lastSession` and instantly re-mounts them to active projection screens (`phase: 'podium'`).

### 3. Script Version Invalidation (`admin.html`)
- Increment script query parameter to `admin.js?v=step2` to guarantee cache invalidation.

## Verification Plan

### Manual Verification
- On `admin.html`, verify the saved Quiz Bank appears in the list with `Start` and `Delete` buttons.
- Click `Start`. Verify the quiz initiates successfully on question 1.
- Answer question 1 and conclude the quiz. Verify final scores archive into `/lastSession`.
- Return to lobby. Click `Result` on that bank. Verify projection screens flawlessly re-display the historical podium celebration.
