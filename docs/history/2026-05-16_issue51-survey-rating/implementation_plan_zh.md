# 實作即時調查評分模式 (Survey Rating) 與直方圖統計計畫

為全站引入第三大核心互動模式：**調查評分模式 (Survey - Rating)**。賦予管理員專屬的調查題庫管理工具，可自訂多個問題敘述、評分尺度 (如 1-5、1-7) 以及兩極敘述 (如 `Low`/`High`, `Poor`/`Rich`)。參與者透過直覺的滑桿即時送出評分，展示大螢幕同步呈現即時提交進度並在揭曉瞬間流暢展現統計直方圖。

## 使用者審查事項
請審閱 `/admin/surveys` 與 `/admin/surveyState` 的資料庫結構設計以及直方圖的展示介面規劃。

## 建議系統架構

### 1. 資料庫結構與安全規則 (`database.rules.json`)
- `/admin/surveys`：事先建置好的調查題庫儲存區。所有人可讀取，僅管理員可寫入新增或修改。
- `/admin/surveyState`：當前啟動中的調查狀態。整體控制權歸屬管理員，但開放子節點 `/admin/surveyState/submissions/$uid` 供全場參與者即時寫入評分。
  ```json
  {
    "active": true,
    "surveyId": "q1",
    "question": "您對新專案的期待程度？",
    "scale": 10,
    "minLabel": "毫無興趣",
    "maxLabel": "熱血沸騰",
    "phase": "input", // 'input' | 'result' | 'ended'
    "submissions": { "uid1": 8, "uid2": 10 },
    "results": { "counts": { "1":0, ..., "8":1, "10":1 }, "average": 9.0, "total": 2 }
  }
  ```

### 2. 介面與視覺設計 (`styles.css`)
- 新增問卷評分滑桿 (`.survey-slider`)、動態數字顯示器以及大螢幕直方圖柱狀圖 (`.histogram-bar`) 的高質感 CSS 樣式。

### 3. 管理員控制台 (`admin.html`, `admin.js`)
- 於後台新增調查控制面板 (`#admin-survey-controls`)，支援題庫的新增、編輯與刪除。
- 啟動調查時，呈現即時已提交人數，並提供「揭曉鍵 (`Reveal Results`)」與「重設鍵 (`Reset Survey`)」。揭曉時自動由管理員端計算全場投票分布與均值寫入資料庫。

### 4. 投影大螢幕 (`presenter.html`, `presenter.js`)
- 新增 `#survey-presenter-view` 模組。
- 提交階段 (`input`)：大螢幕呈現問題、尺度軸、極值敘述以及「目前 X 人已送出」，下方直方圖高度暫時為 0。
- 揭曉階段 (`result`)：直方圖依據票數分布秒速流暢向上延展，並標註各項得票百分比與總體平均評分。

### 5. 參與者操作端 (`index.html`, `script.js`)
- 新增 `#survey-client-view` 卡片。
- 提交階段：展示問題與兩端標籤，玩家滑動 range 左右拉桿選擇分數後點擊「提交評分」。
- 成功送出或管理員揭曉後，即時鎖定操作介面並顯示成功回饋。

## 驗證計畫

### 手動驗證
- 於 `admin.html` 建立新調查題：「整體流暢度」，尺度 `7`，標籤 `普通` 到 `極致完美`。
- 點選開啟調查，觀察 `presenter.html` 秒速呈現題目與空白直方圖，計數器顯示 `0 submitted`。
- 於無痕視窗中登入匿名帳戶，操作滑桿拉至 `7` 分並送出。
- 觀察大螢幕提交人數跳至 `1 submitted`。
- 管理員按下揭曉，大螢幕直方圖第 7 柱流暢升起，顯示得票與平均 7.0 分。
