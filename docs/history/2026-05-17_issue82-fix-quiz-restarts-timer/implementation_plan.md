# Synchronize Bank Cards and Correct Timer Metadata inside admin.js

Resolve two gameplay bugs reported on the host console: (A) Start buttons remaining disabled when returning to the lobby from a finished quiz, and (B) Auto-jump timers failing to advance questions automatically when the countdown expires.

## User Review Required
Please review the synchronization of bank card rendering functions in `updateVisibilityState()` and the timer metadata lookup correction in `admin.js`.

## Root Cause Analysis

### Bug A: Obsolete Disabled Attributes on Bank Cards
When a quiz session was active (`currentQuizPhase === 'question'` or `'podium'`), all bank list cards (`renderQuizBankList`, `renderSurveyBank`, `renderIdeaBank`) generated start buttons with `disabled` attributes enforced by mutex lock checks (`currentQuizPhase !== 'idle'`). When administrators clicked `Return Lobby`, `currentQuizPhase` correctly reverted to `'idle'`, and `updateVisibilityState()` was invoked. However, `updateVisibilityState()` only refreshed layout containers without re-triggering the bank card rendering functions. Consequently, the bank cards retained their obsolete `disabled` attributes from the previous active phase. Adding explicit calls to re-render the bank lists at the end of `updateVisibilityState()` instantly unlatches all buttons upon entering the lobby.

### Bug B: Incorrect Timer Duration Source
During question advancement in `quizState`, line 904 attempted to look up timer duration from an obsolete, non-existent DOM element (`document.getElementById('quiz-auto-jump')`). Because this element was `null`, the parsed duration always defaulted to `0`. Consequently, the auto-jump countdown evaluation (`if (timerSecs > 0)`) never executed. Changing the lookup to read `state.timerSecs` directly from the database snapshot restores automated question jumping instantly.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Re-trigger bank card rendering at the end of `updateVisibilityState()` (line 550):
  ```javascript
  if (typeof updateRoomStatusBanner === 'function') updateRoomStatusBanner();
  if (typeof renderQuizBankList === 'function') renderQuizBankList();
  if (typeof renderSurveyBank === 'function') renderSurveyBank();
  if (typeof renderIdeaBank === 'function') renderIdeaBank();
  ```
- Correct timer lookup in `quizState` listener (line 904):
  ```javascript
  clearAutoJump();
  if (auth.currentUser && auth.currentUser.email && ADMIN_EMAILS.includes(auth.currentUser.email)) {
      const timerSecs = parseInt(state?.timerSecs) || 0;
      if (timerSecs > 0) {
          autoJumpTimeoutId = setTimeout(() => { ... }, timerSecs * 1000);
      }
  }
  ```

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Increment script query parameter to `admin.js?v=sync_cards_timer`.

## Verification Plan

### Manual Verification
- Open `admin.html`. Save a Quiz Bank with timer set to 10 seconds.
- Click `Start`. Verify the quiz starts and timer counts down from 10.
- Wait 10 seconds. Verify the quiz automatically jumps to Question 2 when countdown expires.
- Click `Return Lobby`. Verify all bank cards instantly re-enable their Start buttons without requiring F5 reloads.
