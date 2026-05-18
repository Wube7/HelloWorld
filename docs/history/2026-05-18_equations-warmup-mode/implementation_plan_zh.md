# 方程式熱身賽模式實作計畫

在正式進入硬核的多未知數合作解碼之前，我們將為全場玩家部署一組「二元一次聯立方程式熱身賽（Equations Warm-up）」！
此關卡所有人拿到的題目完全相同，純粹使用加減號，作為激發解題興趣與破冰的絕佳熱身。

## 使用者審查事項
請審查二元一次方程式設計與管理台雙階段控制。

## 1. 熱身賽數學系統
未知數：$A, B$。
隱藏解答：
- $A = 7$
- $B = 4$
- **終極解（通關密碼）：** $A + B = 11$

### 方程式系統（純加減，無乘除號）
1. $A + A - B = 10$
2. $B + B - A = 1$

全體玩家螢幕上顯示的兩道題 100% 完全相同。

---

## 建議修改計畫

### 1. 擴充配置表檔 (`equations_config.js`)
- 新增熱身賽算式與密碼：
  ```javascript
  export const WARMUP_EQUATIONS = [
      "A + A - B = 10",
      "B + B - A = 1"
  ];
  export const WARMUP_PASSCODE = 11;
  ```

### 2. 擴充資料庫 Room 狀態區
- 將 `/admin/equationsState` 重構為支援多階段 `phase`：
  - `phase: 'warmup'` （熱身賽階段）
  - `phase: 'active'` （正式賽階段）
  - `phase: 'idle'` （大廳待命）

### 3. Presenter 看板英文說明 (`presenter.html`, `presenter.js`)
- 建立熱身賽專屬簡報面板：
  - `"🕵️‍♂️ System Security Pre-Lock: Warm-up Decryption"`
  - `"Analyze the system of 2 equations, calculate A and B, and compute: Answer = A + B in grams."`

### 4. 玩家大廳與管理台同步控制
- 玩家輸入 `11` 後可順暢解鎖並看見華麗通關卡片。
- 管理台新增 「`🚀 Start Warm-up Game`」 按鈕。

## 驗證計畫
- 啟動熱身賽，確認全體玩家看見相同的兩行算式。
- 玩家輸入 `11`，算式隱退，華麗獎盃升起！
