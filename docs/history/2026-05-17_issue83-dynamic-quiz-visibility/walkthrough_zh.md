# 實行紀錄：實作問答操作列動態收合模式

本份文件紀錄了為追求 UI 架構極致一致，所完成的 Quiz 操作框動態收合與保留總開關成果。

## 執行變更

### 動態收合與上帝保險栓 (`admin.html`, `admin.js`)
1. **回歸隱藏預設值 (`admin.html`)**：於第 55 行將 `#admin-active-quiz-controls` 外框加回 `class="hidden"`。讓登入大廳時題庫清單下方乾淨俐落。
2. **實時收合切換 (`admin.js`)**：於 `quizState` 監聽器中加回 `classList.add/remove('hidden')`。當收到賽事進行快照秒展面板，收到結束快照秒速收攏。
3. **保留總開關保險 (`admin.html`, `admin.js`)**：將 `#btn-emergency-lobby` 總開關常駐保留於頂端橫幅框中，隨時提供一鍵全域解鎖能力。
4. **強制更新 (`admin.html`)**：引用升級為 `admin.js?v=dynamic_quiz_with_emergency_reset`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 登入大廳後 Quiz 區塊乾淨收合，點擊卡片 Start 紫色操作框秒速流暢滑出。
- 頂端紅色緊急總開關穩固常駐，一鍵解除所有幽靈死鎖。
