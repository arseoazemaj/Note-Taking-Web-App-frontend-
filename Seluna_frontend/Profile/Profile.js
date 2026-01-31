const username = document.getElementById("username");

document.addEventListener("DOMContentLoaded", loadUsername );

async function loadUsername() {
    try {
        const token = localStorage.getItem("token");
        const username_input = document.getElementById("username_change");
        if (!token) {
            console.error("No JWT token found");
            return;
        }

        const response = await fetch("http://localhost:5216/api/account/username", {
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
        username_input.value = data.username;
    } catch (error) {
        console.error("Failed to load username:", error);
    }
    account();
}

const account_settings = document.getElementById("account_settings");
const account_btn = document.getElementById("account");
const note_settings = document.getElementById("note_settings");
const note_btn = document.getElementById("note");

const backup_settings = document.getElementById("backup_settings");
const backup_btn = document.getElementById("backup");

const security_settings = document.getElementById("security_settings");
const security_btn = document.getElementById("security");

const help_settings = document.getElementById("help_settings");
const help_btn = document.getElementById("help");

function account() {
    account_settings.style.visibility = "visible";
    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "hidden";

    account_btn.style.backgroundColor = "#251e45";
    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "transparent";
}

function change_name() {
    console.log("Change name clicked");
}

function note() {
    account_settings.style.visibility = "hidden";
    note_settings.style.visibility = "visible";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "hidden";

    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "#251e45";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "transparent";
}

function backup() {
    account_settings.style.visibility = "hidden";
    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "visible";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "hidden";

    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "#251e45";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "transparent";
}

function security() {
    account_settings.style.visibility = "hidden";
    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "visible";
    help_settings.style.visibility = "hidden";

    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "#251e45";
    help_btn.style.backgroundColor = "transparent";
}

function help() {
    account_settings.style.visibility = "hidden";
    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "visible";

    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "#251e45";
}