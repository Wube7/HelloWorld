# 修正管理台語法例外與空 DOM 防呆修復卡死計畫

針對後台管理台 (`admin.html`) 永久卡在 `'Verifying Authentication...'` 進行底層編譯級別排查與修復。精準補回上一回合遺漏的 `initDatabaseFuncs.push` 宣告以消除未匹配括號引發的致命語法錯誤 (`SyntaxError`)，同時替在線人數 DOM 操作加上空值防呆，確保管理台腳本順利通過編譯並秒速完成身分驗證。

## 使用者審查事項
請確認括號匹配修正與 DOM 防呆邏輯。

## 根本原因剖析 (Root Cause Analysis)
在稍早實作 Issue #53 時，當我們將創意徵集的資料庫監聽器注入 `admin.js` 時，替換操作漏掉了開頭的 `initDatabaseFuncs.push(() => {`，卻保留了結尾的 `});`！這導致 V8 JavaScript 引擎在初次編譯 `admin.js` 腳本時，直接遭遇了致命的 `SyntaxError: Unexpected token ')'`。
由於編譯階段出錯，整支腳本瞬間崩潰，無論是 `onAuthStateChanged` 或是稍早加入的 5 秒 `setTimeout` 保底機制皆無從執行，畫面自然永久停滯。
另外，大廳在線人數監聽器試圖賦值給 `userCountEl`，但在 `admin.html` 中並無該 DOM 元素。補齊括號與防呆檢查後即可完美解鎖管理控制台。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 補回 `initDatabaseFuncs.push` 閉包宣告：
  ```javascript
      initDatabaseFuncs.push(() => {
          // Real-time Survey Ideas Master listeners
          dbListenersUnsubscribes.push(onValue(ref(db, 'admin/ideaSurveys'), (snapshot) => { ... }));
          ...
      });
  ```
- 替 `userCountEl` 增加防呆：
  ```javascript
      initDatabaseFuncs.push(() => {
          dbListenersUnsubscribes.push(onValue(presenceRef, (snapshot) => {
              const onlineUsersCount = snapshot.size;
              if (userCountEl) userCountEl.textContent = onlineUsersCount;
          }, ...));
      });
  ```

## 驗證計畫

### 手動驗證
- 開啟 `admin.html`，確認網頁不再卡在驗證狀態，秒速展開深藍黑底漸層的高對比管理員控制介面。
