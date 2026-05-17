# Refactor Quiz Active Console to Always Visible Mode

Refactor `#admin-active-quiz-controls` to be permanently visible on the host dashboard, guaranteeing administrators absolute access to exit or advance running quiz sessions at any time regardless of underlying state variables.

## User Review Required
Please review the permanent visibility styling and event handlers for the Quiz Master control box.

## Proposed Changes

### 1. Permanent UI Visibility (`admin.html`)
- Remove `class="hidden"` from `#admin-active-quiz-controls`. The control box remains permanently visible directly below the quiz bank list.

### 2. Flawless Handlers & Class Toggles Removal (`admin.js`)
- Remove dynamic `classList.add('hidden')` and `classList.remove('hidden')` operations on `adminActiveQuizControls` within the `quizState` listener.
- Safely declare `adminActiveQuizControls`, `quizAdminQnum`, `quizAdminTopic`, `btnQuizNext`, `btnQuizCrown`, and `btnQuizReturn` in the top DOM section (line 85).
- Attach robust click handlers for `Next Question`, `End Game (Crown Winner)`, and `Return Lobby`.

### 3. Cache Busting (`admin.html`)
- Increment script query parameter to `admin.js?v=always_visible_quiz_controls`.

## Verification Plan

### Manual Verification
- Open `admin.html`. Verify the active quiz controls box (`#admin-active-quiz-controls`) is permanently visible directly below the Quiz Bank list upon page load.
- Verify clicking `Return Lobby` successfully transmits `active: false` to the database.
- Check Survey and KBC sections. Verify stored question lists and controls render perfectly without missing elements.
