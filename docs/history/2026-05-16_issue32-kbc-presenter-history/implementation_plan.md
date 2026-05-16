# Display Simultaneous Scoreboard and Round History in KBC Presenter View

Enhance the Keynesian Beauty Contest (KBC) presenter view (`presenter.html`) by replacing single-column or tabbed layouts with an elegant two-column side-by-side grid displaying real-time scores and round history simultaneously.

## User Review Required
Please review the side-by-side grid layout designed for public screen projection.

## Proposed Changes

### Public Assets

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html)
- Inside `#kbc-container`, replace the standalone `#kbc-scoreboard` section with a comprehensive two-column CSS grid container (`grid-template-columns: 1fr 1fr; gap: 3rem;`).
- Left Column: `#kbc-scoreboard-section` containing `#kbc-score-list`.
- Right Column: `#kbc-history-section` containing `#kbc-history-view` and `#kbc-history-content` (always visible, no tabs).

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Ensure `renderKbcHistory` successfully populates `#kbc-history-content` in the presenter DOM without requiring tab clicks.

## Verification Plan

### Manual Verification
- Launch a KBC round from `admin.html`.
- Open `presenter.html` and verify the KBC container renders with round status at the top, followed by live Scoreboard on the left and Round History on the right.
- Complete a round and verify historical data populates cleanly on the right.
