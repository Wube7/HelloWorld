# 實行紀錄：同步遊戲模組參賽名單讀取 WebSocket 狀態名稱

本份文件紀錄了為解決 Quiz 頒獎台與 KBC 競賽中，因為單方面向資料庫查詢導致快取未及時跟上而遺失動物名字的死角，所進行的全域狀態封包名稱提取成果。

## 執行變更

### 名單生成器升級 (`script.js`, `admin.js`, `presenter.js`)
1. **Quiz 頒獎台精準冠名 (`renderPodium`)**：
   - 於計分結算時，要求系統優先自 WebSocket 狀態封包提取自帶名稱 (`pData.name`) 或是得分榜紀錄上的名稱 (`scoreData.name`)。
2. **KBC 參賽名冊精準冠名 (`btnKbcStart.click`)**：
   - 在管理員按下 KBC 啟動按鈕建置參賽者清單 (`players`) 時，同步優先自 WebSocket 狀態封包提取名稱。
   - 確保傳送給全場的 KBC 遊戲狀態封包中，每一位參賽者皆精準帶有正確的動物名稱（如 `Anonymous Owl`），徹底告別死板的 Anonymous！

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並發布至測試站台。
- 不論在 Quiz 頒獎台還是 KBC 計分板，參賽者的動物名稱皆達到完美的精確與統一。
