# Align Google Auth Flow with Firebase Best Practices

Resolve a critical architectural bug where users logging in via Google popup fail to appear in the online user list or mount real-time database listeners until the page is refreshed.

## User Review Required
Please review the removal of the redundant Google popup auth resolver flags.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Remove `isGoogleAuthResolving` variable declaration (line 180).
- Simplify Google Auth popup click handler (lines 181-197):
  - Remove `isGoogleAuthResolving = true` and `isGoogleAuthResolving = false`.
  - Remove the redundant `await enterLobby(result.user)` call.
  - The handler should purely perform `await signInWithPopup(auth, provider)` and handle config errors.
- Simplify `onAuthStateChanged` listener (line 256):
  - Remove early return check `if (isGoogleAuthResolving) return;`.
  - Allow `onAuthStateChanged` to serve as the single authoritative conductor for all Google and Anonymous logins.

## Verification Plan

### Manual Verification
- Log out from the testing staging lobby.
- Click `Sign in with Google` to log in as `wube8816@gmail.com`.
- Verify you instantly appear in the online counter and user dropdown list without requiring any page refresh.
- Open a separate anonymous incognito tab. Verify both users see each other instantly in the active user dropdown.
