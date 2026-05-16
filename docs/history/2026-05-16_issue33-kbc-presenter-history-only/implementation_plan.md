# Streamline KBC Presenter Mode to Focus Exclusively on Round History

Refine the Keynesian Beauty Contest (KBC) presenter mode (`presenter.html`) by removing scoreboard rankings and maximizing focus on live round progress, round results, and complete historical tables.

## User Review Required
Please review the streamlined KBC presentation structure centered around historical round data.

## Proposed Changes

### Public Assets

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html)
- Inside `#kbc-presenter-input-phase`, remove the `#kbc-score-list` section. Keep only the `#kbc-waiting` submission tracker.
- Inside `#kbc-presenter-result-phase`, remove the `#kbc-res-score-list` section. Keep only the `#kbc-result-card` showing average, target, winner, and penalties.
- Maintain `#kbc-presenter-history` directly below, permanently displaying round history tables.

## Verification Plan

### Manual Verification
- Launch a KBC round from `admin.html`.
- Open `presenter.html` and verify the KBC presentation displays active round status and waiting player counts without scoreboard lists.
- Resolve a round and verify the result card transitions cleanly, immediately followed by historical tables.
