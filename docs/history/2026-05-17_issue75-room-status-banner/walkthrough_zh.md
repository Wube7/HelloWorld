# 實行紀錄：新增實時全域狀態列橫幅呈現競賽模式

本份文件紀錄了為提供大廳全局上帝視角所完成的狀態列橫幅建置與實時 DOM 同步成果。

## 執行變更

### 上帝視角橫幅列 (`admin.html`, `admin.js`)
1. **UI 橫幅列 (`admin.html`)**：於頂部標題列下方新增 `#admin-room-status-banner` 橫幅區塊。
2. **實時動態變色 (`admin.js`)**：實作 `updateRoomStatusBanner()` 並綁定於可見性狀態切換中。橫幅會秒速依據競賽切換變色：
   - **大廳待命 (`idle`)**：翠綠色橫幅 (`"🟢 LOBBY (Idle - All Games Available)"`)。
   - **問答進行中 (`question`/`podium`)**：紫色橫幅 (`"🎯 QUIZ ROOM in Progress"`)。
   - **KBC 選美進行中**：粉紅色橫幅 (`"🎲 KBC ROOM in Progress"`)。
   - **問卷進行中**：深綠色橫幅 (`"📊 SURVEY ROOM in Progress"`)。
   - **發想進行中**：藍色橫幅 (`"💡 IDEATION ROOM in Progress"`)。
3. **強制更新 (`admin.html`)**：版本號升級為 `admin.js?v=status_banner`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 登入大廳呈現翠綠色提示，進入各項競賽秒速精準變換專屬顏色與文字。
