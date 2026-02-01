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

async function change_email() {
    try {
        const token = localStorage.getItem("token");
        const input = document.getElementById("email_change");

        if (!token) return;

        const response = await fetch("http://localhost:5216/api/account/change_email", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Email: input.value
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        loadEmail();
    } catch (err) {
        console.error("Failed to update email:", err);
    }
}

const blur_background = document.getElementById("blur_background");
const password_change_menu = document.getElementById("password_change_menu");


function blur_backgroundHandler() {
    setTimeout(() => {
        username_input.style.visibility = "visible";
        email_input.style.visibility = "visible";
        const oldPassword_input = document.getElementById("old_password");
        oldPassword_input.value = "";
        oldPassword_input.type = "password";
        const newPassword = document.getElementById("new_password");
        const confirmNewPassword = document.getElementById("confirm_new_password");
        newPassword.value = "";
        confirmNewPassword.value = "";
        newPassword.type = "password";
        confirmNewPassword.type = "password";

        if (password_change_menu.classList.contains("show")) {
            password_change_menu.classList.add("hide");
            password_change_menu.classList.remove("show");
            const eyeIcon = document.getElementById("eye_2");
            const hiddenEyeIcon = document.getElementById("hidden_eye_2");
            eyeIcon.style.display = "inline";
            hiddenEyeIcon.style.display = "none";
            continuePasswordBtn.disabled = true;
        }
        if (change_password_menu.classList.contains("show")) {
            change_password_menu.classList.add("hide");
            change_password_menu.classList.remove("show");
            continuePasswordBtn.disabled = true;
            const savePasswordBtn = document.getElementById("save_password");
            savePasswordBtn.disabled = true;
        }

        blur_background.style.visibility = "hidden";
    }, 100);
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

const username_input = document.getElementById("username_input");
const email_input = document.getElementById("email_input");

function change_password() {
    username_input.style.visibility = "hidden";
    email_input.style.visibility = "hidden";

    password_change_menu.classList.add("show");
    password_change_menu.classList.remove("hide");
    blur_background.style.visibility = "visible";
}

function togglePassword(event) {
    const toggle = event.target.closest("span");
    if (!toggle) return;

    const wrapper = toggle.closest(".password-wrapper");
    if (!wrapper) return;

    const passwordInput = wrapper.querySelector("input");

    const eyeIcon = toggle.querySelector(".eye_icon");
    const hiddenEyeIcon = toggle.querySelector(".hidden_eye_icon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.style.display = "none";
        hiddenEyeIcon.style.display = "inline";
    } else {
        passwordInput.type = "password";
        eyeIcon.style.display = "inline";
        hiddenEyeIcon.style.display = "none";
    }
}

function cancel_password() {
    password_change_menu.classList.add("hide");
    password_change_menu.classList.remove("show");
    username_input.style.visibility = "visible";
    email_input.style.visibility = "visible";
    const oldPassword_input = document.getElementById("old_password");
    oldPassword_input.value = "";
    oldPassword_input.type = "password";
    const eyeIcon = document.getElementById("eye_2");
    const hiddenEyeIcon = document.getElementById("hidden_eye_2");
    eyeIcon.style.display = "inline";
    hiddenEyeIcon.style.display = "none";
    blur_backgroundHandler();
}

const oldPassword = document.getElementById("old_password");
const continuePasswordBtn = document.getElementById("continue_password");

continuePasswordBtn.disabled = true;

oldPassword.addEventListener("input", oldPasswordValidation);

function oldPasswordValidation() {
    const password = oldPassword.value;

    const longEnough = password.length >= 8;
    const noSpaces = !password.includes(" ");

    if (longEnough && noSpaces) {
        continuePasswordBtn.disabled = false;
    } else {
        continuePasswordBtn.disabled = true;
    }
}

const change_password_menu = document.getElementById("change_password");

async function continue_password() { //*This will check if the password that the user entere is the same with the one in the DB
    const oldPassword = document.getElementById("old_password").value.trim();
    if (!oldPassword) return;

    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5216/api/account/check_password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ Password: oldPassword }) // matches your DTO
    });

    const result = await response.json();

    if (!result.valid) {
        alert("Wrong password");
        return;
    }

    change_password_menu.classList.add("show");
    change_password_menu.classList.remove("hide");
    password_change_menu.classList.add("hide");
    password_change_menu.classList.remove("show");
}

function cancel_password_change() {
    change_password_menu.classList.add("hide");
    change_password_menu.classList.remove("show");
    password_change_menu.classList.add("show");
    password_change_menu.classList.remove("hide");
    oldPassword.value = "";
    continuePasswordBtn.disabled = true;
}

async function save_password() {
    const newPassword = document.getElementById("new_password");
    const confirmNewPassword = document.getElementById("confirm_new_password");

    if (!newPassword || !confirmNewPassword) {
        console.error("Password inputs not found");
        return;
    }

    const password = newPassword.value;
    const confirm = confirmNewPassword.value;

    if (password.length < 8 || password.includes(" ")) {
        alert("Password too short or contains spaces");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5216/api/account/change_password", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Password: password })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        change_password_menu.classList.add("hide");
        change_password_menu.classList.remove("show");
        blur_backgroundHandler();
    } catch (err) {
        console.error(err);
        alert("Failed to change password");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const newPassword = document.getElementById("new_password");
    const confirmNewPassword = document.getElementById("confirm_new_password");
    const savePasswordBtn = document.getElementById("save_password");

    savePasswordBtn.disabled = true;

    if (!newPassword || !confirmNewPassword || !savePasswordBtn) return;

    newPassword.addEventListener("input", validateNewPasswordForm);
    confirmNewPassword.addEventListener("input", validateNewPasswordForm);

    function validateNewPasswordForm() {
        const password = newPassword.value;
        const confirmPassword = confirmNewPassword.value;

        const longEnough = password.length >= 8;
        const noSpaces = !password.includes(" ");
        const passwordsMatch = password === confirmPassword;

        savePasswordBtn.disabled = !(longEnough && noSpaces && passwordsMatch);
    }
});






//* Here will be all functions for the account settings menu



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