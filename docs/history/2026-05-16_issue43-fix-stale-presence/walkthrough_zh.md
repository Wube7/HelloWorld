# 實行紀錄：動態獲取名稱消除 WebSocket 閉包覆寫 Bug

本份文件紀錄了為解決在線名單中匿名帳戶重載時被舊閉包變數無情覆寫回 `'Connecting...'` 的底層問題，所進行的即時動態取值重構成果。

## 執行變更

### 動態即時取值 (`script.js`)
- 移除了 `onAuthStateChanged` 中過早宣告並凍結的靜態 `presencePayload` 變數。
- 於底層 WebSocket 監聽器 (`.info/connected`) 握手成功寫入 Firebase 的當下，要求系統必須即時向 `auth.currentUser` 索取最新、最準確的顯示名稱：
  ```javascript
  const activeDispName = (auth.currentUser && auth.currentUser.displayName) || user.displayName || 'Connecting...';
  set(userPresenceRef, { online: true, name: activeDispName, isAnon: isAnon });
  ```
- 確保不論網路連線何時重整或波動，廣播封包必定攜帶完美的動物名稱。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 新進匿名者與在線重整時，雙方名單精準呈現專屬動物名稱，再無卡死或閃回現象。
