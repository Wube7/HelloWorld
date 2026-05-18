# 修正熱身賽玩家端 UI 隱藏問題計畫

針對您實測發現的「啟動熱身賽後玩家端一片全白」問題，我們秒速精準排查出了核心代碼缺漏：這完全是因為在玩家端 `script.js` 的可見性控制中心 `updateVisibilityState` 裡，只授權了 `equations-active` 階段顯示容器，卻漏掉了 `equations-warmup` 階段！
我們將立即修復此邏輯，確保熱身賽啟動時，解鎖面板秒速在玩家螢幕上流暢掛載呈現。

## 使用者審查事項
請審查 `updateVisibilityState` 容器掛載邏輯。

## 建議修改計畫

### 1. 補上熱身賽階段顯示授權 (`script.js`)
- 於 `updateVisibilityState` 內 (第 419 行) 修改為雙階段容許：
  ```javascript
  } else if (currentQuizPhase === 'equations-active' || currentQuizPhase === 'equations-warmup') {
      const equationsClientContainer = document.getElementById('equations-client-container');
      if (equationsClientContainer) equationsClientContainer.classList.remove('hidden');
  }
  ```

## 驗證計畫

### 手動驗證
- 管理台點擊 `Start Warm-up Game`。
- 觀察玩家畫面，確認解鎖面板、兩行熱身算式與輸入框**秒速順暢顯現，毫無白屏**！
- 輸入密碼 `11`，確認成功通關解鎖。
