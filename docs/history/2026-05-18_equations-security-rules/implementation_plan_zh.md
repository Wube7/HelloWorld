# 修正資料庫安全規則授權方程式競賽計畫

針對您在 Chrome F12 捕捉到的 `PERMISSION_DENIED` 紅字例外，我們精準定位了原因：新引入的 `/admin/equationsState` 節點在 Firebase 實時資料庫安全規則檔 `database.rules.json` 中尚未授權寫入！
我們將立即在安全規則中為該節點注入嚴密的管理員寫入與在線玩家讀取授權，並透過 CI/CD 秒速更新雲端安全規則，徹底打通方程式競賽模式。

## 使用者審查事項
請審查 `database.rules.json` 中對方程式節點的讀寫授權範圍。

## 建議修改計畫

### 1. 注入資料庫授權安全規則 (`database.rules.json`)
- 於 `admin` 區塊末尾 (第 100 行下方) 精確注入 `equationsState` 節點安全規則：
  ```json
  "equationsState": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.email == 'wube8816@gmail.com'"
  }
  ```

## 驗證計畫

### 雲端安全規則發布
- 提交並推送安全規則變更，透過 Firebase 自動化發布管道發布規則。

### 手動驗證
- 點擊管理台啟動方程式競賽，確認 F12 乾淨無暇，賽事順暢啟動！
