# Walkthrough: Decouple KBC Return Lobby from Data Reset, Archive Last Session, and Enforce Lobby Mutex

This document records the lifecycle decoupling, database snapshot archiving (`kbcArchive`), and lobby mutex protections implemented across the Keynesian Beauty Contest master module.

## Changes Implemented

### KBC Lifecycle & Archiving (`admin.html`, `admin.js`)
1. **Data Preservation (`Return Lobby` vs `Reset Data`)**:
   - Replaced legacy data deletion buttons with `Return Lobby (Keep Data)`.
   - Session termination now transitions `active: false` without wiping underlying state nodes. Screens smoothly return to the lobby while active database nodes preserve historical data. Finalized snapshots (`players`, `history`, `lastResult`) are archived directly into `/admin/kbcArchive`.
2. **Historical Projection (`Result` button)**:
   - Introduced the `Result (Last Session)` button in the KBC lobby launch bar.
   - Re-mounts finalized snapshots back to active projection state nodes (`active: true, phase: 'ended'`), allowing controllers to re-display past contest winners and round history tables at any time.
3. **Lobby Mutex Protection**:
   - Launch buttons (`Start Contest`, `Result`) are guarded against execution if `currentQuizPhase !== 'idle'`. Active contest flow buttons (`End Round / Resolve`, `Force Resolve`) are dynamically hidden inside the lobby and only exposed during active games.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified returning to the lobby during or after KBC rounds preserves historical data without database wipes.
- Verified clicking `Result` on finalized KBC sessions successfully re-projects past standings.
- Verified launch buttons are correctly locked out during active games.
