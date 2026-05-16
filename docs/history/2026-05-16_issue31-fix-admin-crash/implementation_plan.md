# Prevent Null DOM Reference Crashes in Decoupled Admin and Presenter Scripts

Critical bug fix to ensure missing DOM elements (like QR code containers and login buttons) in decoupled web applications (`admin.html` and `presenter.html`) do not cause fatal `TypeError` crashes during script initialization.

## User Review Required
Please review the root cause analysis and the proposed defensive DOM wrappers.

## Root Cause Analysis
When `admin.js` and `presenter.js` were duplicated from `script.js`, lines such as `document.getElementById('qr-code-link').href = ...` and `btnGoogle.addEventListener(...)` remained. In `admin.html`, these DOM elements do not exist (`null`). In JavaScript, attempting to set a property on or attach a listener to `null` throws a fatal `TypeError`. This unhandled exception instantly crashed the `DOMContentLoaded` thread before `onAuthStateChanged` could execute, leaving the admin dashboard frozen on "Verifying Authentication...".

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Wrap QR code initialization in protective `if` checks.
- Wrap `btnGoogle` and `btnAnon` event listeners in protective `if` checks.

## Verification Plan

### Manual Verification
- Log in as an administrator on the main site.
- Open `admin.html` and verify the authentication check successfully completes and reveals the operational controls.
- Open `presenter.html` and verify live view rendering functions smoothly without throwing console errors.
