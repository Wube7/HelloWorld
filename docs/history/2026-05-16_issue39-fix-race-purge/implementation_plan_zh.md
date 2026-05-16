# 修復自動清理機制異步競爭危害計畫

解決嚴重的異步競爭危害 (Race Condition)。在稍早的實作中，剛開始連線的匿名帳號（例如 `Anonymous Owl`）在初始化階段，會因為 Firebase 廣播時間差，遭到管理員的自動清理程式誤判為已斷線幽靈帳號並當場刪除個人檔案，導致其在後續連線中被降級冠上 `'Anonymous/Legacy User'`。

## 使用者審查事項
請審閱這份深度的非同步時序分析，以及我們所建議導入的時間戳緩衝期 (Grace Period) 保護機制。

## 根本原因剖析 (Root Cause Analysis)
當新訪客點選匿名登入時，系統非同步發送寫入 `/users/${uid}` 的請求，並同步建立 `/presence/${uid}` 在線狀態。
在分散式雲端網路中，`users` 快照廣播往往會比 `presence` 的 WebSocket 握手完成提早幾毫秒送達管理員客戶端。
稍早在 `renderUserList()` 中，管理員判定 `if (isAnon && !isOnline) { remove(users/uid) }`。當 `users` 廣播率先抵達時，管理員因為尚未收到對方的在線訊號 (`!isOnline`)，竟然瞬間將新訪客剛建立的個人資料庫節點予以刪除！
當幾毫秒後對方的 `presence` 終於連線廣播時，管理員發現對方在線但個人資料庫已不存在，系統便被迫給予 `'Anonymous/Legacy User'` 的稱號！

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
1. **時間戳記錄**：
   - 在儲存使用者個人檔案時（包含 `onAuthStateChanged` 與 `btnAnon` 登入），加上 `lastActive: Date.now()` 或 `serverTimestamp()`。
2. **設立安全緩衝期 (Grace Period)**：
   - 在 `renderUserList()` 中，設定斷線判斷必須超過 10 秒才啟動主動資料庫清除：
     ```javascript
     const uTime = uObj.lastActive || 0;
     const isLongOffline = (Date.now() - uTime > 10000); // 斷線超過 10 秒才視為真實幽靈
     if (isAnon && !isOnline) {
         delete combinedUsers[uid]; // 前端即時隱藏
         if (isAdmin && isLongOffline && uTime > 0) {
             remove(ref(db, `users/${uid}`)).catch(() => {}); // 緩衝期過後才發送清除請求
         }
     }
     ```

## 驗證計畫

### 手動驗證
- 以管理員身分登入。
- 開啟無痕視窗進行匿名登入。
- 觀察管理員清單中，新帳號準確顯示為其專屬動物名稱（如 `Anonymous Owl`），而不會被降級為 Legacy User。
- 關閉無痕視窗，確認 10 秒後資料庫殘留節點順利被背景清除乾淨。
