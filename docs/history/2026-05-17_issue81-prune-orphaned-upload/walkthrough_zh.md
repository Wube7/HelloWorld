# 實行紀錄：刪除殘留舊版上傳變數修復當機

本份文件紀錄了為排查實機 F12 日誌所發現的 ReferenceError 當機，所完成的殘留代碼清整成果。

## 執行變更

### 殘留代碼徹底清空 (`admin.js`, `admin.html`)
1. **刪除舊有監聽器 (`admin.js`)**：徹底清空了第 1075 到 1157 行殘留的舊版單一題庫上傳按鈕監聽器 (`btnQuizUpload` 等)。徹底解除了嚴格模式下讀取未宣告變數造成的 ReferenceError 當機，打通後續 KBC 與 Survey 監聽器的掛載。
2. **刪除屬性操作 (`admin.js`)**：於 `updateVisibilityState()` 中移除了殘留的按鍵屬性操作。
3. **強制更新 (`admin.html`)**：引用升級為 `admin.js?v=prune_orphaned_upload_vars`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 重新載入頁面，控制台紅字全數消散，後方 KBC 與 Survey 監聽器順利掛載，問卷清單與按鈕滿血復活。
