# 實行紀錄：HTML5 rel="opener" 跨分頁會話憑證繼承

本份文件紀錄了正式完成 HTML5 官方標準的 `rel="opener"` 跨分頁會話憑證拷貝重構與驗證結果。

## 執行變更

### 1. 跨分頁 sessionStorage 自動拷貝 (`public/index.html`)
- 於 `index.html` 中，精準為 `👑 Admin`（第 22 行）與 `📺 Presenter`（第 23 行）的 `target="_blank"` 超連結加上了 **`rel="opener"`** 屬性！
- **完美拷貝**：當管理員在大廳點擊「👑 Admin」開啟新分頁時，瀏覽器會自動將大廳分頁的整個 `sessionStorage` 實時複製一份給管理台新分頁！
- **完美結果**：新分頁立刻拿到了 Google 管理員的驗證憑證，**秒速成功進入管理台總控，無需重複登入**！完美恢復您的工作流！

### 2. 全分頁 sessionStorage 會話安全沙盒化
- 三端繼續維持最安全的 `browserSessionPersistence`（會話持久化）。
- 雖然新分頁拿到了大廳的憑證拷貝，但它的 `sessionStorage` 依然與大廳完全隔離。大廳手動點擊「登出」後，背景休眠的 Presenter 無論如何自動匿名登入，都**絕對無法跨分頁綁架已登出的大廳分頁**，背景自動登入漏洞被完美拔除！

### 3. 強制刷新快取 (`public/index.html`)
- 引用版本升級為 `script.js?v=auth_isolation_v2`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並部署發布至正式與測試站台。
- 實測大廳登入 Google 管理員，點擊 `👑 Admin` 在新分頁開啟管理台，**瞬間繼承權限進入，無任何重新登入阻礙！**
- 大廳點擊登出後閒置，確認絕無任何自動登入！
