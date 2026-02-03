//TODO Uncomment the following code when everything is finished

const token = localStorage.getItem("token");

// if (!token) {
//     window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
// } else {
//     fetch("http://localhost:5216/api/Notes/check-auth", {
//         headers: {
//             "Authorization": "Bearer " + token
//         }
//     })
//     .then(res => {
//         if (!res.ok) {
//             localStorage.removeItem("token");
//             window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
//         }
//     });
// }

function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const base64Payload = token.split(".")[1];
        const payload = atob(base64Payload);
        const parsedPayload = JSON.parse(payload);
        return parsedPayload.nameid || null;
    } catch (e) {
        console.error("Failed to parse JWT token", e);
        return null;
    }
}

const sanitize = str => str.replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, "");

lucide.createIcons();

(() => {
    const MOVE_THRESHOLD = 5;
    let startX = 0;
    let startY = 0;
    let moved = false;
    let activeEl = null;

    document.addEventListener('pointerdown', (e) => {
            const el = e.target.closest('[data-tap]');
            if (!el) return;

            activeEl = el;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
        },
        { passive: true }
    );

    document.addEventListener('pointermove', (e) => {
            if (!activeEl) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > MOVE_THRESHOLD) {
                moved = true;
            }
        },
        { passive: true }
    );

    document.addEventListener('pointerup', (e) => {
        if (!activeEl || moved) {
            activeEl = null;
            return;
        }

        const fnName = activeEl.dataset.tap;
        const fn = window[fnName];

        if (typeof fn === 'function') {
            fn.call(activeEl, e);
        } else {
            console.warn(`data-tap function "${fnName}" not found`);
        }

        activeEl = null;
    });
})();

document.addEventListener("DOMContentLoaded", loadUsername );

async function loadUsername() {
    try {
        const username = document.getElementById("username");
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No JWT token found");
            return;
        }

        const response = await fetch("http://localhost:5216/api/account/get_username", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        username.textContent = data.username;
    } catch (error) {
        console.error("Failed to load username:", error);
    }
}