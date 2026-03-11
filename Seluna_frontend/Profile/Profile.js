const username = document.getElementById("username");

document.addEventListener("DOMContentLoaded", first );

function first() {
    loadEmail();
    account();
}


function profile_icon() {
    const change_icon = document.getElementById("change_icon");
    change_icon.classList.add("show");
    change_icon.classList.remove("hide");
    blur_background.style.visibility = "visible";
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

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email_change");
    const changeEmailBtn = document.getElementById("change_email_btn");

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test(email)) {
            changeEmailBtn.classList.remove("disabled");
        } else {
            changeEmailBtn.classList.add("disabled");
        }
    }

    emailInput.addEventListener("input", validateEmail);

});

async function change_email() { //*Will have something to verify the email later*
    try {
        const token = localStorage.getItem("token");
        const input = document.getElementById("email_change");
        const changeEmailBtn = document.getElementById("change_email_btn");

        if (!token) return;
        if (changeEmailBtn.classList.contains("disabled")) return;

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
        const oldPassword_input = document.getElementById("old_password");
        oldPassword_input.value = "";
        oldPassword_input.type = "password";
        const newPassword = document.getElementById("new_password");
        const confirmNewPassword = document.getElementById("confirm_new_password");
        newPassword.value = "";
        confirmNewPassword.value = "";
        newPassword.type = "password";
        confirmNewPassword.type = "password";

        if (account_settings.style.visibility === "visible") {
            username_input.style.visibility = "visible";
            email_input.style.visibility = "visible";
        }

        const change_icon = document.getElementById("change_icon");

        if (change_icon.classList.contains("show")) {
            change_icon.classList.add("hide");
            change_icon.classList.remove("show");
        }

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
        if (log_out_page.classList.contains("show")) {
            log_out_page.classList.add("hide");
            log_out_page.classList.remove("show");
        }
        if (delete_page.classList.contains("show")) {
            delete_page.classList.add("hide");
            delete_page.classList.remove("show");
        }
        if (continue_delete_page.classList.contains("show")) {
            continue_delete_page.classList.add("hide");
            continue_delete_page.classList.remove("show");
            delete_password_input.value = "";
            delete_password_input.type = "password";
            const eyeIcon = document.getElementById("eye_4");
            const hiddenEyeIcon = document.getElementById("hidden_eye_4");
            eyeIcon.style.display = "inline";
            hiddenEyeIcon.style.display = "none";
            delete_btn.disabled = true;
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
    account_btn.style.backgroundColor = "#251e45";
        username_input.style.visibility = "visible";
        email_input.style.visibility = "visible";

    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "transparent";

    account_settings.style.visibility = "visible";
    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "hidden";
}

const username_input = document.getElementById("username_input");
const email_input = document.getElementById("email_input");

function change_password() {
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
        body: JSON.stringify({ Password: oldPassword })
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

const log_out_page = document.getElementById("log_out_page");
function open_log_out() {
    log_out_page.classList.add("show");
    log_out_page.classList.remove("hide");
    blur_background.style.visibility = "visible";
}

function do_not_log_out() {
    blur_backgroundHandler();
}

function do_log_out() {
    localStorage.removeItem("token");
    window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
}

const delete_page = document.getElementById("delete_page");
function open_delete_account() {
    delete_page.classList.add("show");
    delete_page.classList.remove("hide");
    blur_background.style.visibility = "visible";
}

function cancel_delete() {
    blur_backgroundHandler();
}

const continue_delete_page = document.getElementById("continue_delete_page");
function continue_delete() {
    continue_delete_page.classList.add("show");
    continue_delete_page.classList.remove("hide");
    setTimeout(() => {        
        delete_page.style.visibility = "hidden";
        delete_page.classList.remove("show");
    }, 170);
}

const delete_password_input = document.getElementById("confirm_delete_password");
const delete_btn = document.getElementById("do_delete");

function do_not_delete() {
    open_delete_account();
    continue_delete_page.classList.add("hide");
    continue_delete_page.classList.remove("show");
    delete_password_input.value = "";
    delete_password_input.type = "password";
    const eyeIcon = document.getElementById("eye_4");
    const hiddenEyeIcon = document.getElementById("hidden_eye_4");
    eyeIcon.style.display = "inline";
    hiddenEyeIcon.style.display = "none";
    delete_btn.disabled = true;
}
delete_btn.disabled = true;

delete_password_input.addEventListener("input", deletePasswordValidation);

function deletePasswordValidation() {
    const password = delete_password_input.value.trim();

    const longEnough = password.length >= 8;
    const noSpaces = !password.includes(" ");

    if (longEnough && noSpaces) {
        delete_btn.disabled = false;
    } else {
        delete_btn.disabled = true;
    }
}

async function do_delete() {
    const delete_password_input = document.getElementById("confirm_delete_password");
    const password = delete_password_input.value.trim();

    console.log("Current password is: " + password);
}





//* Here will be all functions for the account settings menu



function note() {
    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "#251e45";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "transparent";

    account_settings.style.visibility = "hidden";
        username_input.style.visibility = "hidden";
        email_input.style.visibility = "hidden";

    note_settings.style.visibility = "visible";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "hidden";
}

function backup() {
    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "#251e45";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "transparent";

    account_settings.style.visibility = "hidden";
        username_input.style.visibility = "hidden";
        email_input.style.visibility = "hidden";

    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "visible";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "hidden";
}

function security() {
    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "#251e45";
    help_btn.style.backgroundColor = "transparent";

    account_settings.style.visibility = "hidden";
        username_input.style.visibility = "hidden";
        email_input.style.visibility = "hidden";

    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "visible";
    help_settings.style.visibility = "hidden";
}

function help() {
    account_btn.style.backgroundColor = "transparent";
    note_btn.style.backgroundColor = "transparent";
    backup_btn.style.backgroundColor = "transparent";
    security_btn.style.backgroundColor = "transparent";
    help_btn.style.backgroundColor = "#251e45";

    account_settings.style.visibility = "hidden";
        username_input.style.visibility = "hidden";
        email_input.style.visibility = "hidden";

    note_settings.style.visibility = "hidden";
    backup_settings.style.visibility = "hidden";
    security_settings.style.visibility = "hidden";
    help_settings.style.visibility = "visible";
}