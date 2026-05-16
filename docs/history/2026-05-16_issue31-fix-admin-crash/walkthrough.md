# Walkthrough: Prevent Null DOM Reference Crashes in Decoupled Admin and Presenter Scripts

This document records the protective code wrappers implemented to eliminate fatal `TypeError` initialization crashes in decoupled web applications (`admin.html` and `presenter.html`).

## Changes Implemented

### Defensive DOM Initialization (`admin.js`, `presenter.js`)
1. **Wrapped QR Code Logic**:
   - Replaced unprotected `document.getElementById('qr-code-link').href = ...` with conditional `if (qrLink)` and `if (qrImg)` checks.
   - Prevents fatal `TypeError: Cannot set properties of null` exceptions in dedicated views where QR code containers do not exist.
2. **Wrapped Authentication Buttons**:
   - Encapsulated `btnGoogle.addEventListener` and `btnAnon.addEventListener` inside protective `if (btnGoogle)` and `if (btnAnon)` blocks.
   - Ensures standard event loop progression allows `onAuthStateChanged` to successfully execute and reveal the admin operational dashboard.

## Verification Results
- Successfully deployed to testing staging environment via automated GitHub Actions pipeline.
- Verified opening `admin.html` successfully completes Firebase authentication verification and instantly displays active operational controls without script errors.
