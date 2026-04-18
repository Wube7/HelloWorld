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
    const autoJumpSlider = document.getElementById('auto-jump-slider');
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

        if (currentQuizPhase === 'question') {
            if (cardsGrid) cardsGrid.classList.add('hidden');
            if (interactiveDemo) interactiveDemo.classList.add('hidden');
            if (podiumContainer) podiumContainer.classList.add('hidden');
            if (headerEl) headerEl.classList.add('hidden');
            if (qrCodeEl) qrCodeEl.classList.add('hidden');
            if (chatDemoSection) chatDemoSection.classList.add('hidden');
            if (userSidebar) userSidebar.classList.add('hidden');
            if (quizContainer) quizContainer.classList.remove('hidden');
            if (chatContainer) chatContainer.classList.remove('big-chat-mode');
        } else if (currentQuizPhase === 'podium') {
            if (cardsGrid) cardsGrid.classList.add('hidden');
            if (interactiveDemo) interactiveDemo.classList.add('hidden');
            if (quizContainer) quizContainer.classList.add('hidden');
            if (headerEl) headerEl.classList.add('hidden');
            if (qrCodeEl) qrCodeEl.classList.add('hidden');
            if (chatDemoSection) chatDemoSection.classList.add('hidden');
            if (userSidebar) userSidebar.classList.add('hidden');
            if (podiumContainer) podiumContainer.classList.remove('hidden');
            if (chatContainer) chatContainer.classList.remove('big-chat-mode');
        } else {
            // Idle Phase (Quiz inactive)
            if (quizContainer) quizContainer.classList.add('hidden');
            if (podiumContainer) podiumContainer.classList.add('hidden');
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

        // Sync slider and input
        if (autoJumpSlider && autoJumpInput) {
            autoJumpSlider.addEventListener('input', (e) => {
                autoJumpInput.value = e.target.value;
            });
            autoJumpInput.addEventListener('input', (e) => {
                let val = parseInt(e.target.value) || 0;
                if (val < 0) val = 0;
                if (val > 300) val = 300;
                autoJumpSlider.value = val;
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
                    const remaining = Math.ceil((state.timerEnd - Date.now()) / 1000);
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
});