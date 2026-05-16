# Unify Deferred Database Listener Lifecycle across Admin and Presenter Scripts

Replicate the robust deferred database listener architecture (`initDatabaseFuncs`) across `admin.js` and `presenter.js` to permanently prevent dead data feeds caused by unauthenticated initial page loads.

## User Review Required
Please review the lifecycle standardization across all three application scripts.

## Root Cause Analysis
In Issue #41, we successfully encapsulated root-level database listeners in `script.js`. However, `admin.js` and `presenter.js` still executed listeners (`presence`, `users`, game nodes) directly at the root level of `DOMContentLoaded`. When administrators or projection screens loaded the pages before session authentication completed, Firebase rejected these initial subscriptions with `PERMISSION_DENIED`, terminating the listener objects. When the admin subsequently authenticated, the dead data feeds prevented live presence data from populating `onlinePresence`, causing `btnKbcStart.click` to either fail or build incomplete rosters.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Declare listener lifecycle tracking variables: `let dbListenersUnsubscribes = [];`, `let listenersInitialized = false;`, `let initDatabaseFuncs = [];`.
- In `onAuthStateChanged`, invoke `initDatabaseFuncs.forEach(f => f())` exactly once upon successful authentication.
- Encapsulate all root-level `onValue` and `onChildAdded` calls into `initDatabaseFuncs.push(() => { ... })`.

## Verification Plan

### Manual Verification
- Log in as an administrator on `admin.html` after a fresh F5 reload. Verify the admin status and active user list populate seamlessly.
- Start a KBC contest. Verify the active scoreboard instantly displays correct animal names without reverting to `Anonymous`.
- Open `presenter.html`. Verify the projection screen perfectly mirrors the active contest and names.
