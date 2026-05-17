# Declare Missing storedQuizBanks Variable inside admin.js

Resolve a fatal sync loop exception where the Quiz Bank list failed to render newly created banks due to an omitted variable declaration in strict mode.

## User Review Required
Please review the variable declaration added to the top DOM declarations section of `admin.js`.

## Root Cause Analysis
In Issue #70 (Step 2), a real-time Firebase listener was attached to `/admin/quizBanks`. When the listener received snapshots, it executed `storedQuizBanks = snapshot.val() || {};`. However, the global variable declaration `let storedQuizBanks = {};` was accidentally omitted from the script's top declarations section. Because ES Modules enforce JavaScript Strict Mode, assigning a value to an undeclared variable instantly throws a `ReferenceError: storedQuizBanks is not defined`. This uncaught exception killed the Firebase listener callback, causing the bank list (`#quiz-bank-list`) to remain completely empty even after successfully saving new banks to Firebase. Declaring the variable restores the real-time rendering loop instantly.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Declare `storedQuizBanks` at line 93:
  ```javascript
      const quizBankListEl = document.getElementById('quiz-bank-list');
      const quizBankCountEl = document.getElementById('quiz-bank-count');

      let storedQuizBanks = {}; // <-- Declared variable

      // Extra Elements to Hide During Quiz
  ```

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Increment script version query parameter to `admin.js?v=fix_stored_banks` to bust client caches.

## Verification Plan

### Manual Verification
- Open `admin.html`. Verify zero `ReferenceError` exceptions appear in browser console (F12).
- Input topic `"2026 Tech Trivia"` and click `+ Save Quiz Bank`. Verify the new bank successfully commits to Firebase and instantly renders in the list below without requiring F5 reloads.
