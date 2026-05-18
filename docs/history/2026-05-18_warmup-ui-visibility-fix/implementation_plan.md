# Fix Equations Warm-up Player UI Visibility

Resolve a critical layout mounting bug where the Player UI remains completely blank during Equations Warm-up Mode by updating the `updateVisibilityState` container handler inside `script.js`.

## User Review Required
Please review the dynamic container mounting rules in `script.js`.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Update `updateVisibilityState` container toggles (lines 419-421) to mount the equations container in both warmup and active phases:
  ```javascript
  } else if (currentQuizPhase === 'equations-active' || currentQuizPhase === 'equations-warmup') {
      const equationsClientContainer = document.getElementById('equations-client-container');
      if (equationsClientContainer) equationsClientContainer.classList.remove('hidden');
  }
  ```

## Verification Plan

### Manual Verification
- Click `Start Warm-up Game` on the host dashboard.
- Verify the player screen instantly mounts `#equations-client-container` displaying the two warm-up equations.
- Input sum `11` and verify the passcode accepts and triggers victory.
