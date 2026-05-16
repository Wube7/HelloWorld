# 實行紀錄：同步登入微任務時序與統一綠燈判斷

本份文件紀錄了為排查 Google 登入卡在首頁與在線名單綠燈未亮，所完成的非同步微任務解耦與型態標準化成果。

## 執行變更

### 非同步微任務與連線狀態提取 (`script.js`)
1. **獨立大廳進入函式 (`enterLobby`)**：
   - 將大廳 DOM 的解鎖邏輯封裝為 `enterLobby(user)`。
   - 在 `signInWithPopup` 成功 resolving 時直接調用，防止 `isGoogleAuthResolving` 屏障在微任務時序中意外吃掉大廳跳轉。
2. **標準化綠燈判斷 (`checkIsOnline`)**：
   - 於排序、過濾與名單建置模組中統一採用 `checkIsOnline(pData)`。
   - 完美解析微封包物件 `{ online: true }`，確保每一位參與者的綠色連線燈號準確亮起。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 首頁點選 Google 登入完成授權當下，無縫躍進純白大廳。
- 匿名與 Google 帳號在線清單綠色指示燈閃耀精準。
