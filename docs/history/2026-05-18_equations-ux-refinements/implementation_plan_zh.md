# 方程式競賽介面對齊與華麗通關實作計畫

針對您極致細緻且完美的體驗優化指示，我們將在純淨穩定的代碼基礎上發動這場重量級介面升級！
包含 Presenter 看板標題中文化、配方比例表格對齊、實時通關計數器以及玩家端「華麗通關」畫面的重磅建置。

## 使用者審查事項
請審查資料庫安全規則擴充與華麗通關 UI 佈局。

## 建議修改計畫

### 1. 擴充資料庫安全規則 (`database.rules.json`)
- 允許在線玩家向 `/admin/equationsState/players/$uid/solved` 寫入 `true` 自我宣告通關。
  ```json
  "equationsState": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.email == 'wube8816@gmail.com'",
    "players": {
      "$uid": {
        "solved": {
          ".write": "auth != null && auth.uid == $uid"
        }
      }
    }
  }
  ```

### 2. 秘方排版對齊與實時計數看板 (`presenter.html`, `presenter.js`)
- **標題修改**：將 `"🚨 INTEL DEBRIEF:"` 修改為親民的 **`"🚨 MISSION CLUES: (任務線索)"`**。
- **表格完美對齊**：將純文字條列式配方改為乾淨高雅的 HTML `<table>` 表格排版，使 Sugar (A) 到 Natural Flavorings (F) 的英文與變數比例在畫面上垂直完美切齊。
- **實時通關人數計數器**：於看板中注入 `#equations-presenter-count`，實時呈現 `👥 Decoded Progress: X / Y Players` 追蹤全場破解進度。

### 3. 玩家端「華麗通關」大卡片 (`index.html`, `script.js`, `styles.css`)
- **動態釋出空間 (`script.js`)**：當玩家成功輸入 `32` 後，系統自動將 `17` 字元的對稱算式清單與輸入框「完全隱藏隱退」，騰出高達 80% 的黃金版面！
- **華麗通關卡片 (`index.html`)**：在原處升起 `#equations-victory-card` 華麗大卡片！帶有金色旋轉獎盃動畫與深綠色大字：「`🏆 SYSTEM SECURED: Code Decoded successfully! Vault Unlocked!`」。
- **自我宣告 (`script.js`)**：成功通關時發送 `set(..., { solved: true })` 實時向後端廣播。

### 4. 管理台實時追蹤 (`admin.js`)
- 啟動時將角色結構初始化為 `{ roleIndex: idx % 6, solved: false }`。
- 控制台列表實時展示玩家進度，例如：`Player A: 🟢 SOLVED` 或 `🔴 DECODING`。

### 5. 快取作廢 (`admin.html`, `presenter.html`, `index.html`)
- 升級為 `admin.js?v=equations_refinements_v2` 等強制刷新。

## 驗證計畫
- 啟動競賽，Presenter 看板顯示對齊的配方比例與任務線索。
- 玩家輸入 `32`，算式名單隱退，華麗獎盃大卡片優雅升起！
- 管理台與 Presenter 實時計數同步跳轉。
