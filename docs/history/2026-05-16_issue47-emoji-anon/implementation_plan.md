# Replace Verbose Anonymous Prefix with Cloaked Ninja Emoji Across User Profiles

Enhance UI compactness and presentation aesthetics by replacing the verbose 10-character prefix `'Anonymous '` with a cloaked ninja emoji `'🥷 '` across newly generated anonymous profiles.

## User Review Required
Please review the selected cloaked ninja emoji (`🥷`) and the updated string identification logic.

## Root Cause Analysis
Previously, newly generated anonymous accounts were assigned names like `'Anonymous Capybara'` or `'Anonymous Axolotl'`. The prefix alone occupied substantial horizontal width across chat message headers, user dropdown lists, and game podium cards. By replacing the text prefix with `'🥷 '` (e.g., `'🥷 Capybara'`), string length is reduced by 8 characters, conserving critical layout space while injecting a mysterious cloaked aesthetic suitable for competitive game sessions.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
1. **Profile Generation Updates**:
   - In `btnAnon.click` handler, assign cloaked ninja emoji prefix:
     ```javascript
     await updateProfile(result.user, { displayName: `🥷 ${randomAnimal}` });
     ```
2. **Anonymous Flag Evaluation Updates**:
   - Update string checks across authentication and user list merger routines to recognize both legacy and new cloaked prefixes:
     ```javascript
     const isAnon = user.isAnonymous || (user.displayName && (user.displayName.startsWith('Anonymous') || user.displayName.startsWith('🥷')));
     ```
     ```javascript
     const isAnon = uObj.isAnonymous || (uObj.name && (uObj.name.startsWith('Anonymous') || uObj.name.startsWith('🥷')));
     ```

## Verification Plan

### Manual Verification
- Open an incognito window to the main site.
- Click "Anonymous Login".
- Verify the top header user badge displays `👤 🥷 Owl` (or assigned animal).
- Send a chat message. Verify the message author name appears compactly as `🥷 Owl`.
- Verify the user list on active admin dashboards correctly identifies and lists `🥷 Owl` with the kick button.
