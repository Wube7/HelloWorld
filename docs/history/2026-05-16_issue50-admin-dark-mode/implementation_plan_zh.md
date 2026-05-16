# 恢復管理員控制台深色背景與高亮字體計畫

針對後台管理台 (`admin.html`) 進行專屬視覺識別重構。徹底移除與前台共用的 `logged-in-white` 淺色主題，全面恢復成最初沉穩專業、深藍黑底搭配高對比淺色字體 (`#f8fafc`) 的科技深色模式，作為與大廳及大螢幕展示最鮮明的操作環境區隔。

## 使用者審查事項
請確認深色背景回歸與相應的淺色字體高對比調色盤設定是否符合期望。

## 根本原因剖析 (Root Cause Analysis)
在 Issue #26 中，我們為了測試對比度，曾短暫將 `logged-in-white` 應用於管理台。然而，若前台參與者、展示大螢幕與管理員操作介面全都共用完全相同的淺色版面，容易在視覺上混淆不同的工作視窗。
透過將 `admin.html` 回歸最初的深色漸層 (`#0f172a` 至 `#1e293b`)，並將各項標題與按鈕文字改回銳利的亮色系，不僅提升了後台操控的專注感，更打造出極致專業的沉浸式控制台體驗。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.html)
- 於 `<body>` 標籤中刪除 `logged-in-white` 類別。
- 於 `#admin-panel` 中，將字體顏色自 `#0f172a` 恢復為 `#f8fafc`。
- 將計時器控制框 (`.admin-timer-controls`) 的樣式改回深色玻璃效果：`background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border);`。
- 將標籤與輔助字體顏色改回 `#e2e8f0` 與 `#cbd5e1`。
- 將預設按鈕與輸入框文字改回 `#f8fafc`。
- 將 KBC 控制按鈕文字改回 `#f8fafc`。

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
- 於 `onAuthStateChanged` 中，刪除 `document.body.classList.add('logged-in-white');`。

## 驗證計畫

### 手動驗證
- 開啟 `admin.html` 視窗。
- 確認整個背景呈現出極致深邃的深藍黑色科技漸層。
- 檢視所有標題、按鈕與狀態文字，確認皆以清晰高對比的亮白色系展現，視覺層次完美分明。
