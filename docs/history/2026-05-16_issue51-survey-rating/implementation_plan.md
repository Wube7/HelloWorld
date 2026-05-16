# Implement Real-Time Survey Rating Mode with Question Bank and Live Histogram

Introduce a third interactive real-time mode: **Survey - Rating**. Equip verified administrators with question bank management tools to store custom scales (e.g. 1-5, 1-7) and narrative labels (e.g. `Low`/`High`), enable client participants to submit exact ratings via interactive range sliders, and render real-time submission counters alongside spectacular reveal histograms on presenter projection screens.

## User Review Required
Please review the database schema additions for `/admin/surveys` and `/admin/surveyState` as well as the proposed histogram UI layout.

## Proposed Architecture

### 1. Database Schema & Security Rules (`database.rules.json`)
- `/admin/surveys`: Storage for persistent question bank items. Read accessible by all authenticated users, write restricted to verified administrators (`wube8816@gmail.com`).
- `/admin/surveyState`: Real-time active survey session state. Overall metadata write restricted to administrators, while client submission nodes (`/admin/surveyState/submissions/$uid`) grant write access directly to matching active user sessions.
  ```json
  {
    "active": true,
    "surveyId": "q123",
    "question": "Rate the overall UI clarity:",
    "scale": 7,
    "minLabel": "Confusing",
    "maxLabel": "Crystal Clear",
    "phase": "input", // 'input' | 'result' | 'ended'
    "submissions": { "uid1": 5, "uid2": 7 },
    "results": { "counts": { "1":0, ..., "7":1 }, "average": 6.0, "total": 2 }
  }
  ```

### 2. Public Interface & Styling (`styles.css`)
- Add responsive styling for range sliders (`.survey-slider`), interactive rating dials, and animated vertical/horizontal histogram bars (`.histogram-bar`).

### 3. Host Dashboard (`admin.html`, `admin.js`)
- Introduce `#admin-survey-controls` containing question bank management (Add, Edit, Delete).
- During active surveys, display live submission totals and enable session controllers to click `Reveal Results` (transitioning state to `result` and calculating distribution counts) or `Reset Survey`.

### 4. Projection Display (`presenter.html`, `presenter.js`)
- Introduce `#survey-presenter-view`.
- Input Phase (`phase === 'input'`): Displays question prompt, scale bounds (`Low`/`High`), and live submission counter (`X submitted`) with blank histogram bars.
- Result Phase (`phase === 'result'`): Histogram bars smoothly animate to reflect rating distribution counts alongside calculated averages.

### 5. Client Interactive Application (`index.html`, `script.js`)
- Introduce `#survey-client-view`.
- Input Phase: Displays question prompt, scale labels, dynamic interactive range slider, and `Submit Rating` button.
- Locks interface and displays confirmation banner upon successful rating transmission or admin reveal.

## Verification Plan

### Manual Verification
- Log in as an administrator on `admin.html`. Add a custom question: `"Project Excitement"`, scale `10`, labels `"Snooze"` to `"Thrilled"`.
- Click `Start Survey`. Verify `presenter.html` instantly transitions to display the question and an empty 10-bar histogram with `0 submitted`.
- In an incognito window, log in as an anonymous ninja account. Verify the client interface presents the 10-point slider. Select `8` and click `Submit`.
- Verify `presenter.html` submission counter transitions to `1 submitted`.
- In `admin.html`, click `Reveal Results`. Verify `presenter.html` histogram animates to display 1 vote on bar 8 with an average rating of `8.0`.
