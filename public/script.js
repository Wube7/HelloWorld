import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, updateProfile, signOut, deleteUser } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getDatabase, ref, onValue, onDisconnect, set, remove, push, serverTimestamp, onChildAdded, query, orderByChild, limitToLast } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

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

    // Animal Names for Temp Accounts
    const ANIMALS = ['Capybara', 'Penguin', 'Axolotl', 'Red Panda', 'Koala', 'Platypus', 'Quokka', 'Sloth', 'Fox', 'Owl'];

    // 2. Authentication Logic
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

    btnAnon.addEventListener('click', async () => {
        try {
            const result = await signInAnonymously(auth);
            if (!result.user.displayName) {
                const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
                await updateProfile(result.user, { displayName: `Anonymous ${randomAnimal}` });
                userNameDisplay.textContent = auth.currentUser.displayName;
                
                // Immediately sync the newly assigned animal name to the DB to overwrite the generic 'User'
                const userProfileRef = ref(db, `users/${result.user.uid}`);
                set(userProfileRef, {
                    uid: result.user.uid,
                    name: auth.currentUser.displayName,
                    isAnonymous: true
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

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            loginSection.classList.add('hidden');
            mainContent.classList.remove('hidden');
            onlineCounter.classList.remove('hidden');
            userProfilePanel.classList.remove('hidden');
            if(btnLogout) btnLogout.classList.remove('hidden');

            userNameDisplay.textContent = user.displayName || 'Loading...';

            console.log("Logged in as:", user.displayName || 'User');

            // Admin Check
            if (user.email && ADMIN_EMAILS.includes(user.email)) {
                adminPanel.classList.remove('hidden');
            } else {
                adminPanel.classList.add('hidden');
            }

            // Save user profile
            const isAnon = user.isAnonymous || (user.displayName && user.displayName.startsWith('Anonymous'));
            const userProfileRef = ref(db, `users/${user.uid}`);
            set(userProfileRef, {
                uid: user.uid,
                name: user.displayName || 'User',
                isAnonymous: isAnon
            }).catch(console.error);

            if (userScoreListener) { userScoreListener(); }
            userScoreListener = onValue(ref(db, `quizScores/${user.uid}`), (snap) => {
                myScore = snap.val()?.score || 0;
            });

            // Setup Presence Write
            userPresenceRef = ref(db, `presence/${user.uid}`);
            const connectedRef = ref(db, '.info/connected');
            
            if (connectedUnsubscribe) connectedUnsubscribe();
            connectedUnsubscribe = onValue(connectedRef, (snap) => {
                if (snap.val() === true) {
                    // On disconnect, remove our node
                    onDisconnect(userPresenceRef).remove().then(() => {
                        // While connected, set presence to true
                        set(userPresenceRef, true);
                    });
                }
            });

        } else {
            // User is not signed in
            loginSection.classList.remove('hidden');
            mainContent.classList.add('hidden');
            onlineCounter.classList.add('hidden');
            userProfilePanel.classList.add('hidden');
            if(btnLogout) btnLogout.classList.add('hidden');
            adminPanel.classList.add('hidden');

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
        }
    });

    // 4. Track Total Online Users
    const presenceRef = ref(db, 'presence');
    onValue(presenceRef, (snapshot) => {
        const onlineUsersCount = snapshot.size;
        userCountEl.textContent = onlineUsersCount;
    }, (error) => {
        console.error("Presence read failed - check database rules and instance:", error);
    });

    // Admin View Toggle Logic
    if (globalViewToggle) {
        globalViewToggle.addEventListener('change', (e) => {
            if (!auth.currentUser || !auth.currentUser.email || !ADMIN_EMAILS.includes(auth.currentUser.email)) {
                e.target.checked = !e.target.checked; // revert
                return;
            }
            set(ref(db, 'admin/globalView'), {
                view: e.target.checked ? 'chat' : 'main',
                updatedBy: auth.currentUser.uid,
                timestamp: serverTimestamp()
            }).catch(err => {
                console.error("Failed to update global view:", err);
                alert("Only admins can change the global view! Check Firebase rules.");
                e.target.checked = !e.target.checked; // revert
            });
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
            if (quizContainer) quizContainer.classList.add('hidden');
            if (podiumContainer) podiumContainer.classList.add('hidden');
            if (kbcContainer) kbcContainer.classList.add('hidden');
            if (kbcResultContainer) kbcResultContainer.classList.add('hidden');
            if (kbcGameoverContainer) kbcGameoverContainer.classList.add('hidden');
            if (headerEl) headerEl.classList.remove('hidden');
            if (qrCodeEl) qrCodeEl.classList.remove('hidden');
            if (chatDemoSection) chatDemoSection.classList.remove('hidden');
            if (userSidebar) userSidebar.classList.remove('hidden');

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

    onValue(ref(db, 'admin/currentQuizData'), (snapshot) => {
        if (snapshot.exists() && Array.isArray(snapshot.val())) {
            quizData = snapshot.val();
        } else {
            quizData = defaultQuizData;
        }
    });

    const globalViewRef = ref(db, 'admin/globalView');
    onValue(globalViewRef, (snapshot) => {
        const data = snapshot.val();
        currentGlobalViewMode = (data && data.view) || 'main';
        if (globalViewToggle) globalViewToggle.checked = (currentGlobalViewMode === 'chat');
        updateVisibilityState();
    });

    // Existing Interaction logic
    actionBtn.addEventListener('click', () => {
        actionBtn.textContent = 'Processing...';
        actionBtn.style.opacity = '0.8';
        actionBtn.disabled = true;

        setTimeout(() => {
            statusMessage.textContent = '✅ Magic Initialized!';
            statusMessage.classList.remove('hidden');
            statusMessage.classList.add('visible');

            actionBtn.textContent = 'Success ⚡';
            actionBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            actionBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                actionBtn.style.transform = 'scale(1)';
            }, 200);

        }, 1500);
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
        const recentMessagesQuery = query(ref(db, 'messages'), orderByChild('timestamp'), limitToLast(50));
        
        onChildAdded(recentMessagesQuery, (snapshot) => {
            const data = snapshot.val();
            
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('chat-message');
            // If the current user sent this, align it to the right
            if (auth.currentUser && data.uid === auth.currentUser.uid) {
                msgDiv.classList.add('self');
            }
            
            const timeString = data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
            
            // XSS Safe HTML Generation
            msgDiv.innerHTML = `
                <div class="msg-header">
                    <span class="msg-name"></span>
                    <span class="msg-time"></span>
                </div>
                <div class="msg-text"></div>
            `;
            msgDiv.querySelector('.msg-name').textContent = data.name;
            msgDiv.querySelector('.msg-time').textContent = timeString;
            msgDiv.querySelector('.msg-text').textContent = data.text;

            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
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
            set(ref(db, 'admin/quizState'), stateObj);
        });
        btnQuizNext.addEventListener('click', () => {
            if (!oldQuizState) return;
            const nextIdx = (oldQuizState.questionIndex || 0) + 1;
            if (nextIdx >= quizData.length) {
                set(ref(db, 'admin/quizState'), { active: true, phase: 'podium' });
            } else {
                const timerSecs = parseInt(autoJumpInput?.value) || 0;
                const stateObj = { active: true, phase: 'question', questionIndex: nextIdx };
                if (timerSecs > 0) stateObj.timerEnd = Date.now() + timerSecs * 1000;
                set(ref(db, 'admin/quizState'), stateObj);
            }
        });
        btnQuizEnd.addEventListener('click', () => {
            set(ref(db, 'admin/quizState'), { active: true, phase: 'podium' });
        });
        btnQuizReset.addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete all scores and reset the quiz?")) {
                await set(ref(db, 'admin/quizState'), { active: false });
                await remove(ref(db, 'quizScores'));
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

    onValue(ref(db, 'admin/quizState'), (snapshot) => {
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
                const timerSecs = parseInt(autoJumpInput?.value) || 0;
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
    });

    onValue(ref(db, 'quizScores'), (snapshot) => {
        allQuizScores = snapshot.val() || {};
        if (oldQuizState?.phase === 'podium') renderPodium();
    });

    onValue(ref(db, 'users'), (snapshot) => {
        allUsers = snapshot.val() || {};
        if (oldQuizState?.phase === 'podium') renderPodium();
        if (typeof window.renderUserList === 'function') window.renderUserList();
    });

    onValue(ref(db, 'presence'), (snapshot) => {
        onlinePresence = snapshot.val() || {};
        if (oldQuizState?.phase === 'podium') renderPodium();
        if (typeof window.renderUserList === 'function') window.renderUserList();
    });

    function renderPodium() {
        const combinedUsers = [];
        
        // Merge online users with their scores
        for (const [uid, isOnline] of Object.entries(onlinePresence)) {
            if (isOnline) {
                const userObj = allUsers[uid] || { name: 'Anonymous/Legacy' };
                const userScoreObj = allQuizScores[uid] || { score: 0 };
                // Also default anonymous temp users correctly
                let nameToUse = userObj.name;
                if (!nameToUse && userObj.isAnonymous) nameToUse = 'Anonymous';
                
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

                    set(ref(db, 'admin/currentQuizData'), parsed)
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
                remove(ref(db, 'admin/currentQuizData'))
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

    if (userListEl && hideAnonToggle) {
        hideAnonToggle.addEventListener('change', (e) => {
            hideAnon = e.target.checked;
            renderUserList();
        });

        // make renderUserList global so the hoisted listeners can call it
        window.renderUserList = function() {
            if (!auth.currentUser) return; // Wait until authenticated state to render correctly
            
            userListEl.innerHTML = '';
            
            // Merge legacy users from presence tracking who might not be in the new /users node
            const combinedUsers = { ...allUsers };
            for (const [uid, isOnline] of Object.entries(onlinePresence)) {
                if (isOnline && !combinedUsers[uid]) {
                    combinedUsers[uid] = { uid: uid, name: 'Anonymous/Legacy User', isAnonymous: true };
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
                
                const dot = document.createElement('div');
                dot.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'user-list-name';
                nameSpan.textContent = u.name;

                li.appendChild(dot);
                li.appendChild(nameSpan);
                
                userListEl.appendChild(li);
            });
        }
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
        const container = document.getElementById('kbc-history-content');
        if (!container) return;

        if (!history || history.length === 0) {
            container.innerHTML = '<p style="color: #94a3b8; text-align: center;">No rounds played yet.</p>';
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
        html += '<th>Avg</th><th>⅔×Avg</th></tr></thead><tbody>';

        history.forEach(entry => {
            html += '<tr>';
            html += `<td style="font-weight: 700; color: #f472b6;">R${entry.round}</td>`;
            allPlayerUids.forEach(uid => {
                const sub = entry.submissions?.[uid];
                if (!sub || sub.pick === null || sub.pick === undefined) {
                    html += '<td style="color: #64748b;">—</td>';
                } else if (sub.isWinner) {
                    html += `<td class="kbc-winner-cell">🏆 ${sub.pick}</td>`;
                } else {
                    html += `<td>${sub.pick}</td>`;
                }
            });
            html += `<td class="kbc-round-info">${entry.average}</td>`;
            html += `<td class="kbc-round-info">${entry.target}</td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // Admin: Start Contest
    if (btnKbcStart) {
        btnKbcStart.addEventListener('click', () => {
            const players = {};
            // Snapshot current online users
            for (const [uid, isOnline] of Object.entries(onlinePresence)) {
                if (isOnline) {
                    const userObj = allUsers[uid] || {};
                    players[uid] = {
                        name: userObj.name || 'Anonymous',
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
                remove(ref(db, 'admin/kbcState'));
            }
        });
    }

    // Admin: Force Resolve (end round early with only submitted numbers)
    if (btnKbcForce) {
        btnKbcForce.addEventListener('click', () => {
            // Trigger resolution manually via the listener by reading current state
            const kbcRef = ref(db, 'admin/kbcState');
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
            const snap = await new Promise(resolve => {
                onValue(ref(db, 'admin/kbcState'), resolve, { onlyOnce: true });
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
            const target = avg * 2 / 3;

            const zeroPickCount = submittedPlayers.filter(([, p]) => p.submitted === 0).length;
            
            // First pass: find the normal winner distance
            let normalMinDist = Infinity;
            submittedPlayers.forEach(([, p]) => {
                const dist = Math.abs(p.submitted - target);
                if (dist < normalMinDist) normalMinDist = dist;
            });

            // Check if 0 is among the winners
            let zeroWouldWin = false;
            submittedPlayers.forEach(([, p]) => {
                if (Math.abs(p.submitted - target) === normalMinDist && p.submitted === 0) {
                    zeroWouldWin = true;
                }
            });

            const triggerSpecialRule = zeroWouldWin && zeroPickCount > 2;

            let eligiblePlayers = submittedPlayers;
            if (triggerSpecialRule) {
                const nonZeroPlayers = submittedPlayers.filter(([, p]) => p.submitted !== 0);
                if (nonZeroPlayers.length > 0) {
                    eligiblePlayers = nonZeroPlayers;
                } else {
                    eligiblePlayers = [];
                }
            }

            // Find actual closest among eligible
            let minDist = Infinity;
            eligiblePlayers.forEach(([, p]) => {
                const dist = Math.abs(p.submitted - target);
                if (dist < minDist) minDist = dist;
            });

            const winnerUids = new Set();
            eligiblePlayers.forEach(([uid, p]) => {
                if (Math.abs(p.submitted - target) === minDist) winnerUids.add(uid);
            });

            // Update points: losers (submitted but not winner) lose 1 point
            // Non-submitters (force resolve) also lose 1 point
            const updatedPlayers = {};
            for (const [uid, p] of Object.entries(players)) {
                const newP = { name: p.name, points: p.points };
                if (p.points > 0 && !winnerUids.has(uid)) {
                    newP.points = Math.max(0, p.points - 1);
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
                specialRuleTriggered: triggerSpecialRule
            };

            // Build history entry for this round
            const historyEntry = {
                round: state.round,
                average: lastResult.average,
                target: lastResult.target,
                winnerUids: Array.from(winnerUids),
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
                await set(ref(db, 'admin/kbcState'), {
                    active: true,
                    round: state.round,
                    phase: 'ended',
                    players: updatedPlayers,
                    lastResult: lastResult,
                    history: existingHistory
                });
            } else {
                // Show result, then auto-advance to next round after a delay
                await set(ref(db, 'admin/kbcState'), {
                    active: true,
                    round: state.round,
                    phase: 'result',
                    players: updatedPlayers,
                    lastResult: lastResult,
                    history: existingHistory
                });
                // After 6 seconds, advance to next input round
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
                        history: existingHistory
                    });
                }, 6000);
            }
        } catch (err) {
            console.error('KBC resolve error:', err);
        } finally {
            kbcResolving = false;
        }
    }

    // Real-time KBC state listener
    onValue(ref(db, 'admin/kbcState'), (snapshot) => {
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
            if (deadlockMsg) deadlockMsg.classList.add('hidden');

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
            if (winnerNameEl) winnerNameEl.textContent = r.winnerNames || '—';
            if (winnerPickEl) winnerPickEl.textContent = r.winnerPicks || '—';

            renderKbcScoreboard(document.getElementById('kbc-res-score-list'), players);
            renderKbcHistory(state.history, players);
            
            const deadlockMsg = document.getElementById('kbc-deadlock-msg');
            if (deadlockMsg) {
                if (r.specialRuleTriggered) deadlockMsg.classList.remove('hidden');
                else deadlockMsg.classList.add('hidden');
            }

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
    });
});