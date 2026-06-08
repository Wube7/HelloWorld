import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, updateProfile, signOut, deleteUser, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getDatabase, ref, onValue, onDisconnect, set, remove, push, serverTimestamp, onChildAdded, query, orderByChild, limitToLast, runTransaction, get } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';
import { EQUATIONS_MATRIX, EQUATIONS_PASSCODE, WARMUP_EQUATIONS, WARMUP_PASSCODE } from './equations_config.js';

    const translations = {
        zh: {
            welcome_title: "🚀 歡迎來到 Brainstorm Room ✨",
            welcome_desc: "進入思想碰撞與魔法發生的競技場：",
            btn_google: " 使用 Google 帳號登入",
            btn_anon: "🐾 使用臨時動物帳號",
            portal_title: "🔑 房間大廳入口 Portal",
            tab_join: "🚪 加入現有房間",
            tab_create: "➕ 創建全新房間",
            join_desc: "請輸入 6 位數房間代碼與檢核碼加入協作：",
            placeholder_room_id: "房間代碼 (例如 K8A9D3)",
            placeholder_check_code: "房間檢核碼 (選填)",
            btn_join: "進入房間",
            create_desc: "為您的團隊建立一個專屬獨立的解密房間：",
            placeholder_room_name: "房間名稱 (例如 DeepMind Team A)",
            placeholder_set_check_code: "設定房間檢核碼 (選填)",
            btn_create: "創建並進入房間",
            my_rooms_title: "🏢 我創立的房間 My Rooms",
            btn_exit_room: "🚪 退出房間",
            btn_logout: "🚪 登出",
            global_chat_title: "💬 房間聊天室",
            btn_delete: "🗑️ 刪除",
            btn_enter: "🚪 進入",
            btn_copy: "📋 複製連結",
            alert_no_room_name: "❌ 請輸入房間名稱！",
            alert_invalid_room_id: "❌ 請輸入合法的 6 位數房間代碼！",
            alert_room_not_exist: "❌ 房間不存在，請確認代碼是否輸入正確！",
            alert_wrong_check_code: "❌ 房間檢核碼錯誤！",
            alert_no_permission: "❌ 您的帳號無權限創建房間！",
            prompt_need_check_code: "🔑 此房間已受檢核碼保護，請輸入檢核碼進入：",
            alert_create_failed: "創建房間失敗: ",
            alert_join_failed: "加入房間失敗: ",
            confirm_delete_room: "⚠️ 確定要徹底刪除房間嗎？\n這會連同該房間的狀態、答題分數、實時對話完全清除，無法還原！"
        },
        en: {
            welcome_title: "🚀 Welcome to the Brainstorm Room ✨",
            welcome_desc: "Enter the arena where ideas collide and magic happens:",
            btn_google: " Sign in with Google",
            btn_anon: "🐾 Use Temp Animal Account",
            portal_title: "🔑 Room Lobby Entrance Portal",
            tab_join: "🚪 Join Existing Room",
            tab_create: "➕ Create New Room",
            join_desc: "Enter 6-digit Room Code and Check Code to join:",
            placeholder_room_id: "Room Code (e.g. K8A9D3)",
            placeholder_check_code: "Room Check Code (Optional)",
            btn_join: "Enter Room",
            create_desc: "Create an exclusive independent decryption room for your team:",
            placeholder_room_name: "Room Name (e.g. DeepMind Team A)",
            placeholder_set_check_code: "Set Room Check Code (Optional)",
            btn_create: "Create & Enter Room",
            my_rooms_title: "🏢 My Created Rooms",
            btn_exit_room: "🚪 Exit Room",
            btn_logout: "🚪 Log Out",
            global_chat_title: "💬 Room Chat Room",
            btn_delete: "🗑️ Delete",
            btn_enter: "🚪 Join",
            btn_copy: "📋 Copy Link",
            alert_no_room_name: "❌ Please enter room name!",
            alert_invalid_room_id: "❌ Please enter a valid 6-digit Room Code!",
            alert_room_not_exist: "❌ Room does not exist. Please check the code!",
            alert_wrong_check_code: "❌ Room Check Code is incorrect!",
            alert_no_permission: "❌ Your account does not have permission to create rooms!",
            prompt_need_check_code: "🔑 This room is protected by a Check Code, please enter to join:",
            alert_create_failed: "Room creation failed: ",
            alert_join_failed: "Room joining failed: ",
            confirm_delete_room: "⚠️ Are you sure you want to completely delete this room?\nThis will wipe all active game state, scores, and chats permanently!"
        }
    };
    

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Firebase from Hosting Init URL
    let app, auth, db;
    try {
        const response = await fetch('/__/firebase/init.json');
        if (!response.ok) throw new Error('Could not fetch init.json');
        const config = await response.json();
        // Force the absolute URL because init.json might provide an invalid non-absolute string
        // config.databaseURL = 'https://helloworld777-fa78b-default-rtdb.firebaseio.com';
        
        app = initializeApp(config);
        auth = getAuth(app);
        db = getDatabase(app);
        await setPersistence(auth, browserSessionPersistence).catch(console.error);
    } catch (e) {
        console.error("Firebase init failed. Ensure you are running via Firebase Hosting (e.g. firebase serve/deploy):", e);
        return;
    }

    // 2. Initialize dynamic QR code based on environment
    const currentUrl = window.location.origin;
    document.getElementById('qr-code-link').href = currentUrl;
    document.getElementById('qr-code-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;

    // UI Elements
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const onlineCounter = document.getElementById('online-counter');
    const userCountEl = document.getElementById('user-count');
    const userProfilePanel = document.getElementById('user-profile');
    const userNameDisplay = document.getElementById('user-name-display');
    const btnGoogle = document.getElementById('btn-google-login');
    const btnAnon = document.getElementById('btn-anon-login');
    const btnLogout = document.getElementById('btn-logout');

    const actionBtn = document.getElementById('action-btn');
    const statusMessage = document.getElementById('status-message');

    // Admin & Global View UI Elements
    const linkAdminPanel = document.getElementById('link-admin-panel');
    const linkPresenterPage = document.getElementById('link-presenter-page');
    const btnViewChat = document.getElementById('btn-view-chat');
    const btnViewGame = document.getElementById('btn-view-game');
    const cardsGrid = document.querySelector('.cards-grid');
    const interactiveDemo = document.querySelector('.interactive-demo');
    const chatContainer = document.querySelector('.chat-container');

    const ADMIN_EMAILS = ['wube8816@gmail.com'];
    const SUPER_ADMIN_EMAIL = 'wube@google.com';

    // Centralized Path Scoping Helper
    function getRoomPath(subPath) {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room') || 'lobby';
        return `rooms/${roomId}/${subPath}`;
    }

    // Room Portal Elements
    const roomPortalSection = document.getElementById('room-portal-section');
    const btnTabJoin = document.getElementById('btn-tab-join');
    const btnTabCreate = document.getElementById('btn-tab-create');
    const panelJoinRoom = document.getElementById('panel-join-room');
    const panelCreateRoom = document.getElementById('panel-create-room');
    const inputJoinRoomId = document.getElementById('input-join-room-id');
    const inputJoinRoomPwd = document.getElementById('input-join-room-pwd');
    const btnSubmitJoinRoom = document.getElementById('btn-submit-join-room');
    const inputCreateRoomName = document.getElementById('input-create-room-name');
    const inputCreateRoomPwd = document.getElementById('input-create-room-pwd');
    const btnSubmitCreateRoom = document.getElementById('btn-submit-create-room');

    async function renderMyRooms() {
        if (!myRoomsList || !panelMyRooms) return;
        const user = auth.currentUser;
        if (!user) {
            panelMyRooms.classList.add('hidden');
            return;
        }

        const t = translations[currentLanguage];

        try {
            const roomsSnap = await get(ref(db, 'rooms'));
            myRoomsList.innerHTML = "";
            
            if (!roomsSnap.exists()) {
                panelMyRooms.classList.add('hidden');
                return;
            }

            const roomsObj = roomsSnap.val();
            const myRoomsEntries = Object.entries(roomsObj).filter(([id, r]) => {
                return r.metadata && r.metadata.creatorUid === user.uid;
            });

            if (myRoomsEntries.length === 0) {
                panelMyRooms.classList.add('hidden');
                return;
            }

            panelMyRooms.classList.remove('hidden');

            myRoomsEntries.forEach(([rid, rObj]) => {
                const metadata = rObj.metadata || {};
                const roomName = metadata.roomName || "Room";
                const requiredPwd = metadata.password || "";

                const card = document.createElement('div');
                card.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 12px 16px; border-radius: 8px; margin-bottom: 8px;";
                
                card.innerHTML = `
                    <div>
                        <div style="font-weight: bold; color: #0f172a; font-size: 1.1rem;">${roomName}</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                            Code: <code style="font-weight: bold; color: var(--accent-1);">${rid}</code> 
                            ${requiredPwd ? '🔒 ' + t.placeholder_check_code.replace('(選填)','').replace('(Optional)','') + ': ' + requiredPwd : '🔓 Public'}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="primary-btn btn-enter-myroom" style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 6px 12px; font-size: 0.85rem; border:none; height:auto; width:auto;"></button>
                        <button class="primary-btn btn-copy-myroom" style="background: linear-gradient(135deg, #10b981, #059669); padding: 6px 12px; font-size: 0.85rem; border:none; height:auto; width:auto;"></button>
                        <button class="primary-btn btn-delete-myroom" style="background: rgba(239,68,68,0.1); border-color: #ef4444; color: #f87171; padding: 6px 12px; font-size: 0.85rem; border:1px solid #ef4444; height:auto; width:auto;"></button>
                    </div>
                `;

                card.querySelector('.btn-enter-myroom').textContent = t.btn_enter;
                card.querySelector('.btn-copy-myroom').textContent = t.btn_copy;
                card.querySelector('.btn-delete-myroom').textContent = t.btn_delete;

                // Bind buttons
                card.querySelector('.btn-enter-myroom').addEventListener('click', () => {
                    if (requiredPwd) {
                        sessionStorage.setItem(`unlocked_room_${rid}`, 'true');
                    }
                    window.location.href = `index.html?room=${rid}`;
                });

                card.querySelector('.btn-copy-myroom').addEventListener('click', () => {
                    const joinUrl = `${window.location.origin}/index.html?room=${rid}${requiredPwd ? '&pwd=' + encodeURIComponent(requiredPwd) : ''}`;
                    navigator.clipboard.writeText(joinUrl).then(() => {
                        alert(currentLanguage === 'zh' ? "📋 複製進入連結成功！" : "📋 Room Link Copied!");
                    }).catch(e => {
                        alert("Copy failed: " + e.message);
                    });
                });

                card.querySelector('.btn-delete-myroom').addEventListener('click', async () => {
                    if (confirm(t.confirm_delete_room)) {
                        try {
                            await remove(ref(db, `rooms/${rid}`));
                            console.log(`Room ${rid} deleted.`);
                            renderMyRooms(); // refresh
                        } catch (err) {
                            alert("Delete failed: " + err.message);
                        }
                    }
                });

                myRoomsList.appendChild(card);
            });

        } catch (e) {
            console.error("Error loading my rooms:", e);
        }
    }
    

    if (btnExitRoom) {
        btnExitRoom.addEventListener('click', async () => {
            if (userPresenceRef) {
                await remove(userPresenceRef).catch(() => {});
            }
            window.location.href = "index.html";
        });
    }
    

    let currentLanguage = localStorage.getItem('preferred_language');
    if (!currentLanguage) {
        currentLanguage = navigator.language.startsWith('zh') ? 'zh' : 'en';
    }

    function applyLanguage() {
        const t = translations[currentLanguage];
        if (!t) return;
        
        const welcomeTitle = document.querySelector('#login-section h2');
        if (welcomeTitle) welcomeTitle.textContent = t.welcome_title;
        
        const welcomeDesc = document.querySelector('#login-section p');
        if (welcomeDesc) welcomeDesc.textContent = t.welcome_desc;
        
        if (btnGoogle) {
            btnGoogle.innerHTML = `<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google logo">${t.btn_google}`;
        }
        if (btnAnon) btnAnon.textContent = t.btn_anon;
        
        const portalTitle = document.querySelector('#room-portal-section h2');
        if (portalTitle) portalTitle.textContent = t.portal_title;
        
        if (btnTabJoin) btnTabJoin.textContent = t.tab_join;
        if (btnTabCreate) btnTabCreate.textContent = t.tab_create;
        
        const labelJoinDesc = document.getElementById('label-join-desc');
        if (labelJoinDesc) labelJoinDesc.textContent = t.join_desc;
        
        if (inputJoinRoomId) inputJoinRoomId.placeholder = t.placeholder_room_id;
        if (inputJoinRoomPwd) inputJoinRoomPwd.placeholder = t.placeholder_check_code;
        if (btnSubmitJoinRoom) btnSubmitJoinRoom.textContent = t.btn_join;
        
        const labelCreateDesc = document.getElementById('label-create-desc');
        if (labelCreateDesc) labelCreateDesc.textContent = t.create_desc;
        
        if (inputCreateRoomName) inputCreateRoomName.placeholder = t.placeholder_room_name;
        if (inputCreateRoomPwd) inputCreateRoomPwd.placeholder = t.placeholder_set_check_code;
        if (btnSubmitCreateRoom) btnSubmitCreateRoom.textContent = t.btn_create;
        
        const labelMyRoomsTitle = document.getElementById('label-my-rooms-title');
        if (labelMyRoomsTitle) labelMyRoomsTitle.textContent = t.my_rooms_title;
        
        if (btnExitRoom) btnExitRoom.textContent = t.btn_exit_room;
        if (btnLogout) btnLogout.textContent = t.btn_logout;
        
        if (btnLangToggle) {
            btnLangToggle.textContent = currentLanguage === 'zh' ? '🌐 English' : '🌐 繁中';
        }

        renderMyRooms();
    }

    if (btnLangToggle) {
        btnLangToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
            localStorage.setItem('preferred_language', currentLanguage);
            applyLanguage();
        });
    }

    // Trigger initial language layout on DOMContentLoaded
    setTimeout(applyLanguage, 100);
    

    const btnLangToggle = document.getElementById('btn-lang-toggle');
    const btnExitRoom = document.getElementById('btn-exit-room');
    const panelMyRooms = document.getElementById('panel-my-rooms');
    const myRoomsList = document.getElementById('my-rooms-list');
    

    // Tab Switching Logic
    if (btnTabJoin && btnTabCreate && panelJoinRoom && panelCreateRoom) {
        btnTabJoin.addEventListener('click', () => {
            panelJoinRoom.classList.remove('hidden');
            panelCreateRoom.classList.add('hidden');
            btnTabJoin.style.background = 'rgba(59, 130, 246, 0.1)';
            btnTabJoin.style.borderColor = '#3b82f6';
            btnTabJoin.style.color = '#3b82f6';
            btnTabJoin.style.fontWeight = 'bold';
            btnTabCreate.style.background = 'transparent';
            btnTabCreate.style.borderColor = 'transparent';
            btnTabCreate.style.color = '#64748b';
            btnTabCreate.style.fontWeight = 'normal';
        });

        btnTabCreate.addEventListener('click', () => {
            panelJoinRoom.classList.add('hidden');
            panelCreateRoom.classList.remove('hidden');
            btnTabJoin.style.background = 'transparent';
            btnTabJoin.style.borderColor = 'transparent';
            btnTabJoin.style.color = '#64748b';
            btnTabJoin.style.fontWeight = 'normal';
            btnTabCreate.style.background = 'rgba(59, 130, 246, 0.1)';
            btnTabCreate.style.borderColor = '#3b82f6';
            btnTabCreate.style.color = '#3b82f6';
            btnTabCreate.style.fontWeight = 'bold';
        });
    }

    // Helper: Generate random 6-character room ID
    function generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Helper: Check if user is authorized to create a room
    async function checkCanCreateRoom(user) {
        if (!user) return false;
        try {
            const restrictionSnap = await get(ref(db, 'systemConfig/roomCreationRestriction'));
            const rule = restrictionSnap.exists() ? restrictionSnap.val() : 'anyone';
            
            if (rule === 'anyone') return true;
            if (rule === 'admin_only') return user.email === SUPER_ADMIN_EMAIL;
            if (rule === 'googler_and_admin') {
                return user.email === SUPER_ADMIN_EMAIL || (user.email && user.email.endsWith('@google.com'));
            }
            if (rule === 'all_logged_in') {
                return !user.isAnonymous; // Must not be anonymous (i.e. logged in with Google)
            }
            return false;
        } catch (e) {
            console.error("Error checking room creation permission:", e);
            return false;
        }
    }

    // Bind Portal Action Buttons
    if (btnSubmitCreateRoom && inputCreateRoomName && inputCreateRoomPwd) {
        btnSubmitCreateRoom.addEventListener('click', async () => {
            const roomName = inputCreateRoomName.value.trim();
            const roomPwd = inputCreateRoomPwd.value.trim();
            
            if (!roomName) {
                alert(translations[currentLanguage].alert_no_room_name);
                return;
            }
            
            btnSubmitCreateRoom.disabled = true;
            btnSubmitCreateRoom.textContent = currentLanguage === 'zh' ? '正在創建...' : 'Creating...';

            const user = auth.currentUser;
            const hasPermission = await checkCanCreateRoom(user);
            
            if (!hasPermission) {
                alert(translations[currentLanguage].alert_no_permission);
                btnSubmitCreateRoom.disabled = false;
                btnSubmitCreateRoom.textContent = translations[currentLanguage].btn_create;
                return;
            }

            try {
                // Generate and verify unique room ID
                let roomId = generateRoomId();
                let isUnique = false;
                let attempts = 0;
                
                while (!isUnique && attempts < 5) {
                    const checkSnap = await get(ref(db, `rooms/${roomId}/metadata`));
                    if (!checkSnap.exists()) {
                        isUnique = true;
                    } else {
                        roomId = generateRoomId();
                        attempts++;
                    }
                }

                // Write metadata
                const metaRef = ref(db, `rooms/${roomId}/metadata`);
                await set(metaRef, {
                    roomName: roomName,
                    creatorUid: user.uid,
                    creatorEmail: user.email || 'Anonymous',
                    createdAt: serverTimestamp(),
                    password: roomPwd // Optional plain text password for simple client-side verification
                });

                console.log(`🎉 Room ${roomId} created successfully! Redirecting...`);
                // Clear inputs
                inputCreateRoomName.value = '';
                inputCreateRoomPwd.value = '';

                // Save unlock state to sessionStorage
                if (roomPwd) {
                    sessionStorage.setItem(`unlocked_room_${roomId}`, 'true');
                }

                // Redirect to the newly created room
                window.location.href = `index.html?room=${roomId}`;

            } catch (err) {
                alert(translations[currentLanguage].alert_create_failed + err.message);
                btnSubmitCreateRoom.disabled = false;
                btnSubmitCreateRoom.textContent = "創建並進入房間";
            }
        });
    }

    if (btnSubmitJoinRoom && inputJoinRoomId && inputJoinRoomPwd) {
        btnSubmitJoinRoom.addEventListener('click', async () => {
            const roomId = inputJoinRoomId.value.trim().toUpperCase();
            const inputPwd = inputJoinRoomPwd.value.trim();
            
            if (!roomId || roomId.length !== 6) {
                alert(translations[currentLanguage].alert_invalid_room_id);
                return;
            }

            btnSubmitJoinRoom.disabled = true;
            btnSubmitJoinRoom.textContent = currentLanguage === 'zh' ? '正在驗證...' : 'Verifying...';

            try {
                const metaSnap = await get(ref(db, `rooms/${roomId}/metadata`));
                if (!metaSnap.exists()) {
                    alert(translations[currentLanguage].alert_room_not_exist);
                    btnSubmitJoinRoom.disabled = false;
                    btnSubmitJoinRoom.textContent = translations[currentLanguage].btn_join;
                    return;
                }

                const metadata = metaSnap.val();
                const requiredPwd = metadata.password || "";

                if (requiredPwd !== "" && requiredPwd !== inputPwd) {
                    alert(translations[currentLanguage].alert_wrong_check_code);
                    btnSubmitJoinRoom.disabled = false;
                    btnSubmitJoinRoom.textContent = "進入房間";
                    return;
                }

                console.log(`🚪 Password match! Joining room ${roomId}...`);
                inputJoinRoomId.value = '';
                inputJoinRoomPwd.value = '';

                // Save unlock state to sessionStorage
                if (requiredPwd) {
                    sessionStorage.setItem(`unlocked_room_${roomId}`, 'true');
                }

                // Redirect to the room URL
                window.location.href = `index.html?room=${roomId}`;

            } catch (err) {
                alert(translations[currentLanguage].alert_join_failed + err.message);
                btnSubmitJoinRoom.disabled = false;
                btnSubmitJoinRoom.textContent = "進入房間";
            }
        });
    }

    // Quiz Elements
    const quizContainer = document.getElementById('quiz-container');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizBtns = document.querySelectorAll('.quiz-btn');
    const podiumContainer = document.getElementById('podium-container');
    
    // Admin Quiz Buttons
    const btnQuizStart = document.getElementById('btn-quiz-start');
    const btnQuizNext = document.getElementById('btn-quiz-next');
    const btnQuizEnd = document.getElementById('btn-quiz-end');
    const btnQuizReset = document.getElementById('btn-quiz-reset');
    const btnQuizUpload = document.getElementById('btn-quiz-upload');
    const btnQuizDefault = document.getElementById('btn-quiz-default');
    const quizUploadInput = document.getElementById('quiz-upload-input');
    
    // Admin Auto-Jump Timer
    const timerPresetBtns = document.querySelectorAll('.timer-preset-btn');
    const autoJumpInput = document.getElementById('auto-jump-input');

    // Extra Elements to Hide During Quiz
    const headerEl = document.querySelector('header');
    const qrCodeEl = document.querySelector('.qr-code-container');
    const chatDemoSection = document.querySelector('.chat-demo');
    const userSidebar = document.getElementById('user-sidebar');

    // User Dropdown Modal Toggle & Close Button
    if (onlineCounter && userSidebar) {
        onlineCounter.addEventListener('click', (e) => {
            e.stopPropagation();
            userSidebar.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!userSidebar.classList.contains('hidden') && !userSidebar.contains(e.target) && !onlineCounter.contains(e.target)) {
                userSidebar.classList.add('hidden');
            }
        });
    }
    const btnCloseUsers = document.getElementById('btn-close-users');
    if (btnCloseUsers && userSidebar) {
        btnCloseUsers.addEventListener('click', (e) => {
            e.stopPropagation();
            userSidebar.classList.add('hidden');
        });
    }

    let quizData = [];
    let defaultQuizData = [];
    try {
        const res = await fetch('quiz.json');
        defaultQuizData = await res.json();
        quizData = defaultQuizData;
    } catch(e) { console.error("Could not load quiz.json fallback"); }

    let oldQuizState = null;
    let currentSelectedAnswer = null;
    let answeredQuestions = new Set();
    let myScore = 0;
    let userScoreListener = null;
    let autoJumpTimeoutId = null;
    let clientTimerIntervalId = null;

    let allUsers = {};
    let onlinePresence = {};
    let allQuizScores = {};

    // KBC (Keynesian Beauty Contest) Elements
    const kbcContainer = document.getElementById('kbc-container');
    const kbcResultContainer = document.getElementById('kbc-result-container');
    const kbcGameoverContainer = document.getElementById('kbc-gameover-container');
    const btnKbcStart = document.getElementById('btn-kbc-start');
    const btnKbcEnd = document.getElementById('btn-kbc-end');
    const btnKbcForce = document.getElementById('btn-kbc-force');
    const btnKbcReset = document.getElementById('btn-kbc-reset');
    const kbcSlider = document.getElementById('kbc-slider');
    const kbcNumberInput = document.getElementById('kbc-number-input');
    const btnKbcSubmit = document.getElementById('btn-kbc-submit');
    let kbcResolving = false; // guard to prevent double-resolve

    // Survey Elements
    const surveyClientContainer = document.getElementById('survey-client-container');
    const surveyClientQ = document.getElementById('survey-client-question');
    const surveyClientMin = document.getElementById('survey-client-min-label');
    const surveyClientMax = document.getElementById('survey-client-max-label');
    const surveyClientSlider = document.getElementById('survey-client-slider');
    const surveyClientVal = document.getElementById('survey-client-value');
    const btnSurveySubmit = document.getElementById('btn-survey-submit');
    const surveySubmittedBanner = document.getElementById('survey-submitted-banner');

    // Survey Ideas Elements
    const ideaClientContainer = document.getElementById('idea-client-container');
    const ideaClientQ = document.getElementById('idea-client-question');
    const ideaClientLockBanner = document.getElementById('idea-client-lock-banner');
    const ideaClientBoard = document.getElementById('idea-client-board');
    const ideaClientInput = document.getElementById('idea-client-input');
    const btnIdeaSubmit = document.getElementById('btn-idea-submit');

    let currentIdeaStateObj = null;

    // Animal Names for Temp Accounts
    const ANIMALS = ['Capybara', 'Penguin', 'Axolotl', 'Red Panda', 'Koala', 'Platypus', 'Quokka', 'Sloth', 'Fox', 'Owl'];

    function checkIsOnline(pData) {
        return pData && (pData === true || pData.online);
    }

    async function enterLobby(user) {
        document.body.classList.add('logged-in-white');
        loginSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
        onlineCounter.classList.remove('hidden');
        userProfilePanel.classList.remove('hidden');
        if(btnLogout) btnLogout.classList.remove('hidden');

        userNameDisplay.textContent = user.displayName || 'Loading...';
        console.log("Entered lobby as:", user.displayName || 'User');

        // Dynamic Creator & Super Admin Authorization Check for Admin Panel / Presenter Screen
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');
        if (roomId) {
            const metaRef = ref(db, `rooms/${roomId}/metadata`);
            get(metaRef).then((snap) => {
                if (snap.exists()) {
                    const metadata = snap.val();
                    const isCreator = metadata.creatorUid === user.uid;
                    const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;

                    if (isCreator || isSuperAdmin) {
                        if (linkAdminPanel) {
                            linkAdminPanel.textContent = isSuperAdmin ? "👑 System Admin" : "👑 Admin Panel";
                            linkAdminPanel.href = isSuperAdmin ? "super-admin.html" : `admin.html?room=${roomId}`;
                            linkAdminPanel.classList.remove('hidden');
                        }
                        if (linkPresenterPage) {
                            linkPresenterPage.href = `presenter.html?room=${roomId}`;
                            linkPresenterPage.classList.remove('hidden');
                        }
                    } else {
                        if (linkAdminPanel) linkAdminPanel.classList.add('hidden');
                        if (linkPresenterPage) linkPresenterPage.classList.add('hidden');
                    }

                    // Dynamically set room chat room title
                    const chatTitleEl = document.querySelector('.chat-demo h2');
                    if (chatTitleEl) {
                        const roomName = metadata.roomName || 'Room';
                        chatTitleEl.textContent = currentLanguage === 'zh' ? `💬 ${roomName} 聊天室` : `💬 ${roomName} Chat Room`;
                    }
                }
            }).catch(console.error);
        }

        // Show Exit Room button in lobby
        if (btnExitRoom) btnExitRoom.classList.remove('hidden');
    }

    // 2. Authentication Logic
    btnGoogle.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error("Google login failed", err);
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
                alert("Google Sign-In is not enabled! Please go to your Firebase Console -> Authentication -> Sign-in method, and enable Google.");
            } else {
                alert("Login failed: " + err.message);
            }
        }
    });

    btnAnon.addEventListener('click', async () => {
        try {
            const result = await signInAnonymously(auth);
            if (!result.user.displayName) {
                const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
                const anonName = `🥷 ${randomAnimal}`;
                await updateProfile(result.user, { displayName: anonName });
                userNameDisplay.textContent = anonName;
                
                // Latency-Busting: Immediately force-write both standard users profile and presence nodes
                const myUid = result.user.uid;
                await set(ref(db, `users/${myUid}`), {
                    uid: myUid,
                    name: anonName,
                    isAnonymous: true,
                    lastActive: Date.now()
                }).catch(console.error);
                
                await set(ref(db, getRoomPath(`presence/${myUid}`)), {
                    online: true,
                    name: anonName,
                    isAnon: true
                }).catch(console.error);
            }
        } catch(err) {
            console.error("Anon login failed", err);
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
                alert("Anonymous Sign-In is not enabled! Please go to your Firebase Console -> Authentication -> Sign-in method, and enable the Anonymous provider.");
            } else {
                alert("Login failed: " + err.message);
            }
        }
    });

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                // Must manually clean up presence perfectly BEFORE signing out, otherwise DB rejects the write
                if (userPresenceRef) {
                    await remove(userPresenceRef);
                    userPresenceRef = null;
                }
                
                if (auth.currentUser) {
                    const isTemp = auth.currentUser.isAnonymous || (auth.currentUser.displayName && auth.currentUser.displayName.startsWith('Anonymous'));
                    if (isTemp) {
                        // Delete their profile from the persistent /users list so they don't linger
                        await remove(ref(db, `users/${auth.currentUser.uid}`));
                        // Destroy the anonymous account from Firebase Authentication
                        await deleteUser(auth.currentUser);
                    } else {
                        await signOut(auth);
                    }
                }
            } catch (err) {
                console.error("Sign out error", err);
            }
        });
    }

    // 3. Auth State & Presence Logic
    let userPresenceRef = null;
    let connectedUnsubscribe = null;
    let dbListenersUnsubscribes = [];
    let listenersInitialized = false;
    let initDatabaseFuncs = [];

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Check for Room ID in URL
            const urlParams = new URLSearchParams(window.location.search);
            const roomId = urlParams.get('room');

            if (!roomId) {
                // Scenario B: No Room selected yet -> Hide login, reveal Room Portal
                loginSection.classList.add('hidden');
                if (roomPortalSection) roomPortalSection.classList.remove('hidden');
                
                // Keep main-content hidden
                mainContent.classList.add('hidden');
                
                // Hide exit room button in portal portal
                if (btnExitRoom) btnExitRoom.classList.add('hidden');
                
                // Render list of rooms created by this user
                renderMyRooms();

                // Render Super Admin redirection if user is wube@google.com
                const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
                if (isSuperAdmin && linkAdminPanel) {
                    // Super admin gets special link
                    linkAdminPanel.textContent = "👑 System Admin";
                    linkAdminPanel.href = "super-admin.html";
                    linkAdminPanel.classList.remove('hidden');
                }
                
                // Populate Profile Badge in Header
                if (userProfilePanel && userNameDisplay) {
                    userNameDisplay.textContent = user.displayName || user.email || 'Admin';
                    userProfilePanel.classList.remove('hidden');
                    if (btnLogout) btnLogout.classList.remove('hidden');
                }
                
                // Stop further lobby setup until room is joined
                return;
            }

            // Scenario A: Room ID is present in URL -> Verify Password before entering Lobby
            try {
                const metaSnap = await get(ref(db, `rooms/${roomId}/metadata`));
                if (!metaSnap.exists()) {
                    alert(translations[currentLanguage].alert_room_not_exist);
                    window.location.href = "index.html";
                    return;
                }

                const metadata = metaSnap.val();
                const requiredPwd = metadata.password || "";
                
                if (requiredPwd !== "") {
                    // Check URL parameter bypass first
                    const urlPwd = urlParams.get('pwd');
                    const sessionUnlocked = sessionStorage.getItem(`unlocked_room_${roomId}`) === 'true';
                    
                    if (urlPwd !== requiredPwd && !sessionUnlocked) {
                        // Prompt password modal
                        const userEnteredPwd = prompt(translations[currentLanguage].prompt_need_check_code);
                        if (userEnteredPwd !== requiredPwd) {
                            alert(translations[currentLanguage].alert_wrong_check_code);
                            window.location.href = "index.html";
                            return;
                        }
                        sessionStorage.setItem(`unlocked_room_${roomId}`, 'true');
                    } else if (urlPwd === requiredPwd) {
                        // URL password bypass is valid -> Save to session for subsequent refreshes
                        sessionStorage.setItem(`unlocked_room_${roomId}`, 'true');
                    }
                }

                // Update QR Code on player lobby to point to the current room
                const joinUrl = `${window.location.origin}/index.html?room=${roomId}${requiredPwd ? '&pwd=' + encodeURIComponent(requiredPwd) : ''}`;
                const qrLink = document.getElementById('qr-code-link');
                const qrImg = document.getElementById('qr-code-img');
                if (qrLink) qrLink.href = joinUrl;
                if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`;

                await enterLobby(user);
            } catch (e) {
                console.error("Error verifying room credentials:", e);
                window.location.href = "index.html";
            }

            // Listen to forceful logout kick
            const kickRef = ref(db, getRoomPath(`kicklist/${user.uid}`));
            onValue(kickRef, async (snap) => {
                if (snap.exists() && snap.val() === true) {
                    alert("🚷 You have been forcefully logged out by an administrator!");
                    if (userPresenceRef) remove(userPresenceRef).catch(() => {});
                    remove(kickRef).catch(() => {});
                    signOut(auth).catch(() => {});
                }
            });

            // 1. Write Ordering Barrier: Ensure user profile is written before announcing presence
            const isAnon = user.isAnonymous || (user.displayName && (user.displayName.startsWith('Anonymous') || user.displayName.startsWith('🥷')));
            const userProfileRef = ref(db, `users/${user.uid}`);
            await set(userProfileRef, {
                uid: user.uid,
                name: user.displayName || 'User',
                isAnonymous: isAnon,
                lastActive: Date.now()
            }).catch(console.error);

            // 2. Initialize deferred database listeners upon successful authentication
            if (!listenersInitialized) {
                listenersInitialized = true;
                initDatabaseFuncs.forEach(f => f());
            }

            if (userScoreListener) { userScoreListener(); }
            userScoreListener = onValue(ref(db, getRoomPath(`quizScores/${user.uid}`)), (snap) => {
                myScore = snap.val()?.score || 0;
            });

            // Setup Presence Write
            userPresenceRef = ref(db, getRoomPath(`presence/${user.uid}`));
            const connectedRef = ref(db, '.info/connected');
            
            if (connectedUnsubscribe) connectedUnsubscribe();
            connectedUnsubscribe = onValue(connectedRef, (snap) => {
                if (snap.val() === true) {
                    onDisconnect(userPresenceRef).remove().then(() => {
                        const activeDispName = (auth.currentUser && auth.currentUser.displayName) || user.displayName || 'Connecting...';
                        set(userPresenceRef, {
                            online: true,
                            name: activeDispName,
                            isAnon: isAnon
                        });
                    });
                }
            });

        } else {
            // User is not signed in
            document.body.classList.remove('logged-in-white');
            loginSection.classList.remove('hidden');
            mainContent.classList.add('hidden');
            onlineCounter.classList.add('hidden');
            userProfilePanel.classList.add('hidden');
            if(btnLogout) btnLogout.classList.add('hidden');
            if (linkAdminPanel) linkAdminPanel.classList.add('hidden');
            if (linkPresenterPage) linkPresenterPage.classList.add('hidden');

            if (userScoreListener) {
                userScoreListener();
                userScoreListener = null;
                myScore = 0;
            }

            if (connectedUnsubscribe) {
                connectedUnsubscribe();
                connectedUnsubscribe = null;
            }
            if (userPresenceRef) {
                remove(userPresenceRef).catch(e => {
                    // Ignore error: write might be rejected since user is already signed out
                });
                userPresenceRef = null;
            }
            if (listenersInitialized) {
                dbListenersUnsubscribes.forEach(unsub => unsub());
                dbListenersUnsubscribes = [];
                listenersInitialized = false;
            }
        }
    });

    // 4. Track Total Online Users
    const presenceRef = ref(db, getRoomPath('presence'));
    initDatabaseFuncs.push(() => {
        dbListenersUnsubscribes.push(onValue(presenceRef, (snapshot) => {
            const onlineUsersCount = snapshot.size;
            userCountEl.textContent = onlineUsersCount;
        }, (error) => {
            console.error("Presence read failed - check database rules and instance:", error);
        }));
    });



    // View Toggle Logic
    let clientForceView = 'auto';
    if (btnViewChat && btnViewGame) {
        btnViewChat.addEventListener('click', () => {
            clientForceView = 'chat';
            updateVisibilityState();
        });
        btnViewGame.addEventListener('click', () => {
            clientForceView = 'game';
            updateVisibilityState();
        });
    }

    // Listen to Global View
    let currentGlobalViewMode = 'main';
    let currentQuizPhase = 'idle';

    function updateVisibilityState() {
        if (btnQuizUpload) btnQuizUpload.disabled = (currentQuizPhase === 'question');
        if (btnQuizDefault) btnQuizDefault.disabled = (currentQuizPhase === 'question');

        // Helper to hide all fullscreen sections
        const hideAll = () => {
            if (cardsGrid) cardsGrid.classList.add('hidden');
            if (interactiveDemo) interactiveDemo.classList.add('hidden');
            if (quizContainer) quizContainer.classList.add('hidden');
            if (podiumContainer) podiumContainer.classList.add('hidden');
            if (kbcContainer) kbcContainer.classList.add('hidden');
            if (kbcResultContainer) kbcResultContainer.classList.add('hidden');
            if (kbcGameoverContainer) kbcGameoverContainer.classList.add('hidden');
            if (qrCodeEl) qrCodeEl.classList.add('hidden');
            if (chatDemoSection) chatDemoSection.classList.add('hidden');
            if (userSidebar) userSidebar.classList.add('hidden');
            if (surveyClientContainer) surveyClientContainer.classList.add('hidden');
            if (ideaClientContainer) ideaClientContainer.classList.add('hidden');
            const equationsClientContainer = document.getElementById('equations-client-container');
            if (equationsClientContainer) equationsClientContainer.classList.add('hidden');
            if (chatContainer) chatContainer.classList.remove('big-chat-mode');
            if (headerEl) headerEl.classList.remove('hidden'); // 確保永遠顯示
        };

        if (currentQuizPhase !== 'idle') {
            if (clientForceView === 'chat') {
                hideAll();
                if (chatDemoSection) chatDemoSection.classList.remove('hidden');
                if (btnViewGame) btnViewGame.classList.remove('hidden');
                if (btnViewChat) btnViewChat.classList.add('hidden');
            } else {
                hideAll();
                if (currentQuizPhase === 'question') {
                    if (quizContainer) quizContainer.classList.remove('hidden');
                } else if (currentQuizPhase === 'podium') {
                    if (podiumContainer) podiumContainer.classList.remove('hidden');
                } else if (currentQuizPhase === 'kbc-input' || currentQuizPhase === 'kbc-result') {
                    if (currentQuizPhase === 'kbc-input') {
                        if (kbcContainer) kbcContainer.classList.remove('hidden');
                    } else {
                        if (kbcResultContainer) kbcResultContainer.classList.remove('hidden');
                    }
                } else if (currentQuizPhase === 'kbc-ended') {
                    if (kbcGameoverContainer) kbcGameoverContainer.classList.remove('hidden');
                } else if (currentQuizPhase === 'survey-input' || currentQuizPhase === 'survey-result') {
                    if (surveyClientContainer) surveyClientContainer.classList.remove('hidden');
                } else if (currentQuizPhase === 'idea-active') {
                    if (ideaClientContainer) ideaClientContainer.classList.remove('hidden');
                } else if (currentQuizPhase === 'equations-active' || currentQuizPhase === 'equations-warmup') {
                    const equationsClientContainer = document.getElementById('equations-client-container');
                    if (equationsClientContainer) equationsClientContainer.classList.remove('hidden');
                }
                if (btnViewChat) btnViewChat.classList.remove('hidden');
                if (btnViewGame) btnViewGame.classList.add('hidden');
            }
        } else {
            // Idle Phase (Quiz inactive)
            hideAll();
            clientForceView = 'auto';
            if (headerEl) headerEl.classList.remove('hidden');
            if (qrCodeEl) qrCodeEl.classList.remove('hidden');
            if (chatDemoSection) chatDemoSection.classList.remove('hidden');
            if (userSidebar) userSidebar.classList.add('hidden');

            if (currentGlobalViewMode === 'chat') {
                if (cardsGrid) cardsGrid.classList.add('hidden');
                if (interactiveDemo) interactiveDemo.classList.add('hidden');
                if (chatContainer) chatContainer.classList.add('big-chat-mode');
            } else {
                if (cardsGrid) cardsGrid.classList.remove('hidden');
                if (interactiveDemo) interactiveDemo.classList.remove('hidden');
                if (chatContainer) chatContainer.classList.remove('big-chat-mode');
            }
        }
    }

    initDatabaseFuncs.push(() => {
        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('state/currentQuizData')), (snapshot) => {
            if (snapshot.exists() && Array.isArray(snapshot.val())) {
                quizData = snapshot.val();
            } else {
                quizData = defaultQuizData;
            }
        }));

        const globalViewRef = ref(db, getRoomPath('state/globalView'));
        dbListenersUnsubscribes.push(onValue(globalViewRef, (snapshot) => {
            const data = snapshot.val();
            currentGlobalViewMode = (data && data.view) || 'main';
            updateVisibilityState();
        }));
    });



    // 5. Global Chat Logic
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (chatForm) {
        // Send message
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text || !auth.currentUser) return;
            
            chatInput.value = '';
            
            const msgRef = ref(db, getRoomPath('messages'));
            try {
                await push(msgRef, {
                    text: text,
                    uid: auth.currentUser.uid,
                    name: auth.currentUser.displayName || 'Unknown',
                    timestamp: serverTimestamp()
                });
            } catch (err) {
                console.error("Error sending message:", err);
                alert("Failed to send message: " + err.message);
            }
        });

        // Receive messages
        initDatabaseFuncs.push(() => {
            const recentMessagesQuery = query(ref(db, getRoomPath('messages')), orderByChild('timestamp'), limitToLast(50));
            
            dbListenersUnsubscribes.push(onChildAdded(recentMessagesQuery, (snapshot) => {
                const data = snapshot.val();
                
                const wrapperDiv = document.createElement('div');
                wrapperDiv.classList.add('chat-message-wrapper');
                if (auth.currentUser && data.uid === auth.currentUser.uid) {
                    wrapperDiv.classList.add('self');
                }
                
                const timeString = data.timestamp ? new Date(data.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Just now';
                
                wrapperDiv.innerHTML = `
                    <div class="msg-meta">
                        <span class="msg-name"></span>
                        <span class="msg-time"></span>
                    </div>
                    <div class="msg-bubble">
                        <div class="msg-text"></div>
                    </div>
                `;
                wrapperDiv.querySelector('.msg-name').textContent = data.name;
                wrapperDiv.querySelector('.msg-time').textContent = timeString;
                wrapperDiv.querySelector('.msg-text').textContent = data.text;

                chatMessages.appendChild(wrapperDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
            }));
        });
    }

    // --- QUIZ LOGIC ---
    quizBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (oldQuizState?.phase !== 'question') return;
            const index = parseInt(e.target.dataset.index);
            currentSelectedAnswer = index;
            quizBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
        });
    });

    if (btnQuizStart) {
        btnQuizStart.addEventListener('click', () => {
            const timerSecs = parseInt(autoJumpInput?.value) || 0;
            const stateObj = { active: true, phase: 'question', questionIndex: 0 };
            if (timerSecs > 0) stateObj.timerEnd = Date.now() + timerSecs * 1000;
            set(ref(db, getRoomPath('state/quizState')), stateObj);
        });
        btnQuizNext.addEventListener('click', () => {
            if (!oldQuizState) return;
            const nextIdx = (oldQuizState.questionIndex || 0) + 1;
            if (nextIdx >= quizData.length) {
                set(ref(db, getRoomPath('state/quizState')), { active: true, phase: 'podium' });
            } else {
                const timerSecs = parseInt(autoJumpInput?.value) || 0;
                const stateObj = { active: true, phase: 'question', questionIndex: nextIdx };
                if (timerSecs > 0) stateObj.timerEnd = Date.now() + timerSecs * 1000;
                set(ref(db, getRoomPath('state/quizState')), stateObj);
            }
        });
        btnQuizEnd.addEventListener('click', () => {
            set(ref(db, getRoomPath('state/quizState')), { active: true, phase: 'podium' });
        });
        btnQuizReset.addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete all scores and reset the quiz?")) {
                await set(ref(db, getRoomPath('state/quizState')), { active: false });
                await remove(ref(db, getRoomPath('quizScores')));
                answeredQuestions.clear();
                alert("Quiz reset!");
            }
        });

        // Preset timer buttons
        timerPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const secs = parseInt(btn.dataset.seconds);
                if (autoJumpInput) autoJumpInput.value = secs;
                timerPresetBtns.forEach(b => b.style.outline = 'none');
                btn.style.outline = '2px solid #60a5fa';
            });
        });

        if (autoJumpInput) {
            autoJumpInput.addEventListener('input', () => {
                timerPresetBtns.forEach(b => b.style.outline = 'none');
            });
        }
    }

    function clearAutoJump() {
        if (autoJumpTimeoutId) {
            clearTimeout(autoJumpTimeoutId);
            autoJumpTimeoutId = null;
        }
    }

    function clearClientTimer() {
        if (clientTimerIntervalId) {
            clearInterval(clientTimerIntervalId);
            clientTimerIntervalId = null;
        }
        const timerDisplay = document.getElementById('quiz-timer-display');
        if (timerDisplay) timerDisplay.classList.add('hidden');
    }

    initDatabaseFuncs.push(() => {
        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('state/quizState')), (snapshot) => {
            const state = snapshot.val();
        
        // Evaluate previous answer if phase changed or question advanced
        if (oldQuizState && oldQuizState.phase === 'question') {
            const hasMovedOn = !state || state.phase !== 'question' || state.questionIndex > oldQuizState.questionIndex;
            if (hasMovedOn && currentSelectedAnswer !== null && auth.currentUser) {
                const correctIdx = quizData[oldQuizState.questionIndex].correctIndex;
                if (currentSelectedAnswer === correctIdx && !answeredQuestions.has(oldQuizState.questionIndex)) {
                    answeredQuestions.add(oldQuizState.questionIndex);
                    set(ref(db, getRoomPath(`quizScores/${auth.currentUser.uid}`)), {
                        score: myScore + 1,
                        name: auth.currentUser.displayName || 'Unknown'
                    });
                }
            }
        }
        
        if (state && state.phase === 'question' && state.questionIndex !== oldQuizState?.questionIndex) {
            currentSelectedAnswer = null;
            quizBtns.forEach(b => {
                b.classList.remove('selected');
                b.blur();
            });
            
            clearAutoJump();
        }

        oldQuizState = state;

        if (!state || !state.active) {
            clearAutoJump();
            clearClientTimer();
            currentQuizPhase = 'idle';
            updateVisibilityState();
            
            if (btnQuizStart) btnQuizStart.disabled = false;
            if (btnQuizNext) btnQuizNext.disabled = true;
            if (btnQuizEnd) btnQuizEnd.disabled = true;
            
        } else if (state.phase === 'question') {
            currentQuizPhase = 'question';
            updateVisibilityState();
            
            const timerDisplay = document.getElementById('quiz-timer-display');
            const timerSecondsEl = document.getElementById('quiz-timer-seconds');
            clearClientTimer();
            if (state.timerEnd && state.timerEnd > Date.now()) {
                if (timerDisplay) timerDisplay.classList.remove('hidden');
                
                const updateTimer = () => {
                    const remaining = Math.floor((state.timerEnd - Date.now()) / 1000);
                    if (remaining > 0) {
                        if (timerSecondsEl) timerSecondsEl.textContent = remaining;
                    } else {
                        if (timerSecondsEl) timerSecondsEl.textContent = "0";
                        if (clientTimerIntervalId) {
                            clearInterval(clientTimerIntervalId);
                            clientTimerIntervalId = null;
                        }
                    }
                };
                updateTimer();
                clientTimerIntervalId = setInterval(updateTimer, 1000);
            } else {
                if (timerDisplay) timerDisplay.classList.add('hidden');
            }
            
            if (quizData[state.questionIndex]) {
                const q = quizData[state.questionIndex];
                if (quizQuestionEl) quizQuestionEl.textContent = `Q${state.questionIndex + 1}: ${q.question}`;
                quizBtns.forEach((btn, idx) => {
                    btn.textContent = q.options[idx];
                });
            }
            
            if (btnQuizStart) btnQuizStart.disabled = true;
            if (btnQuizNext) btnQuizNext.disabled = false;
            if (btnQuizEnd) btnQuizEnd.disabled = false;
            
        } else if (state.phase === 'podium') {
            clearAutoJump();
            clearClientTimer();
            currentQuizPhase = 'podium';
            updateVisibilityState();
            
            if (btnQuizStart) btnQuizStart.disabled = false;
            if (btnQuizNext) btnQuizNext.disabled = true;
            if (btnQuizEnd) btnQuizEnd.disabled = true;
            
            renderPodium();
        }
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('quizScores')), (snapshot) => {
            allQuizScores = snapshot.val() || {};
            if (oldQuizState?.phase === 'podium') renderPodium();
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, 'users'), (snapshot) => {
            allUsers = snapshot.val() || {};
            if (oldQuizState?.phase === 'podium') renderPodium();
            if (typeof window.renderUserList === 'function') window.renderUserList();
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('presence')), (snapshot) => {
            onlinePresence = snapshot.val() || {};
            if (oldQuizState?.phase === 'podium') renderPodium();
            if (typeof window.renderUserList === 'function') window.renderUserList();
        }));

        // Real-time Cooperative Equations Game listener
        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('state/equationsState')), (snapshot) => {
            const state = snapshot.val();
            if (state && state.active) {
                if (state.phase === 'warmup') {
                    currentQuizPhase = 'equations-warmup';
                } else {
                    currentQuizPhase = 'equations-active';
                }
                updateVisibilityState();

                const myUid = auth.currentUser?.uid;
                const roleIndexObj = state.players || {};
                const playerPayload = myUid ? roleIndexObj[myUid] : null;
                const myRoleIndex = (playerPayload && typeof playerPayload === 'object') ? playerPayload.roleIndex : null;
                const isSolved = (playerPayload && typeof playerPayload === 'object') ? !!playerPayload.solved : false;

                const listContainer = document.getElementById('equations-list');
                const passcodeForm = document.getElementById('equations-submission-area');
                const victoryCard = document.getElementById('equations-victory-card');
                const subtitleEl = document.getElementById('equations-client-subtitle');

                if (isSolved) {
                    // Hide equation board completely to release space
                    if (listContainer) listContainer.classList.add('hidden');
                    if (passcodeForm) passcodeForm.classList.add('hidden');
                    if (subtitleEl) subtitleEl.classList.add('hidden');
                    if (victoryCard) victoryCard.classList.remove('hidden');
                } else {
                    if (listContainer) {
                        listContainer.classList.remove('hidden');
                        listContainer.innerHTML = '';
                        
                        const isWarmup = state.phase === 'warmup';
                        
                        // Dynamically adjust passcode label text
                        const passcodeLabel = document.getElementById('equations-passcode-label');
                        if (passcodeLabel) {
                            if (isWarmup) {
                                passcodeLabel.textContent = "🔑 Enter Decoded Passcode (A+B):";
                            } else {
                                passcodeLabel.textContent = "🔑 Enter Decoded Passcode (A+B+C+D+E+F):";
                            }
                        }

                        if (isWarmup) {
                            // Warm-up Phase: everyone gets identical 2 equations
                            const activeWarmupEqs = state.warmupEquations || WARMUP_EQUATIONS;
                            activeWarmupEqs.forEach(eqText => {
                                const row = document.createElement('div');
                                row.className = 'equation-row';
                                row.textContent = eqText;
                                listContainer.appendChild(row);
                            });
                        } else {
                            // Active Phase: role assigned symmetric matrix
                            if (myRoleIndex !== null && myRoleIndex !== undefined && EQUATIONS_MATRIX[myRoleIndex]) {
                                const rows = EQUATIONS_MATRIX[myRoleIndex];
                                rows.forEach(eqText => {
                                    const row = document.createElement('div');
                                    row.className = 'equation-row';
                                    row.textContent = eqText;
                                    listContainer.appendChild(row);
                                });
                            } else {
                                listContainer.innerHTML = '<div style="color: #ef4444; font-weight: bold;">⚠️ Role Assignment Pending...</div>';
                            }
                        }
                    }
                    
                    if (passcodeForm) passcodeForm.classList.remove('hidden');
                    if (subtitleEl) subtitleEl.classList.remove('hidden');
                    if (victoryCard) victoryCard.classList.add('hidden');
                    
                    const submitBtn = document.getElementById('btn-equations-submit');
                    const inputField = document.getElementById('equations-passcode-input');
                    if (submitBtn) submitBtn.disabled = false;
                    if (inputField) {
                        inputField.disabled = false;
                        inputField.value = '';
                    }
                }
            } else {
                if (currentQuizPhase === 'equations-active' || currentQuizPhase === 'equations-warmup') {
                    currentQuizPhase = 'idle';
                    updateVisibilityState();
                }
            }
        }));

        // Asynchronous Passcode Submission Handler
        const btnEqSubmit = document.getElementById('btn-equations-submit');
        const inputEqPasscode = document.getElementById('equations-passcode-input');

        if (btnEqSubmit && inputEqPasscode) {
            btnEqSubmit.addEventListener('click', async () => {
                const val = parseInt(inputEqPasscode.value) || 0;
                
                // Dynamically resolve target passcode matching current phase
                let targetPasscode = EQUATIONS_PASSCODE; // Default active 32
                const stateSnap = await get(ref(db, getRoomPath('state/equationsState')));
                if (stateSnap.exists() && stateSnap.val().phase === 'warmup') {
                    targetPasscode = stateSnap.val().warmupPasscode !== undefined ? stateSnap.val().warmupPasscode : WARMUP_PASSCODE;
                }

                if (val === targetPasscode) {
                    btnEqSubmit.disabled = true;
                    inputEqPasscode.disabled = true;

                    // Broadcast solved: true securely to Firebase
                    const myUid = auth.currentUser?.uid;
                    if (myUid) {
                        await set(ref(db, getRoomPath(`state/equationsState/players/${myUid}/solved`)), true);
                    }
                } else {
                    alert("❌ Passcode Denied! Check calculations!");
                }
            });
        }
    });

    function renderPodium() {
        const combinedUsers = [];
        
        // Merge online users with their scores, prioritizing presence metadata
        for (const [uid, pData] of Object.entries(onlinePresence)) {
            const isOnline = checkIsOnline(pData);
            if (isOnline) {
                const fetchedPName = (typeof pData === 'object' && pData.name) ? pData.name : null;
                const userScoreObj = allQuizScores[uid] || {};
                const userObj = allUsers[uid] || {};
                const nameToUse = fetchedPName || userScoreObj.name || userObj.name || 'Anonymous User';
                
                combinedUsers.push({
                    name: nameToUse,
                    score: userScoreObj.score || 0
                });
            }
        }
        
        // Include users who have scores but are offline
        for (const [uid, scoreData] of Object.entries(allQuizScores)) {
            if (!onlinePresence[uid]) {
                combinedUsers.push({
                    name: scoreData.name || 'Offline User',
                    score: scoreData.score || 0
                });
            }
        }

        const scoresArr = combinedUsers.sort((a, b) => {
            if (b.score === a.score) return a.name.localeCompare(b.name);
            return b.score - a.score;
        });
        
        for (let i = 1; i <= 3; i++) {
            const spotName = document.getElementById(`podium-${i}-name`);
            const spotScore = document.getElementById(`podium-${i}-score`);
            if (scoresArr[i-1]) {
                if (spotName) spotName.textContent = scoresArr[i-1].name;
                if (spotScore) spotScore.textContent = scoresArr[i-1].score;
            } else {
                if (spotName) spotName.textContent = '-';
                if (spotScore) spotScore.textContent = '0';
            }
        }
        
        const listEl = document.getElementById('podium-full-list');
        if (listEl) {
            listEl.innerHTML = '';
            scoresArr.forEach((userScore, idx) => {
                const li = document.createElement('li');
                li.className = 'user-list-item';
                li.innerHTML = `<span style="width: 30px; font-weight: bold;">#${idx+1}</span> <span class="user-list-name" style="flex:1;">${userScore.name}</span> <span style="color: #60a5fa; font-weight: bold;">${userScore.score} pts</span>`;
                listEl.appendChild(li);
            });
        }
    }
    // -------------------

    // Quiz Upload Logic
    if (btnQuizUpload) {
        btnQuizUpload.addEventListener('click', () => {
            quizUploadInput.click();
        });
    }

    if (quizUploadInput) {
        quizUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("JSON must be a non-empty array.");
                    
                    parsed.forEach((q, idx) => {
                        if (!q.question || typeof q.question !== 'string') throw new Error(`Question ${idx + 1} is missing a valid 'question' string.`);
                        if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Question ${idx + 1} must have an 'options' array with at least 2 items.`);
                        if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) throw new Error(`Question ${idx + 1} has an invalid 'correctIndex'.`);
                    });

                    set(ref(db, getRoomPath('state/currentQuizData')), parsed)
                        .then(() => {
                            alert("Custom quiz uploaded and deployed successfully!");
                            e.target.value = ''; // reset
                        })
                        .catch(err => {
                            console.error(err);
                            alert("Failed to save to database. Check permissions.");
                        });
                } catch(error) {
                    alert("Invalid Quiz JSON format: \n" + error.message);
                    e.target.value = ''; // reset
                }
            };
            reader.readAsText(file);
        });
    }

    if (btnQuizDefault) {
        btnQuizDefault.addEventListener('click', () => {
            if (confirm("Are you sure you want to revert to the default quiz data? All participants will immediately sync.")) {
                remove(ref(db, getRoomPath('state/currentQuizData')))
                    .then(() => alert("Reverted to default quiz successfully!"))
                    .catch(err => alert("Failed to revert: " + err.message));
            }
        });
    }

    const btnQuizTemplate = document.getElementById('btn-quiz-template');
    if (btnQuizTemplate) {
        btnQuizTemplate.addEventListener('click', () => {
            const template = [
                {
                    "question": "What is the capital of the Moon?",
                    "options": ["Crater City", "Sea of Tranquility", "Dark Side Town", "Cheese Village"],
                    "correctIndex": 1
                },
                {
                    "question": "How many legs does a programmer's chair have?",
                    "options": ["4, but one is wobbly", "3 and a stack of books", "5 spinning wheels", "Who needs a chair?"],
                    "correctIndex": 2
                },
                {
                    "question": "What does AI stand for?",
                    "options": ["Absolutely Incredible", "Artificial Intelligence", "Always Indecisive", "Another Invoice"],
                    "correctIndex": 1
                }
            ];

            const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quiz_template.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // 6. User Sidebar Logic
    const userListEl = document.getElementById('user-list');
    const hideAnonToggle = document.getElementById('hide-anon-toggle');
    
    let hideAnon = false;
    let disconnectMap = {};

    if (userListEl && hideAnonToggle) {
        hideAnonToggle.addEventListener('change', (e) => {
            hideAnon = e.target.checked;
            renderUserList();
        });

        // make renderUserList global so the hoisted listeners can call it
        window.renderUserList = function() {
            if (!auth.currentUser) return; // Wait until authenticated state to render correctly
            
            userListEl.innerHTML = '';
            
            // Merge legacy users and purge offline anonymous accounts
            const combinedUsers = { ...allUsers };
            const isAdmin = auth.currentUser && auth.currentUser.email && ADMIN_EMAILS.includes(auth.currentUser.email);
            
            const now = Date.now();
            for (const [uid, uObj] of Object.entries(combinedUsers)) {
                const pData = onlinePresence[uid];
                const isOnline = checkIsOnline(pData);
                const isAnon = uObj.isAnonymous || (uObj.name && (uObj.name.startsWith('Anonymous') || uObj.name.startsWith('🥷')));
                
                if (isOnline) {
                    delete disconnectMap[uid];
                } else if (isAnon) {
                    if (!disconnectMap[uid]) disconnectMap[uid] = now;
                    const offlineDuration = now - disconnectMap[uid];
                    
                    delete combinedUsers[uid];
                    if (isAdmin && offlineDuration > 60000) {
                        remove(ref(db, `users/${uid}`)).catch(() => {});
                    }
                }
            }

            for (const [uid, pData] of Object.entries(onlinePresence)) {
                const isOnline = checkIsOnline(pData);
                if (isOnline && !combinedUsers[uid]) {
                    const fetchedName = (typeof pData === 'object' && pData.name) ? pData.name : 'Connecting...';
                    const fetchedAnon = (typeof pData === 'object' && pData.isAnon !== undefined) ? pData.isAnon : true;
                    combinedUsers[uid] = { uid: uid, name: fetchedName, isAnonymous: fetchedAnon };
                }
            }
            
            let userArray = Object.values(combinedUsers);
            if (hideAnon) {
                userArray = userArray.filter(u => !u.isAnonymous);
            }
            
            // Sort: online first, then by name alphabetically
            userArray.sort((a, b) => {
                const aOnline = checkIsOnline(onlinePresence[a.uid]);
                const bOnline = checkIsOnline(onlinePresence[b.uid]);
                if (aOnline === bOnline) {
                    return a.name.localeCompare(b.name);
                }
                return aOnline ? -1 : 1;
            });

            userArray.forEach(u => {
                const isOnline = checkIsOnline(onlinePresence[u.uid]);
                
                const li = document.createElement('li');
                li.className = 'user-list-item';
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.justifyContent = 'space-between';
                
                const leftDiv = document.createElement('div');
                leftDiv.style.display = 'flex';
                leftDiv.style.alignItems = 'center';
                leftDiv.style.gap = '10px';
                leftDiv.style.flex = '1';

                const dot = document.createElement('div');
                dot.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'user-list-name';
                nameSpan.textContent = u.name;

                leftDiv.appendChild(dot);
                leftDiv.appendChild(nameSpan);
                li.appendChild(leftDiv);

                // Admin Kick Button
                if (isAdmin && isOnline && auth.currentUser && auth.currentUser.uid !== u.uid) {
                    const kickBtn = document.createElement('button');
                    kickBtn.className = 'btn-kick-user';
                    kickBtn.textContent = '🚷';
                    kickBtn.title = `Force logout ${u.name}`;
                    kickBtn.style.background = 'transparent';
                    kickBtn.style.border = 'none';
                    kickBtn.style.cursor = 'pointer';
                    kickBtn.style.fontSize = '1.2rem';
                    kickBtn.style.padding = '0 4px';
                    kickBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to forcefully disconnect ${u.name}?`)) {
                            set(ref(db, getRoomPath(`kicklist/${u.uid}`)), true).catch(err => alert("Kick failed: " + err.message));
                        }
                    };
                    li.appendChild(kickBtn);
                }
                
                userListEl.appendChild(li);
            });
        }
        window.renderUserList();
    }

    // ============================
    // 7. KEYNESIAN BEAUTY CONTEST
    // ============================

    // Slider <-> Number input sync
    if (kbcSlider && kbcNumberInput) {
        kbcSlider.addEventListener('input', (e) => {
            kbcNumberInput.value = e.target.value;
        });
        kbcNumberInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 0;
            if (val < 0) val = 0;
            if (val > 100) val = 100;
            kbcSlider.value = val;
        });
    }

    // Helper: render a KBC scoreboard into a <ul> element
    function renderKbcScoreboard(listEl, players) {
        if (!listEl || !players) return;
        listEl.innerHTML = '';
        const sorted = Object.entries(players).sort((a, b) => b[1].points - a[1].points);
        sorted.forEach(([uid, p], idx) => {
            const li = document.createElement('li');
            li.className = 'user-list-item';
            const pointColor = p.points > 0 ? '#f472b6' : '#64748b';
            const strikeStyle = p.points <= 0 ? 'text-decoration: line-through; opacity: 0.5;' : '';
            li.innerHTML = `<span style="width: 30px; font-weight: bold;">#${idx+1}</span> <span class="user-list-name" style="flex:1; ${strikeStyle}">${p.name}</span> <span style="color: ${pointColor}; font-weight: bold;">${p.points} pts</span>`;
            listEl.appendChild(li);
        });
    }

    // Helper: render KBC round history as a table
    function renderKbcHistory(history, players) {
        const container1 = document.getElementById('kbc-history-content');
        const container2 = document.getElementById('kbc-history-content-end');
        if (!container1 && !container2) return;

        if (!history || history.length === 0) {
            const emptyHtml = '<p style="color: #94a3b8; text-align: center;">No rounds played yet.</p>';
            if (container1) container1.innerHTML = emptyHtml;
            if (container2) container2.innerHTML = emptyHtml;
            return;
        }

        // Collect all unique player UIDs from history
        const allPlayerUids = [];
        const playerNameMap = {};
        if (players) {
            for (const [uid, p] of Object.entries(players)) {
                if (!allPlayerUids.includes(uid)) allPlayerUids.push(uid);
                playerNameMap[uid] = p.name;
            }
        }
        history.forEach(entry => {
            if (entry.submissions) {
                for (const [uid, s] of Object.entries(entry.submissions)) {
                    if (!allPlayerUids.includes(uid)) allPlayerUids.push(uid);
                    if (!playerNameMap[uid]) playerNameMap[uid] = s.name;
                }
            }
        });

        let html = '<table class="kbc-history-table"><thead><tr><th>Round</th>';
        allPlayerUids.forEach(uid => {
            html += `<th>${playerNameMap[uid] || '?'}</th>`;
        });
        html += '<th>Avg</th><th>0.8×Avg</th></tr></thead><tbody>';

        history.forEach(entry => {
            html += '<tr>';
            let rulesIndicator = '';
            if (entry.ruleActive) rulesIndicator += '<span title="Deadlock Rule Active" style="font-size: 0.8rem;">⚠️</span>';
            if (entry.rule2Triggered) rulesIndicator += '<span title="2nd Special Rule: 100 beats 0" style="font-size: 0.8rem;">⚔️</span>';
            html += `<td style="font-weight: 700; color: #f472b6;">R${entry.round} ${rulesIndicator}</td>`;
            allPlayerUids.forEach(uid => {
                const sub = entry.submissions?.[uid];
                if (!sub || sub.pick === null || sub.pick === undefined) {
                    html += '<td style="color: #64748b;">—</td>';
                } else if (sub.isWinner) {
                    html += `<td class="kbc-winner-cell">🏆 ${sub.pick}</td>`;
                } else if (entry.disqualifiedNumbers && entry.disqualifiedNumbers.includes(sub.pick)) {
                    let extra = '';
                    if (entry.worstUids && entry.worstUids.includes(uid)) extra = ' 💀';
                    html += `<td style="color: #ef4444; text-decoration: line-through;" title="Disqualified by Deadlock Rule">${sub.pick}${extra}</td>`;
                } else if (entry.worstUids && entry.worstUids.includes(uid)) {
                    html += `<td style="color: #ef4444;" title="Lost 2 points (worst pick)">${sub.pick} 💀</td>`;
                } else {
                    html += `<td>${sub.pick}</td>`;
                }
            });
            html += `<td class="kbc-round-info">${entry.average}</td>`;
            html += `<td class="kbc-round-info">${entry.target}</td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        if (container1) container1.innerHTML = html;
        if (container2) container2.innerHTML = html;
    }

    // Admin: Start Contest
    if (btnKbcStart) {
        btnKbcStart.addEventListener('click', () => {
            const players = {};
            // Snapshot current online users
            for (const [uid, pData] of Object.entries(onlinePresence)) {
                const isOnline = checkIsOnline(pData);
                if (isOnline) {
                    const fetchedPName = (typeof pData === 'object' && pData.name) ? pData.name : null;
                    const userObj = allUsers[uid] || {};
                    players[uid] = {
                        name: fetchedPName || userObj.name || 'Anonymous User',
                        points: 10
                    };
                }
            }
            if (Object.keys(players).length < 2) {
                alert('Need at least 2 online users to start a contest!');
                return;
            }
            set(ref(db, getRoomPath('state/kbcState')), {
                active: true,
                round: 1,
                phase: 'input',
                players: players
            });
        });
    }

    // Admin: End Contest
    if (btnKbcEnd) {
        btnKbcEnd.addEventListener('click', () => {
            set(ref(db, 'admin/kbcState/phase'), 'ended');
        });
    }

    // Admin: Reset Contest
    if (btnKbcReset) {
        btnKbcReset.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the Keynesian Beauty Contest?')) {
                remove(ref(db, getRoomPath('state/kbcState')));
            }
        });
    }

    // Admin: Force Resolve (end round early with only submitted numbers)
    if (btnKbcForce) {
        btnKbcForce.addEventListener('click', () => {
            // Trigger resolution manually via the listener by reading current state
            const kbcRef = ref(db, getRoomPath('state/kbcState'));
            onValue(kbcRef, (snapshot) => {
                // one-shot read — we only want to run this once
            }, { onlyOnce: true });
            // Actually perform the force
            resolveKbcRound(true);
        });
    }

    // Player: Submit number
    if (btnKbcSubmit) {
        btnKbcSubmit.addEventListener('click', () => {
            if (!auth.currentUser) return;
            const val = parseInt(kbcNumberInput.value);
            if (isNaN(val) || val < 0 || val > 100) {
                alert('Please pick a number between 0 and 100.');
                return;
            }
            set(ref(db, getRoomPath(`state/kbcState/players/${auth.currentUser.uid}/submitted`)), val)
                .catch(err => {
                    console.error('KBC submit failed:', err);
                    alert('Failed to submit: ' + err.message);
                });
        });
    }

    // Resolve a KBC round
    async function resolveKbcRound(force = false) {
        if (kbcResolving) return;
        kbcResolving = true;

        try {
            // Read current state
            const snap = await new Promise(resolve => {
                onValue(ref(db, getRoomPath('state/kbcState')), resolve, { onlyOnce: true });
            });
            const state = snap.val();
            if (!state || !state.active || state.phase !== 'input' || !state.players) {
                kbcResolving = false;
                return;
            }

            const players = state.players;
            const activePlayers = Object.entries(players).filter(([, p]) => p.points > 0);
            const submittedPlayers = activePlayers.filter(([, p]) => typeof p.submitted === 'number');

            if (!force && submittedPlayers.length < activePlayers.length) {
                kbcResolving = false;
                return;
            }

            if (submittedPlayers.length === 0) {
                kbcResolving = false;
                return;
            }

            // Calculate
            const sum = submittedPlayers.reduce((acc, [, p]) => acc + p.submitted, 0);
            const avg = sum / submittedPlayers.length;
            const target = avg * 0.8;

            const deadlockRuleActive = !!(state.deadlockRuleActive || state.zeroRuleActive); // Support legacy name
            
            const pickCounts = {};
            submittedPlayers.forEach(([, p]) => {
                pickCounts[p.submitted] = (pickCounts[p.submitted] || 0) + 1;
            });

            const disqualifiedNumbers = new Set();
            if (deadlockRuleActive) {
                for (const [numStr, count] of Object.entries(pickCounts)) {
                    if (count > 1) {
                        disqualifiedNumbers.add(Number(numStr));
                    }
                }
            }

            let eligiblePlayers = submittedPlayers.filter(([, p]) => !disqualifiedNumbers.has(p.submitted));

            // Find actual closest among eligible
            let minDist = Infinity;
            if (eligiblePlayers.length > 0) {
                eligiblePlayers.forEach(([, p]) => {
                    const dist = Math.abs(p.submitted - target);
                    if (dist < minDist) minDist = dist;
                });
            }

            const winnerUids = new Set();
            if (eligiblePlayers.length > 0) {
                eligiblePlayers.forEach(([uid, p]) => {
                    if (Math.abs(p.submitted - target) === minDist) winnerUids.add(uid);
                });
            }

            // Find worst pick (disabled in dual games with 2 or fewer players)
            let maxDist = -1;
            const worstUids = new Set();
            
            if (activePlayers.length > 2) {
                submittedPlayers.forEach(([, p]) => {
                    const dist = Math.abs(p.submitted - target);
                    if (dist > maxDist) maxDist = dist;
                });

                submittedPlayers.forEach(([uid, p]) => {
                    if (Math.abs(p.submitted - target) === maxDist) {
                        if (!winnerUids.has(uid)) {
                            worstUids.add(uid);
                        }
                    }
                });
            }

            // 2nd Special Rule: down to 2 players, choices are exactly 0 and 100 -> 100 wins
            let rule2Triggered = false;
            if (activePlayers.length === 2 && submittedPlayers.length === 2) {
                const picks = submittedPlayers.map(([, p]) => p.submitted);
                if (picks.includes(0) && picks.includes(100)) {
                    winnerUids.clear();
                    submittedPlayers.forEach(([uid, p]) => {
                        if (p.submitted === 100) winnerUids.add(uid);
                    });
                    rule2Triggered = true;
                }
            }

            // State updates for deadlock rule
            let noOneLostPoint = false;
            if (activePlayers.length > 1 && winnerUids.size === activePlayers.length) {
                noOneLostPoint = true;
            }
            const deadlockTriggeredNow = !deadlockRuleActive && noOneLostPoint;
            const nextDeadlockRuleActive = deadlockRuleActive || noOneLostPoint;

            // Update points: losers (submitted but not winner) lose 1 point, worst pickers lose 2
            // Non-submitters (force resolve) also lose 1 point
            const updatedPlayers = {};
            const heavilyPenalizedNames = [];
            for (const [uid, p] of Object.entries(players)) {
                const newP = { name: p.name, points: p.points };
                if (p.points > 0) {
                    if (!winnerUids.has(uid)) {
                        let deduction = 1;
                        if (typeof p.submitted === 'number' && worstUids.has(uid)) {
                            deduction = 2;
                            heavilyPenalizedNames.push(p.name);
                        }
                        newP.points = p.points - deduction;
                    }
                }
                // Clear submitted for next round
                updatedPlayers[uid] = newP;
            }

            // Check game over
            const remainingActive = Object.values(updatedPlayers).filter(p => p.points > 0);

            const winnerNames = [];
            const winnerPicks = [];
            winnerUids.forEach(uid => {
                winnerNames.push(players[uid].name);
                winnerPicks.push(players[uid].submitted);
            });

            const lastResult = {
                round: state.round,
                average: Math.round(avg * 100) / 100,
                target: Math.round(target * 100) / 100,
                winnerNames: winnerNames.join(', '),
                winnerPicks: winnerPicks.join(', '),
                rule2Triggered: rule2Triggered,
                worstNames: heavilyPenalizedNames.join(', '),
                deadlockTriggeredNow: deadlockTriggeredNow
            };

            // Build history entry for this round
            const historyEntry = {
                round: state.round,
                average: lastResult.average,
                target: lastResult.target,
                winnerUids: Array.from(winnerUids),
                worstUids: Array.from(worstUids),
                ruleActive: deadlockRuleActive,
                disqualifiedNumbers: Array.from(disqualifiedNumbers),
                rule2Triggered: rule2Triggered,
                submissions: {}
            };
            for (const [uid, p] of Object.entries(players)) {
                historyEntry.submissions[uid] = {
                    name: p.name,
                    pick: typeof p.submitted === 'number' ? p.submitted : null,
                    isWinner: winnerUids.has(uid)
                };
            }
            const existingHistory = state.history || [];
            existingHistory.push(historyEntry);

            if (remainingActive.length <= 1) {
                // Game over
                await set(ref(db, getRoomPath('state/kbcState')), {
                    active: true,
                    round: state.round,
                    phase: 'ended',
                    players: updatedPlayers,
                    lastResult: lastResult,
                    history: existingHistory,
                    deadlockRuleActive: nextDeadlockRuleActive
                });
            } else {
                // Show result, then auto-advance to next round after a delay
                await set(ref(db, getRoomPath('state/kbcState')), {
                    active: true,
                    round: state.round,
                    phase: 'result',
                    players: updatedPlayers,
                    lastResult: lastResult,
                    history: existingHistory,
                    deadlockRuleActive: nextDeadlockRuleActive
                });
                // After 3 seconds, advance to next input round
                setTimeout(async () => {
                    // Clear submitted and advance round
                    const nextPlayers = {};
                    for (const [uid, p] of Object.entries(updatedPlayers)) {
                        nextPlayers[uid] = { name: p.name, points: p.points };
                    }
                    await set(ref(db, getRoomPath('state/kbcState')), {
                        active: true,
                        round: state.round + 1,
                        phase: 'input',
                        players: nextPlayers,
                        history: existingHistory,
                        deadlockRuleActive: nextDeadlockRuleActive
                    });
                }, 3000);
            }
        } catch (err) {
            console.error('KBC resolve error:', err);
        } finally {
            kbcResolving = false;
        }
    }

    // Real-time KBC state listener
    initDatabaseFuncs.push(() => {
        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('state/kbcState')), (snapshot) => {
        const state = snapshot.val();

        if (!state || !state.active) {
            currentQuizPhase = (currentQuizPhase.startsWith('kbc')) ? 'idle' : currentQuizPhase;
            if (btnKbcStart) btnKbcStart.disabled = false;
            if (btnKbcEnd) btnKbcEnd.disabled = true;
            if (btnKbcForce) btnKbcForce.disabled = true;
            updateVisibilityState();
            return;
        }

        // Admin buttons
        if (btnKbcStart) btnKbcStart.disabled = true;
        if (btnKbcEnd) btnKbcEnd.disabled = false;
        if (btnKbcForce) btnKbcForce.disabled = (state.phase !== 'input');

        const uid = auth.currentUser?.uid;
        const players = state.players || {};
        const myPlayer = uid ? players[uid] : null;

        if (state.phase === 'input') {
            currentQuizPhase = 'kbc-input';
            updateVisibilityState();

            const deadlockMsg = document.getElementById('kbc-deadlock-msg');
            const dualMsg = document.getElementById('kbc-dual-msg');
            if (deadlockMsg) {
                if (state.deadlockRuleActive || state.zeroRuleActive) {
                    deadlockMsg.classList.remove('hidden');
                } else {
                    deadlockMsg.classList.add('hidden');
                }
            }

            if (dualMsg) {
                const activePlayers = Object.entries(players).filter(([, p]) => p.points > 0);
                if (activePlayers.length === 2) {
                    dualMsg.classList.remove('hidden');
                } else {
                    dualMsg.classList.add('hidden');
                }
            }

            // Update round
            const roundEl = document.getElementById('kbc-round-num');
            if (roundEl) roundEl.textContent = state.round || 1;

            // Update my points
            const myPointsEl = document.getElementById('kbc-my-points-val');
            const inputArea = document.getElementById('kbc-input-area');
            const waitingArea = document.getElementById('kbc-waiting');
            const eliminatedArea = document.getElementById('kbc-eliminated');

            if (myPlayer) {
                if (myPointsEl) myPointsEl.textContent = myPlayer.points;

                if (myPlayer.points <= 0) {
                    // Eliminated
                    if (inputArea) inputArea.classList.add('hidden');
                    if (waitingArea) waitingArea.classList.add('hidden');
                    if (eliminatedArea) eliminatedArea.classList.remove('hidden');
                } else if (typeof myPlayer.submitted === 'number') {
                    // Already submitted
                    if (inputArea) inputArea.classList.add('hidden');
                    if (eliminatedArea) eliminatedArea.classList.add('hidden');
                    if (waitingArea) waitingArea.classList.remove('hidden');
                    const myPickEl = document.getElementById('kbc-my-pick');
                    if (myPickEl) myPickEl.textContent = myPlayer.submitted;
                } else {
                    // Can submit
                    if (inputArea) inputArea.classList.remove('hidden');
                    if (waitingArea) waitingArea.classList.add('hidden');
                    if (eliminatedArea) eliminatedArea.classList.add('hidden');
                }
            } else {
                // Not a player (joined late)
                if (myPointsEl) myPointsEl.textContent = '0';
                if (inputArea) inputArea.classList.add('hidden');
                if (waitingArea) waitingArea.classList.add('hidden');
                if (eliminatedArea) eliminatedArea.classList.remove('hidden');
            }

            // Update submitted/active counts
            const activePlayers = Object.values(players).filter(p => p.points > 0);
            const submittedCount = activePlayers.filter(p => typeof p.submitted === 'number').length;
            const subCountEl = document.getElementById('kbc-submitted-count');
            const actCountEl = document.getElementById('kbc-active-count');
            if (subCountEl) subCountEl.textContent = submittedCount;
            if (actCountEl) actCountEl.textContent = activePlayers.length;

            // Render scoreboard
            renderKbcScoreboard(document.getElementById('kbc-score-list'), players);
            renderKbcHistory(state.history, players);

            // Check if all active players submitted → admin auto-resolves
            if (submittedCount >= activePlayers.length && activePlayers.length > 0) {
                if (auth.currentUser?.email && ADMIN_EMAILS.includes(auth.currentUser.email)) {
                    resolveKbcRound(false);
                }
            }

        } else if (state.phase === 'result') {
            currentQuizPhase = 'kbc-result';
            updateVisibilityState();

            const r = state.lastResult || {};
            const avgEl = document.getElementById('kbc-res-avg');
            const targetEl = document.getElementById('kbc-res-target');
            const winnerNameEl = document.getElementById('kbc-res-winner-name');
            const winnerPickEl = document.getElementById('kbc-res-winner-pick');
            if (avgEl) avgEl.textContent = r.average ?? '—';
            if (targetEl) targetEl.textContent = r.target ?? '—';
            if (winnerNameEl) {
                if (r.winnerNames) {
                    winnerNameEl.textContent = r.winnerNames;
                } else {
                    winnerNameEl.textContent = 'Nobody';
                }
            }
            
            if (r.rule2Triggered) {
                if (winnerPickEl) winnerPickEl.innerHTML = `100 <span style="font-size: 0.9rem; color: #fbbf24; display: block; margin-top: 0.5rem;">(2nd Special Rule! 100 beats 0)</span>`;
            } else {
                if (winnerPickEl) winnerPickEl.textContent = r.winnerPicks || '—';
            }

            if (r.worstNames) {
                const penaltyEl = document.getElementById('kbc-res-penalty');
                const penaltyNamesEl = document.getElementById('kbc-res-penalty-names');
                if (penaltyEl && penaltyNamesEl) {
                    penaltyNamesEl.textContent = r.worstNames;
                    penaltyEl.classList.remove('hidden');
                }
            } else {
                const penaltyEl = document.getElementById('kbc-res-penalty');
                if (penaltyEl) penaltyEl.classList.add('hidden');
            }

            const deadlockTriggeredEl = document.getElementById('kbc-res-deadlock-triggered');
            if (deadlockTriggeredEl) {
                if (r.deadlockTriggeredNow) {
                    deadlockTriggeredEl.classList.remove('hidden');
                } else {
                    deadlockTriggeredEl.classList.add('hidden');
                }
            }

            renderKbcScoreboard(document.getElementById('kbc-res-score-list'), players);
            renderKbcHistory(state.history, players);
        } else if (state.phase === 'ended') {
            currentQuizPhase = 'kbc-ended';
            updateVisibilityState();

            // Find final winner(s)
            const sorted = Object.values(players).sort((a, b) => b.points - a.points);
            const finalWinnerEl = document.getElementById('kbc-final-winner');
            if (finalWinnerEl) {
                if (sorted.length > 0 && sorted[0].points > 0) {
                    finalWinnerEl.innerHTML = `🎉 <span style="color: #fbbf24; font-weight: 800;">${sorted[0].name}</span> wins with ${sorted[0].points} points!`;
                } else {
                    finalWinnerEl.textContent = 'No winners — everyone was eliminated!';
                }
            }

            // Show last round result if available
            if (state.lastResult) {
                const avgEl = document.getElementById('kbc-res-avg');
                const targetEl = document.getElementById('kbc-res-target');
                if (avgEl) avgEl.textContent = state.lastResult.average ?? '—';
                if (targetEl) targetEl.textContent = state.lastResult.target ?? '—';
            }

            renderKbcScoreboard(document.getElementById('kbc-final-score-list'), players);
            renderKbcHistory(state.history, players);
        }
        }));

        // Real-time Survey listener
        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('state/surveyState')), (snapshot) => {
            const state = snapshot.val();
            if (!state || !state.active) {
                currentQuizPhase = (currentQuizPhase.startsWith('survey')) ? 'idle' : currentQuizPhase;
                updateVisibilityState();
                return;
            }

            if (state.phase === 'input') {
                currentQuizPhase = 'survey-input';
                updateVisibilityState();
                if (surveyClientQ) surveyClientQ.textContent = state.question;
                if (surveyClientMin) surveyClientMin.textContent = state.minLabel;
                if (surveyClientMax) surveyClientMax.textContent = state.maxLabel;
                if (surveyClientSlider) {
                    surveyClientSlider.max = state.scale || 5;
                    surveyClientSlider.disabled = false;
                }
                if (btnSurveySubmit) btnSurveySubmit.disabled = false;
                if (surveySubmittedBanner) surveySubmittedBanner.classList.add('hidden');
                
                if (auth.currentUser && state.submissions && state.submissions[auth.currentUser.uid] !== undefined) {
                    if (surveyClientSlider) {
                        surveyClientSlider.value = state.submissions[auth.currentUser.uid];
                        surveyClientVal.textContent = surveyClientSlider.value;
                        surveyClientSlider.disabled = true;
                    }
                    if (btnSurveySubmit) btnSurveySubmit.disabled = true;
                    if (surveySubmittedBanner) {
                        surveySubmittedBanner.textContent = "✅ Submitted successfully! Waiting for host to reveal results...";
                        surveySubmittedBanner.classList.remove('hidden');
                    }
                }
            } else if (state.phase === 'result') {
                currentQuizPhase = 'survey-result';
                updateVisibilityState();
                if (surveyClientSlider) surveyClientSlider.disabled = true;
                if (btnSurveySubmit) btnSurveySubmit.disabled = true;
                if (surveySubmittedBanner) {
                    surveySubmittedBanner.textContent = `🎯 Results Revealed! Average Rating: ${state.results?.average || '—'}`;
                    surveySubmittedBanner.classList.remove('hidden');
                }
            }
        }));

        // Real-time Survey Ideas listener
        dbListenersUnsubscribes.push(onValue(ref(db, getRoomPath('state/ideaState')), (snapshot) => {
            currentIdeaStateObj = snapshot.val();
            if (!currentIdeaStateObj || !currentIdeaStateObj.active) {
                currentQuizPhase = (currentQuizPhase.startsWith('idea')) ? 'idle' : currentQuizPhase;
                updateVisibilityState();
                return;
            }

            currentQuizPhase = 'idea-active';
            updateVisibilityState();
            if (ideaClientQ) ideaClientQ.textContent = currentIdeaStateObj.question;

            const isLocked = !!currentIdeaStateObj.locked;
            if (ideaClientLockBanner) {
                if (isLocked) ideaClientLockBanner.classList.remove('hidden');
                else ideaClientLockBanner.classList.add('hidden');
            }
            if (ideaClientInput) ideaClientInput.disabled = isLocked;
            if (btnIdeaSubmit) btnIdeaSubmit.disabled = isLocked;

            renderIdeaClientBoard(currentIdeaStateObj.ideas || {}, isLocked);
        }));
    });

    function renderIdeaClientBoard(ideasMap, isLocked) {
        if (!ideaClientBoard) return;
        ideaClientBoard.innerHTML = '';
        
        const sortedIdeas = Object.values(ideasMap).sort((a, b) => {
            const aV = a.votes || 0;
            const bV = b.votes || 0;
            if (bV !== aV) return bV - aV;
            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        if (sortedIdeas.length === 0) {
            ideaClientBoard.innerHTML = '<div style="color:#94a3b8; grid-column: 1/-1;">No ideas posted yet. Be the first to share!</div>';
            return;
        }

        const currentUserUid = auth.currentUser ? auth.currentUser.uid : null;

        sortedIdeas.forEach(item => {
            const card = document.createElement('div');
            card.className = 'idea-card';
            
            const voters = item.voters || {};
            const myVote = currentUserUid ? (voters[currentUserUid] || 0) : 0;
            const isMyIdea = (currentUserUid && item.uid === currentUserUid);
            const isAnonMode = !!currentIdeaStateObj?.anonMode;
            const authorDisplay = isAnonMode ? (isMyIdea ? '🥷 Anonymous (You)' : '🥷 Anonymous') : (isMyIdea ? `${item.author} (You)` : item.author);
            const btnDisabled = (isLocked || isMyIdea) ? 'disabled' : '';
            const titleAttr = isMyIdea ? 'title="You cannot vote for your own idea"' : '';
            
            card.innerHTML = `
                <div>
                    <div class="idea-card-header">
                        <span class="idea-author">${authorDisplay}</span>
                        <span>${new Date(item.timestamp || 0).toLocaleString([], {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false})}</span>
                    </div>
                    <div class="idea-card-body">${item.text}</div>
                </div>
                <div class="idea-card-footer">
                    <span class="idea-points">${item.votes || 0} pts</span>
                    <div class="idea-actions">
                        <button class="btn-upvote ${myVote === 1 ? 'voted-1' : ''}" data-id="${item.id}" data-val="1" ${btnDisabled} ${titleAttr}>👍 +1</button>
                        <button class="btn-upvote ${myVote === 2 ? 'voted-2' : ''}" data-id="${item.id}" data-val="2" ${btnDisabled} ${titleAttr}>🔥 +2</button>
                    </div>
                </div>
            `;
            ideaClientBoard.appendChild(card);
        });

        let isVotingInProgress = false;
        ideaClientBoard.querySelectorAll('.btn-upvote').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (isLocked || !auth.currentUser || isVotingInProgress) return;
                isVotingInProgress = true;
                const iid = e.target.dataset.id;
                const clickVal = parseInt(e.target.dataset.val);
                
                try {
                    const ideaRef = ref(db, getRoomPath(`state/ideaState/ideas/${iid}`));
                    await runTransaction(ideaRef, (currentIdea) => {
                        if (!currentIdea || currentIdea.uid === auth.currentUser.uid) return currentIdea;
                        
                        const votersMap = currentIdea.voters || {};
                        const oldVal = votersMap[auth.currentUser.uid] || 0;
                        let newVal = (oldVal === clickVal) ? 0 : clickVal;
                        
                        const diff = newVal - oldVal;
                        currentIdea.votes = (currentIdea.votes || 0) + diff;
                        
                        if (newVal === 0) {
                            delete currentIdea.voters[auth.currentUser.uid];
                        } else {
                            if (!currentIdea.voters) currentIdea.voters = {};
                            currentIdea.voters[auth.currentUser.uid] = newVal;
                        }
                        return currentIdea;
                    });
                } catch(err) {
                    console.error("Idea vote transaction error", err);
                } finally {
                    isVotingInProgress = false;
                }
            });
        });
    }

    if (surveyClientSlider && surveyClientVal) {
        surveyClientSlider.addEventListener('input', (e) => {
            surveyClientVal.textContent = e.target.value;
        });
    }

    if (btnSurveySubmit) {
        btnSurveySubmit.addEventListener('click', async () => {
            if (!auth.currentUser) return;
            const val = parseInt(surveyClientSlider.value);
            btnSurveySubmit.disabled = true;
            if (surveyClientSlider) surveyClientSlider.disabled = true;
            try {
                await set(ref(db, getRoomPath(`state/surveyState/submissions/${auth.currentUser.uid}`)), val);
                if (surveySubmittedBanner) {
                    surveySubmittedBanner.textContent = "✅ Submitted successfully! Waiting for host to reveal results...";
                    surveySubmittedBanner.classList.remove('hidden');
                }
            } catch (err) {
                console.error("Survey submit error:", err);
                alert("Failed to submit rating: " + err.message);
                btnSurveySubmit.disabled = false;
                if (surveyClientSlider) surveyClientSlider.disabled = false;
            }
        });
    }

    if (btnIdeaSubmit && ideaClientInput) {
        btnIdeaSubmit.addEventListener('click', async () => {
            if (!auth.currentUser || currentIdeaStateObj?.locked) return;
            const text = ideaClientInput.value.trim();
            if (!text) return;
            
            btnIdeaSubmit.disabled = true;
            ideaClientInput.disabled = true;
            try {
                const newIdeaRef = push(ref(db, getRoomPath('state/ideaState/ideas')));
                const iid = newIdeaRef.key;
                await set(newIdeaRef, {
                    id: iid,
                    text: text,
                    uid: auth.currentUser.uid,
                    author: auth.currentUser.displayName || '🥷 Anonymous',
                    timestamp: serverTimestamp(),
                    votes: 0,
                    voters: {}
                });
                ideaClientInput.value = '';
            } catch(err) {
                console.error("Idea submit error", err);
                alert("Failed to post idea: " + err.message);
            } finally {
                if (!currentIdeaStateObj?.locked) {
                    btnIdeaSubmit.disabled = false;
                    ideaClientInput.disabled = false;
                }
            }
        });
    }
});