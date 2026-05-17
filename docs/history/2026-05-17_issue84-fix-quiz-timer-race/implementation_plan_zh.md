# 消除計時器跳題競態衝撞與確保繼承計畫

針對您極其敏銳且專業的深層非同步反饋，我們精準排查出了兩大核心競態衝撞元凶：(1) 跳轉第二題時未繼承上一題的元數據 (`bankId`, `timerSecs`)；(2) 玩家端與管理端重複綁定跳轉計時器引發後端寫入衝撞。透過在跳題寫入時展開繼承 (`...state`)，並刪除展示端的冗餘發送，即可滿血貫通。

## 使用者審查事項
請審查跳題繼承結構與冗餘控制器刪除範圍。

## 根本原因剖析 (Root Cause Analysis)

### 1. 殘留跳題快照未繼承元數據
當 `admin.js` 裡的計時器倒數至 0 秒發動跳題時 (第 915 行)，它只發出了全新的 `{ active: true, phase: 'question', questionIndex: nextIdx }`。
**核心痛點**：由於它沒有使用展開運算子繼承上一題的狀態 (`...state`)，導致跳到第二題時，原本自帶的 `bankId`、`topic` 與 `timerSecs` 瞬間全部遺失！當第二題的快照推送給監聽器時，`state.timerSecs` 變成 `undefined`，取得的秒數當場變成 `0`，自動計時器與計分機制當場癱瘓。只要在跳轉寫入時加上 `...state` 繼承，即可秒速化解。

### 2. 雙重發送競態衝撞
在 `script.js` (主頁玩家端) 裡，竟然也留有相同的 `setTimeout` 跳題判斷！若管理員同時開啟兩個網頁，兩邊同時計時並對後端發出寫入，會造成極為嚴重的競態衝撞。將 `script.js` 中的跳題寫入徹底刪除，使控制權歸一於管理控制台。

## 建議修改計畫

### 1. 繼承元數據 (`admin.js`)
- 於第 913-915 行加入 `...state` 展開繼承：
  ```javascript
  set(ref(db, 'admin/quizState'), { ...state, active: true, phase: 'podium' });
  ...
  const stateObj = { ...state, active: true, phase: 'question', questionIndex: nextIdx };
  ```

### 2. 刪除玩家端冗餘發送 (`script.js`)
- 於第 629-643 行徹底刪除自動跳題寫入，僅保留 `clearAutoJump()`。

### 3. 快取作廢 (`admin.html`)
- 升級為 `admin.js?v=fix_timer_metadata_race`。

## 驗證計畫

### 手動驗證
- 建立設定 10 秒的 Quiz 題庫。
- 點擊 Start，見證第一題完美倒數 10 秒。
- 倒數至 0 秒，見證精準切換第二題，且第二題完美繼承 10 秒設定再次精準倒數！
- 於第二題選擇正確答案，確認計分板完美累加。
