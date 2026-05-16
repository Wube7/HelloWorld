# Implement Survey Ideas Mode with Question Bank and Real-Time Board

Introduce a fourth interactive real-time mode: **Survey - Ideas** (Ideation & Brainstorming). Equip verified administrators with question bank management tools and session locking capabilities. Enable client participants and projection screens to share a real-time synchronized Idea Board where participants submit text ideas and upvote peers using weighted votes (`+1` and `+2`). The board dynamically auto-sorts in real-time based on total votes descending, secondary sorted by timestamp newest first.

## User Review Required
Please review the database schema additions for `/admin/ideaSurveys` and `/admin/ideaState` as well as the proposed weighted voting algorithm.

## Proposed Architecture

### 1. Database Schema & Security Rules (`database.rules.json`)
- `/admin/ideaSurveys`: Storage for persistent ideation question prompts. Read accessible by all authenticated users, write restricted to verified administrators (`wube8816@gmail.com`).
- `/admin/ideaState`: Real-time active ideation session state. Session metadata (`active`, `locked`) write restricted to administrators, while idea submission nodes and voter tracking sub-nodes allow direct authenticated participant writes.
  ```json
  {
    "active": true,
    "surveyId": "idea_q1",
    "question": "What features should we build next quarter?",
    "locked": false,
    "ideas": {
      "id_123": {
        "id": "id_123",
        "text": "AI automatic code refactoring agent",
        "uid": "uid_A",
        "author": "🥷 Capybara",
        "timestamp": 1779888000000,
        "votes": 5,
        "voters": { "uid_B": 2, "uid_C": 1, "uid_D": 2 }
      }
    }
  }
  ```

### 2. Public Interface & Styling (`styles.css`)
- Add high-quality CSS card styling for `.idea-board`, `.idea-card`, `.idea-card-header`, `.idea-card-body`, `.idea-card-footer`, and interactive upvote buttons (`.btn-upvote`).

### 3. Host Dashboard (`admin.html`, `admin.js`)
- Introduce `#admin-idea-controls` containing question bank management (Add, Edit, Delete).
- During active ideation, display session status and enable controllers to toggle session locks (`🔒 Lock / Unlock`) or `Reset Survey`.

### 4. Projection Display (`presenter.html`, `presenter.js`)
- Introduce `#idea-presenter-container`.
- Instantly renders question prompt and a spectacular full-width `#idea-presenter-board`.
- Dynamic Real-Time Sorting Algorithm:
  ```javascript
  const sortedIdeas = Object.values(ideas).sort((a, b) => {
      if ((b.votes || 0) !== (a.votes || 0)) return (b.votes || 0) - (a.votes || 0);
      return (b.timestamp || 0) - (a.timestamp || 0);
  });
  ```

### 5. Client Interactive Application (`index.html`, `script.js`)
- Introduce `#idea-client-container`.
- Renders synchronized `#idea-client-board` where each idea card features interactive upvote buttons (`👍 +1` and `🔥 +2`).
- Anchors an input bar at the bottom for new text submissions.
- When `locked === true`, immediately disables the input bar and all voting buttons while displaying a locked notification banner.

## Verification Plan

### Manual Verification
- Log in as an administrator on `admin.html`. Add a custom prompt: `"Marketing Campaign Ideas"`.
- Click `Start Ideation`. Verify `presenter.html` instantly transitions to display the prompt and an empty board.
- In an incognito window, log in as an anonymous ninja account (`🥷 Owl`). Submit idea: `"Viral TikTok Dance Challenge"`.
- Verify the card instantly populates on the board across all three screens.
- In a second client session (`🥷 Koala`), click `+2` on the card. Verify total points transition instantly to `2 pts`.
- In `admin.html`, click `🔒 Lock Session`. Verify client input bars and vote buttons instantly lock.
