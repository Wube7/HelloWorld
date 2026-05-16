# 階段 1/3：建置多題庫資料庫規則與題庫上傳介面計畫

啟動問答模組 (`Quiz`) 多題庫進化的安全首部曲。採用極度謹慎、與現有功能完全隔離的小步伐，率先於資料庫開啟 `/admin/quizBanks` 讀寫權限，並在管理控制台新增獨立的題庫建置表單與範本下載按鍵。過程中完整保留舊有按鈕的 DOM 宣告（將其隱藏），確保腳本初始化 100% 免於 `ReferenceError` 例外。

## 使用者審查事項
請確認題庫目錄的安全性授權與上傳表單介面設計。

## 建議修改計畫

### 1. 資料庫底層授權 (`database.rules.json`)
- 於 `admin` 節點下開放 `quizBanks` 目錄的讀取 (`auth != null`) 與管理員寫入 (`wube8816@gmail.com`) 權限。

### 2. 題庫建置區 UI (`admin.html`)
- 將舊有的 Quiz 操作按鈕包裹於隱藏容器中 (`style="display: none;"`)，維持舊變數相容性。
- 新增多題庫專屬的表單區塊：主題名稱輸入框、自動跳轉秒數輸入框、隱藏式檔案上傳元件，以及 `+ Save Quiz Bank` 與 `Download Template` 按鍵。

### 3. 檔案解析與儲存 (`admin.js`)
- 宣告新建表單的 DOM 變數。
- 實作一鍵下載範例題庫 JSON 邏輯。
- 實作自訂 JSON 檔案解析防呆與持久化寫入 `/admin/quizBanks` 邏輯。

## 驗證計畫

### 手動驗證
- 開啟 `admin.html`，確認全新題庫表單完美呈現，且舊有 KBC 與 Survey 功能完全不受影響。
- 點擊 `Download Template` 成功下載範例題庫。
- 填寫主題 `"2026 科技大考驗"`、秒數 `"10"` 並選取下載的 JSON，按下 `+ Save Quiz Bank` 成功存入資料庫。
