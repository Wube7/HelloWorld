# 實行紀錄：記憶體斷線追蹤器與 60 秒重整保護機制

本份文件紀錄了為解決匿名帳號在房間較久後按 F5 重新整理時，遭到自動清道夫以登入時間計算斷線時長從而當場誤殺的 Bug，所實作的記憶體精確斷線起算器成果。

## 執行變更

### 記憶體精準追蹤 (`script.js`, `admin.js`)
- 移除了單純依賴靜態 `lastActive` 登入時間戳記算帳的盲點，改以 JavaScript 記憶體字典 (`disconnectMap`) 進行即時追蹤。
- 在 `renderUserList()` 中：
  - 只要使用者連線中 (`onlinePresence[uid] === true`)，立刻抹除其斷線紀錄 (`delete disconnectMap[uid]`)。
  - 當偵測到斷線時，準確寫入斷線當下的毫秒時刻 (`disconnectMap[uid] = Date.now()`)。
  - 斷線者在前端名單立刻自動過濾隱藏。
  - 管理員的背景清道夫嚴格依據：「自**斷線瞬間**起算，是否連續離線超過 60 秒 (`now - disconnectMap[uid] > 60000`)」，才會發出資料庫刪除請求。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並推送至測試站台。
- 任何參與者隨意按下 F5 重載網頁時，皆能在數百毫秒內順暢重連並精準保留原動物名稱，不再被降級為 Legacy User。
