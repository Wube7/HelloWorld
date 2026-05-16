# 解耦管理員控制台與引入獨立 Presenter 模式計畫

將原本內嵌於主應用程式中的管理員控制台 (`#admin-panel`) 徹底抽離為獨立的後台系統 (`admin.html`)，並針對現場活動或直播大螢幕投影需求，建構專用的主持人展示模式 (`presenter.html`)，大幅精簡一般使用者的主畫面結構。

## 使用者審查事項
請確認管理員與主持人模式解耦後的連結配置及 Presenter 投影畫面的功能定義是否符合您的活動規劃。

## 建議修改計畫

### 前端資源

#### [MODIFY] [index.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/index.html)
- 將 `<div id="admin-panel">` 區塊全數刪除。
- 在頁首 `.header-right` 內部新增兩個預設隱藏的管理員專用按鈕：
  - `👑 Admin`：開啟 `admin.html`
  - `📺 Presenter`：開啟 `presenter.html`

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- 修改管理員登入檢查邏輯，登入後改為顯示頁首的新連結，而非直接展開控制面板。
- 移除原本主程式中與管理按鈕直接相關的事件處理程式。

#### [NEW] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html) & [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 獨立的管理專用後台網頁，包含完整的 Quiz Master 與 KBC 控制器。
- 在執行操作前實施嚴謹的 Firebase 身分驗證審核 (`ADMIN_EMAILS`)。

#### [NEW] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html) & [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 大螢幕展示專用視窗。
- 監聽並即時同步 Firebase 上的 Quiz 與 KBC 狀態，但完全隱藏個人答題選項與數值提交框，避免洩漏主持人的私人操作。
- 清晰呈現 QR code 導引、全球即時對話、題目播報、頒獎盛典及 KBC 回合戰況。

## 驗證計畫

### 手動驗證
- 以管理員身分登入，檢查頁首右側是否順利解鎖 `👑 Admin` 與 `📺 Presenter` 連結。
- 開啟 `admin.html` 測試出題與切換回合。
- 開啟 `presenter.html` 檢驗大螢幕視圖是否即時跟進活動狀態且不具作答介面。
