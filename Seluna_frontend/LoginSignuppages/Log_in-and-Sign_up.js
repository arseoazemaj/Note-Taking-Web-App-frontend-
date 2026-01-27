function togglePassword(inputId, eyeId, hiddenEyeId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(eyeId);
    const hiddenEyeIcon = document.getElementById(hiddenEyeId);

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

const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("Password");
const confirmPassword = document.getElementById("confirmPassword");
const eye_1 = document.getElementById("eye-icon-1");
const hidden_eye_1 = document.getElementById("hidden-eye-icon-1");
const eye_2 = document.getElementById("eye-icon-2");
const hidden_eye_2 = document.getElementById("hidden-eye-icon-2");

const loginUsername = document.getElementById("login_username");
const loginPassword = document.getElementById("login_password");
const eye_3 = document.getElementById("eye-icon-3");
const hidden_eye_3 = document.getElementById("hidden-eye-icon-3");

function go_to_log_in() {
    document.getElementById("sign_up").style.display = "none";
    document.getElementById("log_in").style.display = "flex";
    document.getElementById("redirect_sign_up").style.display = "none";
    document.getElementById("redirect_log_in").style.display = "block";
    username.value = "";
    email.value = "";
    password.value = "";
    confirmPassword.value = "";
    password.type = "password";
    confirmPassword.type = "password";
    eye_1.style.display = "inline";
    hidden_eye_1.style.display = "none";
    eye_2.style.display = "inline";
    hidden_eye_2.style.display = "none";
}

function go_to_sign_up() {
    document.getElementById("log_in").style.display = "none";
    document.getElementById("sign_up").style.display = "flex";
    document.getElementById("redirect_log_in").style.display = "none";
    document.getElementById("redirect_sign_up").style.display = "flex";
    loginUsername.value = "";
    loginPassword.value = "";
    password.type = "password";
    confirmPassword.type = "password";
    eye_3.style.display = "inline";
    hidden_eye_3.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("Password");
    const confirmPassword = document.getElementById("confirmPassword");
    const signUpBtn = document.getElementById("sign_up_btn");

    const loginUsername = document.getElementById("login_username");
    const loginPassword = document.getElementById("login_password");
    const logInBtn = document.getElementById("log_in_btn");

    function isValidEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    function validateSignUpForm() {
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value;
        const confirmPasswordValue = confirmPassword.value;

        const isEmailValid = isValidEmail(emailValue);
        const isFormValid = usernameValue !== "" && emailValue !== "" && isEmailValid && passwordValue.length >= 8 && confirmPasswordValue.length >= 8 && passwordValue === confirmPasswordValue;

        signUpBtn.disabled = !isFormValid;
    }

    function validateLogInForm() {
        const usernameValue = loginUsername.value.trim();
        const passwordValue = loginPassword.value.trim();

        const isFormValid = usernameValue !== "" && passwordValue !== ""; //TODO: replace passwordValue !== "" with passwordValue.length >= 8

        logInBtn.disabled = !isFormValid;
    }

    const inputsWithNoSpaces = [
        username,
        email,
        loginUsername,
        password,
        loginPassword,
        confirmPassword
    ];

    inputsWithNoSpaces.forEach(input => {
        if (input) {
            input.addEventListener("keypress", function (e) {
                if (e.key === " ") {
                    e.preventDefault();
                }
            });
        }
    });

    if (username && email && password && confirmPassword) {
        username.addEventListener("input", validateSignUpForm);
        email.addEventListener("input", validateSignUpForm);
        password.addEventListener("input", validateSignUpForm);
        confirmPassword.addEventListener("input", validateSignUpForm);
    }

    if (loginUsername && loginPassword) {
        loginUsername.addEventListener("input", validateLogInForm);
        loginPassword.addEventListener("input", validateLogInForm);
    }
});

const sanitize_2 = str => str.replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, "");

async function signup(event) {
    event.preventDefault();

    const username_input = document.getElementById("username").value.trim();
    const email_input = document.getElementById("email").value.trim();
    const password_input = document.getElementById("Password").value;
    const confirmPassword_input = document.getElementById("confirmPassword").value;
    const username = sanitize_2(username_input);
    const email = sanitize_2(email_input);
    const password = sanitize_2(password_input);
    const confirmPassword = sanitize_2(confirmPassword_input);

    const data = {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
    };

    try {
        const response = await fetch("http://localhost:5216/api/Auth/sign_up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            const loginResponse = await fetch("http://localhost:5216/api/Auth/log_in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            });

            const loginResult = await loginResponse.json();

            if (loginResponse.ok && loginResult.token) {
                localStorage.setItem("token", loginResult.token);
                window.location.href = "../Notes/Notes.html";
            } else {
                alert("Signup succeeded but auto-login failed: " + (loginResult.message || "Unknown error"));
                go_to_log_in();
            }

        } else {
            const message = result.message?.toLowerCase() || "";

            if (response.status === 507 || message.includes("storage") || message.includes("space")) {
                alert("Your sign-up couldn't proceed because Seluna's database is currently full and cannot store new accounts. We're working on expanding it — please try again later.");
            } else {
                alert("Signup failed: " + (result.message || "Unknown error"));
            }
        }

    } catch (error) {
        console.error("Error during sign up:", error);
        alert("An error occurred. Please try again.");
    }
}

async function login(event) {
    event.preventDefault();

    const username = document.getElementById("login_username").value.trim();
    const password_input = document.getElementById("login_password").value;
    const password = sanitize_2(password_input);
    const data = {
        username: username,
        password: password
    };

    try {
        const response = await fetch("http://localhost:5216/api/Auth/log_in", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.token) {
            localStorage.setItem("token", result.token);
            window.location.href = "../Notes/Notes.html";
        } else {
            alert(result.message || "Login failed.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again later.");
    }
}