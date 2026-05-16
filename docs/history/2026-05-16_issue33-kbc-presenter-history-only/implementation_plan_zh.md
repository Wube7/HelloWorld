# 精簡 KBC 投影展示模式專注於歷史紀錄計畫

依據您的最新回饋，針對 Keynesian Beauty Contest (KBC) 的主持人展示頁面 (`presenter.html`) 進行排版瘦身。將出價等待與開獎階段中所附帶的名次清單徹底移除，讓大螢幕展示畫面極致專注於即時出價人數統計、開獎結果卡片及常駐的全景歷史表格 (`Round History`)。

## 使用者審查事項
請確認去除即時排行清單後的極簡展示結構是否符合您的現場投影規劃。

## 建議修改計畫

### 前端資源

#### [MODIFY] [presenter.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.html)
- 於 `#kbc-presenter-input-phase` 內部，刪除 `#kbc-score-list` 排行榜區塊，僅保留 `#kbc-waiting` 提交人數進度提示。
- 於 `#kbc-presenter-result-phase` 內部，刪除 `#kbc-res-score-list` 排行榜區塊，僅保留展示均值、目標、贏家與懲罰的 `#kbc-result-card`。
- 底部常駐 `#kbc-presenter-history` 表格，讓全場目光專注於歷史均值走勢。

## 驗證計畫

### 手動驗證
- 於管理台啟動 KBC 遊戲。
- 檢視 `presenter.html` 畫面，確認出價等待與公布結果時，僅顯示核心卡片與下方的常駐歷史表格。
