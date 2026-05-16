# 同步大螢幕 KBC 歷史表渲染與管理台狀態回饋計畫

針對大廳點擊 Result 鍵後大螢幕未顯示走勢表，以及管理台點擊強制結算後缺乏視覺回饋進行精緻重構。於大螢幕 `ended` 階段同步呼叫 `renderKbcHistory`，並在管理控制台 `#admin-active-kbc-controls` 標題中即時顯示當前競賽子階段 (`Phase`)，賦予主持人最直覺、清晰的操作反饋。

## 使用者審查事項
請確認管理台階段狀態對應 (`input` -> `等待提交`, `result` -> `回合結算中 (3秒)`, `ended` -> `比賽結束 (排行榜)`)。

## 根本原因剖析 (Root Cause Analysis)
稍早當大廳按下 Result 鍵時，資料庫正確寫入 `phase: 'ended'`。但在大螢幕 (`presenter.js`) 的監聽器分支中，`ended` 階段漏掉了呼叫 `renderKbcHistory()`，導致下方的歷史表格依舊空白。
另外，在管理台 (`admin.html`) 中，進行中控制列僅顯示回合數 (`Round 1`)。當點選 `Force Resolve` 進入 3 秒的結算過渡期 (`phase: 'result'`) 時，由於回合數不變且缺乏子階段提示，畫面看起來完全靜止，讓主持人誤以為按鈕無效。補上渲染與動態標題即可完美解決。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- 於 KBC 標題列插入 `#kbc-admin-status`：
  ```html
  <div style="color: #f472b6; font-weight: bold; margin-bottom: 8px;">🎲 Active KBC in Progress (Round <span id="kbc-admin-round">1</span>)<span id="kbc-admin-status"></span></div>
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 即時對應並渲染當前子階段文字：
  ```javascript
  const phaseDisplayMap = { input: 'Waiting for Submissions', result: 'Round Resolving (3s)', ended: 'Contest Over (Standings)' };
  ...
  if (kbcAdminStatusEl) kbcAdminStatusEl.textContent = ` - Phase: ${phaseStr}`;
  ```

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 於 `ended` 階段補回歷史表渲染：
  ```javascript
  renderKbcHistory(state.history, players);
  ```

## 驗證計畫

### 手動驗證
- 於管理台啟動 KBC，觀察標題列呈現 `"Phase: Waiting for Submissions"`。
- 一人答題後按下 `Force Resolve`，標題列瞬間轉變為 `"Phase: Round Resolving (3s)"`。
- 3 秒後順暢跳轉至 Round 2。
- 退回大廳後點選 Result，大螢幕精準呈現最終榜單與完整的回合走勢表。
