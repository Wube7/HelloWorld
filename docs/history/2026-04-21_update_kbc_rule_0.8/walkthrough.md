# Walkthrough - KBC Rule Update to 0.8x Average

I have updated the Keynesian Beauty Contest winning rule from 2/3 of the average to 0.8 of the average. This involved updating both the backend-simulated logic and the frontend user interface.

## Changes Made

### Logic Updates
In `script.js`, I updated the `resolveKbcRound` function to use the new `0.8` multiplier.

```javascript
// Before
const target = avg * 2 / 3;

// After
const target = avg * 0.8;
```

### UI Updates
I updated the following UI elements to reflect the new rule:

1.  **Game Instructions**: Updated the text in the main KBC container in `index.html`.
2.  **Result Stat Labels**: Updated the "Target" label in the round result section in `index.html`.
3.  **History Table Header**: Updated the history table column header in `script.js`.

## Verification Results

### Browser Verification
I ran a local server and verified the UI text update:

-   **Instruction Text**: "Pick an integer from 0 to 100. The winner is closest to 0.8 of the average!" (Verified ✅)

### Code Verification
The logic change was verified by inspecting the `script.js` file after the edit.

> [!NOTE]
> All other game rules (Deadlock Rule, Dual Rule) remain intact and function as before.
