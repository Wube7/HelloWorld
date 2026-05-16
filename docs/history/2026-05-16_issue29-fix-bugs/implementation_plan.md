# Resolve Chatroom Auto-Logout, Unstable Online Counter, and Empty User List

Critical bug fix to resolve unhandled `ReferenceError` exceptions in the JavaScript execution thread that blocked event binding and dynamic DOM rendering.

## User Review Required
Please review the root cause analysis and the proposed cleanup of obsolete variables.

## Root Cause Analysis
During the architectural decoupling in Issue #28, the variable declaration `const globalViewToggle = ...` was replaced with header links. However, legacy checks like `if (globalViewToggle)` remained in the code. In JavaScript, referencing an undeclared identifier throws a fatal `ReferenceError`. This crash aborted the `DOMContentLoaded` execution sequence mid-flight, resulting in:
1. **Bug 1**: `chatForm.addEventListener('submit', ...)` was never bound. Pressing Enter in the chat input triggered standard HTML form submission, causing page reload and apparent logout.
2. **Bug 3**: `window.renderUserList` was never defined, leaving the user list modal empty upon opening.
3. **Bug 2**: Instantaneous presence removal/re-adding during unhandled page reloads caused the online counter to fluctuate wildly.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Remove obsolete `globalViewToggle` event listeners and state update lines.

## Verification Plan

### Manual Verification
- Refresh the testing site.
- Send a message in the global chat room and verify the message appears smoothly without triggering a page reload or logout.
- Open the user list modal and verify active online users render perfectly.
- Verify online presence counter remains stable during smooth single-page operations.
