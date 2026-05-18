# Implementation Plan: Cooperative Equations Game Mode

Deploy the perfectly symmetric Cooperative Equations game mode inside the Brainstorm Room host and player dashboards.

## Proposed Changes

### 1. Game Backend State & Data Generation
- Hardcode the six distinct player roles ($A, B, C, D, E, F$) and their corresponding perfectly symmetric single-digit equation matrix.
- Maintain a single backend room state `/admin/equationsState`:
  ```json
  {
    "active": true,
    "submissions": {}
  }
  ```

### 2. Host Command Center (`admin.html`, `admin.js`)
- Inject `#cooperative-equations-card` under the main dashboard grid to allow the Host to launch or terminate Equation game sessions.
- Display real-time role assignment lists and player submissions tracking in the host view.

### 3. Player Dashboard (`index.html`, `script.js`)
- Hide standard components during the Equation phase.
- Inject `#equations-game-panel` containing the cleanly styled 6-equation symmetric list.
- Style all equations with identical CSS. No highlights or color offsets are permitted.
- Include a passcode submission form.

## Verification Plan
- Open staging console, trigger Equations Game Mode.
- Verify Player C sees Q3 as exactly `C = 6 + 9 - 2 - 5` resolving to 8.
- Verify Player D sees Q4 as exactly `D = 3 + 9 - 6 - 4` resolving to 2.
- Verify all players see a visually identical list of 6 equations with zero color highlights, sharing exact character lengths, operators, and structure.
- Select correct values from in-game chat, input sum `32`, and verify victory state triggers correctly.
