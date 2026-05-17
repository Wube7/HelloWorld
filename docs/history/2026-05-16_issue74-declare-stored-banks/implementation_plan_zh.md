# 宣告遺漏變數修復題庫清單空白計畫

針對點擊建立題庫後寫入成功但下方清單依然空白的問題進行深入排查。精準發現在稍早重構題庫清單時，於 `admin.js` 頂端漏掉了 `let storedQuizBanks = {};` 的全域變數宣告。在 ES Module 嚴格模式下直接對未宣告變數賦值引發的 `ReferenceError` 當機，正是導致 Firebase 實時清單無法更新的真正元凶。補齊宣告即可瞬間恢復動態清單重繪。

## 使用者審查事項
請審查 `admin.js` 全域變數宣告。

## 根本原因剖析 (Root Cause Analysis)
在稍早 Issue #70 (Step 2) 裡，我們連線監聽了 `/admin/quizBanks`。當 Firebase 收到題庫快照時，回呼執行了 `storedQuizBanks = snapshot.val() || {};`。
然而，在頂端的 DOM 宣告區中，我們意外漏寫了 `let storedQuizBanks = {};` 的宣告。因為 ES Module 強制執行 Strict Mode（嚴格模式），對未宣告變數賦值會當場引發 `ReferenceError: storedQuizBanks is not defined` 例外。這道未捕獲的錯誤當場中斷了 Firebase 監聽器回呼，導致管理控制台下方的 `#quiz-bank-list` 永遠保持空白。補齊變數宣告即可秒速通關。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 於第 93 行補齊宣告：
  ```javascript
      const quizBankListEl = document.getElementById('quiz-bank-list');
      const quizBankCountEl = document.getElementById('quiz-bank-count');

      let storedQuizBanks = {}; // <-- 補齊宣告

      // Extra Elements to Hide During Quiz
  ```

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- 升級為 `admin.js?v=fix_stored_banks` 強制刷新快取。

## 驗證計畫

### 手動驗證
- 開啟 `admin.html`，按 F12 觀察完全無 `ReferenceError` 例外。
- 按下 `+ Save Quiz Bank`，秒速寫入資料庫並即刻動態重繪於下方清單中，無需重整網頁。
