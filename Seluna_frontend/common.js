//TODO Uncomment the following code when everything is finished

const token = localStorage.getItem("token");
console.log("Token on Notes page:", token);

if (!token) {
    window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
} else {
    fetch("http://192.168.1.7:5216/api/Notes/check_auth", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(async res => {
        console.log("Status:", res.status);
        console.log(await res.text());

        if (!res.ok) {
            window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
        }
    })
    .catch(console.error);
}

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