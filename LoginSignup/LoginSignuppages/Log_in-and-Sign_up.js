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

function go_to_log_in() {
    document.getElementById("sign_up").style.display = "none";
    document.getElementById("log_in").style.display = "flex";
    document.getElementById("redirect_sign_up").style.display = "none";
    document.getElementById("redirect_log_in").style.display = "block";
}

function go_to_sign_up() {
    document.getElementById("log_in").style.display = "none";
    document.getElementById("sign_up").style.display = "flex";
    document.getElementById("redirect_log_in").style.display = "none";
    document.getElementById("redirect_sign_up").style.display = "flex";
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
        const isFormValid = usernameValue !== "" &&
            emailValue !== "" &&
            isEmailValid &&
            passwordValue.length >= 8 &&
            confirmPasswordValue.length >= 8 &&
            passwordValue === confirmPasswordValue;

        signUpBtn.disabled = !isFormValid;
    }

    function validateLogInForm() {
        const usernameValue = loginUsername.value.trim();
        const passwordValue = loginPassword.value.trim();

        const isFormValid = usernameValue !== "" && passwordValue !== ""; //TODO: replace passwordValue !== "" with passwordValue.length > 8

        logInBtn.disabled = !isFormValid;
    }

    const inputsWithNoSpaces = [
        username, email, loginUsername,
        password, loginPassword, confirmPassword
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

async function signup(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("Password").value;
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    const data = {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
    };

    try {
        const response = await fetch("https://localhost:5001/api/Auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            const loginResponse = await fetch("https://localhost:5001/api/Auth/login", {
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
    const password = document.getElementById("login_password").value;

    const data = {
        username: username,
        password: password
    };

    try {
        const response = await fetch("https://localhost:5001/api/Auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.token) {
            console.log("Login successful:", result.message);
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