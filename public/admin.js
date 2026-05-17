import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, updateProfile, signOut, deleteUser } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getDatabase, ref, onValue, onDisconnect, set, remove, push, serverTimestamp, onChildAdded, query, orderByChild, limitToLast, get } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("admin.js started initializing...");
    const adminStatus = document.getElementById('admin-status');
    const adminMain = document.getElementById('admin-main');
    let authResolved = false;

    // Watchdog timeout placed at the very top
    setTimeout(() => {
        if (!authResolved && adminStatus) {
            console.warn("Auth verification timeout reached.");
            adminStatus.textContent = "⚠️ Authentication verification timeout. Please ensure you are logged in on the main page or F5 reload.";
        }
    }, 5000);

    // 1. Initialize Firebase from Hosting Init URL
    let app, auth, db;
    try {
        const response = await fetch('/__/firebase/init.json');
        if (!response.ok) throw new Error('Could not fetch init.json');
        const config = await response.json();
        app = initializeApp(config);
        auth = getAuth(app);
        db = getDatabase(app);
    } catch (e) {
        console.error("Firebase init failed. Ensure you are running via Firebase Hosting (e.g. firebase serve/deploy):", e);
        if (adminStatus) adminStatus.textContent = "⚠️ Firebase Init Failed. Check console for emulator/hosting connection details.";
        return;
    }

    // 2. Initialize dynamic QR code based on environment
    const currentUrl = window.location.origin;
    const qrLink = document.getElementById('qr-code-link');
    const qrImg = document.getElementById('qr-code-img');
    if (qrLink) qrLink.href = currentUrl;
    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;

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
    const adminPanel = document.getElementById('admin-panel');
    const globalViewToggle = document.getElementById('global-view-toggle');
    const cardsGrid = document.querySelector('.cards-grid');
    const interactiveDemo = document.querySelector('.interactive-demo');
    const chatContainer = document.querySelector('.chat-container');

    const ADMIN_EMAILS = ['wube8816@gmail.com'];

    // Quiz Elements
    const quizContainer = document.getElementById('quiz-container');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizBtns = document.querySelectorAll('.quiz-btn');
    const podiumContainer = document.getElementById('podium-container');
    
    // Quiz Multiple Bank DOM (Step 1, 2 & 3 Always Visible)
    const quizAddTopic = document.getElementById('quiz-add-topic');
    const quizAddTimer = document.getElementById('quiz-add-timer');
    const quizUploadFile = document.getElementById('quiz-upload-file');
    const btnQuizSelectFile = document.getElementById('btn-quiz-select-file');
    const quizSelectedFilename = document.getElementById('quiz-selected-filename');
    const btnQuizCreateBank = document.getElementById('btn-quiz-create-bank');
    const btnQuizDlTemplate = document.getElementById('btn-quiz-dl-template');
    const quizBankListEl = document.getElementById('quiz-bank-list');
    const quizBankCountEl = document.getElementById('quiz-bank-count');
    const adminActiveQuizControls = document.getElementById('admin-active-quiz-controls');
    const quizAdminQnum = document.getElementById('quiz-admin-qnum');
    const quizAdminTopic = document.getElementById('quiz-admin-topic');
    const btnQuizNext = document.getElementById('btn-quiz-next');
    const btnQuizCrown = document.getElementById('btn-quiz-crown');
    const btnQuizReturn = document.getElementById('btn-quiz-return');
    
    let storedQuizBanks = {};
    let currentQuizStateObj = null;

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
    fetch('quiz.json').then(res => res.json()).then(data => {
        defaultQuizData = data;
        quizData = defaultQuizData;
    }).catch(e => console.error("Could not load quiz.json fallback"));

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
    const btnKbcRes = document.getElementById('btn-kbc-res');
    const adminActiveKbcControls = document.getElementById('admin-active-kbc-controls');
    const kbcAdminRoundEl = document.getElementById('kbc-admin-round');
    const btnKbcEnd = document.getElementById('btn-kbc-end');
    const btnKbcForce = document.getElementById('btn-kbc-force');
    const btnKbcReturn = document.getElementById('btn-kbc-return');
    const kbcAdminStatusEl = document.getElementById('kbc-admin-status');
    let lastKbcArchive = null;
    const kbcSlider = document.getElementById('kbc-slider');
    const kbcNumberInput = document.getElementById('kbc-number-input');
    const btnKbcSubmit = document.getElementById('btn-kbc-submit');
    let kbcResolving = false; // guard to prevent double-resolve

    // Survey Master DOM
    const surveyAddQ = document.getElementById('survey-add-q');
    const surveyAddScale = document.getElementById('survey-add-scale');
    const surveyAddMin = document.getElementById('survey-add-min');
    const surveyAddMax = document.getElementById('survey-add-max');
    const btnSurveyCreate = document.getElementById('btn-survey-create');
    const surveyBankListEl = document.getElementById('survey-bank-list');
    const surveyBankCountEl = document.getElementById('survey-bank-count');
    const adminActiveSurveyControls = document.getElementById('admin-active-survey-controls');
    const surveySubCountEl = document.getElementById('survey-sub-count');
    const btnSurveyReveal = document.getElementById('btn-survey-reveal');
    const btnSurveyEnd = document.getElementById('btn-survey-end');

    let storedSurveys = {};
    let currentSurveyState = null;

    // Survey Ideas Master DOM
    const ideaAddQ = document.getElementById('idea-add-q');
    const btnIdeaCreate = document.getElementById('btn-idea-create');
    const ideaBankListEl = document.getElementById('idea-bank-list');
    const ideaBankCountEl = document.getElementById('idea-bank-count');
    const adminActiveIdeaControls = document.getElementById('admin-active-idea-controls');
    const ideaSubCountEl = document.getElementById('idea-sub-count');
    const btnIdeaLock = document.getElementById('btn-idea-lock');
    const btnIdeaEnd = document.getElementById('btn-idea-end');

    let storedIdeaPrompts = {};
    let currentIdeaStateObj = null;

    // Animal Names for Temp Accounts
    const ANIMALS = ['Capybara', 'Penguin', 'Axolotl', 'Red Panda', 'Koala', 'Platypus', 'Quokka', 'Sloth', 'Fox', 'Owl'];

    // 2. Authentication Logic
    if (btnGoogle) {
        btnGoogle.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider).catch(err => {
                console.error("Google login failed", err);
                if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
                    alert("Google Sign-In is not enabled! Please go to your Firebase Console -> Authentication -> Sign-in method, and enable Google.");
                } else {
                    alert("Login failed: " + err.message);
                }
            });
        });
    }

    if (btnAnon) {
        btnAnon.addEventListener('click', async () => {
            try {
                const result = await signInAnonymously(auth);
                if (!result.user.displayName) {
                    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
                    await updateProfile(result.user, { displayName: `🥷 ${randomAnimal}` });
                    if (userNameDisplay) userNameDisplay.textContent = auth.currentUser.displayName;
                    
                    const userProfileRef = ref(db, `users/${result.user.uid}`);
                    set(userProfileRef, {
                        uid: result.user.uid,
                        name: auth.currentUser.displayName,
                        isAnonymous: true
                    }).catch(console.error);
                }
            } catch(err) {
                console.error("Anon login failed", err);
            }
        });
    }

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

    console.log("Mounting onAuthStateChanged listener...");
    onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed:", user ? (user.email || "Anon") : "null");
        authResolved = true;
        if (user) {
            if (user.email && ADMIN_EMAILS.includes(user.email)) {
                if (adminStatus) adminStatus.textContent = `👑 Active Admin: ${user.displayName || user.email}`;
                if (adminMain) adminMain.classList.remove('hidden');
                if (adminPanel) adminPanel.classList.remove('hidden');
                
                if (!listenersInitialized) {
                    listenersInitialized = true;
                    initDatabaseFuncs.forEach(f => f());
                }
            } else {
                if (adminStatus) adminStatus.textContent = "⛔ Access Denied: You must log in as an authorized administrator!";
                if (adminMain) adminMain.classList.add('hidden');
            }
        } else {
            if (adminStatus) adminStatus.textContent = "🔒 Please log in as an administrator on the main page first.";
            if (adminMain) adminMain.classList.add('hidden');
            if (listenersInitialized) {
                dbListenersUnsubscribes.forEach(unsub => unsub());
                dbListenersUnsubscribes = [];
                listenersInitialized = false;
            }
        }
    });

    const adminRoomBanner = document.getElementById('admin-room-status-banner');
    const adminRoomLabel = document.getElementById('admin-room-state-label');

    function updateRoomStatusBanner() {
        if (!adminRoomBanner || !adminRoomLabel) return;
        if (currentQuizPhase === 'idle') {
            adminRoomBanner.style.background = 'rgba(16, 185, 129, 0.15)';
            adminRoomBanner.style.borderColor = '#10b981';
            adminRoomLabel.style.color = '#34d399';
            adminRoomLabel.textContent = '🟢 LOBBY (Idle - All Games Available)';
        } else if (currentQuizPhase === 'question' || currentQuizPhase === 'podium') {
            adminRoomBanner.style.background = 'rgba(109, 40, 217, 0.15)';
            adminRoomBanner.style.borderColor = '#6d28d9';
            adminRoomLabel.style.color = '#a78bfa';
            adminRoomLabel.textContent = `🎯 QUIZ ROOM in Progress (${currentQuizPhase})`;
        } else if (currentQuizPhase.startsWith('kbc')) {
            adminRoomBanner.style.background = 'rgba(219, 39, 119, 0.15)';
            adminRoomBanner.style.borderColor = '#db2777';
            adminRoomLabel.style.color = '#f472b6';
            adminRoomLabel.textContent = `🎲 KBC ROOM in Progress (${currentQuizPhase})`;
        } else if (currentQuizPhase.startsWith('survey') || currentSurveyState?.active) {
            adminRoomBanner.style.background = 'rgba(5, 150, 105, 0.15)';
            adminRoomBanner.style.borderColor = '#059669';
            adminRoomLabel.style.color = '#6ee7b7';
            adminRoomLabel.textContent = `📊 SURVEY ROOM in Progress`;
        } else if (currentIdeaStateObj?.active) {
            adminRoomBanner.style.background = 'rgba(37, 99, 235, 0.15)';
            adminRoomBanner.style.borderColor = '#2563eb';
            adminRoomLabel.style.color = '#60a5fa';
            adminRoomLabel.textContent = `💡 IDEATION ROOM in Progress`;
        }
    }

    initDatabaseFuncs.push(() => {
        // Real-time KBC Archive listener
        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/kbcArchive'), (snapshot) => {
            lastKbcArchive = snapshot.val();
            if (btnKbcRes) {
                btnKbcRes.disabled = (!lastKbcArchive || currentQuizPhase !== 'idle');
            }
        }));

        // Real-time Survey Ideas Master listeners
        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/ideaSurveys'), (snapshot) => {
            storedIdeaPrompts = snapshot.val() || {};
            renderIdeaBank();
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/ideaState'), (snapshot) => {
            currentIdeaStateObj = snapshot.val();
            if (currentIdeaStateObj && currentIdeaStateObj.active) {
                if (adminActiveIdeaControls) adminActiveIdeaControls.classList.remove('hidden');
                const ideasMap = currentIdeaStateObj.ideas || {};
                const postedCount = Object.keys(ideasMap).length;
                if (ideaSubCountEl) ideaSubCountEl.textContent = postedCount;
                if (btnIdeaLock) {
                    const isLocked = !!currentIdeaStateObj.locked;
                    btnIdeaLock.textContent = isLocked ? "🔓 Unlock Session" : "🔒 Lock Session";
                    btnIdeaLock.style.background = isLocked ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)";
                    btnIdeaLock.style.borderColor = isLocked ? "#10b981" : "#f59e0b";
                }
            } else {
                if (adminActiveIdeaControls) adminActiveIdeaControls.classList.add('hidden');
            }
        }));
    });

    function renderIdeaBank() {
        if (!ideaBankListEl) return;
        ideaBankListEl.innerHTML = '';
        const keys = Object.keys(storedIdeaPrompts);
        if (ideaBankCountEl) ideaBankCountEl.textContent = keys.length;

        if (keys.length === 0) {
            ideaBankListEl.innerHTML = '<div style="color: #64748b;">No brainstorming prompts saved. Add one above!</div>';
            return;
        }

        for (const [pid, pObj] of Object.entries(storedIdeaPrompts)) {
            const itemDiv = document.createElement('div');
            itemDiv.style = "background: rgba(255,255,255,0.05); border: 1px solid #475569; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;";
            itemDiv.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #f8fafc;">${pObj.question}</div>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="btn-start-idea primary-btn btn-sm" data-pid="${pid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981;">Start</button>
                    <button class="btn-edit-idea primary-btn btn-sm" data-pid="${pid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6;">Edit</button>
                    <button class="btn-del-idea primary-btn btn-sm" data-pid="${pid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444;">Delete</button>
                    <button class="btn-res-idea primary-btn btn-sm" data-pid="${pid}" ${(!pObj.lastSession || currentQuizPhase !== 'idle') ? 'disabled' : ''} style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #f59e0b;">Result</button>
                </div>
            `;
            ideaBankListEl.appendChild(itemDiv);
        }

        ideaBankListEl.querySelectorAll('.btn-start-idea').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const pid = e.target.dataset.pid;
                const pObj = storedIdeaPrompts[pid];
                if (!pObj) return;
                const isAnon = document.getElementById('toggle-idea-anon')?.checked ?? true;
                await set(ref(db, 'admin/ideaState'), {
                    active: true,
                    surveyId: pid,
                    question: pObj.question,
                    locked: false,
                    anonMode: isAnon,
                    ideas: {}
                });
            });
        });

        ideaBankListEl.querySelectorAll('.btn-edit-idea').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const pid = e.target.dataset.pid;
                const pObj = storedIdeaPrompts[pid];
                if (!pObj) return;
                if (ideaAddQ) ideaAddQ.value = pObj.question;
                if (btnIdeaCreate) {
                    btnIdeaCreate.textContent = "Update Prompt";
                    btnIdeaCreate.dataset.editingPid = pid;
                }
            });
        });

        ideaBankListEl.querySelectorAll('.btn-res-idea').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const pid = e.target.dataset.pid;
                const pObj = storedIdeaPrompts[pid];
                const sess = pObj?.lastSession;
                if (!sess || !sess.ideas) return;
                await set(ref(db, 'admin/ideaState'), {
                    active: true,
                    surveyId: pid,
                    question: pObj.question,
                    locked: true,
                    anonMode: pObj.anonMode ?? true,
                    ideas: sess.ideas
                });
            });
        });

        ideaBankListEl.querySelectorAll('.btn-del-idea').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const pid = e.target.dataset.pid;
                if (confirm("Are you sure you want to delete this brainstorming prompt?")) {
                    await remove(ref(db, `admin/ideaSurveys/${pid}`));
                }
            });
        });
    }

    if (btnIdeaCreate) {
        btnIdeaCreate.addEventListener('click', async () => {
            const q = ideaAddQ.value.trim();
            if (!q) { alert("Please enter a prompt."); return; }
            
            const editingPid = btnIdeaCreate.dataset.editingPid;
            if (editingPid) {
                await set(ref(db, `admin/ideaSurveys/${editingPid}`), { question: q });
                btnIdeaCreate.textContent = "+ Add to Prompt Bank";
                delete btnIdeaCreate.dataset.editingPid;
            } else {
                const newRef = push(ref(db, 'admin/ideaSurveys'));
                await set(newRef, { question: q });
            }
            ideaAddQ.value = '';
        });
    }

    if (btnIdeaLock) {
        btnIdeaLock.addEventListener('click', async () => {
            if (!currentIdeaStateObj) return;
            const nextLocked = !currentIdeaStateObj.locked;
            await set(ref(db, 'admin/ideaState/locked'), nextLocked);
            if (nextLocked && currentIdeaStateObj.surveyId) {
                await set(ref(db, `admin/ideaSurveys/${currentIdeaStateObj.surveyId}/lastSession/ideas`), currentIdeaStateObj.ideas || {});
            }
        });
    }

    if (btnIdeaEnd) {
        btnIdeaEnd.addEventListener('click', async () => {
            if (currentIdeaStateObj?.surveyId) {
                await set(ref(db, `admin/ideaSurveys/${currentIdeaStateObj.surveyId}/lastSession/ideas`), currentIdeaStateObj.ideas || {});
            }
            await set(ref(db, 'admin/ideaState/active'), false);
        });
    }

    // 4. Track Total Online Users
    const presenceRef = ref(db, 'presence');
    initDatabaseFuncs.push(() => {
        dbListenersUnsubscribes.push(onValue(presenceRef, (snapshot) => {
            const onlineUsersCount = snapshot.size;
            if (userCountEl) userCountEl.textContent = onlineUsersCount;
        }, (error) => {
            console.error("Presence read failed - check database rules and instance:", error);
        }));
    });



    // Listen to Global View
    let currentGlobalViewMode = 'main';
    let currentQuizPhase = 'idle';

    function updateVisibilityState() {
        // Helper to hide all fullscreen sections
        const hideAll = () => {
            if (cardsGrid) cardsGrid.classList.add('hidden');
            if (interactiveDemo) interactiveDemo.classList.add('hidden');
            if (quizContainer) quizContainer.classList.add('hidden');
            if (podiumContainer) podiumContainer.classList.add('hidden');
            if (kbcContainer) kbcContainer.classList.add('hidden');
            if (kbcResultContainer) kbcResultContainer.classList.add('hidden');
            if (kbcGameoverContainer) kbcGameoverContainer.classList.add('hidden');
            if (headerEl) headerEl.classList.add('hidden');
            if (qrCodeEl) qrCodeEl.classList.add('hidden');
            if (chatDemoSection) chatDemoSection.classList.add('hidden');
            if (userSidebar) userSidebar.classList.add('hidden');
            if (chatContainer) chatContainer.classList.remove('big-chat-mode');
        };

        if (currentQuizPhase === 'question') {
            hideAll();
            if (quizContainer) quizContainer.classList.remove('hidden');
        } else if (currentQuizPhase === 'podium') {
            hideAll();
            if (podiumContainer) podiumContainer.classList.remove('hidden');
        } else if (currentQuizPhase === 'kbc-input' || currentQuizPhase === 'kbc-result') {
            hideAll();
            if (currentQuizPhase === 'kbc-input') {
                if (kbcContainer) kbcContainer.classList.remove('hidden');
            } else {
                if (kbcResultContainer) kbcResultContainer.classList.remove('hidden');
            }
        } else if (currentQuizPhase === 'kbc-ended') {
            hideAll();
            if (kbcGameoverContainer) kbcGameoverContainer.classList.remove('hidden');
        } else {
            // Idle Phase (Quiz inactive)
            hideAll();
            if (adminActiveKbcControls) adminActiveKbcControls.classList.add('hidden');
            if (adminActiveSurveyControls) adminActiveSurveyControls.classList.add('hidden');
            if (adminActiveIdeaControls) adminActiveIdeaControls.classList.add('hidden');
            if (headerEl) headerEl.classList.remove('hidden');
            if (qrCodeEl) qrCodeEl.classList.remove('hidden');
            if (chatDemoSection) chatDemoSection.classList.remove('hidden');

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
        if (typeof updateRoomStatusBanner === 'function') updateRoomStatusBanner();
        if (typeof renderQuizBankList === 'function') renderQuizBankList();
        if (typeof renderSurveyBank === 'function') renderSurveyBank();
        if (typeof renderIdeaBank === 'function') renderIdeaBank();
    }

    initDatabaseFuncs.push(() => {
        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/quizBanks'), (snapshot) => {
            storedQuizBanks = snapshot.val() || {};
            if (typeof renderQuizBankList === 'function') renderQuizBankList();
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/currentQuizData'), (snapshot) => {
            if (snapshot.exists() && Array.isArray(snapshot.val())) {
                quizData = snapshot.val();
            } else {
                quizData = defaultQuizData;
            }
        }));

        const globalViewRef = ref(db, 'admin/globalView');
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
            
            const msgRef = ref(db, 'messages');
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
            const recentMessagesQuery = query(ref(db, 'messages'), orderByChild('timestamp'), limitToLast(50));
            
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

    if (btnQuizNext) {
        btnQuizNext.addEventListener('click', async () => {
            if (!currentQuizStateObj) return;
            const nextIdx = (currentQuizStateObj.questionIndex || 0) + 1;
            if (nextIdx >= quizData.length) {
                await set(ref(db, 'admin/quizState/phase'), 'podium');
                if (currentQuizStateObj.bankId) {
                    const scoresSnap = await get(ref(db, 'quizScores'));
                    await set(ref(db, `admin/quizBanks/${currentQuizStateObj.bankId}/lastSession`), {
                        quizScores: scoresSnap.val() || {},
                        podiumData: { finishedAt: Date.now() }
                    });
                }
            } else {
                const timerSecs = currentQuizStateObj.timerSecs || 0;
                const stateObj = { ...currentQuizStateObj, phase: 'question', questionIndex: nextIdx };
                if (timerSecs > 0) stateObj.timerEnd = Date.now() + timerSecs * 1000;
                await set(ref(db, 'admin/quizState'), stateObj);
            }
        });
    }

    if (btnQuizCrown) {
        btnQuizCrown.addEventListener('click', async () => {
            if (confirm("Are you sure you want to end the quiz early and crown the winner based on current scores?")) {
                await set(ref(db, 'admin/quizState/phase'), 'podium');
                if (currentQuizStateObj?.bankId) {
                    const scoresSnap = await get(ref(db, 'quizScores'));
                    await set(ref(db, `admin/quizBanks/${currentQuizStateObj.bankId}/lastSession`), {
                        quizScores: scoresSnap.val() || {},
                        podiumData: { finishedAt: Date.now() }
                    });
                }
            }
        });
    }

    if (btnQuizReturn) {
        btnQuizReturn.addEventListener('click', async () => {
            if (currentQuizStateObj?.bankId) {
                const scoresSnap = await get(ref(db, 'quizScores'));
                await set(ref(db, `admin/quizBanks/${currentQuizStateObj.bankId}/lastSession`), {
                    quizScores: scoresSnap.val() || {},
                    podiumData: { finishedAt: Date.now() }
                });
            }
            await set(ref(db, 'admin/quizState/active'), false);
        });
    }

    if (btnQuizSelectFile && quizUploadFile) {
        btnQuizSelectFile.addEventListener('click', () => quizUploadFile.click());
        quizUploadFile.addEventListener('change', () => {
            if (quizUploadFile.files && quizUploadFile.files[0]) {
                if (quizSelectedFilename) quizSelectedFilename.textContent = quizUploadFile.files[0].name;
            } else {
                if (quizSelectedFilename) quizSelectedFilename.textContent = 'No file chosen';
            }
        });
    }

    if (btnQuizCreateBank) {
        btnQuizCreateBank.addEventListener('click', async () => {
            const topic = quizAddTopic?.value.trim() || 'Custom Tech Quiz';
            const timer = parseInt(quizAddTimer?.value) || 0;
            if (!topic) { alert("Please enter a quiz topic name."); return; }

            if (quizUploadFile && quizUploadFile.files && quizUploadFile.files[0]) {
                const file = quizUploadFile.files[0];
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const parsed = JSON.parse(e.target.result);
                        if (!Array.isArray(parsed) || parsed.length === 0 || !parsed[0].question) {
                            alert("Invalid JSON format: must be an array of question objects.");
                            return;
                        }
                        const newRef = push(ref(db, 'admin/quizBanks'));
                        await set(newRef, {
                            topic: topic,
                            timerSecs: timer,
                            quizData: parsed,
                            createdAt: serverTimestamp()
                        });
                        alert("Quiz Bank created successfully!");
                        if (quizAddTopic) quizAddTopic.value = '';
                        if (quizUploadFile) quizUploadFile.value = '';
                        if (quizSelectedFilename) quizSelectedFilename.textContent = 'No file chosen';
                    } catch(err) { alert("JSON Parse Error: " + err.message); }
                };
                reader.readAsText(file);
            } else {
                const newRef = push(ref(db, 'admin/quizBanks'));
                await set(newRef, {
                    topic: topic,
                    timerSecs: timer,
                    quizData: defaultQuizData,
                    createdAt: serverTimestamp()
                });
                alert("Quiz Bank created using default questions!");
                if (quizAddTopic) quizAddTopic.value = '';
            }
        });
    }

    if (btnQuizDlTemplate) {
        btnQuizDlTemplate.addEventListener('click', () => {
            const template = [
                {
                    "question": "Sample Tech Question: In what year was Google founded?",
                    "options": ["1995", "1998", "2001", "2004"],
                    "correctIndex": 1
                },
                {
                    "question": "Sample Tech Question: What does HTML stand for?",
                    "options": ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "High Tech Modern Language"],
                    "correctIndex": 0
                }
            ];
            const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quiz_template.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    function renderQuizBankList() {
        if (!quizBankListEl) return;
        quizBankListEl.innerHTML = '';
        const keys = Object.keys(storedQuizBanks);
        if (quizBankCountEl) quizBankCountEl.textContent = keys.length;
        
        if (keys.length === 0) {
            quizBankListEl.innerHTML = '<div style="color: #64748b;">No quiz banks saved. Create one above!</div>';
            return;
        }
        
        for (const [qid, qObj] of Object.entries(storedQuizBanks)) {
            const qCount = qObj.quizData ? qObj.quizData.length : 0;
            const hasRes = !!qObj.lastSession;
            const itemDiv = document.createElement('div');
            itemDiv.style = "background: rgba(255,255,255,0.05); border: 1px solid #475569; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;";
            itemDiv.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #f8fafc;">${qObj.topic || 'Untitled Quiz'}</div>
                    <div style="font-size: 0.85rem; color: #94a3b8;">${qCount} Qs | Timer: ${qObj.timerSecs || 0}s</div>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="btn-start-quizbank primary-btn btn-sm" data-qid="${qid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981;">Start</button>
                    <button class="btn-del-quizbank primary-btn btn-sm" data-qid="${qid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444;">Delete</button>
                    <button class="btn-res-quizbank primary-btn btn-sm" data-qid="${qid}" ${(hasRes && currentQuizPhase === 'idle') ? '' : 'disabled'} style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #f59e0b;">Result</button>
                </div>
            `;
            quizBankListEl.appendChild(itemDiv);
        }

        quizBankListEl.querySelectorAll('.btn-start-quizbank').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const qid = e.target.dataset.qid;
                const qObj = storedQuizBanks[qid];
                if (!qObj || !qObj.quizData) return;
                
                await set(ref(db, 'admin/currentQuizData'), qObj.quizData);
                const timerSecs = qObj.timerSecs || 0;
                const stateObj = {
                    active: true,
                    bankId: qid,
                    topic: qObj.topic || 'Quiz',
                    timerSecs: timerSecs,
                    phase: 'question',
                    questionIndex: 0
                };
                if (timerSecs > 0) stateObj.timerEnd = Date.now() + timerSecs * 1000;
                await set(ref(db, 'admin/quizState'), stateObj);
                await remove(ref(db, 'quizScores'));
                answeredQuestions.clear();
            });
        });

        quizBankListEl.querySelectorAll('.btn-res-quizbank').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const qid = e.target.dataset.qid;
                const qObj = storedQuizBanks[qid];
                const sess = qObj?.lastSession;
                if (!sess) return;
                await set(ref(db, 'admin/quizState'), {
                    active: true,
                    bankId: qid,
                    topic: qObj.topic || 'Quiz',
                    phase: 'podium',
                    podiumData: sess.podiumData || {},
                    quizScores: sess.quizScores || {}
                });
            });
        });

        quizBankListEl.querySelectorAll('.btn-del-quizbank').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const qid = e.target.dataset.qid;
                if (confirm("Are you sure you want to delete this quiz bank?")) {
                    await remove(ref(db, `admin/quizBanks/${qid}`));
                }
            });
        });
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
        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/quizState'), (snapshot) => {
            const state = snapshot.val();
        
        // Evaluate previous answer if phase changed or question advanced
        if (oldQuizState && oldQuizState.phase === 'question') {
            const hasMovedOn = !state || state.phase !== 'question' || state.questionIndex > oldQuizState.questionIndex;
            if (hasMovedOn && currentSelectedAnswer !== null && auth.currentUser) {
                const correctIdx = quizData[oldQuizState.questionIndex].correctIndex;
                if (currentSelectedAnswer === correctIdx && !answeredQuestions.has(oldQuizState.questionIndex)) {
                    answeredQuestions.add(oldQuizState.questionIndex);
                    set(ref(db, `quizScores/${auth.currentUser.uid}`), {
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
            if (auth.currentUser && auth.currentUser.email && ADMIN_EMAILS.includes(auth.currentUser.email)) {
                const timerSecs = parseInt(state?.timerSecs) || 0;
                if (timerSecs > 0) {
                    autoJumpTimeoutId = setTimeout(() => {
                        const nextIdx = state.questionIndex + 1;
                        if (nextIdx >= quizData.length) {
                            set(ref(db, 'admin/quizState'), { active: true, phase: 'podium' });
                        } else {
                            const stateObj = { active: true, phase: 'question', questionIndex: nextIdx };
                            if (timerSecs > 0) stateObj.timerEnd = Date.now() + timerSecs * 1000;
                            set(ref(db, 'admin/quizState'), stateObj);
                        }
                    }, timerSecs * 1000);
                }
            }
        }

        oldQuizState = state;

        if (!state || !state.active) {
            clearAutoJump();
            clearClientTimer();
            currentQuizPhase = 'idle';
            if (adminActiveQuizControls) adminActiveQuizControls.classList.add('hidden');
            updateVisibilityState();
            return;
        }
        
        currentQuizStateObj = state;
        if (adminActiveQuizControls) adminActiveQuizControls.classList.remove('hidden');
        if (quizAdminQnum) quizAdminQnum.textContent = (state.questionIndex || 0) + 1;
        if (quizAdminTopic) quizAdminTopic.textContent = state.topic || 'Quiz';
        
        if (state.phase === 'question') {
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
            
        } else if (state.phase === 'podium') {
            clearAutoJump();
            clearClientTimer();
            currentQuizPhase = 'podium';
            updateVisibilityState();
            
            renderPodium();

            if (state.bankId) {
                get(ref(db, 'quizScores')).then(scoresSnap => {
                    set(ref(db, `admin/quizBanks/${state.bankId}/lastSession`), {
                        quizScores: scoresSnap.val() || {},
                        podiumData: { finishedAt: Date.now() }
                    });
                }).catch(console.error);
            }
        }
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, 'quizScores'), (snapshot) => {
            allQuizScores = snapshot.val() || {};
            if (oldQuizState?.phase === 'podium') renderPodium();
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, 'users'), (snapshot) => {
            allUsers = snapshot.val() || {};
            if (oldQuizState?.phase === 'podium') renderPodium();
            if (typeof window.renderUserList === 'function') window.renderUserList();
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, 'presence'), (snapshot) => {
            onlinePresence = snapshot.val() || {};
            if (oldQuizState?.phase === 'podium') renderPodium();
            if (typeof window.renderUserList === 'function') window.renderUserList();
        }));
    });

    function renderPodium() {
        const combinedUsers = [];
        
        // Merge online users with their scores, prioritizing presence metadata
        for (const [uid, pData] of Object.entries(onlinePresence)) {
            const isOnline = pData && (pData === true || pData.online);
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
                const isOnline = pData && (pData === true || pData.online);
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
                const isOnline = pData && (pData === true || pData.online);
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
                const aOnline = !!onlinePresence[a.uid];
                const bOnline = !!onlinePresence[b.uid];
                if (aOnline === bOnline) {
                    return a.name.localeCompare(b.name);
                }
                return aOnline ? -1 : 1;
            });

            userArray.forEach(u => {
                const isOnline = !!onlinePresence[u.uid];
                
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
                            set(ref(db, `admin/kicklist/${u.uid}`), true).catch(err => alert("Kick failed: " + err.message));
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
            if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
            const players = {};
            // Snapshot current online users
            for (const [uid, pData] of Object.entries(onlinePresence)) {
                const isOnline = pData && (pData === true || pData.online);
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
            set(ref(db, 'admin/kbcState'), {
                active: true,
                round: 1,
                phase: 'input',
                players: players
            });
        });
    }

    if (btnKbcRes) {
        btnKbcRes.addEventListener('click', async () => {
            if (currentQuizPhase !== 'idle' || !lastKbcArchive) return;
            await set(ref(db, 'admin/kbcState'), {
                active: true,
                round: lastKbcArchive.round || 1,
                phase: 'ended',
                players: lastKbcArchive.players || {},
                lastResult: lastKbcArchive.lastResult || null,
                history: lastKbcArchive.history || [],
                deadlockRuleActive: !!lastKbcArchive.deadlockRuleActive
            });
        });
    }

    if (btnKbcEnd) {
        btnKbcEnd.addEventListener('click', async () => {
            if (confirm("Are you sure you want to end the KBC game early and crown the winner based on current points?")) {
                const snap = await get(ref(db, 'admin/kbcState'));
                const state = snap.val();
                if (!state || !state.active || !state.players) return;
                
                const archiveObj = {
                    round: state.round || 1,
                    players: state.players,
                    lastResult: state.lastResult || null,
                    history: state.history || [],
                    deadlockRuleActive: !!state.deadlockRuleActive
                };
                await set(ref(db, 'admin/kbcState'), { ...state, phase: 'ended' });
                await set(ref(db, 'admin/kbcArchive'), archiveObj);
            }
        });
    }

    if (btnKbcReturn) {
        btnKbcReturn.addEventListener('click', async () => {
            await set(ref(db, 'admin/kbcState/active'), false);
        });
    }

    // Admin: Force Resolve (end round early with only submitted numbers)
    if (btnKbcForce) {
        btnKbcForce.addEventListener('click', () => {
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
            set(ref(db, `admin/kbcState/players/${auth.currentUser.uid}/submitted`), val)
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
            const snap = await get(ref(db, 'admin/kbcState'));
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

            const currentArchiveObj = {
                round: state.round,
                players: updatedPlayers,
                lastResult: lastResult,
                history: existingHistory,
                deadlockRuleActive: nextDeadlockRuleActive
            };
            await set(ref(db, 'admin/kbcArchive'), currentArchiveObj);

            if (remainingActive.length <= 1) {
                // Game over
                await set(ref(db, 'admin/kbcState'), {
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
                await set(ref(db, 'admin/kbcState'), {
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
                    await set(ref(db, 'admin/kbcState'), {
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
        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/kbcState'), (snapshot) => {
        const state = snapshot.val();

        if (!state || !state.active) {
            currentQuizPhase = (currentQuizPhase.startsWith('kbc')) ? 'idle' : currentQuizPhase;
            if (btnKbcStart) btnKbcStart.disabled = false;
            if (adminActiveKbcControls) adminActiveKbcControls.classList.add('hidden');
            if (btnKbcRes) btnKbcRes.disabled = (!lastKbcArchive || currentQuizPhase !== 'idle');
            updateVisibilityState();
            return;
        }

        // Admin buttons
        if (adminActiveKbcControls) adminActiveKbcControls.classList.remove('hidden');
        if (kbcAdminRoundEl) kbcAdminRoundEl.textContent = state.round || 1;
        const phaseDisplayMap = { input: 'Waiting for Submissions', result: 'Round Resolving (3s)', ended: 'Contest Over (Standings)' };
        const phaseStr = phaseDisplayMap[state.phase] || state.phase;
        if (kbcAdminStatusEl) kbcAdminStatusEl.textContent = ` - Phase: ${phaseStr}`;
        if (btnKbcStart) btnKbcStart.disabled = true;
        if (btnKbcRes) btnKbcRes.disabled = true;
        if (btnKbcEnd) btnKbcEnd.disabled = false;
        if (btnKbcReturn) btnKbcReturn.disabled = false;
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

        // Real-time Survey Master listeners
        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/surveys'), (snapshot) => {
            storedSurveys = snapshot.val() || {};
            renderSurveyBank();
        }));

        dbListenersUnsubscribes.push(onValue(ref(db, 'admin/surveyState'), (snapshot) => {
            currentSurveyState = snapshot.val();
            if (currentSurveyState && currentSurveyState.active) {
                if (adminActiveSurveyControls) adminActiveSurveyControls.classList.remove('hidden');
                const subs = currentSurveyState.submissions ? Object.keys(currentSurveyState.submissions).length : 0;
                if (surveySubCountEl) surveySubCountEl.textContent = subs;
                if (btnSurveyReveal) btnSurveyReveal.disabled = (currentSurveyState.phase !== 'input');
            } else {
                if (adminActiveSurveyControls) adminActiveSurveyControls.classList.add('hidden');
            }
        }));
    });

    function renderSurveyBank() {
        if (!surveyBankListEl) return;
        surveyBankListEl.innerHTML = '';
        const keys = Object.keys(storedSurveys);
        if (surveyBankCountEl) surveyBankCountEl.textContent = keys.length;

        if (keys.length === 0) {
            surveyBankListEl.innerHTML = '<div style="color: #64748b;">No questions in bank. Add one above!</div>';
            return;
        }

        for (const [sid, sObj] of Object.entries(storedSurveys)) {
            const itemDiv = document.createElement('div');
            itemDiv.style = "background: rgba(255,255,255,0.05); border: 1px solid #475569; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;";
            itemDiv.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #f8fafc;">${sObj.question}</div>
                    <div style="font-size: 0.85rem; color: #94a3b8;">Scale: 1-${sObj.scale} (${sObj.minLabel} / ${sObj.maxLabel})</div>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="btn-start-survey primary-btn btn-sm" data-sid="${sid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981;">Start</button>
                    <button class="btn-edit-survey primary-btn btn-sm" data-sid="${sid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6;">Edit</button>
                    <button class="btn-del-survey primary-btn btn-sm" data-sid="${sid}" ${currentQuizPhase !== 'idle' ? 'disabled' : ''} style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444;">Delete</button>
                    <button class="btn-res-survey primary-btn btn-sm" data-sid="${sid}" ${(!sObj.lastSession || currentQuizPhase !== 'idle') ? 'disabled' : ''} style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #f59e0b;">Result</button>
                </div>
            `;
            surveyBankListEl.appendChild(itemDiv);
        }

        surveyBankListEl.querySelectorAll('.btn-start-survey').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const sid = e.target.dataset.sid;
                const sObj = storedSurveys[sid];
                if (!sObj) return;
                await set(ref(db, 'admin/surveyState'), {
                    active: true,
                    surveyId: sid,
                    question: sObj.question,
                    scale: sObj.scale,
                    minLabel: sObj.minLabel,
                    maxLabel: sObj.maxLabel,
                    phase: 'input',
                    submissions: {}
                });
            });
        });

        surveyBankListEl.querySelectorAll('.btn-edit-survey').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const sid = e.target.dataset.sid;
                const sObj = storedSurveys[sid];
                if (!sObj) return;
                if (surveyAddQ) surveyAddQ.value = sObj.question;
                if (surveyAddScale) surveyAddScale.value = sObj.scale;
                if (surveyAddMin) surveyAddMin.value = sObj.minLabel;
                if (surveyAddMax) surveyAddMax.value = sObj.maxLabel;
                if (btnSurveyCreate) {
                    btnSurveyCreate.textContent = "Update Question";
                    btnSurveyCreate.dataset.editingSid = sid;
                }
            });
        });

        surveyBankListEl.querySelectorAll('.btn-res-survey').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const sid = e.target.dataset.sid;
                const sObj = storedSurveys[sid];
                const sess = sObj?.lastSession;
                if (!sess) return;
                await set(ref(db, 'admin/surveyState'), {
                    active: true,
                    surveyId: sid,
                    question: sObj.question,
                    scale: sObj.scale,
                    minLabel: sObj.minLabel,
                    maxLabel: sObj.maxLabel,
                    phase: 'result',
                    submissions: sess.submissions || {},
                    results: sess.results || {}
                });
            });
        });

        surveyBankListEl.querySelectorAll('.btn-del-survey').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (currentQuizPhase !== 'idle') { alert("Please return to lobby first!"); return; }
                const sid = e.target.dataset.sid;
                if (confirm("Are you sure you want to delete this survey question?")) {
                    await remove(ref(db, `admin/surveys/${sid}`));
                }
            });
        });
    }

    if (btnSurveyCreate) {
        btnSurveyCreate.addEventListener('click', async () => {
            const q = surveyAddQ.value.trim();
            const scale = parseInt(surveyAddScale.value) || 5;
            const minL = surveyAddMin.value.trim() || 'Low';
            const maxL = surveyAddMax.value.trim() || 'High';
            if (!q) { alert("Please enter a question prompt."); return; }
            
            const editingSid = btnSurveyCreate.dataset.editingSid;
            if (editingSid) {
                await set(ref(db, `admin/surveys/${editingSid}`), { question: q, scale: scale, minLabel: minL, maxLabel: maxL });
                btnSurveyCreate.textContent = "+ Add to Question Bank";
                delete btnSurveyCreate.dataset.editingSid;
            } else {
                const newRef = push(ref(db, 'admin/surveys'));
                await set(newRef, { question: q, scale: scale, minLabel: minL, maxLabel: maxL });
            }
            surveyAddQ.value = '';
            surveyAddMin.value = '';
            surveyAddMax.value = '';
        });
    }

    if (btnSurveyReveal) {
        btnSurveyReveal.addEventListener('click', async () => {
            if (!currentSurveyState || currentSurveyState.phase !== 'input') return;
            const subs = currentSurveyState.submissions || {};
            const scale = currentSurveyState.scale || 5;
            const counts = {};
            for (let i = 1; i <= scale; i++) counts[i] = 0;
            
            let sum = 0;
            let total = 0;
            for (const [uid, val] of Object.entries(subs)) {
                const vNum = parseInt(val);
                if (counts[vNum] !== undefined) {
                    counts[vNum]++;
                    sum += vNum;
                    total++;
                }
            }
            const avg = total > 0 ? parseFloat((sum / total).toFixed(2)) : 0;
            
            const resObj = { counts: counts, average: avg, total: total };
            await set(ref(db, 'admin/surveyState/results'), resObj);
            await set(ref(db, 'admin/surveyState/phase'), 'result');
            
            if (currentSurveyState?.surveyId) {
                await set(ref(db, `admin/surveys/${currentSurveyState.surveyId}/lastSession`), {
                    submissions: subs,
                    results: resObj
                });
            }
        });
    }

    if (btnSurveyEnd) {
        btnSurveyEnd.addEventListener('click', async () => {
            if (currentSurveyState?.surveyId) {
                await set(ref(db, `admin/surveys/${currentSurveyState.surveyId}/lastSession`), {
                    submissions: currentSurveyState.submissions || {},
                    results: currentSurveyState.results || {}
                });
            }
            await set(ref(db, 'admin/surveyState/active'), false);
        });
    }
});