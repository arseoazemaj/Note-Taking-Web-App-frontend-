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