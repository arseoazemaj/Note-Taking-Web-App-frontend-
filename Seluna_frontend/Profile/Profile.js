const username = document.getElementById("username");

document.addEventListener("DOMContentLoaded", first );

function first() {
    account();
}

function profile_icon() {
    const change_icon = document.getElementById("change_icon");
    change_icon.classList.add("show");
    change_icon.classList.remove("hide");
    blur_background.style.visibility = "visible";
}





const account_btn = document.getElementById("account");
const security_btn = document.getElementById("security");
const editor_btn = document.getElementById("editor");
const appearance_btn = document.getElementById("appearance");
const focus_btn = document.getElementById("focus");
const help_btn = document.getElementById("help");

const account_icon = document.getElementById("account_icon");
const security_icon = document.getElementById("security_icon");
const editor_icon = document.getElementById("editor_icon");
const appearance_icon = document.getElementById("appearance_icon");
const focus_icon = document.getElementById("focus_icon");
const help_icon = document.getElementById("help_icon");


const account_text = document.createTextNode("Account");
const security_text = document.createTextNode("Security");
const editor_text = document.createTextNode("Editor");
const appearance_text = document.createTextNode("Appearance");
const focus_text = document.createTextNode("Focus");
const help_text = document.createTextNode("Help");

function account() {
    account_btn.insertBefore(account_text, account_btn.firstChild);

    account_btn.classList.add("active");
    security_btn.classList.remove("active");
    editor_btn.classList.remove("active");
    appearance_btn.classList.remove("active");
    focus_btn.classList.remove("active");
    help_btn.classList.remove("active");

    if (account_btn.classList.contains("active")) {
        account_text.textContent = "Account";
        security_text.textContent = "";
        editor_text.textContent = "";
        appearance_text.textContent = "";
        focus_text.textContent = "";
        help_text.textContent = "";

        account_settings.style.display = "grid";
        security_settings.style.display = "none";
        editor_settings.style.display = "none";
        appearance_settings.style.display = "none";
        focus_settings.style.display = "none";
        help_settings.style.display = "none";
    }
}

function security() {
    security_btn.insertBefore(security_text, security_btn.firstChild);

    account_btn.classList.remove("active");
    security_btn.classList.add("active");
    editor_btn.classList.remove("active");
    appearance_btn.classList.remove("active");
    focus_btn.classList.remove("active");
    help_btn.classList.remove("active");

    if (security_btn.classList.contains("active")) {
        account_text.textContent = "";
        security_text.textContent = "Security";
        editor_text.textContent = "";
        appearance_text.textContent = "";
        focus_text.textContent = "";
        help_text.textContent = "";

        account_settings.style.display = "none";
        security_settings.style.display = "grid";
        editor_settings.style.display = "none";
        appearance_settings.style.display = "none";
        focus_settings.style.display = "none";
        help_settings.style.display = "none";
    }
}

function editor() {
    editor_btn.insertBefore(editor_text, editor_btn.firstChild);

    account_btn.classList.remove("active");
    security_btn.classList.remove("active");
    editor_btn.classList.add("active");
    appearance_btn.classList.remove("active");
    focus_btn.classList.remove("active");
    help_btn.classList.remove("active");

    if (editor_btn.classList.contains("active")) {
        account_text.textContent = "";
        security_text.textContent = "";
        editor_text.textContent = "Editor";
        appearance_text.textContent = "";
        focus_text.textContent = "";
        help_text.textContent = "";

        account_settings.style.display = "none";
        security_settings.style.display = "none";
        editor_settings.style.display = "grid";
        appearance_settings.style.display = "none";
        focus_settings.style.display = "none";
        help_settings.style.display = "none";
    }
}

function appearance() {
    appearance_btn.insertBefore(appearance_text, appearance_btn.firstChild);

    account_btn.classList.remove("active");
    security_btn.classList.remove("active");
    editor_btn.classList.remove("active");
    appearance_btn.classList.add("active");
    focus_btn.classList.remove("active");
    help_btn.classList.remove("active");

    if (appearance_btn.classList.contains("active")) {
        account_text.textContent = "";
        security_text.textContent = "";
        editor_text.textContent = "";
        appearance_text.textContent = "Appearance";
        focus_text.textContent = "";
        help_text.textContent = "";

        account_settings.style.display = "none";
        security_settings.style.display = "none";
        editor_settings.style.display = "none";
        appearance_settings.style.display = "grid";
        focus_settings.style.display = "none";
        help_settings.style.display = "none";
    }
}

function focus() {
    focus_btn.insertBefore(focus_text, focus_btn.firstChild);

    account_btn.classList.remove("active");
    security_btn.classList.remove("active");
    editor_btn.classList.remove("active");
    appearance_btn.classList.remove("active");
    focus_btn.classList.add("active");
    help_btn.classList.remove("active");

    if (focus_btn.classList.contains("active")) {
        account_text.textContent = "";
        security_text.textContent = "";
        editor_text.textContent = "";
        appearance_text.textContent = "";
        focus_text.textContent = "Focus";
        help_text.textContent = "";

        account_settings.style.display = "none";
        security_settings.style.display = "none";
        editor_settings.style.display = "none";
        appearance_settings.style.display = "none";
        focus_settings.style.display = "grid";
        help_settings.style.display = "none";
    }
}

function help() {
    help_btn.insertBefore(help_text, help_btn.firstChild);

    account_btn.classList.remove("active");
    security_btn.classList.remove("active");
    editor_btn.classList.remove("active");
    appearance_btn.classList.remove("active");
    focus_btn.classList.remove("active");
    help_btn.classList.add("active");

    if (help_btn.classList.contains("active")) {
        account_text.textContent = "";
        security_text.textContent = "";
        editor_text.textContent = "";
        appearance_text.textContent = "";
        focus_text.textContent = "";
        help_text.textContent = "Help";

        account_settings.style.display = "none";
        security_settings.style.display = "none";
        editor_settings.style.display = "none";
        appearance_settings.style.display = "none";
        focus_settings.style.display = "none";
        help_settings.style.display = "grid";
    }
}