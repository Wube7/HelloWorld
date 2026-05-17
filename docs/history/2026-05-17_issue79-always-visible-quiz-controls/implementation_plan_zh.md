# 實作問答操作列常駐顯示計畫

遵照您極具工程智慧與務實觀點的建議，我們將在純淨穩定的 `2c0c5df` 基準點上，將 Quiz 進行中控制列 (`#admin-active-quiz-controls`) 改為「常駐顯示 (`Always Visible`)」！
無論系統底層的 `active` 旗標或 `currentQuizPhase` 變數處於何種狀態，管理員隨時隨地都能在主控台看到 `Next Question` 與 `Return Lobby`。即使遭遇斷線殘留幽靈比賽，管理員隨時都能按下一鍵強制退出，徹底排除互斥保護鎖卡死風險。

## 使用者審查事項
請審查操作列的常駐 UI 與按鈕監聽器。

## 戰略調整
在稍早的架構中，Quiz 控制列的可見性依賴 Firebase 的 `active: true` 廣播升起。若偶遇變數未宣告引發 ReferenceError，操作列無法升起，會導致系統卡在遊戲中且無法退出。
透過在 `admin.html` 中拔除 `class="hidden"`，並在 `admin.js` 中刪除動態隱藏操作，讓這座指揮塔永不消失。同時，精確完成所有按鍵變數宣告與監聽，完美守護 Survey 與 KBC 模組。

## 建議修改計畫

### 1. 常駐可見 UI (`admin.html`)
- 移除 `#admin-active-quiz-controls` 的 `class="hidden"` 屬性，使其常駐在題庫卡片清單下方。

### 2. 刪除切換與安全解鎖 (`admin.js`)
- 於 `quizState` 監聽器中，徹底刪除對操作列執行 `classList.add/remove('hidden')` 的切換。
- 於頂部 DOM 宣告區完整精確宣告 `adminActiveQuizControls`, `quizAdminQnum` 等所有變數。
- 於第 653 行精確加入跳題與退回大廳的非同步處理器。

### 3. 快取作廢 (`admin.html`)
- 升級為 `admin.js?v=always_visible_quiz_controls` 強制刷新快取。

## 驗證計畫

### 手動驗證
- 載入頁面後， Quiz 控制列 (`#admin-active-quiz-controls`) 穩穩常駐在清單下方。
- 點擊 Return Lobby 隨時可向後端發送退出廣播。
- Survey Rating Master 與 KBC 區塊安穩健在，無任何紅字例外。
