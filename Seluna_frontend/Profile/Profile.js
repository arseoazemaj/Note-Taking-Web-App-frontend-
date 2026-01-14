function open_menu() {
    console.log("Open menu from profile page...")
}

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