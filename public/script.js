import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getDatabase, ref, onValue, onDisconnect, set, remove } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

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

    // 3. Auth State & Presence Logic
    let userPresenceRef = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            loginSection.classList.add('hidden');
            mainContent.classList.remove('hidden');
            onlineCounter.classList.remove('hidden');
            userProfilePanel.classList.remove('hidden');

            userNameDisplay.textContent = user.displayName || 'Loading...';

            console.log("Logged in as:", user.displayName || 'User');

            // Setup Presence Write
            userPresenceRef = ref(db, `presence/${user.uid}`);
            const connectedRef = ref(db, '.info/connected');
            
            onValue(connectedRef, (snap) => {
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

            if (userPresenceRef) {
                remove(userPresenceRef);
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
});