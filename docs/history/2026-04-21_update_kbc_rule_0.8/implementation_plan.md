# Implementation Plan - Update KBC Rule to 0.8x Average

Update the Keynesian Beauty Contest game logic and UI to change the winning multiplier from 2/3 (0.66...) to 0.8.

## Proposed Changes

### [MODIFY] [script.js](file:///c:/Users/jrben/.gemini/antigravity/HelloWorld/public/script.js)

- Update the target calculation logic.
- Update the history table header text.

### [MODIFY] [index.html](file:///c:/Users/jrben/.gemini/antigravity/HelloWorld/public/index.html)

- Update the game instruction text.
- Update the result stat label.

## Verification Plan

### Automated Tests
- I will verify the logic by running a mock calculation in a scratch script if needed, but the change is a simple constant update.
- I will use the browser tool to verify the UI text is updated correctly.

### Manual Verification
- Check the "Game" tab for the new instruction text.
- Check the "History" tab (if rounds exist) for the new column header.
- Check the "Round Result" screen for the new target label.
