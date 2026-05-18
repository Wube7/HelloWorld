# 跨分頁會話隔離與 rel="opener" 憑證繼承實作計畫

為了解決您提出的「全面分頁會話隔離 `browserSessionPersistence` 會導致點擊 Admin 按鈕開啟新分頁時，新分頁無法繼承 Google 管理員權限」這一經典衝突，我們將採用**最優雅、最精簡且完全不增加代碼複雜度**的解決方案！

我們將在所有網頁繼續維持最安全的 `browserSessionPersistence`（會話隔離）。同時，我們將利用 HTML5 官方標準的 **`rel="opener"`（開啟者關聯屬性）**，讓瀏覽器在新分頁開啟時，自動將大廳分頁的 `sessionStorage` 憑證拷貝一份給管理台新分頁，實現完美的權限繼承！

## 使用者審查事項
請審查 `public/index.html` 中新增 `rel="opener"` 的 HTML 標記。

---

## Proposed Changes

### Public Assets

#### [MODIFY] [public/index.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/index.html)
- 將 Admin 控制台與 Presenter 看板的超連結（第 22-23 行）加上 `rel="opener"` 屬性：
  ```html
  <a id="link-admin-panel" href="admin.html" target="_blank" rel="opener" class="hidden glass-panel-small user-badge" ...>👑 Admin</a>
  <a id="link-presenter-page" href="presenter.html" target="_blank" rel="opener" class="hidden glass-panel-small user-badge" ...>📺 Presenter</a>
  ```
  這能指示現代瀏覽器在保留 `window.opener` 關係的同時，**將父分頁的 `sessionStorage` 實時拷貝一份給新開啟的分頁**，從而讓管理台完美繼承 Google 登入狀態！

#### [MODIFY] [public/script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- 於初始化時，強制將 persistence 設定為分頁獨立的 `browserSessionPersistence`。

#### [MODIFY] [public/admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 於初始化時，強制將 persistence 設定為分頁獨立的 `browserSessionPersistence`。

#### [MODIFY] [public/presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 於初始化時，強制將 persistence 設定為分頁獨立 the `browserSessionPersistence`。

## 驗證計畫
- 登入 Google 管理員帳號。
- 點擊 `👑 Admin`，驗證管理台是否**在新分頁順暢打開、且立刻成功認證為管理員**！
- 大廳登出，靜置不動，驗證大廳分頁絕無自動登入。
