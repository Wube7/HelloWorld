# 同步卡片重繪與修正計時器來源計畫

針對您精確無比的測試反饋，我們精準排查出了兩大核心問題：(A) 結束比賽回到大廳後，卡片按鈕依然維持在稍早鎖死的狀態；(B) 計時器倒數完沒有直接跳轉下一題。透過在可見性更新函數中加入卡片重繪，並修正計時器讀取目標，即可秒速完美解決。

## 使用者審查事項
請審查卡片同步重繪邏輯與計時器變數回正。

## 根本原因剖析 (Root Cause Analysis)

### 問題 A：殘留的按鈕 disabled 屬性
在稍早的互斥保護鎖架構下，當 Quiz 處於進行中 (`question` 或 `podium`) 時，各項題庫清單 (`renderQuizBankList` 等) 繪製出的卡片 Start 鍵會受互斥鎖限制加上 `disabled`。當點擊 Return Lobby 時，系統成功切回 `'idle'` 並呼叫 `updateVisibilityState()`。然而，`updateVisibilityState()` 只有切換外框，並沒有叫題庫清單重新繪製卡片！這導致卡片上的按鈕依舊死守著上一場留下的 disabled 屬性。於 `updateVisibilityState()` 結尾加入卡片重繪呼叫，即可在進出大廳瞬間滿血解鎖。

### 問題 B：錯誤的計時器 DOM 來源
在 Quiz 的跳題計時器邏輯中 (第 904 行)，代碼試圖讀取一個叫 `#quiz-auto-jump` 的輸入框。然而在 `admin.html` 裡，題庫設定秒數的輸入框叫做 `#quiz-add-timer`，且建立與啟動時秒數已自帶在資料庫快照的 `state.timerSecs` 裡！因為讀取不到 `#quiz-auto-jump`，秒數永遠被當成 `0`，所以跳題計時器永遠不會發動。將其改為直接讀取 `state.timerSecs` 即可完美倒數跳轉。

## 建議修改計畫

### 1. 同步卡片重繪與計時器回正 (`admin.js`)
- 於 `updateVisibilityState()` 結尾 (第 550 行) 加入三大題庫卡片清單重繪呼叫：
  ```javascript
  if (typeof updateRoomStatusBanner === 'function') updateRoomStatusBanner();
  if (typeof renderQuizBankList === 'function') renderQuizBankList();
  if (typeof renderSurveyBank === 'function') renderSurveyBank();
  if (typeof renderIdeaBank === 'function') renderIdeaBank();
  ```
- 於第 904 行修正計時器秒數來源：
  ```javascript
  const timerSecs = parseInt(state?.timerSecs) || 0;
  ```

### 2. 快取作廢 (`admin.html`)
- 升級為 `admin.js?v=sync_cards_timer`。

## 驗證計畫

### 手動驗證
- 建立一個秒數設定為 10 秒的 Quiz 題庫。
- 點擊 Start，確認畫面開始 10 秒倒數。
- 倒數至 0 秒，確認系統自動精準切換至第二題。
- 點擊 Return Lobby 退回大廳，確認所有題庫卡片的 Start 按鍵立刻滿血亮起，無需按 F5。
