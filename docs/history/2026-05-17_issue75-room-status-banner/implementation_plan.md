# Introduce Real-Time Room Status Banner on Host Console

Enhance the administrative console header with a prominent, real-time room status banner that clearly indicates current active room modes and lobby mutex locks.

## User Review Required
Please review the UI styling and color coding for the new room status banner.

## Proposed Changes

### 1. Dashboard Status Banner (`admin.html`)
- Inject `#admin-room-status-banner` directly below the authentication verification header.
- The banner provides a clear visual label (`#admin-room-state-label`) indicating whether the system is currently in the lobby or executing a specific room session.

### 2. Dynamic Status Evaluation (`admin.js`)
- Implement `updateRoomStatusBanner()` to dynamically update banner background colors and descriptive text based on active room variables:
  - `idle`: Green banner (`"🟢 LOBBY (Idle - All Games Available)"`).
  - `question`/`podium`: Purple banner (`"🎯 QUIZ ROOM in Progress"`).
  - `kbc-*`: Pink banner (`"🎲 KBC ROOM in Progress"`).
  - `survey-*`: Emerald banner (`"📊 SURVEY ROOM in Progress"`).
  - `idea-*`: Blue banner (`"💡 IDEATION ROOM in Progress"`).
- Synchronize this update directly inside `updateVisibilityState()`.

### 3. Cache Busting (`admin.html`)
- Increment script query parameter to `admin.js?v=status_banner`.

## Verification Plan

### Manual Verification
- Open `admin.html`. Verify the banner displays `"🟢 LOBBY"` in green upon successful login.
- Start a Quiz Bank. Verify the banner instantly transitions to `"🎯 QUIZ ROOM in Progress"` in purple.
- Conclude the quiz and return to lobby. Verify the banner instantly reverts to `"🟢 LOBBY"` in green.
- Launch KBC or Survey. Verify the banner correctly transitions to pink or emerald.
