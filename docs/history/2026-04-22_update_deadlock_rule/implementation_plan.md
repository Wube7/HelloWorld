# Update Trigger for Keyensian Beauty Contest Deadlock Rule

This plan proposes changing the trigger for the Deadlock Rule in the Keynesian Beauty Contest application. The rule currently triggers if the number `0` wins a round. The user has requested to change the trigger so that it triggers when **every player picks the same number**. When this happens, no one loses a point for that round, and the deadlock rule protects future rounds by activating and disqualifying repeated numbers.

## Proposed Changes

### KBC Game Logic

#### [MODIFY] script.js
- Rename the state variables referencing `zeroRule` to `deadlockRule` (`zeroRuleActive` -> `deadlockRuleActive`) to accurately reflect the trigger. This includes backward compatibility checks for active game sessions.
- Modify the resolution logic inside `resolveKbcRound()`:
  - Check if all submitted players picked the exact same number (`Object.keys(pickCounts).length === 1 && submittedPlayers.length > 1`).
  - If they do, they automatically all have the same distance to the target (which is their chosen number * 0.8), meaning they all "win" and thus **no one loses a point**. This naturally solves the "no one loses a point" requirement.
  - Set `nextDeadlockRuleActive` to `true` if this deadlock condition occurs, enabling the rule for all subsequent rounds.
  - Expose a `deadlockTriggeredNow` boolean flag in `lastResult` so the UI knows to announce that the rule has just been enabled.

### KBC User Interface

#### [MODIFY] index.html
- Add a new hidden `<div>` under the point penalty message in the Result Phase `<section id="kbc-result-container">` to announce the newly-enabled deadlock rule. The text will briefly explain: "⚠️ **Deadlock!** Everyone picked the same number. No one lost a point, but the Deadlock Rule activates next round!".

#### [MODIFY] script.js
- In the frontend listener for the `phase === 'result'` state, add logic to toggle the visibility of the new "Deadlock Triggered Now" UI element based on the `r.deadlockTriggeredNow` flag.

## Verification Plan

### Manual Verification
- Start a test game with 3 incognito tabs/users.
- Have all 3 users submit the same number (e.g., 50).
- Confirm that the result shows a deadlock announcement, and none of their point totals (10) decrease.
- Proceed to the next round, and confirm the Deadlock banner appears for the newly active rule.
- Have 2 players pick the same number, and ensure they are disqualified and subsequently lose points as governed by the existing rule.
