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
        config.databaseURL = 'https://helloworld777-fa78b-default-rtdb.firebaseio.com';
        
        app = initializeApp(config);
        auth = getAuth(app);
        db = getDatabase(app);
    } catch (e) {
        console.error("Firebase init failed. Ensure you are running via Firebase Hosting (e.g. firebase serve/deploy):", e);
        return;
    }

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

            // Save user profile
            const isAnon = user.isAnonymous || (user.displayName && user.displayName.startsWith('Anonymous'));
            const userProfileRef = ref(db, `users/${user.uid}`);
            set(userProfileRef, {
                uid: user.uid,
                name: user.displayName || 'User',
                isAnonymous: isAnon
            }).catch(console.error);

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

    // 6. User Sidebar Logic
    const userListEl = document.getElementById('user-list');
    const hideAnonToggle = document.getElementById('hide-anon-toggle');
    
    let allUsers = {};
    let onlinePresence = {};
    let hideAnon = false;

    if (userListEl && hideAnonToggle) {
        hideAnonToggle.addEventListener('change', (e) => {
            hideAnon = e.target.checked;
            renderUserList();
        });

        const usersRef = ref(db, 'users');
        onValue(usersRef, (snapshot) => {
            allUsers = snapshot.val() || {};
            renderUserList();
        });

        const presenceListRef = ref(db, 'presence');
        onValue(presenceListRef, (snapshot) => {
            onlinePresence = snapshot.val() || {};
            renderUserList();
        });

        function renderUserList() {
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