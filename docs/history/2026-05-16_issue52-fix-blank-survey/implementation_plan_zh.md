# 補回遺失 Section 閉合標籤修復問卷空白 Bug 計畫

針對參與者操作端 (`index.html`) 於調查評分啟動時出現全白無畫面進行底層 DOM 排查與修復。將上一回合誤刪的上一代容器結尾標籤補回，讓問卷卡片順利脫離隱藏父元素的束縛。

## 使用者審查事項
請確認 HTML 容器閉合標籤的精確修復計畫。

## 根本原因剖析 (Root Cause Analysis)
在稍早實作 Issue #51 的過程中，當我們在 `index.html` 新增 `#survey-client-container` 時，不小心在替換代碼時將它上方的 `#kbc-gameover-container` 的結尾標籤 `</section>` 給覆寫刪除了！
這導致在瀏覽器的 DOM 樹狀結構中，新加入的問卷卡片被判定為 `#kbc-gameover-container` 的**子元素 (Child element)**！
當系統啟動調查並執行 `updateVisibilityState` 時，雖然正確解除了問卷卡片的隱藏，但同時對 GameOver 容器套用了 `classList.add('hidden')`。在 HTML 底層渲染機制中，父容器一旦隱藏，內部所有的子元素將強制隱藏！這就是為什麼玩家端呈現一片空白。
只要補回那行 `</section>`，兩個區塊便能各自獨立，畫面秒速恢復！

## 建議修改計畫

### 前端資源

#### [MODIFY] [index.html](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/index.html)
- 於 `#kbc-gameover-container` 內部 `kbc-history-content-end` 區塊下方，精準補回 `</section>` 結尾標籤：
  ```html
                  <div style="margin-top: 2.5rem; text-align: left;">
                      <h3 style="margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Match History</h3>
                      <div id="kbc-history-content-end" style="overflow-x: auto;"></div>
                  </div>
              </section> <!-- 補回這行結尾標籤 -->

              <!-- Survey Client Rating View -->
              <section id="survey-client-container" class="hidden glass-panel text-center" style="margin-bottom: 4rem;">
  ```

## 驗證計畫

### 手動驗證
- 於管理台開啟問卷調查。
- 於無痕視窗中觀察玩家端，確認問卷卡片與滑桿瞬間平滑滑出，不再出現空白畫面。
