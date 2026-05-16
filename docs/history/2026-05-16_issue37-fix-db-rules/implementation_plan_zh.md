# 修復踢人機制與離線帳號清理 Firebase 權限規則 Bug 計畫

針對管理員點選強制踢人按鈕 (`🚷`) 及背景執行離線匿名帳號刪除時，遭到 Firebase 伺服器以 `PERMISSION_DENIED` 拒絕寫入的問題，補全 `database.rules.json` 的安全權限規則。

## 使用者審查事項
請審閱針對 `kicklist` 及管理員覆寫 `users` 節點所制定的安全存取規則是否精確無誤。

## 根本原因剖析 (Root Cause Analysis)
在稍早實作 Issue #34 的強制登出功能時，我們讓管理員寫入 `admin/kicklist/${uid}`，但資料庫規則檔 `database.rules.json` 裡完全未曾定義過 `kicklist` 節點，因此 Firebase 預設套用了拒絕存取 (`PERMISSION_DENIED`)。
此外，在背景自動清理幽靈匿名帳號時，管理員嘗試執行 `remove(ref(db, 'users/' + uid))`，但原本的規則僅允許當事人自己 (`auth.uid == $uid`) 刪除自己的資料，因此也遭到伺服器攔截。

## 建議修改計畫

### 前端資源

#### [MODIFY] [database.rules.json](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/database.rules.json)
- 於 `/users/$uid` 及 `/presence/$uid` 節點的 `.write` 規則中，加入允許管理員 (`wube8816@gmail.com`) 進行寫入/刪除的覆寫權限。
- 於 `/admin` 節點下加入專門的 `kicklist` 讀寫規則：
  ```json
  "kicklist": {
      ".read": "auth != null",
      "$uid": {
          ".write": "auth != null && (auth.token.email == 'wube8816@gmail.com' || auth.uid == $uid)"
      }
  }
  ```

## 驗證計畫

### 手動驗證
- 登入管理員帳號。
- 於無痕視窗開啟一個連線帳號。
- 點選清單中的 `🚷` 按鈕，確認不再出現 `Kick failed: PERMISSION_DENIED` 錯誤，目標視窗瞬間被踢出。
