# Decouple Admin Panel and Introduce Dedicated Presenter Page

Architectural refactoring to separate administrative and presenter functionalities into dedicated web applications (`admin.html` and `presenter.html`), streamlining the main user interface (`index.html`).

## User Review Required
Please review the architectural split and the designated capabilities for the dedicated Presenter view.

## Proposed Changes

### Public Assets

#### [MODIFY] [index.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/index.html)
- Remove embedded `<div id="admin-panel">...</div>` section entirely.
- Add two new navigation links inside `.header-right`, hidden by default:
  - `👑 Admin` -> links to `admin.html`
  - `📺 Presenter` -> links to `presenter.html`

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Update admin authentication check to reveal `link-admin-panel` and `link-presenter-page` instead of `#admin-panel`.
- Remove administrative quiz button listeners (now handled in `admin.js`).

#### [NEW] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html) & [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Dedicated administrative dashboard containing Quiz Master and KBC controls.
- Enforces strict Firebase authentication verification (`ADMIN_EMAILS`) before revealing controls.

#### [NEW] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html) & [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Dedicated view optimized for public screen projection.
- Listens to Quiz and KBC state changes from Firebase but suppresses any personal selection/input controls.
- Displays QR code, global chat room, live quiz questions, podium ceremonies, and KBC contest progress/results cleanly.

## Verification Plan

### Manual Verification
- Log in as administrator to verify `👑 Admin` and `📺 Presenter` links appear in header.
- Open `admin.html` to test starting a quiz question and KBC round.
- Open `presenter.html` to verify live state synchronization without selection inputs.
