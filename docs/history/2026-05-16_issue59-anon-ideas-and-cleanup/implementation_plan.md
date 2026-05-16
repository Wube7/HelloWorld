# Implement Anonymous Ideation Mode and Refactor Idle Phase Cleanups

Introduce an `Anonymous Ideation Mode` toggle for administrators while refactoring DOM visibility cleanups during idle phases across client and projection screens to permanently eliminate leftover survey result banners.

## User Review Required
Please review the UI placement for the `Anonymous Ideation Mode` toggle and the author masking logic across client and projection boards.

## Root Cause Analysis
In `script.js` and `presenter.js`, when session controllers clicked `End / Reset Survey` in `admin.html`, the active state nodes were removed from Firebase. When client listeners received `active === false`, they executed `currentQuizPhase = 'idle'` and invoked `updateVisibilityState()`. However, the `idle` branch inside visibility managers manually enumerated specific game containers to hide and omitted the newly introduced `#survey-client-container` and `#idea-client-container`. Refactoring the `idle` branch to invoke the global `hideAll()` helper instantly guarantees perfect cleanup. Furthermore, introducing an `anonMode` boolean inside `/admin/ideaState` allows card renderers to mask authors as `'🥷 Anonymous'` while preserving UID matching for self-vote restrictions.

## Proposed Changes

### Public Assets

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- Add `Anonymous Ideation Mode` toggle checkbox directly above the idea prompt bank:
  ```html
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h4 style="color: #cbd5e1; margin: 0;">Prompt Bank (<span id="idea-bank-count">0</span>)</h4>
      <label style="color: #10b981; font-size: 0.95rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" id="toggle-idea-anon" checked> 🥷 Anonymous Ideation Mode
      </label>
  </div>
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- Capture toggle state when starting ideation sessions:
  ```javascript
  const isAnon = document.getElementById('toggle-idea-anon')?.checked ?? true;
  await set(ref(db, 'admin/ideaState'), {
      active: true,
      surveyId: pid,
      question: pObj.question,
      locked: false,
      anonMode: isAnon,
      ideas: {}
  });
  ```

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Refactor `updateVisibilityState()` idle branch to execute `hideAll()`:
  ```javascript
  } else {
      // Idle Phase
      hideAll();
      clientForceView = 'auto';
      if (headerEl) headerEl.classList.remove('hidden');
      if (qrCodeEl) qrCodeEl.classList.remove('hidden');
      if (chatDemoSection) chatDemoSection.classList.remove('hidden');
  ```
- In `renderIdeaClientBoard`, mask author names when `anonMode === true`:
  ```javascript
  const isAnonMode = !!currentIdeaStateObj?.anonMode;
  const authorDisplay = isAnonMode ? (isMyIdea ? '🥷 Anonymous (You)' : '🥷 Anonymous') : (isMyIdea ? `${item.author} (You)` : item.author);
  ```

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Refactor `updateVisibilityState()` idle branch to execute `hideAll()`:
  ```javascript
  } else {
      // Idle Phase
      hideAll();
      if (headerEl) headerEl.classList.remove('hidden');
      if (qrCodeEl) qrCodeEl.classList.remove('hidden');
      if (chatDemoSection) chatDemoSection.classList.remove('hidden');
  ```
- Mask author names when `anonMode === true`:
  ```javascript
  const isAnonMode = !!currentIdeaStateObj?.anonMode;
  const authorDisplay = isAnonMode ? '🥷 Anonymous' : item.author;
  ```

## Verification Plan

### Manual Verification
- Open `admin.html`. Ensure `Anonymous Ideation Mode` is checked. Click `Start` on an ideation prompt.
- In an incognito window, submit an idea (`"Viral TikTok Challenge"`).
- Verify the card appears on `index.html` and `presenter.html` displaying author as `'🥷 Anonymous'` (or `'🥷 Anonymous (You)'` for the submitter).
- Verify upvote buttons on this card remain disabled for the submitter.
- In `admin.html`, click `End / Reset Ideation`. Verify client and projection screens cleanly return to the lobby without leaving leftover ideation boards or survey banners.
