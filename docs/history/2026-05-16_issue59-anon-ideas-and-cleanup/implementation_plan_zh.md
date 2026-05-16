# 實作創意徵集匿名模式與重構大廳版面清理計畫

針對使用者回報的結束/重設調查後大廳底下殘留舊結果的 Bug 進行底層生命週期重構。透過在 `idle` 階段全面調用 `hideAll()`，徹底保證大廳切換的極致乾淨。同時在管理台加入「匿名徵集模式 (`Anonymous Ideation Mode`)」切換開關，啟動時自動隱藏全場發布者名稱，並維持完美的禁止自投防弊防線。

## 使用者審查事項
請審查管理台匿名模式開關的位置與作者名稱遮罩機制。

## 根本原因剖析 (Root Cause Analysis)
當管理員點選 `End / Reset Survey` 時，客戶端收到狀態移除並進入 `idle` 階段。然而，稍早 `script.js` 與 `presenter.js` 在處理 `idle` 階段時，是手動逐條列出要隱藏的舊版遊戲容器，漏掉了新加入的問卷與創意板！
透過在 `idle` 階段開頭直接調用 `hideAll()`，不僅代碼量精簡一半，更能永久避免未來新增模組時發生殘留 Bug。
另外，透過在資料庫寫入 `anonMode: true`，卡片渲染器在繪製時自動遮罩名稱為 `'🥷 Anonymous'`，且底層自推校驗依然比對真實 UID，兼顧隱私與防弊。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- 於題庫清單上方加入匿名徵集開關：
  ```html
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h4 style="color: #cbd5e1; margin: 0;">Prompt Bank (<span id="idea-bank-count">0</span>)</h4>
      <label style="color: #10b981; font-size: 0.95rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" id="toggle-idea-anon" checked> 🥷 Anonymous Ideation Mode
      </label>
  </div>
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 發動徵集時同步寫入匿名狀態：
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
- 於 `idle` 階段全面調用 `hideAll()`：
  ```javascript
  } else {
      // Idle Phase
      hideAll();
      clientForceView = 'auto';
      if (headerEl) headerEl.classList.remove('hidden');
      ...
  ```
- 於生成卡片時套用遮罩：
  ```javascript
  const isAnonMode = !!currentIdeaStateObj?.anonMode;
  const authorDisplay = isAnonMode ? (isMyIdea ? '🥷 Anonymous (You)' : '🥷 Anonymous') : (isMyIdea ? `${item.author} (You)` : item.author);
  ```

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 同步重構大螢幕 `idle` 階段的 `hideAll()` 與名稱遮罩。

## 驗證計畫

### 手動驗證
- 於 `admin.html` 確認匿名模式勾選，發動徵集。
- 於無痕視窗中發表新點子，確認卡片上顯示 `'🥷 Anonymous'`，且發文者自身的投票按鈕精確呈灰階停用。
- 於管理台按下 `End / Reset Ideation`，確認全場視窗瞬間返回純淨大廳，再無殘留卡片或橫幅。
