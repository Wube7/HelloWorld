# Boost CSS Specificity on Upvote Buttons to Ensure Visual Highlighting

Resolve a CSS specificity conflict where active upvoted states (`voted-1` and `voted-2`) fail to visually render under white mode, ensuring that participants receive clear, immediate visual confirmation of their active votes.

## User Review Required
Please review the glowing CSS styles and color palettes for active upvotes (`#10b981` green and `#ef4444` red).

## Root Cause Analysis
In `styles.css`, active upvoted states were styled using `.btn-upvote.voted-1` and `.btn-upvote.voted-2` (specificity `0, 0, 2, 0`). However, when the lobby theme was transitioned to white mode, the selector `body.logged-in-white .btn-upvote` (specificity `0, 0, 2, 1`) overrode the voted classes, forcing the button backgrounds to remain solid white. Consequently, participants could not perceive which ideas they had voted for or that clicking the button again successfully toggled off their votes. Adding higher-specificity selectors combined with `!important` rules guarantees distinct glowing feedback across both dark and light themes.

## Proposed Changes

### Public Assets

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
- Update active voted button selectors with reinforced specificity and glowing box shadows:
  ```css
  .btn-upvote.voted-1,
  body.logged-in-white .btn-upvote.voted-1 {
      background: #10b981 !important;
      color: white !important;
      border-color: #059669 !important;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  }
  .btn-upvote.voted-2,
  body.logged-in-white .btn-upvote.voted-2 {
      background: #ef4444 !important;
      color: white !important;
      border-color: #dc2626 !important;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  }
  ```

## Verification Plan

### Manual Verification
- Log in as an anonymous ninja account on `index.html`. In an active ideation session, click `+1` on a peer's idea card.
- Verify the button instantly transforms into a glowing emerald green pill (`#10b981`), clearly indicating an active vote.
- Click the same button again. Verify it instantly reverts to its default neutral white styling, confirming successful vote withdrawal.
