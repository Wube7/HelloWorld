# 重構靜態資源阻塞式讀取修復驗證卡死計畫

針對切換至管理控制台 (`admin.html`) 時無盡卡在 `"Verifying Authentication..."` 的致命問題進行非同步生命週期大重構。精準發現在 `admin.js` 初始化階段，阻塞式的 `await fetch('quiz.json')` 在遭遇網路延遲或靜態資源卡頓時會無盡阻塞後續腳本執行。將其改為非阻塞式 Promise 鏈即可秒速通關驗證。

## 使用者審查事項
請審查靜態資源非同步讀取的非阻塞式重構。

## 根本原因剖析 (Root Cause Analysis)
在 `admin.js` 剛執行時，第 112 行調用了 `await fetch('quiz.json')`。由於該行代碼使用了 `await` 關鍵字，一旦本地網路或模擬器在提供靜態資源時發生稍微卡頓，Promise 就會無期維持在 `pending` 狀態。
這直接導致 JavaScript 引擎的主執行緒完全停滯，無法向下執行到第 254 行的 `onAuthStateChanged` 登入狀態監聽，甚至連 5 秒後的超時警告都無法綁定，使頁面文字永遠停留在 `"Verifying Authentication..."`。改為 `fetch(...).then(...)` 即可徹底解放執行緒。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 將阻塞式讀取改為 Promise 鏈：
  ```javascript
  let quizData = [];
  let defaultQuizData = [];
  fetch('quiz.json').then(res => res.json()).then(data => { ... });
  ```

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- 更新底部版本號為 `admin.js?v=fix_auth_pending` 強制清除快取。

## 驗證計畫

### 手動驗證
- 開啟 `admin.html`，確認頁面在毫秒內通過 `"Verifying Authentication..."`，秒速切換為 `"👑 Active Admin"` 或提示登入。
- 確認三大模組操作通暢。
