# 同步登入 Promise 微任務時序與統一綠燈狀態判斷計畫

深刻剖析並解決 Google 登入成功後畫面依然停留在登入卡的時序競爭問題，同時針對在線名單上新進匿名帳號未正確顯示綠燈的 Bug 進行底層資料型態重構。將大廳進入事務解耦封裝為獨立的 `enterLobby` 函式，並全面導入標準化的 `checkIsOnline` 綠燈判斷器。

## 使用者審查事項
請確認大廳進入模組解耦與綠燈狀態型態標準化的設計。

## 根本原因剖析 (Root Cause Analysis)
在 JavaScript 引擎的 Promise 執行緒微任務中，當使用者透過 Google 彈出視窗完成授權，Firebase Auth 內部率先觸發了 `onAuthStateChanged` 回呼函式。此時外層的 `signInWithPopup` 尚未進入 `finally` 區塊將 `isGoogleAuthResolving` 解除！這導致 `onAuthStateChanged` 直接被 `return` 略過，永遠無法進入大廳。
另外，在線名單模組稍早採用簡單的 `!!onlinePresence[uid]` 進行布林轉型判斷。因為我們在資料庫寫入的是完整的微封包物件 `{ online: true, name: ... }`，若物件內部屬性變動，單一轉型無法精確反映實際連線狀態。透過封裝 `checkIsOnline` 可確保判斷 100% 精確無誤。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- 獨立封裝 `enterLobby(user)`：
  ```javascript
  async function enterLobby(user) {
      document.body.classList.add('logged-in-white');
      loginSection.classList.add('hidden');
      mainContent.classList.remove('hidden');
      onlineCounter.classList.remove('hidden');
      ...
  }
  ```
- 建立標準化綠燈判斷器：
  ```javascript
  function checkIsOnline(pData) {
      return pData && (pData === true || pData.online);
  }
  ```

## 驗證計畫

### 手動驗證
- 於首頁點選 Google 登入，確認完成彈出視窗授權當下，首頁無縫秒速跳入大廳。
- 於無痕視窗中建立新匿名帳號，點開在線名單，確認該帳號旁閃耀著亮麗的綠色連線指示燈。
