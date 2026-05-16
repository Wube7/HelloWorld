# 遊戲模式常駐頁首與客戶端大廳切換按鈕計畫

重構視窗可見度控制邏輯，確保當應用程式進入 Quiz 或 KBC 遊戲階段時，頁首 (`headerEl`) 不再被強制隱藏。同時在頁首新增 `💬 Chat` 與 `🎮 Game` 的即時切換開關，讓作答者與管理員能在遊戲進行途中，隨時流暢地進出全球聊天室、登出或跳轉至後台。

## 使用者審查事項
請確認在遊戲中切換大廳與作答畫面的 UI 按鈕設計與客戶端視圖覆寫邏輯是否符合期望。

## 建議修改計畫

### 前端資源

#### [MODIFY] [index.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/index.html)
- 在 `.header-right` 容器內部新增視圖切換按鈕：
  - `💬 Chat`：當處於作答畫面時顯示，點擊可切回大廳聊天室
  - `🎮 Game`：當在遊戲中查看聊天室時顯示，點擊可立即彈回作答視窗

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- 從 `hideAll()` 輔助函數中移除 `if (headerEl) headerEl.classList.add('hidden')`，確保頁首在全站任何模式下永遠常駐。
- 建立 `clientForceView` 狀態追蹤變數 (`'auto'`, `'chat'`, `'game'`)。
- 修改 `updateVisibilityState()`：當遊戲正在活躍時，若客戶端設定為 `'chat'`，則收合作答卡片並開啟全球聊天室；反之則顯示作答模組。並動態切換頁首的按鈕文字。

## 驗證計畫

### 手動驗證
- 經由 `admin.html` 啟動問答題。
- 檢視 `index.html` 切換至作答卡片時，頁首依舊常駐，且包含 `🚪 Log Out`、`👑 Admin` 與新出現的 `💬 Chat` 按鈕。
- 點擊 `💬 Chat`，確認作答卡收起並展開聊天室，按鈕變為 `🎮 Game`。
- 點擊 `🎮 Game`，精準彈回作答卡片。
