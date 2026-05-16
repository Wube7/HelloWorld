# 修復解耦腳本空 DOM 引用崩潰 Bug 計畫

針對稍早分離後台系統與展示頁面時，在 `admin.js` 與 `presenter.js` 中殘留的對缺失 DOM 元素直接存取所引發的致命 `TypeError`，進行全面的安全防呆封裝，以恢復身分驗證與控制項載入。

## 使用者審查事項
請確認根本原因分析與 DOM 安全封裝計畫是否精確無誤。

## 根本原因剖析 (Root Cause Analysis)
在稍早進行 Issue #28 的架構解耦時，我們由主程式碼複製建立了 `admin.js` 與 `presenter.js`。然而，在初始化流程中，依然直接呼叫了 `document.getElementById('qr-code-link').href = ...` 與 `btnGoogle.addEventListener(...)`。
由於在乾淨的 `admin.html` 結構中，並無 QR code 容器與 Google 登入按鈕，這些取得操作皆返回 `null`。在 JavaScript 中，對 `null` 讀取屬性或綁定監聽器會直接觸發致命的 `TypeError: Cannot set properties of null`。這項例外中斷了 `DOMContentLoaded` 執行緒，導致下方的 `onAuthStateChanged` 驗證碼全數夭折，讓畫面永遠死當在 `Verifying Authentication...`。

## 建議修改計畫

### 前端資源

#### [MODIFY] [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js), [presenter.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/presenter.js)
- 將 QR code 的初始化操作加上 `if (qrLink)` 與 `if (qrImg)` 防呆保護。
- 將 Google 與匿名登入按鈕的點擊監聽器加上 `if (btnGoogle)` 與 `if (btnAnon)` 防呆保護。

## 驗證計畫

### 手動驗證
- 在主首頁以管理員身分登入。
- 前往 `admin.html`，檢驗驗證文字是否順利轉變並顯示完整的 Quiz Master 與 KBC 控制台。
- 前往 `presenter.html`，確認畫面即時呈現廣播狀態且無任何控制台報錯。
