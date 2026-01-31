const username = document.getElementById("username");

document.addEventListener("DOMContentLoaded", first );

function first() {
    loadUsername();
    loadEmail();
    account();
}

async function loadUsername() {
    try {
        const token = localStorage.getItem("token");
        const username_input = document.getElementById("username_change");
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
        username_input.value = data.username;
    } catch (error) {
        console.error("Failed to load username:", error);
    }
}

async function loadEmail() {
    try {
        const token = localStorage.getItem("token");
        const email_input = document.getElementById("email_change");
        if (!token) {
            console.error("No JWT token found");
            return;
        }

        const response = await fetch("http://localhost:5216/api/account/get_email", {
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
        email_input.value = data.email;
    } catch (error) {
        console.error("Failed to load email:", error);
    }
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

async function change_name() {
    try {
        const token = localStorage.getItem("token");
        const input = document.getElementById("username_change");

        if (!token) return;

        const response = await fetch("http://localhost:5216/api/account/change_username", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Username: input.value
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        loadUsername();
    } catch (err) {
        console.error("Failed to update username:", err);
    }
}







//* Here will me all functions for the account settings menu

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