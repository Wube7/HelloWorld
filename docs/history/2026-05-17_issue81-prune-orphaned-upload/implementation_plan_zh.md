# 刪除殘留舊版上傳變數修復當機計畫

針對您透過 Chrome F12 提供的實機日誌，我們精準抓出了 `Uncaught ReferenceError: btnQuizUpload is not defined` 這個引發全域當機的致命元凶！徹底刪除殘留的舊版單一模式上傳事件處理器，即可打通 KBC 與 Survey Rating 的實時監聽器。

## 使用者審查事項
請審查殘留舊代碼的刪除範圍。

## 根本原因剖析 (Root Cause Analysis)
在稍早的重構中，我們在 `admin.js` 的頂端 DOM 宣告區移除了舊版單一題庫模式的上傳按鍵變數 (`btnQuizUpload`, `btnQuizDefault`, `btnQuizTemplate`)。
然而，在代碼中後段 (第 1075 到 1157 行)，這些舊有按鈕的事件監聽器綁定卻不慎被殘留了下來！由於 ES Module 強制開啟 Strict Mode（嚴格模式），當腳本順序執行到第 1075 行時，直接對全域未宣告的變數進行 `if (btnQuizUpload)` 判斷，當場觸發了致命的 `ReferenceError` 例外！
這道未捕獲的錯誤當場殺死了 JavaScript 引擎，導致寫在後面的 KBC 監聽器 (第 1656 行) 與 Survey Rating 監聽器 (第 1885 行) 連一行都沒有被執行到！這正是為什麼 Survey 題庫一片空白且 Start 按鍵無效的真正終極謎底！

## 建議修改計畫

### 1. 刪除殘留舊代碼 (`admin.js`)
- 徹底刪除第 1075 到 1157 行殘留的舊版 `Upload`, `Default`, `Template` 事件綁定。
- 於 `updateVisibilityState()` 內部移除殘留的按鍵屬性操作。

### 2. 快取作廢 (`admin.html`)
- 升級為 `admin.js?v=prune_orphaned_upload_vars`。

## 驗證計畫

### 手動驗證
- 開啟網頁，按 F12 觀察 Console，確認紅字 `ReferenceError` 徹底消散。
- 往下查看 Survey Rating Master，問卷清單完美載入顯現！
- 點擊 KBC Start 順暢發動賽事。
