# Changelog

All notable changes to this project will be documented in this file.

---

## [3.0.0] - 2026-06-08

This is a **Major System Upgrade** that transitions the application from a single-room global game to a multi-room, multi-tenant platform with dynamic host privileges, dynamic language localization, and robust E2E validation.

### 🌟 New Features & Architectural Upgrades (Phase 1)
*   **Multi-Room Isolation (獨立房間)**:
    *   Transitioned the entire database schema from a single global state to a room-partitioned system.
    *   Each Googler can now create and manage one or multiple independent rooms.
    *   Room IDs are generated as secure, unique 6-character alphanumeric codes (e.g., `HRD5KN`).
*   **Room Creator Scoped Privileges (房主專屬權限)**:
    *   Added scoped `👑 Admin Panel` (Host control panel) and `📺 Presenter` (Projector view) links to the room header, visible exclusively to the room creator and super-admin.
*   **Unique Super Admin Assignment**:
    *   Appointed `wube@google.com` as the sole global system administrator with exclusive access to the System Admin panel (`super-admin.html`).
    *   Revoked legacy system admin privileges for `wube8816@gmail.com`.
*   **System Admin Dashboard**:
    *   Created a control panel allowing `wube@google.com` to restrict room creation rules globally (Admin-only, Googlers-only, Logged-in-only, Anyone) and manage/delete active rooms.
*   **Direct Room Entry & Check Codes (檢核碼)**:
    *   Re-labeled "Room Password" to "Check Code" / "檢核碼" to represent a gatekeeper verification code rather than a secret.
    *   Room list portal now displays the creator's rooms with direct buttons to copy a room entry URL with integrated Check Code parameters, allowing players to join instantly.
*   **Multi-Language Support (EN/ZH)**:
    *   Dynamically toggles UI text, placeholders, and buttons between English and Traditional Chinese based on user selection.
*   **Dynamic UI Refinements**:
    *   Room-specific chat headers: changed from generic `Global Chat Room` to `[Room Name] Chat Room`.
    *   Added an `Exit Room` button allowing players to cleanly disconnect and return to the main portal lobby.

### 🐞 Host Diagnostics & Bug Fixes (Phase 2)
*   **Host Scopes Disambiguation**:
    *   Visually separated the global `⚙️ System Admin` and room-specific `👑 Admin Panel` buttons.
*   **Presenter Screen Initialization**:
    *   Fixed ReferenceErrors in `presenter.js` preventing the Presenter screen from unlocking or reading DB states.
    *   Restored the **Online Player Counter** on the Presenter header.
*   **Presenter Chat History Sync**:
    *   Synced room-specific chat messages to the Presenter screen in real-time.
*   **Admin Panel Controls Pre-population**:
    *   Newly created rooms are now automatically pre-populated with a Default Quiz Bank (5 questions), 2 Surveys, and 2 Brainstorming Prompts to prevent empty controls.
*   **Survey Ideas Master (Ideation) Activation**:
    *   Partitioned the active `ideaState` under room-specific database paths, resolving the bug where clicking `Start` on brainstorming prompts had no effect.
*   **Quiz Mode Countdown Auto-Jump**:
    *   Removed legacy hardcoded `wube8816@gmail.com` email locks.
    *   Replaced with dynamic `isAuthorizedHost` flags, allowing any authorized host to automatically advance quiz questions upon countdown expiration.

---

# 中文更新日誌 (v3.0.0 大更新)

## [3.0.0] - 2026-06-08

這是一個 **重大系統架構升級版本**，將應用程式從單一全局聊天室，升級為支援多個獨立房間、動態房主權限、多語系切換以及全功能 E2E 驗證的協作遊戲平台。

### 🌟 新增功能與架構升級
*   **多房間隔離系統 (獨立房間)**：
    *   將整個資料庫綱要從單一全局狀態遷移至房間隔離分區系統。
    *   每位 Googler 皆可創建並管理一個或多個獨立運作的房間。
    *   房間 ID 採用安全且唯一的 6 位英數代碼（例如 `HRD5KN`）。
*   **房主專屬控制權限 (房主專屬權限)**：
    *   在大廳 Header 中新增了專屬的 `👑 Admin Panel` (房主控制台) 與 `📺 Presenter` (大螢幕展示幕) 鏈結，僅限該房創立者與系統管理員可見。
*   **唯一總系統管理員指定**：
    *   指派 `wube@google.com` 為全系統唯一的總管理員，可進入總管理員選單 (`super-admin.html`)。
    *   撤銷 `wube8816@gmail.com` 的總管理員權限。
*   **總系統管理員主控台**：
    *   提供控制項讓 `wube@google.com` 能全局切換創房權限限制（僅限管理員、僅限 Googler、僅限登入用戶、任何人），並提供實體刪除所有房間的維護功能。
*   **直入連結與檢核碼功能**：
    *   將「房間密碼」正名為「檢核碼」，做為防止誤入的檢驗用途。
    *   在大廳的「我的房間」列表中提供「複製連結」按鈕，可直接複製內含檢核碼參數的直入 URL，方便參與者一鍵免打碼加入。
*   **中英文多國語言支援 (EN/ZH)**：
    *   支援大廳與房內所有 DOM 文字、輸入提示與按鈕的即時中英文語言切換。
*   **介面體驗優化**：
    *   聊天室標題動態化，由 `Global Chat Room` 修正為 `[房間名稱] 聊天室`。
    *   新增「退出房間」按鈕，讓玩家安全退出並清除即時在線狀態，乾淨導回大廳。

### 🐞 控制台與看板修復
*   **管理員按鈕視覺分離**：
    *   明確分離了全局管理 `⚙️ System Admin` 與房間專屬 `👑 Admin Panel` 控制按鈕。
*   **Presenter 看板崩潰修復**：
    *   修復了 `presenter.js` 中的作用域引用錯誤，成功解鎖 Presenter 畫面，並恢復了右上角的**在線玩家人數計數器**。
*   **Presenter 聊天歷史同步**：
    *   學員發送的聊天訊息，現在會即時同步渲染在 Presenter 展示大螢幕上。
*   **建房自動預裝預設遊戲庫**：
    *   為了解決新房主控台控制項為空的問題，創房時會自動預裝 1 組科技問答、2 組評估投票與 2 組腦力激盪題目。
*   **腦力激盪 (Ideation) 啟動修復**：
    *   將腦力激盪狀態統一隔離至房內專屬資料路徑下，徹底修復房主點擊 `Start` 後學員與看板無反應的缺陷。
*   **問答模式計時器自動跳題**：
    *   徹底移除了 legacy 硬編碼的 `wube8816@gmail.com` 限制，引入了動態房主授權標記 `isAuthorizedHost`，任何合法房主在題目倒數完畢時，其主控台皆能自動發送指令更新資料庫，推動全體自動進入下一題！
