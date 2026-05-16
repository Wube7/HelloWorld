# 實行紀錄：新增 kbcArchive 安全規則修復強制結算卡死

本份文件紀錄了為排查 `Force Resolve` 與大廳 `Result` 毫無反應，所完成的資料庫底層安全規則開放與例外排查成果。

## 執行變更

### 資料庫底層權限開放 (`database.rules.json`)
- 於 `admin` 節點下精準開放 `kbcArchive` 目錄的讀取 (`auth != null`) 與管理員寫入 (`wube8816@gmail.com`) 權限。
- 徹底消除了雲端拒絕寫入造成的 `PERMISSION_DENIED` 崩潰例外。讓系統順暢執行扣 1 分懲罰並跳過未答題者，順利進入下一回合。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 於有人未答題時按下 `Force Resolve`，順利跳過未答者並扣分晉級，毫無卡死。
- 大廳點選 Result 鍵，秒速讀取快照並展示昔日完整榜單。
