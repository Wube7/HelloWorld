# 同步遊戲模組參賽名單讀取 WebSocket 在線狀態名稱計畫

徹底打通全站遊戲模組資料流。針對 Quiz 頒獎台與 KBC 競賽中，參賽者名單依然無腦向 `allUsers` 查詢，導致資料庫延遲時退回 `'Anonymous/Legacy User'` 或 `'Anonymous'` 的死角，全面改以優先讀取 WebSocket 狀態節點自帶的名稱。

## 使用者審查事項
請審查針對 Quiz 與 KBC 參賽者名單產生器的資料讀取順序升級計畫。

## 根本原因剖析 (Root Cause Analysis)
在 Issue #42 中，我們將使用者真實名稱打包進了 WebSocket 在線狀態廣播包 (`onlinePresence[uid].name`)，並順利升級了在線名單視窗。
然而！在 Quiz 的頒獎台繪製函數 (`renderPodium()`) 與管理員發動 KBC 的按鈕 (`btnKbcStart.click`) 裡，系統依然死板地拿著 UID 單方面向本機的 `allUsers` 查詢 (`const userObj = allUsers[uid] || {}`)！當資料庫快照延遲，或稍早因重整造成 `users` 節點被誤刪時，遊戲模組查無資料，便直接套上了預設的防呆字串。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
1. **Quiz 頒獎台同步 (`renderPodium`)**：
   - 遍歷在線帳戶時，優先自狀態封包提取名稱：
     ```javascript
     const pData = onlinePresence[uid];
     const fetchedPName = (typeof pData === 'object' && pData.name) ? pData.name : null;
     const userScoreObj = allQuizScores[uid] || {};
     const userObj = allUsers[uid] || {};
     const nameToUse = fetchedPName || userScoreObj.name || userObj.name || 'Anonymous User';
     ```
2. **KBC 參賽者字典同步 (`btnKbcStart.click`)**：
   - 管理員啟動 KBC 遊戲時，自狀態封包提取參賽者名稱：
     ```javascript
     for (const [uid, pData] of Object.entries(onlinePresence)) {
         const isOnline = pData && (pData === true || pData.online);
         if (isOnline) {
             const fetchedPName = (typeof pData === 'object' && pData.name) ? pData.name : null;
             const userObj = allUsers[uid] || {};
             players[uid] = { name: fetchedPName || userObj.name || 'Anonymous User', points: 10 };
         }
     }
     ```

## 驗證計畫

### 手動驗證
- 於管理員畫面啟動 KBC 比賽。
- 於無痕視窗中以匿名帳號參與。
- 檢視 KBC 計分板，確認參賽名單精確展示動物名字（如 `Anonymous Owl`），不再顯示死板的 Anonymous。
