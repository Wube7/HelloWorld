# Decouple Presenter Chat Message Subscription from Missing Chat Form DOM and Enable Dynamic Resizing

Resolve dead chat message streaming on projection displays by relocating message subscriptions outside un-rendered form DOM wrappers, and enable dynamic viewport responsiveness by transitioning the presenter chat container to flex-calc height scaling.

## User Review Required
Please review the DOM structural decoupling and the flex resizing layout.

## Root Cause Analysis
In `presenter.js`, incoming chat message streaming (`onChildAdded(messagesQuery)`) was enclosed inside `if (chatForm) { ... }`. Because `presenter.html` is a view-only projection display, it lacks an input form (`#chat-form`), causing `chatForm` to evaluate as `null`. Consequently, the incoming listener was never pushed into `initDatabaseFuncs`, leaving the presenter chatroom permanently empty. Moving the incoming subscription to evaluate against `if (chatMessages)` ensures immediate initialization. Additionally, updating `presenter.html` with flexbox calc heights (`height: calc(100vh - 140px)`) allows the chat window to seamlessly resize in real-time as the browser window expands or contracts.

## Proposed Changes

### Public Assets

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- Move the incoming message subscription outside `if (chatForm) { ... }`:
  ```javascript
  if (chatMessages) {
      initDatabaseFuncs.push(() => {
          const recentMessagesQuery = query(ref(db, 'messages'), orderByChild('timestamp'), limitToLast(50));
          dbListenersUnsubscribes.push(onChildAdded(recentMessagesQuery, (snapshot) => { ... }));
      });
  }
  ```

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html)
- Convert `.chat-demo` section to full vertical flex container:
  ```html
  <section class="chat-demo glass-panel" style="margin-top: 0; display: flex; flex-direction: column; height: calc(100vh - 140px);">
      <h2 style="color: #0f172a; font-size: 2.2rem; margin-bottom: 1rem;">🌍 Global Chat Room</h2>
      <div class="chat-container big-chat-mode" style="flex: 1; height: auto; background: rgba(255, 255, 255, 0.9); border-color: #cbd5e1;">
          <div id="chat-messages" class="chat-messages" style="flex: 1;"></div>
      </div>
  </section>
  ```

## Verification Plan

### Manual Verification
- Open `presenter.html` in an incognito window. Verify chat history instantly populates upon load.
- Resize the browser window vertically. Verify the chatroom container dynamically expands or contracts in perfect synchronization with the browser window height.
