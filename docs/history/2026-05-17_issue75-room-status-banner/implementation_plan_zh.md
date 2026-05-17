# 新增實時全域狀態列呈現競賽模式計畫

遵照您精確且具備高度大局觀的指示，我們先將系統乾淨地回滾到了 `1f8e5de`（題庫建立正常且清單無 ReferenceError 的版本）。
同時，於管理控制台頂部新增一個專門且顯著的全域狀態橫幅框 (`Status Banner`)。依據底層賽事切換，即時展現大廳 (`LOBBY`)、問答 (`QUIZ`)、選美 (`KBC`)、問卷 (`SURVEY`) 等運作模式與專屬配色，賦予主持人一覽無遺的上帝視角。

## 使用者審查事項
請審查狀態列的 UI 配色與狀態文字連動。

## 建議修改計畫

### 1. 狀態橫幅框 UI (`admin.html`)
- 於頂部 `#admin-status` 驗證文字下方，注入 `#admin-room-status-banner` 橫幅與 `#admin-room-state-label` 狀態文字標籤。

### 2. 動態狀態判定 (`admin.js`)
- 實作 `updateRoomStatusBanner()` 函數，根據目前賽事變數動態切換配色與文字：
  - `idle` (大廳)：翠綠色 (`"🟢 LOBBY (Idle - All Games Available)"`)。
  - `question` / `podium` (問答)：紫色 (`"🎯 QUIZ ROOM in Progress"`)。
  - `kbc` 系列 (選美)：粉紅色 (`"🎲 KBC ROOM in Progress"`)。
  - `survey` 系列 (問卷)：深綠色 (`"📊 SURVEY ROOM in Progress"`)。
  - `idea` 系列 (發想)：藍色 (`"💡 IDEATION ROOM in Progress"`)。

### 3. 快取作廢 (`admin.html`)
- 版本號升級為 `admin.js?v=status_banner` 保證最新 UI 連動生效。

## 驗證計畫

### 手動驗證
- 開啟網頁登入後，頂部橫幅呈現翠綠色的 `"🟢 LOBBY"`。
- 點擊任何題庫 Start，橫幅秒變紫色的 `"🎯 QUIZ ROOM in Progress"`。
- 點擊 KBC 或 Survey，橫幅即時跳轉對應配色與提示。
