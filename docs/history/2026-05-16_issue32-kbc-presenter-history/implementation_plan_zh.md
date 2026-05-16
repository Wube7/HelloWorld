# KBC 展示頁面雙欄並列呈現計分板與歷史紀錄計畫

針對 Keynesian Beauty Contest (KBC) 的主持人展示頁面 (`presenter.html`)，將原本單一或需切換的分頁版面升級為專業的雙欄並列排版 (Side-by-Side Grid)，左欄即時展示玩家排行，右欄同步呈現所有歷史回合出價紀錄，提供現場參與者一目瞭然的活動全景參考。

## 使用者審查事項
請確認大螢幕雙欄排版的視覺結構與歷史紀錄展示邏輯是否符合您的展示需求。

## 建議修改計畫

### 前端資源

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html)
- 在 `#kbc-container` 內部，將單純的計分板容器重構為雙欄網格 (`display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;`)。
- **左欄**：即時排行榜 (`#kbc-scoreboard-section`) 顯示所有活躍帳號與目前積分。
- **右欄**：歷史紀錄榜 (`#kbc-history-section`) 顯示歷次回合目標與開獎數值，並設定永遠可見，不再依賴按鈕切換。

#### [MODIFY] [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 確保 `renderKbcHistory` 函數在收到 Firebase 廣播時，能順暢且自動地將回合表格動態寫入展示頁面的右欄中。

## 驗證計畫

### 手動驗證
- 在管理台啟動 KBC 遊戲。
- 開啟 `presenter.html`，檢驗競賽模組是否正確載入雙欄並列架構。
- 透過管理台完成一回合開獎，觀察右欄歷史紀錄是否精確同步。
