# 實行紀錄：歸正 Google 登入與 Firebase 監聽器標準流

本份文件紀錄了正式歸正 Google 登入驗證流並徹底解決在線狀態延遲的成果。

## 執行變更

### Google 登入標準流歸一 (`script.js`)
1. **廢除狀態阻斷鎖**：徹底從代碼庫中刪除了變數 `isGoogleAuthResolving`。
2. **極致簡化點擊事件**：從 `btnGoogle` 點擊監聽器中移除了多餘的 `await enterLobby` 和狀態切換。點擊事件現在只純粹發起 Google 彈出視窗驗證（`signInWithPopup`）並處理設定錯誤。
3. **啟用權威唯一監聽器**：從全域的 `onAuthStateChanged` 中移除了阻斷 early return。現在，當 Google 登入成功後，全域監聽器會以唯一的指揮塔身分，精準且一次性地執行大廳加載、寫入 `/users`、寫入 `/presence` 在線狀態並掛載所有資料庫實時監聽器。
4. **強制更新**：引用升級為 `script.js?v=google_auth_flow_aligned`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並部署發布至測試站台。
- 點擊 Google 登入，視窗驗證完成後，右上角在線人數與 User 清單**立刻即時顯示本人，100% 無需刷新網頁**！
- 整體加載過程流暢至極，完美解決了雙重綁定與大廳閃爍的頑疾，成功！
