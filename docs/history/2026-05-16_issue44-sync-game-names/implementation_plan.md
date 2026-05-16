# Synchronize Quiz Podium and KBC Player Rosters with WebSocket Presence Metadata

Resolve data extraction gaps in active game screens where participants in Quiz mode fallback to `'Anonymous/Legacy User'` and in KBC mode default to `'Anonymous'` due to un-synchronized profile queries.

## User Review Required
Please review the game roster data pipeline transition to presence metadata extraction.

## Root Cause Analysis
In Issue #42, we embedded user names into WebSocket presence node payloads (`onlinePresence[uid].name`). While `renderUserList()` was updated to extract this metadata, game screen rosters (`renderPodium()` and `btnKbcStart.click`) still evaluated `const userObj = allUsers[uid] || { name: 'Anonymous' }`. When database profile replication lagged or when ungraceful disconnects briefly cleared `/users`, the game screens queried an empty dictionary and unceremoniously assigned fallback placeholders.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
1. **Quiz Podium Synchronization**:
   - In `renderPodium()`, extract profile name from presence payload:
     ```javascript
     const pData = onlinePresence[uid];
     const fetchedPName = (typeof pData === 'object' && pData.name) ? pData.name : null;
     const userScoreObj = allQuizScores[uid] || {};
     const userObj = allUsers[uid] || {};
     const nameToUse = fetchedPName || userScoreObj.name || userObj.name || 'Anonymous User';
     ```
2. **KBC Roster Synchronization**:
   - In `btnKbcStart.click`, build initial contest players from presence metadata:
     ```javascript
     for (const [uid, pData] of Object.entries(onlinePresence)) {
         const isOnline = pData && (pData === true || pData.online);
         if (isOnline) {
             const fetchedPName = (typeof pData === 'object' && pData.name) ? pData.name : null;
             const userObj = allUsers[uid] || {};
             players[uid] = { name: fetchedPName || userObj.name || 'Anonymous User', points: 10 };
         }
     }
     ```

## Verification Plan

### Manual Verification
- Log in as an administrator on `admin.html`. In an incognito window, log in as an anonymous animal account (e.g., `Anonymous Owl`).
- Start a Quiz round. Submit an answer from the incognito window. Advance to podium and verify the standing displays `Anonymous Owl`.
- Start a KBC contest. Verify the active scoreboard on both admin and presenter windows instantly displays `Anonymous Owl` with 10 points.
