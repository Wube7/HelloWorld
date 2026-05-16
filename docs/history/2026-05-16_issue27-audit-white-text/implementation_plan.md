# Comprehensive Audit and Fix of All White Text Under White Mode

Audit and invert all hardcoded white and light text elements across the application whenever white mode (`body.logged-in-white`) is active.

## User Review Required
Please review the target elements and proposed contrast adjustments for Quiz, Podium, and KBC screens under white mode.

## Proposed Changes

### Public Assets

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
Add holistic CSS overrides under `body.logged-in-white`:
- **Quiz Screen**: Update `.quiz-btn` to light background (`#f8fafc`), dark text (`#0f172a`), and dark border. Update selected state to `#dbeafe` and deep blue text. Invert `#quiz-question` heading to deep blue (`#1e40af`).
- **Podium Screen**: Invert podium headings and user names to `#0f172a`. Update `.podium-spot` backgrounds to distinct light gold/silver/bronze colors with dark text.
- **KBC Contest Screen**: Invert `#kbc-round-display`, instructions, waiting notices, and scoreboards to `#0f172a`. Update `#kbc-number-input` to white background and dark text.
- **Toggles & General**: Ensure `.toggle-container` labels switch to `#334155`.

## Verification Plan

### Manual Verification
- Log in to activate white mode (`body.logged-in-white`).
- Trigger Quiz master and advance through questions to verify `.quiz-btn` and question headers.
- Advance to Podium view to verify podium spots and leaderboard list.
- Trigger Keynesian Beauty Contest to verify slider inputs, custom number inputs, and round history views.
