# 部署緊急大廳總開關與底層 F12 診斷日誌計畫

針對您回報的 Survey 題目清單消失與 KBC 按鍵無效的連鎖問題，我們已將系統乾淨回滾至 `2c0c5df`。
為了徹底排查並化解幽靈互斥鎖，我們將在管理台最頂部建立一鍵強制解鎖四大競賽模組的緊急總開關 (`Emergency Master Reset`)。同時，將 Quiz 進行中操作列改為永不隱藏的常駐顯示，並在系統底層各大 Firebase 監聽器收到快照時，向 Chrome 控制台 (F12) 輸出極度精確的 `[DB SNAPSHOT]` 診斷快照，讓任何底層幽靈旗標無所遁形。

## 使用者審查事項
請審查總開關廣播邏輯、常駐 UI 與 F12 收集指南。

## 戰略剖析
在 Brainstorm 系統的互斥鎖架構中，任何單一模組處於 `active: true` 時，為了防止衝撞，會鎖上其他模組按鈕。若偶遇斷線或快取殘留，會讓系統誤以為比賽仍在進行中。
透過在頂部建立一鍵強制總開關 (`#btn-emergency-lobby`)，點擊瞬間同步對 `quizState`, `kbcState`, `surveyState`, `ideaState` 發送強制關閉指令，能確保所有卡死當場化解。同時，精確完整宣告 Quiz 進行中按鍵變數，徹底排除 ReferenceError。

## 建議修改計畫

### 1. 總開關與常駐 UI (`admin.html`)
- 於頂部橫幅區塊新增 `#btn-emergency-lobby` 按鍵。
- 移除 `#admin-active-quiz-controls` 的 `class="hidden"`，使其常駐展示。

### 2. 總開關廣播與底層數據追蹤 (`admin.js`)
- 於頂端精確完整宣告 Quiz 按鍵與總開關變數 (`adminActiveQuizControls`, `btnEmergencyLobby` 等)。
- 綁定緊急總開關廣播處理器，秒速執行四道後端關閉寫入：
  ```javascript
  await set(ref(db, 'admin/quizState/active'), false);
  await set(ref(db, 'admin/kbcState/active'), false);
  ...
  ```
- 於第 651 行加入 Quiz 跳題、強制加冕與返回大廳的事件監聽。
- 於四大核心 Firebase 監聽器收到快照時，注入開發者快照日誌：
  ```javascript
  console.log("[DB SNAPSHOT] quizState:", state);
  ```
- 曝露 `window.currentQuizPhase = currentQuizPhase;` 供開發者隨時手動檢視。

### 3. 底部快取作廢 (`admin.html`)
- 升級為 `admin.js?v=master_reset_diagnostics`。

## 驗證計畫與 Chrome F12 收集步驟

### Chrome 實機檢驗與 F12 指南
1. 於 Chrome 打開 `admin.html`，按下鍵盤 **F12** 切換至 **Console (主控台)**。
2. **檢視初始載入日誌**：觀察 Console 裡印出的四道快照日誌：
   - `[DB SNAPSHOT] quizState: ...`
   - `[DB SNAPSHOT] kbcState: ...`
   - `[DB SNAPSHOT] surveyState: ...`
   - `[DB SNAPSHOT] ideaState: ...`
   親眼檢視這四個物件，觀察哪一個殘留著 `active: true`。
3. **緊急總開關解鎖**：點擊頂端紅色 `"🚨 Force Unlock All Modes"` 按鈕。
   - 觀察 Console 輸出廣播確認，四道監聽器再次觸發並印出 `active: false`。
   - 檢視 Survey Rating Master，問卷清單完美重現。
4. **常駐操作列**： Quiz 進行中按鍵常駐展示，點選順滑自如。
