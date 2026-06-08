import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    set, 
    remove, 
    get 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Initialize Firebase with staging/production configuration loaded dynamically
let configJson = {};
try {
    const res = await fetch('/__/firebase/init.json');
    if (res.ok) {
        configJson = await res.json();
    }
} catch (e) {
    console.error("Firebase auto-init failed, using fallback config.", e);
}

const app = initializeApp(configJson);
const db = getDatabase(app);
const auth = getAuth(app);

const SUPER_ADMIN_EMAIL = "wube@google.com";

// DOM elements
const adminEmailDisplay = document.getElementById('admin-email-display');
const accessDeniedScreen = document.getElementById('access-denied-screen');
const adminDashboardView = document.getElementById('admin-dashboard-view');
const btnAdminLogout = document.getElementById('btn-admin-logout');
const restrictionGroup = document.getElementById('restriction-group');
const roomsListBody = document.getElementById('rooms-list-body');
const totalRoomsBadge = document.getElementById('total-rooms-badge');

let dbListeners = [];

// Handle authentication state
onAuthStateChanged(auth, (user) => {
    // Clean old listeners
    dbListeners.forEach(unsub => unsub());
    dbListeners = [];

    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        // Access Denied
        adminEmailDisplay.textContent = user ? user.email : "Guest";
        accessDeniedScreen.classList.remove('hidden');
        adminDashboardView.classList.add('hidden');
        return;
    }

    // Access Granted
    adminEmailDisplay.textContent = user.email;
    accessDeniedScreen.classList.add('hidden');
    adminDashboardView.classList.remove('hidden');

    initializeDashboard();
});

// Logout handler
const performLogout = () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch(err => {
        alert("Logout failed: " + err.message);
    });
};
if (btnAdminLogout) btnAdminLogout.addEventListener('click', performLogout);

function initializeDashboard() {
    console.log("👑 Initializing Super Admin Control Panel...");

    // 1. Monitor & Update Global Settings (roomCreationRestriction)
    const configRef = ref(db, 'systemConfig/roomCreationRestriction');
    const unsubConfig = onValue(configRef, (snapshot) => {
        const val = snapshot.val() || 'googler_and_admin'; // Default fallback
        const radio = document.querySelector(`input[name="creation-rule"][value="${val}"]`);
        if (radio) radio.checked = true;
    });
    dbListeners.push(unsubConfig);

    // Add change listeners to radio buttons
    const radios = document.querySelectorAll('input[name="creation-rule"]');
    radios.forEach(radio => {
        radio.addEventListener('change', async (e) => {
            const newVal = e.target.value;
            try {
                await set(configRef, newVal);
                console.log(`✅ Room creation restriction updated: ${newVal}`);
            } catch (err) {
                alert("Failed to update config: " + err.message);
            }
        });
    });

    // 2. Monitor Active Rooms list
    const roomsRef = ref(db, 'rooms');
    const unsubRooms = onValue(roomsRef, (snapshot) => {
        roomsListBody.innerHTML = "";
        if (!snapshot.exists()) {
            roomsListBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 2rem;">📭 目前無任何活躍的房間。</td></tr>`;
            totalRoomsBadge.textContent = "0 房間";
            return;
        }

        const roomsData = snapshot.val();
        const roomsEntries = Object.entries(roomsData);
        totalRoomsBadge.textContent = `${roomsEntries.length} 房間`;

        // Sort by creation date descending
        roomsEntries.sort((a, b) => {
            const timeA = (a[1].metadata && a[1].metadata.createdAt) || 0;
            const timeB = (b[1].metadata && b[1].metadata.createdAt) || 0;
            return timeB - timeA;
        });

        roomsEntries.forEach(([roomId, roomObj]) => {
            const metadata = roomObj.metadata || {};
            const name = metadata.roomName || "未命名房間";
            const creator = metadata.creatorEmail || "匿名創立人";
            const dateStr = metadata.createdAt ? new Date(metadata.createdAt).toLocaleString('zh-TW', { hour12: false }) : "未知日期";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code style="background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 4px; font-weight: bold; color: var(--accent-1);">${roomId}</code></td>
                <td style="font-weight: bold;">${name}</td>
                <td>${creator}</td>
                <td>${dateStr}</td>
                <td style="text-align: right;">
                    <button class="btn-delete-room" data-room-id="${roomId}">⚠️ 刪除</button>
                </td>
            `;

            // Bind delete handler
            const delBtn = tr.querySelector('.btn-delete-room');
            delBtn.addEventListener('click', () => {
                if (confirm(`⚠️ 確定要徹底刪除房間「${name}」嗎？\n這會連同該房間的資料庫狀態、答題分數、實時對話完全清除，無法還原！`)) {
                    deleteRoom(roomId, name);
                }
            });

            roomsListBody.appendChild(tr);
        });
    });
    dbListeners.push(unsubRooms);
}

// Cascading physical room deletion
async function deleteRoom(roomId, roomName) {
    console.log(`🧹 Deleting room ${roomId} (${roomName})...`);
    try {
        await remove(ref(db, `rooms/${roomId}`));
        console.log(`✅ Room ${roomId} physically removed from database.`);
    } catch (e) {
        alert(`Failed to delete room: ${e.message}`);
    }
}
