# 延遲監聽綁定與寫入順序屏障修復空白與降級 Bug 計畫

徹底解決兩大底層架構難題：1. 未登入訪客因權限不足 (`PERMISSION_DENIED`) 導致資料庫監聽器被 Firebase SDK 永久銷毀，在後續完成登入時畫面一片空白必須按 F5 的 Bug。 2. 登入與連線初期的異步廣播競爭，導致使用者短暫被冠上 `'Anonymous/Legacy User'` 的閃爍 Bug。

## 使用者審查事項
請審查延遲啟動資料庫監聽的架構調整與寫入順序屏障 (Write Ordering Barrier) 的時序規劃。

## 根本原因剖析 (Root Cause Analysis)
1. **剛登入一片死寂與 0 人在線**：
   Firebase 資料庫安全規則嚴格要求 `auth != null`。在先前的 `script.js` 中，所有監聽器（如 `onValue(presence)` 與 `onChildAdded(messages)`）皆直接寫在 `DOMContentLoaded` 的最外層。當訪客開啟網頁（未登入狀態）時，伺服器秒回 `PERMISSION_DENIED`。在 Firebase SDK 底層機制中，被拒絕的監聽器會直接遭到永久銷毀。當數秒後訪客點擊登入按鈕順利驗證身分後，已夭折的監聽器無法自動復活，造成頁面毫無反應，直到手動按下 F5 重整。
2. **Legacy User 冠名閃爍**：
   在連線握手階段，系統先前同時發送 `presence` 與 `users` 寫入請求。若網路傳輸中 `presence` 廣播提早 `users` 快照數毫秒抵達管理員端，管理員端執行名單繪製時判定 `!combinedUsers[uid]` 為真，因而將新連線冠上 `'Anonymous/Legacy User'`。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
1. **延遲啟動監聽封裝**：
   - 將所有受保護的資料庫監聽器（包含 `presence`, `users`, `messages`, `quizState`, `quizScores`, `kbcState`, `globalView`）移入專用函數：`function setupDatabaseListeners(user)`。
   - 於 `onAuthStateChanged` 內，當成功確認 `user` 存在且尚未初始化時，才精準呼叫此函數。
2. **寫入順序屏障 (Write Ordering Barrier)**：
   - 於 `onAuthStateChanged` 內強制執行非同步時序屏障：
     ```javascript
     await set(ref(db, `users/${user.uid}`), { ... }); // 確保名片檔案率先在資料庫著陸
     userPresenceRef = ref(db, `presence/${user.uid}`);
     ... // 隨後才啟動 WebSocket 連線與在線廣播
     ```
3. **平滑的 UI 狀態呈現**：
   - 於 `renderUserList()` 裡，將生硬死板的 `'Anonymous/Legacy User'` 改為 `'Connecting...'`（若與自身連線匹配則優先顯示 `auth.currentUser.displayName`）。

## 驗證計畫

### 手動驗證
- 開啟全新無痕視窗前往網站首頁。
- 檢驗初始載入未登入時顯示登入卡片。
- 點選「匿名登入」，檢驗無須按 F5，聊天室歷史對話瞬間湧現，右上角計數器精準跳至實際在線人數。
- 展開名單，確認秒速呈現正確動物名稱，不再閃爍 Legacy User。
