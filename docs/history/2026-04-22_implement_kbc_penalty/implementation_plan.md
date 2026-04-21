# Implementation Plan - KBC Heavy Penalty (Issue #17)

This plan details how to implement the heavy penalty (2-point deduction) for the player(s) who make the worst pick in the Keynesian Beauty Contest.

## Proposed Changes

### [MODIFY] [script.js](file:///c:/Users/jrben/.gemini/antigravity/HelloWorld/public/script.js)

1.  **Logic Update (`resolveKbcRound`):**
    *   Find the `maxDist` among all players who successfully submitted a pick by comparing their pick to the target.
    *   Identify all `worstUids` that match this `maxDist`, but explicitly *exclude* anyone who is in `winnerUids`. (You shouldn't lose points if you actually tied for the win!).
    *   In the points deduction loop, if the player is in `worstUids`, deduct 2 points instead of 1. Allow their points to drop to negative values.
    *   Collect a list of `worstNames` to pass to the client in the `lastResult` object.
    *   Add `worstUids` to the history object.
2.  **UI Update (`renderKbcHistory`):**
    *   Update the history table renderer to display a skull (`💀`) emoji and styling next to the pick of anyone who had 2 points deducted in that round.
3.  **UI Update (State Listener for `phase === 'result'`):**
    *   If `lastResult` contains `worstNames`, unhide and populate the newly added penalty UI element (added to `index.html`) so everyone clearly sees who was penalized.

### [MODIFY] [index.html](file:///c:/Users/jrben/.gemini/antigravity/HelloWorld/public/index.html)

1.  **Result Container Update:**
    *   Add a new `div` with the id `kbc-res-penalty` (hidden by default) in the `kbc-result-container`.
    *   This will contain the text announcing that `[Player]` picked the furthest number and lost 2 points.

## Open Questions

None. The requirements from the issue are very clear about what should happen, and handling negative points is well defined in both the deduction and elimination logic.

## Verification Plan

### Automated Tests
*   N/A

### Manual Verification
1.  Run the application locally via a test server.
2.  Join with 3 concurrent user sessions (using multiple browsers/incognito windows or the anonymous system).
3.  Have User A pick 40, User B pick 50, and User C pick 100.
    *   The average is ~63. Target is ~50.
    *   User B should win.
    *   User A loses 1 point.
    *   User C is furthest from 50 (dist = 50), so User C should be listed as the worst picker, and lose 2 points.
4.  Wait 5 rounds until User C loses all 10 points and drops below 0 to verify the game continues correctly and eliminates them.
5.  Check the history table and result UI to guarantee the skull and penalty message render properly.
