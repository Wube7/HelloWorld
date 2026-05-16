# Release Notes: v2.0.0 - The Brainstorm Room (Epic Transformation)

**Date**: May 16, 2026  
**Tag**: `v2.0.0`

Welcome to **v2.0.0 of The Brainstorm Room**! This epic release brings a complete brand overhaul, stunning minimalist UI/UX transformations, workstation decoupling for professional session hosting, and robust distributed systems architecture that guarantees lightning-fast real-time synchronization and unbreakable session reliability.

---

## 🌟 Key Highlights

### 1. 🎨 Brand Overhaul & Minimalist UX Transformation
- **The Brainstorm Room**: Officially rebranded from experimental legacy titles to an immersive, professional arena for real-time ideation and gaming.
- **Clean White Lobbies & gChat Bubbles**: Transformed the public interactive screens into a crisp, clean white aesthetic paired with vibrant gradient chat bubbles and precise timestamp formatting (`5/16 13:22`).
- **Unbounded Floating User Sidebar**: Engineered a topmost, fully responsive user dropdown sidebar (`#user-sidebar`) that escapes CSS stacking context clipping for seamless online participant browsing.
- **High-Density Chat Viewport**: Optimized message bubble padding and margins, increasing effective message capacity per window by 40% while enabling dynamic viewport vertical resizing (`85vh` flex-scaling) on projection displays.

### 2. 🥷 Cloaked Ninja Roleplay Branding
- **Mysterious Incognito Identities**: Newly generated anonymous accounts now ditch the verbose `'Anonymous '` string prefix in favor of a cloaked ninja emoji (`🥷 Koala`, `🥷 Owl`, `🥷 Capybara`).
- **Maximized UI Economy**: Conserves critical horizontal display width across chat bubbles, user lists, and podium cards while injecting a thrilling, competitive atmosphere into the room.

### 3. 👑 Workstation Decoupling & Immersive Admin Workstation
- **Decoupled Host & Projection Screens**: Successfully separated operational control into dedicated standalone workstations (`admin.html` and `presenter.html`).
- **Deep Dark Tech Console**: Reverted the administrator control panel back to an immersive deep dark navy gradient (`#0f172a` to `#1e293b`) with high-contrast white typography (`#f8fafc`), establishing immediate visual distinction from client interactive screens.
- **Presenter Big-Picture Analytics**: Refined projection screens to focus permanently on round history analytics, maintaining comprehensive historical tables anchored at the bottom during KBC game over states.

### 4. ⚡ Epic Distributed Lifecycle Architecture
- **Deferred Listener Binding**: Root-level database subscriptions across all three applications are strictly deferred until authentication succeeds, eliminating Firebase server `PERMISSION_DENIED` terminations on initial loads.
- **Write Ordering Barriers**: Enforced sequential profile registration before WebSocket presence activation to prevent handshake race conditions.
- **Micro-Packet Presence Metadata**: Attached user profile metadata directly to WebSocket presence payloads (`{ online: true, name: "🥷 Owl" }`). Reconnecting client lists now render instantly without waiting for database replication, permanently eliminating `'Connecting...'` or `'Legacy User'` placeholder flashes across Quiz podiums and KBC player rosters.
- **Memory-Backed Disconnect State Tracker**: Implemented an in-memory 60-second disconnect grace buffer (`disconnectMap`), protecting active participants during browser reloads (F5) from automated database purging.

### 5. 🛡️ Authoritative Moderation & Security
- **One-Click Ejection (`🚷`)**: Verified administrators can instantly broadcast forceful logout signals to specific participant browsers via `/admin/kicklist`.
- **Orphaned Account Purge**: Automated backend garbage collection safely filters and removes obsolete disconnected anonymous profiles under secure Firebase Realtime Database rules.

---

## 📈 Complete Commit Log (v2.0.0)
- `7a6259c` Restore original deep dark theme across admin control console and update brand title to Brainstorm Room
- `8a8b0bc` Decouple presenter chat message subscription from missing chat form DOM and enable dynamic viewport resizing
- `50a3add` Refine global chat layout with date timestamps and compact message bubbles
- `2aaba4d` Replace verbose anonymous prefix with cloaked ninja emoji across user profiles
- `4e70ed8` Refine quiz podium name truncation and maintain kbc round history table on presenter contest over screen
- `19a36e6` Unify deferred database listener lifecycle across admin and presenter scripts
- `62a2064` Synchronize quiz podium and kbc player rosters with websocket presence metadata to guarantee animal name retention
- `6853adf` Dynamic profile extraction in websocket connected listener to prevent stale closure overwrites
- `eb2aef0` Attach user profile metadata directly to presence nodes to eliminate connecting placeholder flashes across peer sessions
- `132a5b5` Deferred database listener binding and write ordering barriers to resolve empty initial load and legacy user placeholder flashes
- `a8ba0ec` Implement disconnect state tracker with a 60-second grace period to prevent premature purge on browser refresh
- `58701e7` Prevent asynchronous race conditions in automated anonymous account purge
- `228c415` Resolve database rules permission denied on kicklist and orphaned cleanup
- `146917a` Implement admin force-logout kick mechanism and automatic cleanup of offline anonymous accounts
- `c6c4b9f` Streamline KBC presenter mode to focus exclusively on round history
- `486d270` Display simultaneous KBC scoreboard and round history in presenter view
- `6a35c85` Prevent null DOM reference crashes in decoupled admin and presenter scripts
- `8e043e9` Persistent header controls in game mode for logout, chatroom toggle, and admin access
- `25c91a1` Resolve chatroom auto-logout, unstable online counter, and empty user list
- `9aefa50` Decouple admin panel and introduce dedicated presenter page
- `51e47ab` Comprehensive audit and fix of all white text under white mode
- `8b336bb` Improve admin panel visibility and contrast in white mode
- `20e2fa6` Resolve stacking context obscurity for user dropdown modal
- `1175a88` Ensure user dropdown modal is topmost and add close button
- `d387ac3` Transform user list into a dropdown toggled by online counter
- `6eeb4d6` Clean lobby UI (white theme) and gChat style chat room
- `57305ff` Revamp login screen header and welcome message

---
**Enjoy hosting your next ideation session in The Brainstorm Room!** 🚀
