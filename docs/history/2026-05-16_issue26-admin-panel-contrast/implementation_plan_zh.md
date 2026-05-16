# 改善白底模式下 Admin Controls 的視覺對比度與易讀性

針對管理員控制面板 (`#admin-panel`) 在切換至白底模式 (`body.logged-in-white`) 時所產生的低對比度（白底白字或難以辨識）問題，進行全面視覺優化。

## 使用者審查事項
請確認為白底模式管理員控制面板所規劃的高對比度配色與邊框樣式是否符合設計預期。

## 建議修改計畫

### 前端資源

#### [MODIFY] [styles.css](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/styles.css)
在 `body.logged-in-white` 命名空間下新增專門針對 `#admin-panel` 的 CSS 樣式規則：
- **面板本體**：背景轉為明亮的純白或淺灰 (`#ffffff` / `#f8fafc`)，保留鮮明的琥珀色邊框 (`#f59e0b`) 與高亮陰影。
- **字體配色**：主標題與說明文字轉為深灰高對比色 (`#0f172a`)。次標題 (Quiz Master 與 KBC) 改為較深的沉穩紫 (`#6d28d9`) 與亮麗粉 (`#db2777`)。
- **計時器設定區**：容器背景改為淺灰 (`#f1f5f9`)，邊框與內部文字 (`Auto-Jump Timer`, `sec`) 轉為深色。
- **數值輸入框**：輸入框背景改為純白，文字為深黑，並加深外框線條。

## 驗證計畫

### 手動驗證
- 以管理員帳號登入。
- 觀察大廳進入白底模式後，`#admin-panel` 是否具備極佳的易讀性與對比度。
- 檢視各按鈕文字、計時器秒數顯示及標題的色彩表現。
