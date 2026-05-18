# Walkthrough: Equations Warm-Up Mode

This document records the successful implementation, deployment, and verification of the Equations Warm-Up Mode, featuring a 2-variable system ($A, B$), passcode `11` validation, and a themed Presenter view.

## Changes Implemented

### 1. Symmetric Equations Setup (`equations_config.js`)
- Added `WARMUP_EQUATIONS` ($A+A-B=10$, $B+B-A=1$) and `WARMUP_PASSCODE` ($11$) exports to the configuration file.

### 2. Dynamic Player UI Phase Handling (`index.html`, `script.js`)
- Refactored player `/admin/equationsState` listener in `script.js` (line 720) to support phase detection:
  - In `'warmup'` phase: Renders the identical 2 equations to everyone.
  - In `'active'` phase: Renders the custom symmetric matrix.
- Updated passcode submit button to dynamically verify passcode `11` when `state.phase === 'warmup'`, else verify `32`.

### 3. Themed Presenter View (`presenter.html`, `presenter.js`)
- Injected `#equations-presenter-warmup` panel inside `presenter.html` styled as a System Security Pre-Lock Calibration debrief. Displays:
  - `"🎲 Equations Warm-Up Round"`
  - `"👥 Warm-Up Solved: X / Y Players"`
  - Explains the 2-variable operator relations ($A+A-B=10, B+B-A=1$) and objectives.
- Registered state handling inside `presenter.js` to seamlessly toggle the warmup debrief.

### 4. Host Command Center (`admin.html`, `admin.js`)
- Injected `#btn-equations-warmup-start` inside the equations card in `admin.html`.
- Wired the `click` listener in `admin.js` to trigger `phase: 'warmup'` assignment.
- Handled live player status list badges to display `[Warm-Up solver]` during warmup phase.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified clicking `Start Warm-up Game` launches the warmup phase successfully.
- Verified all players see identical Q1-Q2 equations.
- Verified submitting `11` successfully triggers the full-screen victory card.
