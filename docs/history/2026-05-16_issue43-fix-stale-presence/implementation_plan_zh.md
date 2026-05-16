# 動態獲取名稱消除 WebSocket 閉包覆寫 Bug 計畫

徹底根除在線名單中匿名帳號重整或連線波動時被無情覆寫回 `'Connecting...'` 的底層閉包陷阱。改以在 WebSocket 連線成功當下即時動態獲取最新使用者名稱，保證廣播封包精確無誤。

## 使用者審查事項
請審閱這份精準的 JavaScript 閉包變數陷阱分析與即時動態取值方案。

## 根本原因剖析 (Root Cause Analysis)
在稍早的實作中，當匿名登入成功觸發 `onAuthStateChanged` 時，`user.displayName` 在那個瞬間為 `null`。系統隨即在記憶體中宣告並凍結了一個靜態變數：`const presencePayload = { name: 'Connecting...' }`。
當底層 WebSocket 監聽器 (`.info/connected`) 在未來任何時刻被觸發時，它總是拿著這個在幾秒鐘前就已經被凍結的舊變數寫入 Firebase 資料庫！
這導致即便稍後匿名登入成功指派了動物名稱 (`Anonymous Owl`)，只要連線稍微有重整或波動，舊的閉包變數就會瞬間把資料庫裡的在線節點**無情覆寫回** `'Connecting...'`！

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- 刪除 `onAuthStateChanged` 內的靜態 `presencePayload` 變數宣告。
- 於 `.info/connected` 監聽器寫入 `presence` 的當下，動態即時獲取當前 `auth` 記憶體中最新準確的顯示名稱：
  ```javascript
  connectedUnsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
          onDisconnect(userPresenceRef).remove().then(() => {
              const disp = (auth.currentUser && auth.currentUser.displayName) || user.displayName || 'Connecting...';
              set(userPresenceRef, { online: true, name: disp, isAnon: isAnon });
          });
      }
  });
  ```

## 驗證計畫

### 手動驗證
- 於管理員畫面檢視在線名單。
- 於無痕視窗進行匿名登入。
- 確認雙方名單皆秒速精準呈現動物名稱。
- 按下 F5 重新整理，確認不再閃現或卡死在 Connecting。
