# 同步登入握手時序修復提早跳轉與管理台卡死計畫

針對使用者回報的登入過程異步時序 Bug 進行深刻排查與修復。透過在 `script.js` 導入登入鎖定屏障 (`isGoogleAuthResolving`)，防止在 Google 帳號選擇彈出視窗尚未完結時網頁過早進入大廳。同時在 `admin.js` 加入 5 秒驗證保底機制 (`Timeout Fallback`)，解決 IndexedDB 在底層操作競爭時導致管理台卡死在驗證中的現象。

## 使用者審查事項
請確認登入屏障鎖與管理台 5 秒保底機制的時序邏輯。

## 根本原因剖析 (Root Cause Analysis)
當訪客點擊 `Sign in with Google` 時，Firebase SDK 底層啟動 OAuth 彈出視窗。在此準備過程中，本機 IndexedDB 的非同步讀取頻繁觸發過渡狀態的 `onAuthStateChanged`，導致在使用者尚未選取完成時，大廳便提早解鎖並顯示 `'Loading...'`。
另外，當主頁與管理台多個分頁同時執行非同步身分驗證時，底層 IndexedDB 事務容易互相鎖定 (`Transaction Lock`)，導致 `admin.js` 卡在等待狀態，永不執行回呼函式。
導入鎖定屏障與 5 秒超時警示可確保完美的時序控制。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- 導入 `isGoogleAuthResolving` 鎖定屏障：
  ```javascript
  let isGoogleAuthResolving = false;
  btnGoogle.addEventListener('click', async () => {
      isGoogleAuthResolving = true;
      const provider = new GoogleAuthProvider();
      try {
          await signInWithPopup(auth, provider);
      } catch(err) { ... } finally {
          isGoogleAuthResolving = false;
      }
  });
  ```
- 在 `onAuthStateChanged` 進行阻攔：
  ```javascript
  onAuthStateChanged(auth, (user) => {
      if (isGoogleAuthResolving) return;
      ...
  });
  ```

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 加入 5 秒超時保底機制：
  ```javascript
  let authResolved = false;
  onAuthStateChanged(auth, (user) => {
      authResolved = true;
      ...
  });

  setTimeout(() => {
      if (!authResolved && adminStatus) {
          adminStatus.textContent = "⚠️ 身分驗證請求逾時。請確保您已在主頁完成登入或按下 F5 重新載入。";
      }
  }, 5000);
  ```

## 驗證計畫

### 手動驗證
- 於首頁點擊 Google 登入，在挑選帳號視窗開啟時，確認主頁安靜停留在歡迎畫面，不再提早跳進大廳。
- 開啟 `admin.html`，確認能順暢驗證管理員身分，若遇本機快取鎖定，5 秒後精準顯示警示文字。
