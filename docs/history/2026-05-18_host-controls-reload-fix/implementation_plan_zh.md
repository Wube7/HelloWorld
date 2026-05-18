# 修正管理台斷線重整時進行中控制項收合計畫

針對您極其敏銳且重要的「管理員斷線重整或重新開啟控制台，導致進行中的 Survey Ideas 控制項被強制收合」問題，我們精準排查出了原因：這完全是因為在管理台的 `updateVisibilityState()` 裡，因為將 Survey 與 Ideation 視為非 Quiz 的「大廳 idle 狀態」，所以在初始化加載時，**無條件且粗暴地將它們的控制面板加回了 `'hidden'` 隱藏**！
我們將立即為這些控制項注入安全防禦門檻，在收合前精準檢查它們是否正處於資料庫的進行中（`active: true`）狀態，徹底實現「大廳斷線重連，控制權完美保留」的企業級穩定體驗。

## 使用者審查事項
請審查 `updateVisibilityState` 與 `ideaState` 監聽器的同步調用。

## 建議修改計畫

### 1. 注入安全防禦門檻 (`admin.js`)
- 於 `updateVisibilityState()` 內 (第 532-534 行)，在加上 `hidden` 收合前，補上狀態安全門檻：
  ```javascript
  if (adminActiveKbcControls && !currentKbcStateObj?.active) adminActiveKbcControls.classList.add('hidden');
  if (adminActiveSurveyControls && !currentSurveyState?.active) adminActiveSurveyControls.classList.add('hidden');
  if (adminActiveIdeaControls && !currentIdeaStateObj?.active) adminActiveIdeaControls.classList.add('hidden');
  ```
- 在 `ideaState` (第 365 行下方) 與 `surveyState` 監聽器中，於數據更新時主動觸發 `updateVisibilityState()` 與 `updateRoomStatusBanner()`，確保重載進入時狀態列與控制面板 100% 完美對齊。

### 2. 快取作廢 (`admin.html`)
- 升級為 `admin.js?v=fix_host_controls_reload_sync`。

## 驗證計畫

### 手動驗證
- 啟動一個 Survey Ideas (或 Survey Rating) 競賽。
- 按下 F5 重新整理管理台。
- 驗證重整後，底下的藍色（或綠色）控制面板**依舊完美展開，且能繼續順暢控制流程**，完全無感斷線！
