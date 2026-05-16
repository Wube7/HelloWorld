# Refactor Blocking Top-Level await on Static Assets inside admin.js

Resolve a severe UI lockup where navigating to `admin.html` caused the host console to stall endlessly on `"Verifying Authentication..."`, ensuring instant execution of authentication listeners and timeout watchdogs.

## User Review Required
Please review the conversion of blocking `await fetch` calls to non-blocking asynchronous promises in `admin.js`.

## Root Cause Analysis
During initial script execution in `admin.js`, line 112 executed a top-level `await fetch('quiz.json')`. Because this operation was wrapped in an `await` inside the primary DOMContentLoaded execution stack, any network delay, emulator throttling, or static asset stalling caused the promise to remain in a `pending` state indefinitely. This completely blocked the JavaScript engine from advancing to subsequent code blocks, isolating the Firebase authentication state listener (`onAuthStateChanged`) and preventing the 5-second verification watchdog from ever mounting. Converting static asset fetching to non-blocking promise chains (`fetch(...).then(...)`) allows script execution to instantly proceed to authentication evaluation.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Convert blocking static asset fetch to non-blocking promise chain:
  ```javascript
  let quizData = [];
  let defaultQuizData = [];
  fetch('quiz.json').then(res => res.json()).then(data => {
      defaultQuizData = data;
      quizData = defaultQuizData;
  }).catch(e => console.error("Could not load quiz.json fallback"));
  ```

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Increment script version query parameter to `admin.js?v=fix_auth_pending` to bust client caches.

## Verification Plan

### Manual Verification
- Open `admin.html`. Verify the host console instantly passes `"Verifying Authentication..."` and displays `"👑 Active Admin"` or prompt login within milliseconds.
- Verify all KBC, Survey, and Quiz Multiple Bank controls initialize perfectly.
