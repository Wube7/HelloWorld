# User-Facing Countdown Timer

The goal is to display a real-time countdown timer on every user's screen showing how many seconds remain before the next question automatically loads.

## User Review Required
Please review the proposed approach for keeping the timer synchronized across different devices.

## Proposed Changes

### UI Components (public/index.html)
#### [MODIFY] index.html
- Add a new `<div>` above the question in the `#quiz-container` to show the remaining time.
- It will be styled prominently (e.g., in red text) and hidden by default unless a timer is active.

### Logic (public/script.js)
#### [MODIFY] script.js
- **State Update:** When the admin advances to a new question and the timer is > 0, we will also write `timerEnd: Date.now() + (timerSecs * 1000)` to the `admin/quizState` in Firebase. This acts as a global deadline that all clients can read.
- **Client Render Loop:**
  - Introduce an interval on the client side (`clientTimerInterval`).
  - When `onValue` receives a `timerEnd` value that is in the future:
    - Display the timer UI element.
    - Start a 1-second interval loop that calculates the remaining seconds `Math.ceil((state.timerEnd - Date.now()) / 1000)` and updates the UI.
    - When it hits 0, display "Time's up!" or "0s" and wait for the admin's device to dispatch the next question state.
  - Clear this interval whenever the question changes, ends, or if no timer is provided.

## Open Questions
- Is standard clock synchronization (assuming client devices have reasonably accurate local clocks) acceptable here? For small timers (5–30 seconds), this is usually perfectly fine and avoids heavy round-trip sync logic.

## Verification Plan
### Manual Verification
- Deploy to Firebase.
- Open as admin on one device and as an ordinary user on another device.
- Set a 15-second timer and start the quiz.
- Observe both devices showing the counting down timer in sync.
