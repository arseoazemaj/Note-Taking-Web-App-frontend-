const back_2 = document.getElementById("back_2");
const setting_page = document.getElementById("setting_page");
const username_edit = document.getElementById("username_edit");
const blur_background = document.getElementById("blur_background");

function open_settings() {
    setting_page.style.visibility = "visible";
}

function change_name() {
    blur_background.style.visibility = "visible";
    username_edit.classList.remove("hide");
    username_edit.classList.add("show");
    console.log("changing name...");
}

function blur_backgroundHandler() {
    blur_background.style.visibility = "hidden";
    username_edit.classList.add("hide");
    username_edit.classList.remove("show");
}