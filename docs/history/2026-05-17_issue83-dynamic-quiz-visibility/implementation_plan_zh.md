# 實作問答操作列動態收合模式計畫

遵照您極致優雅且具備頂級產品美學的要求，既然 Strict Mode 的 ReferenceError 當機鎖已被我們徹底連根拔除，我們現在將把 Quiz 進行中控制框 (`#admin-active-quiz-controls`) 回歸與 Survey 及 KBC 一模一樣的「動態收合模式 (`Dynamic Visibility`)」！
在剛進大廳 (`idle`) 時保持乾淨隱藏，只有當點擊 Start 啟動賽局或檢視 Result 時才會優雅展現。

## 使用者審查事項
請審查動態 classList 切換與初始 HTML 屬性。

## 建議修改計畫

### 1. 初始隱藏 UI (`admin.html`)
- 於 `#admin-active-quiz-controls` 外框加回 `class="hidden"` 屬性。

### 2. 實時動態升降 (`admin.js`)
- 於 `quizState` 監聽器中，當收到非進行中快照時執行 `classList.add('hidden')`。
- 當收到賽事進行中快照時執行 `classList.remove('hidden')`。

### 3. 快取作廢 (`admin.html`)
- 升級為 `admin.js?v=dynamic_quiz_visibility`。

## 驗證計畫

### 手動驗證
- 載入頁面後， Quiz 題庫清單下方乾淨無比，操作框完美收合。
- 點選卡片 Start 鍵，紫色操作列秒速流暢滑出。
- 點選 Return Lobby，操作列瞬間俐落隱藏。
