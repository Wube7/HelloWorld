# 修正 KBC Result 鍵與升級結束鍵為即刻結算冠軍計畫

針對 KBC 模組中提早結束導致歷史快照未歸檔以及進行中結束按鈕功能定義進行重構。確保每一輪計算都同步歸檔快照 (`kbcArchive`)，並將進行中結束按鍵升級為即時結算比賽 (`End Game - Crown Winner`)，立刻依當前點數高低加冕最終得主。

## 使用者審查事項
請確認每回合持續快照歸檔與提前終止加冕的演算法。

## 根本原因剖析 (Root Cause Analysis)
在稍早的 `admin.js` 中，`kbcArchive` 的寫入動作僅存在於最後淘汰階段 (`remainingActive <= 1`)。若管理員在尚未淘汰至最後一人時就退回大廳，資料庫並無歸檔快照，導致大廳的 `Result` 按鍵因缺失快照而無法起作用。將快照寫入獨立於淘汰判斷之外，即可保證每次都有紀錄可用。
另外，進行中的結束鍵過往僅執行常規回合結算。將其點擊事件升級為強制寫入 `phase: 'ended'` 與歸檔快照，即可滿足活動主持任意時刻終止賽局並頒獎的需求。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- 升級進行中結束按鈕文字：
  ```html
  <button id="btn-kbc-end" class="primary-btn btn-sm" style="background: rgba(244, 114, 182, 0.2); border: 1px solid #f472b6; color: white;">End Game (Crown Winner)</button>
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 於回合結算時同步寫入 `kbcArchive`：
  ```javascript
  await set(ref(db, 'admin/kbcArchive'), currentArchiveObj);
  ```
- 點擊結束按鈕秒速加冕：
  ```javascript
  if (btnKbcEnd) {
      btnKbcEnd.addEventListener('click', async () => {
          if (confirm("Are you sure you want to end the KBC game early and crown the winner based on current points?")) { ... }
      });
  }
  ```

## 驗證計畫

### 手動驗證
- 開啟 `admin.html` 啟動 KBC 競賽，進行一輪投票。
- 第二輪中途點擊 `End Game (Crown Winner)`，確認畫面秒速進入加冕狂歡狀態，展示當前點數最高者獲勝。
- 點擊 `Return Lobby` 退回大廳，確認 `Result` 按鈕已亮起。點擊 `Result`，確認大螢幕瞬間重溫剛才的歷史戰績與走勢圖。
