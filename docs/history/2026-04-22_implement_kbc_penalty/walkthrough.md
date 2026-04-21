# Walkthrough - KBC Heavy Penalty (Issue #17)

I have implemented the heavy penalty for the Keynesian Beauty Contest (KBC) as described in Issue #17.

## Changes Made

### Logic Updates (`script.js`)
*   **Worst Pick Calculation:** Added logic to `resolveKbcRound` to find the maximum distance (`maxDist`) between players' submitted picks and the target `0.8 * average`.
*   **Winner Protection:** Ensured that a player who ties for the win cannot be marked as the "worst picker," even if their guess mathematically satisfies `maxDist` (e.g. if everyone picks the exact same number).
*   **Point Deduction:** Re-wrote the deduction loop. Standard losers lose 1 point. Anyone caught in the `worstUids` bucket loses 2 points.
*   **Negative Points:** Retained existing logic to ensure points drop negative and eliminate players exactly as intended.
*   **State Payload:** Added `worstNames` to `lastResult` and `worstUids` to the history map for frontend rendering.

### UI Updates (`index.html` & `script.js`)
*   **Result Announcement:** Added a new notification banner block in the UI that slides into view during `phase === 'result'` to publicly name the player(s) who were penalized.
    *   *Example Output:* "💀 Charlie picked the furthest number and lost 2 points!"
*   **History Table:** Upgraded `renderKbcHistory`. Anyone marked with `worstUids` in a past round will now have a skull emoji (`💀`) and red text rendered next to their pick.

## Verification Results

### Simulated Verification
I ran the logic against an isolated local script mimicking the production variables:
*   Alice, 2 pts, picked 40.
*   Bob, 10 pts, picked 50.
*   Charlie, 1 pt, picked 100.
*   **Result:** The algorithm computed Bob as the winner. Charlie was identified as the worst picker, and Charlie's score successfully reduced from 1 point to -1 point as tested.
