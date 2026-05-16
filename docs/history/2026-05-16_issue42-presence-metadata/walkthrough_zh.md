# 實行紀錄：將名稱掛載於 WebSocket 狀態節點消除 Connecting 閃爍

本份文件紀錄了為解決在線名單於訪客重整時對資料庫快照延遲所造成的 Connecting 閃爍 Bug，所進行的 WebSocket 微封包掛載名稱實踐成果。

## 執行變更

### 狀態封包升級 (`script.js`, `admin.js`)
1. **嵌入個人檔案資訊**：
   - 取消了單純布林值 (`true`) 的連線宣告，改為寫入帶有完整個人檔案資訊的微封包：
     `{ online: true, name: "Anonymous Owl", isAnon: true }`。
2. **自主即時渲染**：
   - 重構了 `renderUserList()` 的合併邏輯。
   - 當管理員或其他人收到連線廣播時，直接讀取封包上自帶的名稱 (`pData.name`)，完全不需再等待資料庫 `users` 節點的廣播跟上。訪客隨意重整網頁時，全場在線名單瞬間精準繪製，徹底根除了 Connecting 或 Legacy 閃爍！

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動推送至測試站台。
- 訪客隨意重新整理分頁時，管理員清單平穩無痕，秒速呈現原正確名字。
