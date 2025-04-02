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
    document.getElementById("log_ig").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    const password = document.getElementById("Password");
    const confirmPassword = document.getElementById("confirmPassword");
    const signUpBtn = document.getElementById("sign_up_btn");

    function validatePasswords() {
        const password = document.getElementById("Password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        document.getElementById("sign_up_btn").disabled = password !== confirmPassword || password === "";
    }

    password.addEventListener("input", validatePasswords);
    confirmPassword.addEventListener("input", validatePasswords);
});