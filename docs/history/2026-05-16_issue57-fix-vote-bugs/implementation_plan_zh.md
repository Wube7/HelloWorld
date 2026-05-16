# 實作原子事務與禁止作者自推修復投票漏洞計畫

針對使用者回報的兩大創意徵集投票 Bug 進行底層演算法重構。全面導入 Firebase 伺服器端原子事務 (`runTransaction`) 與前端防抖鎖定，徹底根絕因非同步網路延遲與多次快擊造成的總票數算術疊加漏洞。同時加入嚴格的卡片作者比對屏障，精準封鎖發文者替自身貼文按讚附議的行為。

## 使用者審查事項
請審核伺服器端原子事務 (`runTransaction`) 與防抖鎖定的演算法邏輯。

## 根本原因剖析 (Root Cause Analysis)
在過往的代碼中，參與者點擊投票按鈕時，程式基於本機端當時的快照快取計算票數差額 (`diff`)，再發出獨立的資料庫覆寫。當使用者快速連續點擊時，第一封網路請求尚未往返，後續的點擊便以未同步的舊資料做基準進行累加，造成嚴重的異步併發競爭 (`Concurrency Race Condition`)。
另外，在渲染卡片清單時，並未比對使用者 ID 是否與卡片作者 ID 相同 (`item.uid === currentUser.uid`)，導致發送者可對自己的貼文按讚。
透過升級為 Firebase `runTransaction`，所有更新均在 Firebase 雲端以原子化校驗執行，保證每一票的增減與個人額度完美吻合。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- 於頂部匯入 `runTransaction` 模組：
  ```javascript
  import { getDatabase, ref, onValue, onDisconnect, set, remove, push, serverTimestamp, onChildAdded, query, orderByChild, limitToLast, runTransaction } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';
  ```
- 於 `renderIdeaClientBoard` 中，若 `item.uid === currentUserUid`，即時將按鈕停用並加上防投提示：
  ```javascript
  const isMyIdea = (currentUserUid && item.uid === currentUserUid);
  ...
  <button class="btn-upvote ..." ${isLocked || isMyIdea ? 'disabled' : ''} title="${isMyIdea ? 'You cannot vote for your own idea' : ''}">👍 +1</button>
  ```
- 重構點擊事件為原子操作與前端防抖鎖：
  ```javascript
  let isVotingInProgress = false;
  ...
  btn.addEventListener('click', async (e) => {
      if (isLocked || !auth.currentUser || isVotingInProgress) return;
      isVotingInProgress = true;
      ...
      try {
          await runTransaction(ref(db, `admin/ideaState/ideas/${iid}`), (currentIdea) => {
              if (!currentIdea || currentIdea.uid === auth.currentUser.uid) return currentIdea;
              
              const voters = currentIdea.voters || {};
              const oldVal = voters[auth.currentUser.uid] || 0;
              let newVal = (oldVal === clickVal) ? 0 : clickVal;
              
              const diff = newVal - oldVal;
              currentIdea.votes = (currentIdea.votes || 0) + diff;
              
              if (newVal === 0) {
                  delete currentIdea.voters[auth.currentUser.uid];
              } else {
                  if (!currentIdea.voters) currentIdea.voters = {};
                  currentIdea.voters[auth.currentUser.uid] = newVal;
              }
              return currentIdea;
          });
      } catch (err) { ... } finally {
          isVotingInProgress = false;
      }
  });
  ```

## 驗證計畫

### 手動驗證
- 於無痕視窗中以 `🥷 Owl` 發表新點子。
- 觀察該張卡片底下的 `+1` 與 `+2` 按鈕，確認呈現灰色停用，且滑鼠移過去提示「您無法為自己的點子附議」。
- 於另一無痕視窗以 `🥷 Koala` 對該點子快速連續連擊 5 次 `+2` 按鈕。確認總分平穩精準地在 0 分與 2 分之間切換，不再發生洗分暴增。
