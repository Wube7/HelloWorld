# 解耦進行中控制列與 hideAll 及解鎖結束鍵修復 KBC 死鎖計畫

針對極端情況下（如系統更新或 F5 重新載入）KBC 進行中管理控制台按鈕消失造成的死鎖進行 DOM 生命週期大重構。將進行中控制列移出 `hideAll()` 清單，僅在大廳 `idle` 階段明確隱藏。同時在所有 KBC 進行中階段永久解鎖 `End Game` 與 `Return Lobby`，保證活動主持在任何非同步中斷下皆握有至高解鎖權。

## 使用者審查事項
請確認進行中按鍵的永久解鎖與可見性控制架構。

## 根本原因剖析 (Root Cause Analysis)
在稍早 Issue #61 裡，為確保大廳乾淨，我們將 `#admin-active-kbc-controls` 放進了 `admin.js` 的 `hideAll()` 輔助函式中。當管理員在 KBC 進行中重新載入網頁，雖然 Firebase 監聽器起初移除了 `'hidden'`，但隨後執行的 `updateVisibilityState()` 內部呼叫了 `hideAll()`，瞬間把進行中控制列又給隱藏了！
在 `active === true` 導致 `Start` 停用且進行中按鍵被隱藏的雙重打擊下，管理員陷入了無法控制賽局的死局。
將進行中控制列移出 `hideAll()` 並保證 `End Game` 永久啟用，即可徹底告別死鎖。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 將 `adminActiveKbcControls` 等列移出 `hideAll`，專門於 `idle` 隱藏：
  ```javascript
  const hideAll = () => {
      if (cardsGrid) cardsGrid.classList.add('hidden');
      ... // 僅保留遊戲卡片
  };
  ...
  } else {
      // Idle Phase
      hideAll();
      if (adminActiveKbcControls) adminActiveKbcControls.classList.add('hidden');
      ...
  ```
- 於任何進行中階段永久解鎖 `btnKbcEnd` 與 `btnKbcReturn`：
  ```javascript
  if (state && state.active) {
      if (adminActiveKbcControls) adminActiveKbcControls.classList.remove('hidden');
      if (btnKbcStart) btnKbcStart.disabled = true;
      if (btnKbcRes) btnKbcRes.disabled = true;
      if (btnKbcEnd) btnKbcEnd.disabled = false; // 永久解鎖
      if (btnKbcReturn) btnKbcReturn.disabled = false; // 永久解鎖
      if (btnKbcForce) btnKbcForce.disabled = (state.phase !== 'input');
  ```

## 驗證計畫

### 手動驗證
- 啟動 KBC 競賽。
- 於作答中途按下 `F5` 重新載入 `admin.html`。
- 觀察頁面載入完畢後，進行中控制列 `#admin-active-kbc-controls` 精準出現。
- 點擊 `End Game (Crown Winner)`，確認比賽順利終結並立刻結算榜首，死鎖徹底消除。
