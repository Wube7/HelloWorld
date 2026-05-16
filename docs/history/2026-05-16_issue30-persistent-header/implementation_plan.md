# Persistent Header Controls in Game Mode for Logout, Chatroom Toggle, and Admin Access

Refactor visibility management to ensure the site header (`headerEl`) remains accessible during active game modes (Quiz and KBC), and introduce a client-side view switch (`💬 Chat` / `🎮 Game`).

## User Review Required
Please review the proposed navigation additions and client override logic for switching views during games.

## Proposed Changes

### Public Assets

#### [MODIFY] [index.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/index.html)
- Add view toggle buttons inside `.header-right`:
  - `<button id="btn-view-chat"...>💬 Chat</button>` -> displayed during active game to switch to chat
  - `<button id="btn-view-game"...>🎮 Game</button>` -> displayed when viewing chat during game to return to game

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Remove `headerEl.classList.add('hidden')` from `hideAll()` to keep header persistent across all modes.
- Implement `clientForceView` state (`'auto'`, `'chat'`, `'game'`).
- In `updateVisibilityState()`, if `clientForceView === 'chat'` during game mode, suppress game modals and reveal global chat room. Toggle view switch buttons accordingly.
- Reveal view buttons upon authentication when game is active.

## Verification Plan

### Manual Verification
- Start a quiz or KBC contest via `admin.html`.
- Verify `index.html` transitions to game screen but retains header with `🚪 Log Out`, `👑 Admin` (if admin), and `💬 Chat` button.
- Click `💬 Chat` to verify smooth transition to chat room while game continues in background. Verify button switches to `🎮 Game`.
- Click `🎮 Game` to return to game screen.
