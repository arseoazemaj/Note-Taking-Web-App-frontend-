function togglePassword(inputId, eyeIconId, hiddenEyeIconId) {
    var passwordInput = document.getElementById(inputId);
    var eyeIcon = document.getElementById(eyeIconId);
    var hiddenEyeIcon = document.getElementById(hiddenEyeIconId);

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