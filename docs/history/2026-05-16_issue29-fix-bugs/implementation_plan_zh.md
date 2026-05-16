# 修復聊天室自動登出、在線人數不穩及清單無內容 Bug 計畫

針對稍早架構解耦時殘留的未宣告變數，在 JavaScript 執行緒中所引發的致命 `ReferenceError`，進行徹底清理，以恢復聊天室非同步傳送與動態清單的正常運作。

## 使用者審查事項
請檢視根本原因分析與變數清理計畫，確認修復邏輯精確無誤。

## 根本原因剖析 (Root Cause Analysis)
在稍早進行 Issue #28 的介面解耦時，我們將原本定義的 `const globalViewToggle = ...` 替換為頁首雙連結。然而，在後續的事件監聽碼中，依然遺留了 `if (globalViewToggle)` 的條件檢查。
在 JavaScript 語法規範中，對一個從未宣告過的變數名稱進行求值，會立即觸發致命的 `ReferenceError: globalViewToggle is not defined`。這項例外直接中斷了 `DOMContentLoaded` 的初始化執行緒，導致：
1. **Bug 1 (自動登出)**：後面的 `chatForm.addEventListener('submit', ...)` 完全沒有綁定上去。當使用者按下 Enter 發送文字時，瀏覽器觸發了標準表單的預設同步提交動作，重載了整個網頁，表現為瞬間斷開連線與登出。
2. **Bug 3 (清單空白)**：後面的 `window.renderUserList` 函數定義被跳過，導致點開選單時無法載入任何名單。
3. **Bug 2 (人數跳動)**：未預期的頻繁表單重載導致 Firebase `onDisconnect` 瞬間移除再新增連線，造成計數器劇烈波動。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 將程式碼中殘留的 `globalViewToggle` 事件綁定與狀態更新行全數刪除。

## 驗證計畫

### 手動驗證
- 重新載入測試頁面。
- 於全球聊天室輸入並發送訊息，確認訊息平順呈現且不引發頁面重載。
- 點擊右上角在線計數器，檢驗使用者清單是否順暢顯示所有連線帳號。
- 確認在單頁面順暢操作期間，計數器維持穩定。
