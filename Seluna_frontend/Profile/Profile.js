const setting_page = document.getElementById("setting_page");
const username_text = document.getElementById("username");
const username_edit = document.getElementById("username_edit");
const blur_background = document.getElementById("blur_background");
const continue_edit = document.getElementById("continue_edit");

document.addEventListener("DOMContentLoaded", loadUsername );

function loadUsername() { //*Will get the username from the DB
    const username_data = "user_333333";


    username_text.textContent = username_data;
    console.log("Username is:", username_data);
}

function account() {
    console.log("Account settings opened");
    const account = document.getElementById("account");
    account.style.backgroundColor = "#251e45";
}