# 實行紀錄：升級 KBC 讀取為標準 get() API 修復強制結算卡死

本份文件紀錄了為排查 `Force Resolve` 毫無反應與大廳 `Result` 無效，所完成的 Promise 讀取優化與非同步競爭排查成果。

## 執行變更

### 官方 API 升級與非同步競爭消弭 (`admin.js`)
1. **全面導入 `get()` API**：
   - 廢除過往以 `onValue(..., { onlyOnce: true })` 封裝單次讀取的冗餘做法，全面升級為官方標準非同步 Promise 讀取 API `get(ref(...))`。
   - 徹底解決 SDK 底層佇列在緊密發起多次 `onValue` 時導致第二個 Promise 永遠無法被 resolve 的死鎖問題。
2. **移除非同步競爭源**：
   - 拔除 `btnKbcForce` 點擊事件中毫無作用且引發卡死的額外監聽器呼叫，確保 `resolveKbcRound(true)` 秒速順滑發動。
3. **保證歸檔連貫性**：
   - 隨著結算順利完成，每一輪的快照精準寫入 `kbcArchive`，大廳 Result 鍵隨之完美復活。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 於有人未答題時點擊 `Force Resolve`，秒速精準扣分並進入下一輪。
- 大廳點擊 Result 鍵，戰績完美重播。
