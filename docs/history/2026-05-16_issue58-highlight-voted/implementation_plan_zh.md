# 提升附議按鈕 CSS 權重確保白模視覺高亮計畫

針對參與者於白模 (`logged-in-white`) 下無法辨識已投票狀態進行 CSS 樣式重構。提升 `.voted-1` 與 `.voted-2` 的 CSS 權重 (`Specificity`)，並加入翠綠與鮮紅的發光陰影效果，保證玩家在點擊附議或收回投票時能獲得最直覺強烈的視覺回饋。

## 使用者審查事項
請審查已投票按鈕的發光配色 (`+1` 翠綠色、`+2` 火紅色) 與樣式設計。

## 根本原因剖析 (Root Cause Analysis)
在過往的 `styles.css` 裡，已投票狀態單純定義為 `.btn-upvote.voted-1` (權重 20)。然而，當前台切換為純白模式時，選擇器 `body.logged-in-white .btn-upvote` 擁有 1 個 tag 與 2 個 class (權重 21)！
根據 CSS 優先級規則，權重 21 覆寫了權重 20，導致即便 JS 正確加入了 `.voted` 類別，按鈕背景仍被死鎖為純白色，讓玩家以為系統沒有記錄。
透過加入更高權重的組合選擇器與 `!important`，即可完美展現高對比的反白與發光狀態。

## 建議修改計畫

### 前端資源

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
- 升級已投票按鈕的 CSS 權重與發光陰影：
  ```css
  .btn-upvote.voted-1,
  body.logged-in-white .btn-upvote.voted-1 {
      background: #10b981 !important;
      color: white !important;
      border-color: #059669 !important;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  }
  .btn-upvote.voted-2,
  body.logged-in-white .btn-upvote.voted-2 {
      background: #ef4444 !important;
      color: white !important;
      border-color: #dc2626 !important;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  }
  ```

## 驗證計畫

### 手動驗證
- 於大廳發表點子後，以另一帳號點擊該點子的 `+1` 按鈕。
- 觀察按鈕瞬間轉變為耀眼的翠綠色 (`#10b981`) 發光藥丸，極致顯眼。
- 再點擊一次同一個按鈕，觀察按鈕瞬間恢復為預設的乾淨純白外觀，完美體現「再點一下收回投票」。
