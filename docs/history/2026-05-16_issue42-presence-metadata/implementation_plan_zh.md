# 將使用者名稱掛載於 WebSocket 狀態節點消除 Connecting 閃爍計畫

重構在線狀態廣播架構。將使用者的顯示名稱與帳戶屬性 (`name`, `isAnon`) 直接嵌入 WebSocket 在線狀態廣播包中 (`/presence/${uid}`)，徹底消除其他人名單系統在握手初期對 `/users` 資料庫快照延遲的依賴，達成與聊天室封包同等高規格的秒速渲染。

## 使用者審查事項
請確認將名稱與匿名屬性直接打包掛載於 WebSocket 在線節點的微服務封裝設計是否合乎期望。

## 根本原因剖析 (Root Cause Analysis)
在過往的架構中，WebSocket 長連線建立時僅單純寫入布林值 (`presence/uid = true`)。其他在線的訪客或管理員收到有人連線時，必須拿著對方的 UID 去前端維護的 `allUsers` 字典中尋找對應的名字。
在分散式網路中，資料庫 `users` 的快照廣播往往會比 `presence` 的連線廣播稍慢幾百毫秒送達。在這微小的毫秒瞬間，名單繪製系統因為查無資料，正確套用了備用字串 `'Connecting...'`。
我們透過將名稱直接掛載於 WebSocket 狀態節點 (`{ online: true, name: "Anonymous Owl", isAnon: true }`)，當連線建立的第一個廣播封包送出時，全場收到的封包便已經自帶了該使用者的正確動物名稱，前端名單瞬間精準繪製，再無卡頓與閃爍！

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
1. **狀態封包升級 (`presencePayload`)**：
   - 於 `onAuthStateChanged` 中，寫入帶有名稱的物件：
     ```javascript
     const presencePayload = { online: true, name: user.displayName || 'Connecting...', isAnon: isAnon };
     set(userPresenceRef, presencePayload);
     ```
   - 於匿名登入按鈕完成動物冠名後，即時重寫狀態封包：
     ```javascript
     set(ref(db, `presence/${result.user.uid}`), { online: true, name: auth.currentUser.displayName, isAnon: true });
     ```
2. **智慧型名單合併 (`renderUserList`)**：
   - 於名單繪製時，當資料庫快照未及時到達時，優先讀取 WebSocket 狀態節點上自帶的名稱：
     ```javascript
     for (const [uid, pData] of Object.entries(onlinePresence)) {
         const isOnline = pData && (pData === true || pData.online);
         if (isOnline && !combinedUsers[uid]) {
             const fetchedName = (typeof pData === 'object' && pData.name) ? pData.name : 'Connecting...';
             const fetchedAnon = (typeof pData === 'object' && pData.isAnon !== undefined) ? pData.isAnon : true;
             combinedUsers[uid] = { uid: uid, name: fetchedName, isAnonymous: fetchedAnon };
         }
     }
     ```

## 驗證計畫

### 手動驗證
- 於管理員畫面觀察在線名單。
- 於無痕視窗中進行匿名登入。
- 確認管理員畫面秒速呈現新進帳號真實的動物名稱，不再閃現 Connecting。
- 對無痕視窗隨意按下 F5，觀察管理員清單精準穩定地保持正確名字。
