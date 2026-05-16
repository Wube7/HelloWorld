# 管理員強制登出機制與離線匿名帳號自動清理計畫

強化使用者清單管理機制。賦予通過身分驗證的管理員直接透過介面強制踢出/登出連線帳號的權力，同時針對直接關閉網頁所殘留的大量已離線匿名帳號，導入自動化的過濾與資料庫清除機制。

## 使用者審查事項
請確認強制登出廣播節點的規劃及離線匿名帳號的自動刪除規則是否符合您的後台控管需求。

## 建議修改計畫

### 前端資源

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js), [admin.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/admin.js)
1. **管理員強制登出 (Kick Mechanism)**：
   - 在使用者成功登入時 (`onAuthStateChanged`)，建立對 Firebase `admin/kicklist/${user.uid}` 的動態監聽。
   - 當接收到踢出訊號時，即時彈出警告訊息，自動刪除其在線狀態 (`presence`) 與被踢紀錄，並秒速執行 `signOut(auth)`。
   - 在名單繪製函數 (`renderUserList`) 裡，若當前登入者為管理員 (`ADMIN_EMAILS`)，則於所有在線帳號（除自身之外）的列表項目右側，動態附上 `🚷` 踢出按鈕，點擊即發送訊號。
2. **離線匿名帳號自動清除 (Offline Cleanup)**：
   - 於 `renderUserList` 中，當偵測到帳號為匿名 (`isAnonymous` 或名字以 Anonymous 開頭) 且目前為離線狀態 (`!onlinePresence[uid]`) 時，不僅在前端名單中自動隱藏，若當前操作者為管理員，則順道發出非同步的 `remove(ref(db, 'users/' + uid))` 請求，自動清理資料庫垃圾節點。

## 驗證計畫

### 手動驗證
- 登入管理員帳號。
- 於無痕視窗中開啟並登入一個匿名帳號。
- 在管理員畫面的使用者清單中，確認該匿名帳號旁出現 `🚷` 按鈕。
- 點擊按鈕，觀察無痕視窗是否瞬間彈出被踢通知並成功強制登出。
- 直接關閉另一個無痕視窗，確認其離線紀錄在管理員介面重整或廣播時被自動剔除與清除。
