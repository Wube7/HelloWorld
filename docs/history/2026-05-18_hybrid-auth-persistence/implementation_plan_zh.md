# 混合動態持久化架構（Hybrid Auth Persistence）實作計畫

針對您回報的「大廳全面採用分頁隔離 `browserSessionPersistence` 後，導致管理員登入 Google 後點選 Admin 按鈕開啟新分頁時，新分頁無法繼承 Google 管理員權限」這一極致經典的實務痛點，我們設計出了堪稱軟體工程藝術的**「混合動態持久化架構（Hybrid Auth Persistence）」**！
我們將拋棄單一、死板的持久化配置，根據玩家的**實際登入行為**，在點擊的瞬間動態切換持久化策略，實現最完美的平衡！

## 使用者審查事項
請審查在 Google 點擊與匿名點擊事件中，動態指派 Persistence 的時機。

---

## 💡 混合分流持久化規則

### 1. 當管理員／玩家選擇「Google 登入」
- **持久化策略**：`browserLocalPersistence`（本地持久化，共享 `localStorage`）。
- **理由**：Google 帳戶屬於永久性安全憑證，我們允許它在瀏覽器跨分頁共享。這樣管理員登入後，點擊「Admin Panel」開啟新分頁時，新分頁能**瞬間、完美地繼承 Google 管理員權限**，無需重複登入！

### 2. 當玩家選擇「匿名登入」
- **持久化策略**：`browserSessionPersistence`（會話持久化，隔離 `sessionStorage`）。
- **理由**：匿名玩家屬於臨時帳號，我們將其強制定格在該分頁內。這 100% 杜絕了背景 Presenter 自動登入憑證的外洩與綁架，且完整保留了「同瀏覽器多開玩家分頁連線測試」的超強紅利！

---

## 建議修改計畫

### 1. 玩家端動態持久化切換 (`script.js`)
- 自 Firebase Auth 模組同時導入 `browserLocalPersistence`。
- 移除初始化加載時的預設隔離設定。
- 在 `btnGoogle` 點擊事件內：
  - 動態指定 `setPersistence(auth, browserLocalPersistence)`，隨後發起 Google 登入。
- 在 `btnAnon` 點擊事件內：
  - 動態指定 `setPersistence(auth, browserSessionPersistence)`，隨後發起匿名登入。

### 2. 管理台本機憑證繼承 (`admin.js`)
- 管理台 `admin.js` 預設指定 `browserLocalPersistence`，確保開啟新分頁時，能瞬間從 `localStorage` 繼承並載入管理員憑證！

### 3. 投影幕會話沙盒隔離 (`presenter.js`)
- 投影幕 `presenter.js` 繼續指定 `browserSessionPersistence`，確保其自動登入憑證鎖死在自己分頁內，不洩漏。

## 驗證計畫
- 登入 Google 管理員，點選 Admin 按鈕在新分頁開啟 `admin.html`。確認**新分頁管理台秒速成功載入，完美繼承管理員憑證！**
- 登出管理員，以匿名玩家登入，確認分頁沙盒隔離完美運作，無任何自動登入。
