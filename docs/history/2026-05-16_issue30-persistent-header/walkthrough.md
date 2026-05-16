# Walkthrough: Persistent Header Controls in Game Mode for Logout, Chatroom Toggle, and Admin Access

This document records the UI enhancements implemented to keep the header navigation bar visible across all active game modes (Quiz and KBC) and introduce an intuitive client-side view switch.

## Changes Implemented

### Navigation & View Management (`index.html` & `script.js`)
1. **Persistent Header**:
   - Removed `headerEl.classList.add('hidden')` from full-screen view transitions, ensuring the compact header always remains anchored at the top of the application.
   - Users retain uninterrupted access to `🚪 Log Out` and online presence stats, while administrators retain access to `👑 Admin` and `📺 Presenter` shortcuts during game modes.
2. **Client-Side View Toggle**:
   - Introduced `<button id="btn-view-chat">💬 Chat</button>` and `<button id="btn-view-game">🎮 Game</button>`.
   - Implemented `clientForceView` tracking. When an active game (Quiz question or KBC round) is running, participants can click `💬 Chat` to temporarily collapse the question panel and participate in the global chat room.
   - Clicking `🎮 Game` instantly collapses the chat room and snaps back to the active game panel.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified header successfully remains docked during game modes.
- Verified smooth client-side toggling between active game questions and global chat room without losing connection or game progress.
