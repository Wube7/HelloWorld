# 解除大螢幕對輸入框 DOM 依賴與視窗高度隨動伸縮計畫

徹底排查並修復大螢幕展示頁 (`presenter.html`) 無法顯示聊天對話的 Bug。將接收訊息監聽器移出未渲染的輸入框 DOM 檢查之外，並全面導入 flex 彈性佈局 (`height: calc(100vh - 140px)`)，讓聊天視窗在瀏覽器縮放時達到完美即時的高度隨動伸縮。

## 使用者審查事項
請審查 DOM 依賴解除與 flex 隨動高度計算的架構設計是否完美符合大螢幕展示需求。

## 根本原因剖析 (Root Cause Analysis)
在 `presenter.js` 中，接收訊息的監聽器 (`onChildAdded`) 稍早被直接包覆在 `if (chatForm) { ... }` 的檢查內部。
因為 `presenter.html` 是純粹的投影展示大螢幕，它根本沒有輸入框與發送按鈕 (`#chat-form`)！這導致 `chatForm` 變數為 `null`，包裹在內部的資料庫接收監聽器從未被綁定，畫面永遠呈現死寂空白！
將接收監聽器移至獨立的 `if (chatMessages)` 檢查中即可秒速修復。同時，透過將展示區塊改為彈性的 `calc(100vh - 140px)` 與 `flex: 1`，不論您如何上下拉動視窗邊界，聊天區塊將極致流暢地進行高度自動調適。

## 建議修改計畫

### 前端資源

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 將接收對話的監聽器綁定移出 `if (chatForm)` 之外：
  ```javascript
  if (chatMessages) {
      initDatabaseFuncs.push(() => {
          const recentMessagesQuery = query(ref(db, 'messages'), orderByChild('timestamp'), limitToLast(50));
          dbListenersUnsubscribes.push(onChildAdded(recentMessagesQuery, (snapshot) => { ... }));
      });
  }
  ```

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html)
- 導入彈性視窗高度與 flex 延展：
  ```html
  <section class="chat-demo glass-panel" style="margin-top: 0; display: flex; flex-direction: column; height: calc(100vh - 140px);">
      <h2 style="color: #0f172a; font-size: 2.2rem; margin-bottom: 1rem;">🌍 Global Chat Room</h2>
      <div class="chat-container big-chat-mode" style="flex: 1; height: auto; background: rgba(255, 255, 255, 0.9); border-color: #cbd5e1;">
          <div id="chat-messages" class="chat-messages" style="flex: 1;"></div>
      </div>
  </section>
  ```

## 驗證計畫

### 手動驗證
- 開啟 `presenter.html`，確認頁面開啟瞬間，大廳歷史對話秒速湧現。
- 上下調整瀏覽器視窗高度，觀察聊天氣泡區塊極致平順地進行同步延展與收縮。
