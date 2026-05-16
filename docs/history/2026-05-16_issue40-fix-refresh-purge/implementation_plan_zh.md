# 建立記憶體斷線追蹤器防止重整誤刪計畫

解決在線較久的匿名使用者在重整網頁 (F5) 時，遭到管理員自動清道夫誤殺並降級為 `'Anonymous/Legacy User'` 的致命時間差 Bug。

## 使用者審查事項
請審閱透過記憶體字典精準記錄斷線起算點的追蹤機制是否合乎期望。

## 根本原因剖析 (Root Cause Analysis)
在 Issue #39 中，我們採用 `Date.now() - lastActive > 10000` 作為防護。然而 `lastActive` 僅在剛登入時寫入一次。若使用者在房間待了 30 秒後按 F5 重新整理，其 WebSocket 會短暫斷線幾百毫秒。
此時管理員收到斷線快照執行 `renderUserList()`，計算 `now - 30秒前的登入時間 > 10秒` 成立，立刻判定該帳號為陳舊幽靈並當場非同步刪除資料庫檔案！當訪客重載完畢重新連線時，資料庫檔案已被清空，只好冠上 `'Anonymous/Legacy User'`。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 在名單模組中宣告斷線時間追蹤表：`let disconnectMap = {};`
- 於 `renderUserList()` 裡，精確追蹤每一位離線者的真實斷線起算時刻：
  ```javascript
  const now = Date.now();
  for (const [uid, uObj] of Object.entries(combinedUsers)) {
      const isOnline = !!onlinePresence[uid];
      const isAnon = uObj.isAnonymous || (uObj.name && uObj.name.startsWith('Anonymous'));
      
      if (isOnline) {
          delete disconnectMap[uid]; // 在線者即時解除斷線追蹤
      } else if (isAnon) {
          if (!disconnectMap[uid]) disconnectMap[uid] = now; // 記錄準確斷線瞬間
          const offlineDuration = now - disconnectMap[uid];
          
          delete combinedUsers[uid]; // 前端秒速隱藏
          if (isAdmin && offlineDuration > 15000) { // 真實斷線時長超過 15 秒才執行清除
              remove(ref(db, `users/${uid}`)).catch(() => {});
          }
      }
  }
  ```

## 驗證計畫

### 手動驗證
- 登入管理員帳號。
- 於無痕視窗登入匿名帳號，在房間裡停留超過 20 秒。
- 按下 F5 重新整理無痕視窗。
- 觀察管理員清單中，目標是否平順重連並精準維持原動物名稱，不再變成 Legacy User。
