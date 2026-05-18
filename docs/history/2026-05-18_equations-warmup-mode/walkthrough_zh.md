# 實行紀錄：聯立方程式熱身賽模式

本份文件紀錄了正式部署「二元一次聯立方程式熱身賽（Equations Warm-up）」模式與驗證結果。

## 執行變更

### 1. 熱身賽算式配置 (`equations_config.js`)
- 部署熱身賽算式陣列與密碼 `11` 常數。

### 2. 雙階段玩家大廳與驗證 (`index.html`, `script.js`)
- 重構 `script.js` 第 720 行 `equationsState` 監聽器，支援雙階段 `phase` 分歧渲染：
  - `phase === 'warmup'`（熱身賽）：所有人繪製 100% 相同的 `A+A-B=10` 和 `B+B-A=1` 兩道題。
  - `phase === 'active'`（正式賽）：依角色序號繪製對稱矩陣。
- 重構密碼比對邏輯，實時拉取資料庫狀態：在熱身賽階段比對 `11`；在正式賽階段比對 `32`。

### 3. Presenter 看板與動態計數器 (`presenter.html`, `presenter.js`)
- 於 `presenter.html` 注入 `#equations-presenter-warmup` 專屬簡報面板。
- 包裝為「預防死鎖校準熱身賽」，實時展示大廳破解進度計數器 `👥 Warm-Up Solved: X / Y Players`。
- 於 `presenter.js` 整合狀態切換。

### 4. 管理台總控雙鈕 (`admin.html`, `admin.js`)
- 於 `admin.html` 注入 `🎲 Start Warm-up Game` 熱身賽啟動按鈕。
- 於 `admin.js` 實作按鈕事件，啟動時向全體玩家廣播 `phase: 'warmup'`，並在列表中顯示 `[Warm-Up solver]` 專屬勳章。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並發布至測試站台。
- 實測啟動熱身賽，全場玩家看到相同的兩行算式。
- 玩家輸入 `11` 順暢通關，華麗獎盃升起！
