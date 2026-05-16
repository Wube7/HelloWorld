# Walkthrough: Grant Read/Write Permissions for kbcArchive in database.rules.json

This document records the database security rule definitions implemented to resolve `PERMISSION_DENIED` exceptions and restore manual round calculations and historical lobby projections for the KBC module.

## Changes Implemented

### Database Security & Permissions (`database.rules.json`)
- Granted explicit read permissions (`auth != null`) and host admin write permissions (`auth.token.email == 'wube8816@gmail.com'`) for `/admin/kbcArchive`.
- Successfully resolves server-side rejection errors during manual round calculations (`Force Resolve`), allowing un-submitted players to be penalized exactly 1 point and smoothly skipped as the contest advances to the next round.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified clicking `Force Resolve` when participants are unanswered successfully calculates deductions and advances the game without permission exceptions.
- Verified clicking `Result (Last Session)` in the lobby successfully reads archived snapshots and re-projects historical standings.
