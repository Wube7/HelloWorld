# Walkthrough: Synchronize Quiz Podium and KBC Player Rosters with WebSocket Presence Metadata

This document records the game roster data pipeline updates implemented to guarantee flawless animal name retention across Quiz and KBC screens.

## Changes Implemented

### Roster Extraction Refactoring (`script.js`, `admin.js`, `presenter.js`)
1. **Quiz Podium Extraction**:
   - Refactored `renderPodium()` to extract profile names directly from the presence payload (`pData.name`) or matching quiz score metadata (`userScoreObj.name`) prior to querying the `/users` database node.
2. **KBC Roster Extraction**:
   - Updated `btnKbcStart.click` roster builders in `script.js` and `admin.js`.
   - When building the initial contest participant list (`players`), the active administrator script interrogates the WebSocket presence payload (`onlinePresence[uid].name`) to guarantee real animal names (e.g., `Anonymous Owl`) are embedded into the contest state.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified standing Quiz podiums cleanly reflect assigned animal names across self, peer, and projection screens without reverting to Legacy User placeholders.
- Verified starting KBC contests populates active scoreboards flawlessly with full animal names.
