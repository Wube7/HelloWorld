# Refactor Quiz Master Controls to Dynamic Visibility

Align active Quiz Master console visibility (`#admin-active-quiz-controls`) with Survey and KBC UI design conventions by maintaining it hidden during idle lobby state and dynamically revealing it only when an active quiz session starts or reveals results.

## User Review Required
Please review the dynamic classList visibility toggles in `admin.js`.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Restore `class="hidden"` attribute to `#admin-active-quiz-controls` (line 55) so it remains cleanly collapsed by default upon entering the lobby.
- Increment script query parameter to `admin.js?v=dynamic_quiz_visibility`.

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Restore `classList.add('hidden')` and `classList.remove('hidden')` operations inside the real-time `quizState` listener (lines 929-935):
  ```javascript
  if (!state || !state.active) {
      clearAutoJump();
      clearClientTimer();
      currentQuizPhase = 'idle';
      if (adminActiveQuizControls) adminActiveQuizControls.classList.add('hidden');
      updateVisibilityState();
      return;
  }
  
  currentQuizStateObj = state;
  if (adminActiveQuizControls) adminActiveQuizControls.classList.remove('hidden');
  ```

## Verification Plan

### Manual Verification
- Open `admin.html`. Verify the Quiz Master controls box (`#admin-active-quiz-controls`) is cleanly hidden beneath the quiz bank list upon page load.
- Click `Start` on a Quiz Bank card. Verify the controls box instantly mounts and reveals standard controls (`Next Question`, etc.).
- Click `Return Lobby`. Verify the controls box instantly collapses back into hidden mode.
