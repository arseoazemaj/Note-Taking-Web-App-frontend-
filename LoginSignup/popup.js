function showPopup(message, options = {}) {
    const existing = document.getElementById("custom-popup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "white";
    popup.style.padding = "1.5em";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 0 20px rgba(0,0,0,0.3)";
    popup.style.zIndex = 9999;
    popup.innerHTML = `<p style="margin: 0 0 1em 0;">${message}</p><button id="close-popup" style="padding: 0.5em 1em; border: none; background: #4B9CD3; color: white; border-radius: 8px; cursor: pointer;">OK</button>`;

    document.body.appendChild(popup);

    document.getElementById("close-popup").onclick = () => {
        popup.remove();
        if (options.onClose) options.onClose();
    };
}