const back_2 = document.getElementById("back_2");
const setting_page = document.getElementById("setting_page");
const username_edit = document.getElementById("username_edit");
const blur_background = document.getElementById("blur_background");
const continue_edit = document.getElementById("continue_edit");

function open_settings() {
    setting_page.style.visibility = "visible";
}

function change_name() {
    blur_background.style.visibility = "visible";
    username_edit.classList.remove("hide");
    username_edit.classList.add("show");
    continue_edit.disabled = true;
    console.log("changing name...");
}

function blur_backgroundHandler() {
    blur_background.style.visibility = "hidden";
    username_edit.classList.add("hide");
    username_edit.classList.remove("show");
}

function cancel_change() {
    blur_background.style.visibility = "hidden";
    username_edit.classList.add("hide");
    username_edit.classList.remove("show");
}