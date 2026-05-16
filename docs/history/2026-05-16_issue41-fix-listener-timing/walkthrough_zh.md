# 實行紀錄：延遲監聽綁定與寫入順序屏障修復空白與降級

本份文件紀錄了為徹底解決未登入訪客因權限不足導致 Firebase SDK 永久銷毀監聽器，及連線初期異步廣播競爭所造成的畫面空白與 Legacy User 閃爍，所進行的底層時序重構成果。

## 執行變更

### 異步生命週期重構 (`script.js`)
1. **延遲監聽封裝 (`initDatabaseFuncs`)**：
   - 將原本直接暴露於 `DOMContentLoaded` 頂層的所有受保護監聽器（`presence`, `users`, `messages`, `quizData`, `globalView`, `quizState`, `quizScores`, `kbcState`）全數包裹進入非同步初始函數集。
   - 確保僅在身實驗證成功 (`onAuthStateChanged`) 的當下，才精確啟動資料庫監聽，完美杜絕了網頁開啟瞬間被伺服器拒絕讀取從而導致 SDK 永久銷毀監聽器的致命死鎖。訪客再也不需按 F5 重載！
2. **寫入順序屏障 (Write Ordering Barrier)**：
   - 於身實驗證流程中嚴格規定：先等待 `users/uid` 個人檔案在資料庫成功著陸 (`await set`)，隨後才允許綁定 WebSocket `presence` 長連線與廣播。
3. **平順的前端呈現**：
   - 將名單中的備用防呆文字自 `'Anonymous/Legacy User'` 改為平順的 `'Connecting...'`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 訪客初次點選匿名登入，聊天室歷史紀錄與右上角在線人數瞬間湧現，名單載入順暢無比，再無空白與降級閃爍現象。
