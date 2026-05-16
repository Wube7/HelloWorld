# 階段 3/3：啟用進行中操作列與拔除舊代碼計畫

執行問答模組 (`Quiz`) 多題庫進化的完結篇。於 `admin.html` 與 `admin.js` 徹底拔除在首部曲保留的陳舊單一模式操控按鈕與事件監聽器。全面啟用專屬進行中操作列 (`#admin-active-quiz-controls`)，賦予主持人順滑自如的手動跳題、強制完賽加冕與大廳退回全方位大權。

## 使用者審查事項
請確認舊代碼拔除範圍與進行中操作列事件連動。

## 建議修改計畫

### 1. 拔除陳舊單一模式代碼 (`admin.html`, `admin.js`)
- 於 `admin.html` 刪除 `#legacy-quiz-controls-hidden` 容器。
- 於 `admin.js` 刪除 `btnQuizStart` 等舊 DOM 宣告及點擊處理器。
- 於 `quizState` 監聽器中移除對舊按鍵的 `disabled` 屬性切換。

### 2. 進行中操作列常駐管理台 (`admin.js`)
- 確保 `#admin-active-quiz-controls` 在作答與頒獎階段穩固呈現，且僅於退回大廳 (`idle`) 階段明確收起。

### 3. 底部版本號更新 (`admin.html`)
- 升級為 `admin.js?v=step3` 確保全網即時讀取最新重構。

## 驗證計畫

### 手動驗證
- 點選題庫清單 `Start` 啟動比賽，確認綠色進行中操作列展現。
- 點選 `Next Question` 順利推進題目。
- 中途點選 `End Game` 秒速頒獎並歸檔。
- 點選 `Return Lobby` 順暢退回大廳，三大題庫清單按鈕秒速自動重繪亮起。
