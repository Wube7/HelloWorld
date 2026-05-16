# 全站白底模式字體色彩全面盤點與修正計畫

針對應用程式進入白底模式 (`body.logged-in-white`) 時，全站包含 Quiz 問答比賽、Podium 頒獎台及 Keynesian Beauty Contest (KBC) 競賽等所有子畫面中所遺留的硬編碼白色字體或淺色設定，進行地毯式的對比度修正與色彩反轉。

## 使用者審查事項
請確認針對 Quiz 題目按鈕、頒獎台排行及 KBC 數值輸入框等子模組所規劃的亮色模式覆寫樣式是否符合您的要求。

## 建議修改計畫

### 前端資源

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
在 `body.logged-in-white` 命名空間下新增全域視覺覆寫：
- **Quiz 問答畫面**：將題目按鈕 `.quiz-btn` 背景轉為淺灰 (`#f8fafc`)，字體轉為深黑 (`#0f172a`)，選取狀態轉為亮藍底配深藍字；題目文字 `#quiz-question` 轉為深沉藍 (`#1e40af`)。
- **Podium 頒獎台**：將頒獎台各名次區塊 `.podium-spot` 背景依序轉為柔和的金、銀、銅亮色調，名次與姓名全數轉為深黑。
- **KBC 競賽畫面**：將回合標題、遊戲說明、等待提示及計分板文字全數轉為深黑 (`#0f172a`)；輸入數值框 `#kbc-number-input` 轉為純白底深黑字。
- **通用設定**：確保開關說明文字 `.toggle-container` 轉為深灰 (`#334155`)。

## 驗證計畫

### 手動驗證
- 登入系統觸發白底模式。
- 啟動 Quiz 問答，檢視四個選項按鈕與問題標題的清晰度。
- 進入 Podium 頒獎台，觀察冠亞季軍卡片及總排行清單文字。
- 啟動 KBC 遊戲，檢驗輸入框字體與回合統計畫面的對比度表現。
