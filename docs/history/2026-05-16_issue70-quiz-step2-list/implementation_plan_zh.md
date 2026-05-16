# 階段 2/3：實作多題庫清單動態渲染與歷史快照重現計畫

執行問答模組 (`Quiz`) 多題庫進化的二部曲。於 `admin.js` 啟動對 `/admin/quizBanks` 的實時監聽，並動態生成題庫清單列。清單按鈕包含受大廳互斥鎖保護的 `Start`, `Delete`, `Result` 鍵。完賽時自動寫入獲勝積分至 `lastSession` 快照歸檔，點擊 Result 鍵瞬間重返歷史榮耀。

## 使用者審查事項
請確認題庫清單的渲染邏輯與歷史榜單重現機制。

## 建議修改計畫

### 1. 題庫清單動態渲染 (`admin.js`)
- 宣告 `storedQuizBanks` 全域變數並連線監聽 `/admin/quizBanks`。
- 實作 `renderQuizBankList()` 動態繪製題庫卡片，並為按鍵加上受 `idle` 狀態保護的事件監聽。

### 2. 啟動賽事與歷史快照回放 (`admin.js`)
- 按下 `Start` 寫入 `/admin/currentQuizData` 與 `admin/quizState` (`phase: 'question'`)。
- 按下 `Result` 讀取 `/lastSession` 並將 `phase` 切換為 `'podium'`，秒速於大螢幕重播昔日頒獎盛況。

### 3. 版本號升級 (`admin.html`)
- 底部腳本升級為 `admin.js?v=step2` 強制刷新快取。

## 驗證計畫

### 手動驗證
- 於 `admin.html` 觀察稍早儲存的題庫出現在下方清單。
- 按下 `Start` 順利啟動競賽，作答並完賽。
- 退回大廳後按下該題庫的 `Result` 鍵，確認大螢幕完美呈現歷史前三名與全體名冊。
