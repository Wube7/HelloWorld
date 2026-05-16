# Attach User Profile Metadata to WebSocket Presence Nodes to Eliminate Connecting Placeholder Flashes

Enhance presence broadcast architecture by embedding user profile metadata (`name`, `isAnon`) directly into WebSocket presence nodes (`/presence/${uid}`), eliminating peer dependency on lagging `/users` database node broadcasts.

## User Review Required
Please review the metadata attachment on presence nodes and the updated user list merger logic.

## Root Cause Analysis
In previous implementations, WebSocket connection handshakes broadcasted boolean flags (`presence/uid = true`). Peer sessions rendering the live user list had to take the active UID and query their local `allUsers` map for the user's name. Across distributed networks, the `users` node broadcast often lagged behind the WebSocket presence broadcast by several hundred milliseconds. During this brief window, peers evaluating `!combinedUsers[uid]` correctly applied the fallback `'Connecting...'`. By attaching profile metadata directly to the presence payload (`{ online: true, name: "Anonymous Owl", isAnon: true }`), the initial presence broadcast arrives fully populated with the user's real name, allowing peer user lists to render perfectly without waiting for database profile synchronization.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
1. **Presence Payload Enhancement**:
   - In `onAuthStateChanged`, broadcast metadata object:
     ```javascript
     const presencePayload = { online: true, name: user.displayName || 'Connecting...', isAnon: isAnon };
     set(userPresenceRef, presencePayload);
     ```
   - In `btnAnon.click`, re-sync presence payload upon successful profile assignment:
     ```javascript
     set(ref(db, `presence/${result.user.uid}`), { online: true, name: auth.currentUser.displayName, isAnon: true });
     ```
2. **Robust User List Merger**:
   - In `renderUserList()`, extract profile names directly from presence node metadata when database user records lag:
     ```javascript
     for (const [uid, pData] of Object.entries(onlinePresence)) {
         const isOnline = pData && (pData === true || pData.online);
         if (isOnline && !combinedUsers[uid]) {
             const fetchedName = (typeof pData === 'object' && pData.name) ? pData.name : 'Connecting...';
             const fetchedAnon = (typeof pData === 'object' && pData.isAnon !== undefined) ? pData.isAnon : true;
             combinedUsers[uid] = { uid: uid, name: fetchedName, isAnonymous: fetchedAnon };
         }
     }
     ```

## Verification Plan

### Manual Verification
- Log in as an administrator on `admin.html`.
- In an incognito window, log in as an anonymous animal account.
- Verify the user list on the admin window instantly reveals the real animal name without flashing `'Connecting...'`.
- Refresh the incognito window (F5). Verify the admin window user list maintains seamless rendering of the correct name.
