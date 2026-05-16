# 以黑斗篷 Emoji 取代冗長 Anonymous 前綴計畫

針對匿名帳戶生成的動物名稱進行精緻美化。將原本高達 10 個字元的冗長前綴 `'Anonymous '` 全面替換為身披黑色斗篷與面罩的神祕人圖示 `'🥷 '` (例如 `'🥷 Koala'`)，大幅省下對話氣泡、名單與頒獎台卡片的橫向顯示空間，為系統注入充滿高手競賽氛圍的神祕氣息。

## 使用者審查事項
請審查選用的黑斗篷圖示 (`🥷`) 及字串判定邏輯是否完美切合您的展示構想。

## 根本原因剖析 (Root Cause Analysis)
稍早在產生匿名帳號時，系統使用 `'Anonymous Capybara'` 等名稱。光是前綴就佔用大量橫向版面，在較窄的容器或手機裝置上容易顯得擁擠。
透過改為 `'🥷 Capybara'`，字串瞬間縮減 8 個字元，不僅版面更純淨開闊，黑斗篷形象更為大廳與博弈競賽增添了充滿高規格的神祕高手氣勢。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
1. **名稱產生器更新**：
   - 於匿名登入按鈕事件中，冠上黑斗篷圖示：
     ```javascript
     await updateProfile(result.user, { displayName: `🥷 ${randomAnimal}` });
     ```
2. **身分判定相容更新**：
   - 於驗證流程與名單繪製模組中，同步相容舊版與新版斗篷前綴：
     ```javascript
     const isAnon = user.isAnonymous || (user.displayName && (user.displayName.startsWith('Anonymous') || user.displayName.startsWith('🥷')));
     ```

## 驗證計畫

### 手動驗證
- 開啟無痕視窗點選匿名登入。
- 檢視頁首名稱呈現帥氣的 `🥷 Owl`。
- 發送對話，對話氣泡精準展示 `🥷 Owl`。
- 於後台名單中確認該帳號精確列出且踢人功能正常。
