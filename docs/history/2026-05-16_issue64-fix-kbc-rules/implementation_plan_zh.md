# 新增 kbcArchive 節點資料庫安全權限修復例外計畫

針對 KBC `Force Resolve` 與大廳 `Result` 按鈕毫無反應進行資料庫底層安全性排查。精準發現新建立的歸檔節點 `/admin/kbcArchive` 缺乏安全權限設定，導致所有讀寫一律被雲端拒絕 (`Permission Denied`)。於 `database.rules.json` 補齊對該路徑的讀寫授權，徹底消除未捕獲例外，解鎖賽事控場。

## 使用者審查事項
請審查 `/admin/kbcArchive` 的讀寫權限定義 (僅登入者可讀、僅指定管理員可寫)。

## 根本原因剖析 (Root Cause Analysis)
在稍早 Issue #61 中，為保存 KBC 賽事紀錄，我們建立了新的資料庫路徑 `/admin/kbcArchive`。然而，我們漏掉了在 `database.rules.json` 中開放該路徑的存取權限！
由於 Firebase Realtime Database 預設實行嚴格的預設拒絕 (`Default Deny`) 安全政策，當管理員點擊 `Force Resolve`，系統執行 `resolveKbcRound` 試圖寫入快照至 `kbcArchive` 時，Firebase 伺服器端直接回傳了致命的 `PERMISSION_DENIED` 例外！
該未捕獲例外致使結算函數當場崩潰中斷，後續更新賽事 `phase` 的代碼全數遭略過，因此按鈕毫無反應。
同時，管理台開局嘗試監聽該節點時也遭拒絕，導致歸檔快取永遠為 null，大廳 Result 鍵無法啟用。

## 建議修改計畫

### 資料庫設定

#### [MODIFY] [database.rules.json](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/database.rules.json)
- 於 `admin` 節點下注入 `kbcArchive` 權限：
  ```json
  "admin": {
      "kbcArchive": {
          ".read": "auth != null",
          ".write": "auth != null && auth.token.email == 'wube8816@gmail.com'"
      },
      "kicklist": { ... }
  ```

## 驗證計畫

### 手動驗證
- 開啟 KBC 競賽。
- 於有人作答、有人未答時按下 `Force Resolve`，確認網頁不再報錯，順暢扣除未答者點數並跳轉 3 秒倒數。
- 退回大廳點選 Result，確認大螢幕精準呈現歷史榜單。
