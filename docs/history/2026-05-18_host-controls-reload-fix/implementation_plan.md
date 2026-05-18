# Fix Host Active Controls Collapse Bug on Page Reload

Resolve a critical state-sync bug where active Ideation (Survey Ideas) and Survey Rating control panels collapse and become inaccessible if the host administrator reloads the dashboard or goes offline and logs back in during an active session.

## User Review Required
Please review the conditional guards injected inside `updateVisibilityState` in `admin.js`.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Add conditional guards inside `updateVisibilityState()`'s idle phase block (lines 532-534):
  - Do not aggressively hide `#admin-active-idea-controls` if `currentIdeaStateObj?.active` evaluates to true.
  - Do not aggressively hide `#admin-active-survey-controls` if `currentSurveyState?.active` evaluates to true.
  - Do not aggressively hide `#admin-active-kbc-controls` if `currentKbcStateObj?.active` evaluates to true.
  ```javascript
  if (adminActiveKbcControls && !currentKbcStateObj?.active) adminActiveKbcControls.classList.add('hidden');
  if (adminActiveSurveyControls && !currentSurveyState?.active) adminActiveSurveyControls.classList.add('hidden');
  if (adminActiveIdeaControls && !currentIdeaStateObj?.active) adminActiveIdeaControls.classList.add('hidden');
  ```
- Trigger `updateVisibilityState()` and `updateRoomStatusBanner()` inside the `ideaState` (line 365) and `surveyState` listeners when they receive updates, ensuring full dashboard synchronization upon page load.

## Verification Plan

### Manual Verification
- Open staging dashboard. Launch a Survey Ideas session.
- Reload `admin.html` (F5).
- Verify the active Ideation controls (`#admin-active-idea-controls`) remain fully expanded, displaying the correct active states.
- Repeat for Survey Rating and verify active controls restore correctly.
