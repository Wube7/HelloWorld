# 實作即時創意徵集模式 (Survey Ideas) 與加權卡片佈告欄計畫

為全站引入第四大核心互動模式：**創意徵集模式 (Survey - Ideas)**。賦予管理員專屬的題目徵集管理工具與場控鎖定權限。參與者與展示大螢幕即時共用一座同步的卡片佈告欄 (`Idea Board`)，參與者可在底下送出文字意見，並對佈告欄上他人的卡片進行加權附議 (`+1` 與 `+2`)。系統即時自動依據總附議點數向下排序，同分者由最新送出優先置頂。

## 使用者審查事項
請審閱 `/admin/ideaSurveys` 與 `/admin/ideaState` 的資料庫結構設計以及加權投票演算法。

## 建議系統架構

### 1. 資料庫結構與安全規則 (`database.rules.json`)
- `/admin/ideaSurveys`：事先建置好的徵集題目儲存區。所有人可讀取，僅管理員可寫入新增或修改。
- `/admin/ideaState`：當前啟動中的徵集狀態。整體控制與鎖定權限歸屬管理員，開放子節點 `/admin/ideaState/ideas` 供全場參與者即時寫入新卡片與個人投票紀錄 (`voters`)。
  ```json
  {
    "active": true,
    "surveyId": "i1",
    "question": "下一季我們該打造什麼新功能？",
    "locked": false, // true 代表鎖定禁止提交與投票
    "ideas": {
      "idea_abc": {
        "id": "idea_abc",
        "text": "AI 自動化代碼重構機器人",
        "uid": "uid_A",
        "author": "🥷 Capybara",
        "timestamp": 1779888000000,
        "votes": 5, // 總得點數
        "voters": { "uid_B": 2, "uid_C": 1, "uid_D": 2 }
      }
    }
  }
  ```

### 2. 介面與視覺設計 (`styles.css`)
- 新增創意佈告欄 (`.idea-board`)、精緻卡片 (`.idea-card`) 以及互動式附議按鈕 (`.btn-upvote`) 的高對比 CSS 樣式。

### 3. 管理員控制台 (`admin.html`, `admin.js`)
- 於後台新增創意徵集面板 (`#admin-idea-controls`)，支援題目的新增、編輯與刪除。
- 啟動徵集時，提供「鎖定鍵 (`🔒 Lock / Unlock`)」與「重設鍵 (`Reset Survey`)」。鎖定時即時廣播停用全場操作。

### 4. 投影大螢幕 (`presenter.html`, `presenter.js`)
- 新增 `#idea-presenter-view` 模組。
- 呈現浩瀚壯麗的卡片瀑布流佈告欄。
- 即時動態排序演算法：
  ```javascript
  const sortedIdeas = Object.values(ideas).sort((a, b) => {
      if ((b.votes || 0) !== (a.votes || 0)) return (b.votes || 0) - (a.votes || 0);
      return (b.timestamp || 0) - (a.timestamp || 0);
  });
  ```

### 5. 參與者操作端 (`index.html`, `script.js`)
- 新增 `#idea-client-view` 模組。
- 呈現與大螢幕完美同步的佈告欄，每張卡片底部附有 `👍 +1` 與 `🔥 +2` 按鈕。
- 底下固定輸入列供送出新意見。當偵測到鎖定廣播時，底下列與所有附議鍵即時凍結並提示。

## 驗證計畫

### 手動驗證
- 於管理台建立新徵集題：「行銷點子發想」。點選開啟。
- 觀察 `presenter.html` 呈現題目與空白佈告欄。
- 於無痕視窗中以 `🥷 Owl` 送出意見：「社群迷因大賽」。
- 確認卡片秒速登入全場佈告欄。
- 於另一無痕視窗中以 `🥷 Koala` 對該卡片點擊 `+2`。確認總分跳至 `2 pts`。
- 管理員點選鎖定，確認全場輸入列與按鈕秒速凍結。
