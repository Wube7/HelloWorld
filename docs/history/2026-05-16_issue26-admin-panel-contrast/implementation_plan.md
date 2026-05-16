# Improve Admin Controls Visibility and Contrast in White Mode

Resolve contrast and readability issues for the Admin Controls panel (`#admin-panel`) when the application is in white mode (`body.logged-in-white`).

## User Review Required
Please review the proposed color palette and contrast adjustments for the admin panel in white mode.

## Proposed Changes

### Public Assets

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
Add dedicated styling rules under `body.logged-in-white` for `#admin-panel`:
- Panel background: Solid white/light-gray (`#ffffff` or `#f8fafc`) with a prominent amber border (`#f59e0b`) and soft amber shadow.
- Typography: Main headings and labels switch to dark slate (`#0f172a` or `#1e293b`). Sub-headings switch to deeper shades (`#6d28d9` for Quiz Master and `#db2777` for KBC).
- Timer Controls: Container background switches to light gray (`#f1f5f9`) with dark border and dark text labels.
- Input Fields: Background switches to white with dark text and clear borders.

## Verification Plan

### Manual Verification
- Log in as administrator (`wube8816@gmail.com` or verified admin account).
- Verify `#admin-panel` renders with excellent contrast in white mode.
- Test readability of timer labels, custom inputs, and section headings.
