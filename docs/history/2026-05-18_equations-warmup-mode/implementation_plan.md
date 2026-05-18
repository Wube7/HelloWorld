# Implementation Plan: Equations Warm-Up Mode

Introduce a 2-variable system of equations warm-up phase ($A, B$) using strictly addition and subtraction before the main Cooperative Equations game.

## User Review Required
Please review the 2-variable warm-up mathematical structure.

## 1. Warm-up Mathematical Structure
Variables: $A, B$.
Secret values:
- $A = 7$
- $B = 4$
- **Target Passcode (Sum):** $A + B = 11$

### Equation System (Only Addition and Subtraction)
1. $A + A - B = 10$ (equivalent to $2A - B = 10$)
2. $B + B - A = 1$ (equivalent to $2B - A = 1$)

Everyone receives the exact same equations on their screens.

---

## Proposed Changes

### 1. Configuration Update (`equations_config.js`)
- Add `WARMUP_EQUATIONS` and `WARMUP_PASSCODE` exports:
  ```javascript
  export const WARMUP_EQUATIONS = [
      "A + A - B = 10",
      "B + B - A = 1"
  ];
  export const WARMUP_PASSCODE = 11;
  ```

### 2. Backend Room Schema
- Refactor `/admin/equationsState` to support `phase`:
  - `phase: 'warmup'` (Warm-up Game)
  - `phase: 'active'` (Cooperative Game)
  - `phase: 'idle'` (Inactive lobby)

### 3. Presenter View (`presenter.html`, `presenter.js`)
- Inject `#equations-presenter-warmup` layout containing the English objective:
  - `"🕵️‍♂️ System Security Pre-Lock: Warm-up Decryption"`
  - `"Analyze the system of 2 equations, calculate A and B, and compute: Answer = A + B in grams."`
- Update state listener to toggle between warmup debrief and main leaked recipe debrief.

### 4. Player View (`index.html`, `script.js`)
- Update passcode submission to match active phase:
  - In `'warmup'` phase, verify against `WARMUP_PASSCODE = 11`.
  - In `'active'` phase, verify against `EQUATIONS_PASSCODE = 32`.
- Render `WARMUP_EQUATIONS` list to all players when in warmup phase.

### 5. Host Command Center (`admin.html`, `admin.js`)
- Inject `"🚀 Start Warm-up Game"` button inside `#cooperative-equations-card`.
- Render player solved lists for the warm-up session.

## Verification Plan
- Trigger Warm-up Game from Host dashboard.
- Verify all players see exactly:
  1. `A + A - B = 10`
  2. `B + B - A = 1`
- Verify Presenter displays the English warm-up objective.
- Input sum `11` on player screen. Verify victory triggers successfully.
