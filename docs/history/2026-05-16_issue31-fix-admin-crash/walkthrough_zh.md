# 實行紀錄：修復解耦腳本空 DOM 引用崩潰 Bug

本份文件紀錄了為解決分離後台系統與展示頁面時，在 `admin.js` 與 `presenter.js` 初始階段對缺失 DOM 元素直接操作所引發的致命 `TypeError` 崩潰，所進行的安全防呆實作成果。

## 執行變更

### 安全 DOM 封裝 (`admin.js`, `presenter.js`)
1. **封裝 QR Code 邏輯**：
   - 取消了未經檢查的 `document.getElementById('qr-code-link').href` 賦值，改以 `if (qrLink)` 與 `if (qrImg)` 條件判斷包覆。
   - 成功排除了在乾淨的後台視窗中，由於缺乏 QR Code 容器所造成的 `TypeError` 崩潰。
2. **封裝身分驗證按鈕**：
   - 將 Google 與匿名登入按鈕的點擊監聽綁定，全數放置於 `if (btnGoogle)` 與 `if (btnAnon)` 的安全防呆保護區塊內。
   - 確保了 JavaScript 執行緒平順運行，讓下方的 `onAuthStateChanged` 能夠順暢執行並解鎖完整的管理員控制台。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動推送至測試站台。
- 開啟 `admin.html` 時，驗證文字順利切換，秒速呈現出題與回合切換面板，主控台再無報錯。
