# Prune Orphaned Legacy Upload Variables inside admin.js

Resolve a fatal script lockup where Chrome F12 console threw `Uncaught ReferenceError: btnQuizUpload is not defined`, completely unblocking the execution of KBC and Survey Rating listeners.

## User Review Required
Please review the pruning of orphaned legacy upload handlers in `admin.js`.

## Root Cause Analysis
In earlier refactoring, the global DOM variable declarations for legacy single-bank upload buttons (`btnQuizUpload`, `btnQuizDefault`, `btnQuizTemplate`) were removed from the top DOM declarations section. However, their associated event listener attachments (lines 1075-1157) were inadvertently left in the code. In ES Module strict mode, when script execution reached line 1075, evaluating `if (btnQuizUpload)` on an undeclared variable instantly threw a fatal `ReferenceError: btnQuizUpload is not defined`. This uncaught exception aborted script execution immediately, preventing all subsequent database listeners (KBC Master at line 1656 and Survey Rating Master at line 1885) from ever mounting. Pruning these orphaned handlers restores full unblocked execution across all room modules instantly.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Prune orphaned legacy event handlers (lines 1075-1157):
  - `btnQuizUpload.addEventListener`
  - `quizUploadInput.addEventListener`
  - `btnQuizDefault.addEventListener`
  - `btnQuizTemplate.addEventListener`
- Prune local variable references in `updateVisibilityState()` (lines 497-498).

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Increment script query parameter to `admin.js?v=prune_orphaned_upload_vars` to bust client caches.

## Verification Plan

### Manual Verification
- Open `admin.html` in Chrome. Press **F12** and switch to the **Console** tab.
- Verify zero `ReferenceError` exceptions appear in the console upon page load.
- Verify Survey Rating Master section perfectly renders the stored questions bank list (`#survey-bank-list`).
- Verify clicking `Start Contest` under KBC successfully transitions room modes.
