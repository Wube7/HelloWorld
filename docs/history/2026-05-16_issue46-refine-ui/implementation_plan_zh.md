# 放寬 Quiz 頒獎台卡片寬度與 KBC 結束常駐歷史紀錄計畫

針對全站介面進行視覺精修：1. 放寬 Quiz 頒獎台卡片寬度與高度，徹底解決第三名得獎者（銅牌）名稱遭截斷的問題。 2. 在 KBC 競賽結束 (Contest Over) 階段，重構主持人展示頁面 (`presenter.html`) 的版面架構，確保歷屆完整的回合出價與目標表格 (`Round History`) 依然常駐於大螢幕下方。

## 使用者審查事項
請確認放寬後的卡片尺寸與 KBC 總結算頁面保留歷史紀錄的排版規劃是否符合大螢幕投影與視覺美觀。

## 建議修改計畫

### 前端資源

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
- 將 `.podium-spot` 寬度自 `120px` 放寬至 `160px`。
- 將 `.podium-spot .name` 的最大寬度自 `100px` 放寬至 `140px`，容納長動物名稱。
- 微調階梯高度比例使視覺更舒展：
  ```css
  .place-1 { height: 240px; ... }
  .place-2 { height: 200px; ... }
  .place-3 { height: 170px; ... }
  ```

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 於 `presenter.html` 內，將獨立的 `#kbc-gameover-container` 移入 `#kbc-presenter-view` 的頂部動態切換區（作為 `Top Section C: #kbc-presenter-ended-phase`）。
- 於 `presenter.js` 中修改狀態判斷：
  當進入 `kbc-ended` 階段時，顯示 `#kbc-presenter-view` 與結束卡片，隱藏等待與結果卡片，確保下方的 `#kbc-presenter-history` 永遠穩固常駐。

## 驗證計畫

### 手動驗證
- 進行 Quiz 答題，以長動物名稱取得第三名，觀察頒獎台文字清晰呈現無省略號 (`...`)。
- 進行 KBC 比賽並結束遊戲，檢驗 `presenter.html` 畫面上方展示總冠軍，下方廣大版面完整保留歷屆回合歷史數據。
