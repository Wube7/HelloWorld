# 實行紀錄：提升超時警告層級與診斷日誌排查驗證卡死

本份文件紀錄了為排查切換至管理台卡在 `"Verifying Authentication..."` 所完成的超時警告層級提升與診斷追蹤日誌成果。

## 執行變更

### 頂層守門員與日誌追蹤 (`admin.html`, `admin.js`)
1. **超時守門員置頂 (`admin.js`)**：將 5 秒驗證超時警告 (`setTimeout`) 提升至 `DOMContentLoaded` 最頂端。即使 Firebase 初始化連線發生不可抗力的停滯，畫面也保證在 5 秒後給出精確的錯誤提示，杜絕無期等待。
2. **連線異常反饋 (`admin.js`)**：當 `init.json` 讀取失敗時，於畫面印出精確的錯誤文字。
3. **開發追蹤日誌 (`admin.js`)**：於控制台輸出追蹤日誌 (`"admin.js started..."`, `"Mounting..."`, `"Auth state changed..."`)，協助開發者精準掌握每一步驟進展。
4. **強制刷新 (`admin.html`)**：引用升級為 `admin.js?v=fix_auth_watchdog`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 網頁載入即刻印出追蹤日誌，精準捕捉登入狀態轉變。
