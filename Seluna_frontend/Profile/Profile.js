function open_settings() {
    const settings = document.getElementById("settings");
    const setting_page = document.getElementById("setting_page");
    const setting_background = document.getElementById("setting_background");

    setting_page.style.visibility = "visible";
    setting_background.style.visibility = "visible";
}

setting_background.addEventListener("touchstart", () => {
    if (setting_background.style.visibility = "visible") {
        setting_background.style.visibility = "hidden";
        setting_page.style.visibility = "hidden";
    }
});