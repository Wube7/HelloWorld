# Refactor Equations UX with Leaked Recipe Alignments & Real-Time Solved Counter

Refactor the Cooperative Equations game mode to display a themed Presenter layout, expand database security rules to track player completion states, and design a magnificent, full-screen player victory card.

## User Review Required
Please review the expanded Firebase security rules and player victory UI design.

## Proposed Changes

### 1. Firebase Realtime Database Security Rules (`database.rules.json`)
- Expand the `/admin/equationsState` secure write permissions (line 100):
  - Allow active players to write `solved: true` to their own child node `/admin/equationsState/players/$uid/solved`.
  ```json
  "equationsState": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.email == 'wube8816@gmail.com'",
    "players": {
      "$uid": {
        "solved": {
          ".write": "auth != null && auth.uid == $uid"
        }
      }
    }
  }
  ```

### 2. Themed Presenter Layout & Aligned Ingredients (`presenter.html`, `presenter.js`)
- **"Mission Clues" Header**: Rename `"🚨 INTEL DEBRIEF:"` to `"🚨 MISSION CLUES: (任務線索)"`.
- **Aligned HTML Table**: Replace the plain text bullet list of 6 ingredients with a cleanly styled HTML table displaying the Sugar (A) to Natural Flavorings (F) variables beautifully aligned.
- **Real-Time Solved Counter**: Inject a dynamic live counter banner inside the presenter card showing `"👥 Decoded Progress: X / Y Players"` using real-time database snapshots.

### 3. Gorgeous Player Victory Card (`index.html`, `script.js`, `styles.css`)
- **Player UI Updates (`index.html`)**:
  - Inject `#equations-victory-card` inside the equations container, pre-styled as a glassmorphic celebration card with a golden trophy icon and deep green success banner.
- **Dynamic UI Toggling (`script.js`)**:
  - Refactor role assignment lookup to read `state.players[uid].roleIndex`.
  - Upon submitting the correct passcode (`32`), execute `set(ref(db, 'admin/equationsState/players/' + uid + '/solved'), true)`.
  - Hide `#equations-list` and `#equations-submission-area` to save screen space.
  - Reveal `#equations-victory-card` with smooth CSS animations.

### 4. Host Command Live Status (`admin.js`)
- Refactor player role initialization payload to write `{ roleIndex: idx % 6, solved: false }` objects.
- Update `renderEquationsStatusList()` to track real-time player completion status (`"🟢 SOLVED"` vs `"🔴 DECODING"`).

### 5. Cache Busting (`admin.html`, `presenter.html`, `index.html`)
- Increment script query parameters to `admin.js?v=equations_refinements_v2`, `presenter.js?v=equations_refinements_v2`, and `script.js?v=equations_refinements_v2`.

## Verification Plan
- Open staging console. Verify Player D sees Q4 perfectly aligned.
- Click `Start Equations Game`.
- Verify Presenter View renders `"🚨 MISSION CLUES: (任務線索)"` and displays a beautifully aligned table of ingredients.
- Input passcode `32` on client. Verify the equations list and passcode form disappear instantly, replaced by a magnificent full-screen glassmorphic victory card.
- Verify the Host View and Presenter live counter immediately increment solved stats.
