# 聊天室日期標記與高密度版面精修計畫

針對全站聊天大廳模組進行視覺精修：1. 將每則訊息的時間標記加上具體日期 (例如 `5/16 13:22`)，讓回溯對話時更為直覺。 2. 在 `styles.css` 中縮減容器內邊距與氣泡間隔 (`gap`)，極大化螢幕的有效訊息容納密度。 3. 鎖定展示大螢幕 (`presenter.html`) 聊天視窗的極大化模式 (`85vh`)，讓投影畫面呈現浩瀚的歷史對話流。

## 使用者審查事項
請審查緊湊的 CSS 內邊距數值與精簡的 `5/16 13:22` 時間標記格式是否符合期望。

## 建議修改計畫

### 前端資源

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
1. **提升文字顯示密度**：
   - 於 `.chat-messages` 中，將 padding 縮減至 `0.5rem 0.8rem`，gap 自 `0.8rem` 縮減至 `0.4rem`。
   - 於 `.msg-bubble` 中，將 padding 縮減至 `0.5rem 0.8rem`。
   - 於 `.msg-meta` 中，將下方間隔微調至 `0.1rem`。
2. **加大展示容器**：
   - 將 `.chat-container.big-chat-mode` 的高度自 `75vh` 拉升至 `85vh`。

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
1. **日期標記導入**：
   - 於三支腳本的接收訊息渲染器中，採用帶有月日的格式：
     ```javascript
     const timeString = data.timestamp ? new Date(data.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Just now';
     ```
2. **常駐大螢幕極大化**：
   - 於 `presenter.js` 的 `hideAll()` 裡，移除取消 `big-chat-mode` 的指令，保證展示大螢幕永遠以 `85vh` 傲視全場。

## 驗證計畫

### 手動驗證
- 於大廳發送一則訊息，觀察時間戳記呈現完美的 `5/16 13:22` 格式。
- 觀察聊天室歷史區塊，確認氣泡排列緊湊俐落，同頁面顯示量顯著增加 40%。
- 開啟 `presenter.html` 視窗，檢驗聊天室容器呈現開闊高聳的視覺張力。
