# 統一後台與展示腳本延遲監聽生命週期計畫

徹底貫通全站底層時序架構。將我們在 Issue #41 於主程式碼所建立的非同步延遲監聽架構 (`initDatabaseFuncs`)，完整複製並實作於 `admin.js` 與 `presenter.js` 裡，徹底解決後台與大螢幕展示頁面在初始載入時因權限不足導致監聽器永久夭折的死角。

## 使用者審查事項
請確認三支核心腳本全面統一延遲監聽生命週期的底層架構升級計畫。

## 根本原因剖析 (Root Cause Analysis)
稍早我們成功解決了主網頁 (`script.js`) 的監聽夭折問題。然而！在獨立的 `admin.js` 與 `presenter.js` 裡，所有監聽器（如 `presence`, `users`, 遊戲模組）依然直接寫在最外層。
當管理員剛開啟 `admin.html` 時，若身分尚未自快取恢復 (`auth === null`)，這些監聽器同樣會遭到 Firebase 伺服器以 `PERMISSION_DENIED` 永久銷毀！這導致當管理員隨後驗證成功並按下 KBC 啟動按鈕時，因為底層監聽器已死，`onlinePresence` 未能即時同步，進而導致名單遺失或套用舊字串。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 宣告生命週期追蹤陣列：`let dbListenersUnsubscribes = [];`, `let listenersInitialized = false;`, `let initDatabaseFuncs = [];`。
- 在 `onAuthStateChanged` 成功確認身分的當下，精準呼叫 `initDatabaseFuncs.forEach(f => f())`。
- 將所有最外層的 `onValue` 與 `onChildAdded` 全數包裹進 `initDatabaseFuncs.push(() => { ... })` 佇列。

## 驗證計畫

### 手動驗證
- 重開乾淨的 `admin.html` 視窗，確認登入後各項管理數據即時連動。
- 按下 KBC 開始比賽，確認計分板精準呈現動物名稱。
- 觀察 `presenter.html`，確認畫面完美展示且無任何延遲或遺失。
