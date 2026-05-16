# Refine Quiz Podium Name Truncation and Maintain KBC History Table on Presenter Contest Over Screen

Refine public interface layouts by expanding narrow Quiz podium cards to prevent winner name truncation, and consolidate the KBC game over container on the presenter view to ensure complete round history tables remain permanently visible at the conclusion of contests.

## User Review Required
Please review the expanded card dimensions and the consolidated presentation layout for KBC game over.

## Proposed Changes

### Public Assets

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
- Expand `.podium-spot` width from `120px` to `160px`.
- Expand `.podium-spot .name` max-width from `100px` to `140px`.
- Adjust podium step heights for improved vertical balance:
  ```css
  .place-1 { height: 240px; ... }
  .place-2 { height: 200px; ... }
  .place-3 { height: 170px; ... }
  ```

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Inside `presenter.html`, move the standalone `#kbc-gameover-container` inside `#kbc-presenter-view` as `#kbc-presenter-ended-phase` (Top Section C).
- In `presenter.js`, update `updateVisibilityState()`:
  When `currentQuizPhase === 'kbc-ended'`, reveal `#kbc-presenter-view` and `#kbc-presenter-ended-phase`, while hiding input and result phases. Ensure `#kbc-presenter-history` remains permanently visible beneath.

## Verification Plan

### Manual Verification
- Start a Quiz round. Complete the quiz with long participant names (e.g., `Anonymous Capybara`). Advance to podium and verify 3rd place displays cleanly without truncated ellipsis.
- Start a KBC contest. Complete the contest to trigger gameover. Verify the presenter screen displays the final standing banner at the top, followed immediately by complete historical round tables at the bottom.
