# 實行紀錄：實作問答操作列常駐顯示

本份文件紀錄了為徹底杜絕互斥鎖卡死，所完成的 Quiz 操作列常駐顯示與無損重構成果。

## 執行變更

### 常駐不滅的指揮塔 (`admin.html`, `admin.js`)
1. **移除隱藏屬性 (`admin.html`)**：於第 55 行直接移除了 `#admin-active-quiz-controls` 外框的 `class="hidden"` 屬性。使操作列永遠穩穩展示於題庫卡片下方。
2. **刪除動態切換 (`admin.js`)**：於 `quizState` 監聽回呼中，徹底刪除了 `classList.add/remove('hidden')` 的可見性切換。
3. **安全解鎖 (`admin.js`)**：於第 89 行精準完整宣告操作列變數，並於第 655 行綁上完善的跳題、加冕與返回大廳事件處理器，分毫不影響 Survey 與 KBC 模組。
4. **強制更新 (`admin.html`)**：引用升級為 `admin.js?v=always_visible_quiz_controls`。

## 驗證結果
- 經由 GitHub Actions 順利完成雲端建置並自動發布至測試站台。
- 重新載入網頁， Quiz 進行中按鍵群穩穩常駐在卡片下方。
- 隨時點擊 Return Lobby 皆可向後端發布關閉廣播，徹底解除卡死風險。
