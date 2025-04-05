function togglePassword(inputId, eyeId, hiddenEyeId) {
    var passwordInput = document.getElementById(inputId);
    var eyeIcon = document.getElementById(eyeId);
    var hiddenEyeIcon = document.getElementById(hiddenEyeId);

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

function go_to_log_in(){
    document.getElementById("sign_up").style.display = "none";
    document.getElementById("log_ig").style.display = "flex";
    document.getElementById("redirect_sign_up").style.display = "none";
    document.getElementById("redirect_log_in").style.display = "block";
}

function go_to_sign_up(){
    document.getElementById("log_ig").style.display = "none";
    document.getElementById("sign_up").style.display = "flex";
    document.getElementById("redirect_log_in").style.display = "none";
    document.getElementById("redirect_sign_up").style.display = "flex";
}

document.addEventListener("DOMContentLoaded", function () {
    //* Sign up
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("Password");
    const confirmPassword = document.getElementById("confirmPassword");
    const signUpBtn = document.getElementById("sign_up_btn");
    
    //* Log in
    const loginUsername = document.getElementById("login_username");
    const loginPassword = document.getElementById("login_password");
    const logInBtn = document.getElementById("log_ig_btn");
    
    //* Email validation
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
            passwordValue !== "" &&
            confirmPasswordValue !== "" &&
            passwordValue === confirmPasswordValue;

        signUpBtn.disabled = !isFormValid;
    }

    function validateLogInForm() {
        const usernameValue = loginUsername.value.trim();
        const passwordValue = loginPassword.value.trim();

        const isFormValid = usernameValue !== "" && passwordValue !== "";

        logInBtn.disabled = !isFormValid;
    }

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

    window.togglePassword = function (inputId, eyeIconId, hiddenEyeIconId) {
        const passwordInput = document.getElementById(inputId);
        const eyeIcon = document.getElementById(eyeIconId);
        const hiddenEyeIcon = document.getElementById(hiddenEyeIconId);

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
});


document.addEventListener("DOMContentLoaded", function () {
    const inputsWithNoSpaces = [
        document.getElementById("username"),
        document.getElementById("email"),
        document.getElementById("login_username"),
        document.getElementById("Password"),
        document.getElementById("login_password"),
        document.getElementById("confirmPassword"),
    ];

    inputsWithNoSpaces.forEach(input => {
        input.addEventListener("keypress", function (e) {
            if (e.key === " ") {
                e.preventDefault();
            }
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const signupBtn = document.getElementById("sign_up_btn");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("Password");
    const confirmPassword = document.getElementById("confirmPassword");

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
            passwordValue !== "" &&
            confirmPasswordValue !== "" &&
            passwordValue === confirmPasswordValue;

        signupBtn.disabled = !isFormValid;
    }

    if (username && email && password && confirmPassword) {
        username.addEventListener("input", validateSignUpForm);
        email.addEventListener("input", validateSignUpForm);
        password.addEventListener("input", validateSignUpForm);
        confirmPassword.addEventListener("input", validateSignUpForm);
    }
});

function signup() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("Password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const data = {
        Username: username,
        Email: email,
        Password: password,
        ConfirmPassword: confirmPassword
    };

    fetch('https://localhost:7093/api/Auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Signup successful!") {
            alert('Signup successful! Redirecting to login page...');
            window.location.href = '/login';
        } else {
            alert(data.message || 'An error occurred');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error with the signup process.');
    });
}