# Eliminate Quiz Auto-Jump Timer Race Conditions

Resolve severe non-deterministic gameplay bugs where the quiz timer countdown reaches zero but fails to advance to the next question, subsequent answers fail to score, and the timer display disappears on later questions.

## User Review Required
Please review the metadata spreading structure in `admin.js` and the elimination of redundant jump controllers in `script.js`.

## Root Cause Analysis

### 1. Obsolete State Payloads Dropping Crucial Metadata
When the auto-jump timer countdown expired in `admin.js` (line 915), it generated a fresh state payload `{ active: true, phase: 'question', questionIndex: nextIdx }`. Because it did not spread previous state attributes (`...state`), crucial metadata (`bankId`, `topic`, `timerSecs`) was entirely dropped on Question 2 and beyond. When the real-time database broadcasted the new state for Question 2, `state.timerSecs` evaluated as `undefined`. Consequently, line 908 (`const timerSecs = parseInt(state?.timerSecs) || 0`) returned 0, breaking the jump evaluation (`if (timerSecs > 0)`) and causing the countdown to freeze indefinitely. Spreading `...state` ensures all crucial attributes inherit perfectly across every single round.

### 2. Dual Controller Race Collisions
Both `admin.js` and `script.js` attempted to register auto-jump countdown `setTimeout` handlers when logged in with administrator credentials. This introduced severe backend write collisions where multiple clients raced to write question indices simultaneously. Eliminating the auto-jump controller from `script.js` ensures the Quiz Master console (`admin.js`) acts as the single authoritative conductor.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Ensure full metadata inheritance during automated transitions (lines 913-915):
  ```javascript
  set(ref(db, 'admin/quizState'), { ...state, active: true, phase: 'podium' });
  ...
  const stateObj = { ...state, active: true, phase: 'question', questionIndex: nextIdx };
  ```
- Ensure full metadata inheritance during manual transitions in `btnQuizNext` click handler (line 660).

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Remove redundant `setTimeout` auto-jump registrations (lines 629-643), preserving only `clearAutoJump()`.

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Increment script query parameter to `admin.js?v=fix_timer_metadata_race`.

## Verification Plan

### Manual Verification
- Open `admin.html`. Save a Quiz Bank with a 10-second timer.
- Click `Start`. Verify Question 1 mounts and timer counts down from 10.
- Wait 10 seconds. Verify the quiz automatically advances to Question 2.
- Verify Question 2 correctly displays the timer counting down from 10 again (confirming `timerSecs` metadata was successfully inherited).
- Select correct answers on Question 2 and verify scores update perfectly.
