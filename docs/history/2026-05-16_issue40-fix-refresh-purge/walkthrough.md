# Walkthrough: Implement Disconnect State Tracker to Prevent Premature Purge on Browser Refresh

This document records the memory-backed disconnect tracking algorithm implemented to eliminate database node race conditions during brief client browser reloads (F5).

## Changes Implemented

### In-Memory Offline Duration Tracking (`script.js`, `admin.js`)
- Replaced static `lastActive` login timestamp evaluations with a dynamic in-memory tracking dictionary (`disconnectMap`).
- In `renderUserList()`:
  - When an anonymous session is actively connected (`onlinePresence[uid] === true`), any existing disconnect marker is instantly erased (`delete disconnectMap[uid]`).
  - When a session disconnects (`!onlinePresence[uid]`), its exact disconnection moment is recorded (`disconnectMap[uid] = Date.now()`).
  - The profile is immediately hidden from the frontend list.
  - Active administrators execute database profile deletion (`remove()`) only when a profile's continuous disconnection duration strictly exceeds a robust 60-second buffer (`Date.now() - disconnectMap[uid] > 60000`).

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified pressing F5 on active anonymous sessions reloads smoothly without evaporating profile nodes or reverting names to Legacy User placeholders.
