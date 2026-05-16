# Restore Original Deep Dark Theme Across Admin Control Console

Revert the administrator dashboard (`admin.html`) back to its original immersive deep dark aesthetic, establishing immediate visual differentiation between backend control consoles and front-end client or projection views.

## User Review Required
Please review the theme reversion and high-contrast text palette updates.

## Root Cause Analysis
In Issue #26, we temporarily applied `logged-in-white` to the admin console to evaluate light theme contrast. However, maintaining identical color profiles across client interactive lobbies, presenter projection screens, and backend control panels blurred workstation boundaries. Reverting `admin.html` to the default dark gradient (`#0f172a` to `#1e293b`) while returning text inline styles to crisp light shades (`#f8fafc`) provides an elegant, distinct operating environment for session controllers.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Remove `logged-in-white` from `<body>` tag.
- In `#admin-panel`, revert `color: #0f172a;` to `color: #f8fafc;`.
- Revert `.admin-timer-controls` box styling to dark glass: `background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border);`.
- Revert timer label and span colors to `#e2e8f0` and `#cbd5e1`.
- Revert preset button text colors to `#f8fafc`.
- In `#auto-jump-input`, revert text color to `#f8fafc` and background to `rgba(0, 0, 0, 0.3)`.
- In KBC buttons, revert text colors to `#f8fafc`.

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- In `onAuthStateChanged`, remove `document.body.classList.add('logged-in-white');`.

## Verification Plan

### Manual Verification
- Open `admin.html` in a browser tab.
- Verify the entire background displays an immersive deep dark navy-slate gradient.
- Verify all dashboard headings, status indicators, and button text appear in crisp, high-contrast white or light pastel shades.
