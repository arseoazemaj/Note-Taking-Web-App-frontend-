document.addEventListener("DOMContentLoaded", async function () { //*Loads the note *//
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get("id");

    if (!noteId) {
        console.error("No note ID found in URL");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5216/api/Notes/get_note/${noteId}`, {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("Failed to load note: " + response.status);
            return;
        }

        const note = await response.json();

        document.getElementById("title").value = note.title;
        document.getElementById("note_input").value = note.content;

        if (note.isImportant) {
            document.getElementById("important-icon").style.fill = "#dda9ff";
            filled = true;
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
});

const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get("id");
const menu = document.getElementById("sub-menu_icon");
menu.addEventListener("touchstart", openMenu);
const container = document.getElementById("container");
const blur_background = document.getElementById("blur_background");
blur_background.addEventListener("touchstart", closeMenu);

const lock_bg = document.getElementById("lock_bg");

const close_lock_menu = document.getElementById("not_lock");
const continue_lockBtn = document.getElementById("do_lock");
const lock_menu_lock_password = document.getElementById("lock_password_menu");
const cancel_lock_password = document.getElementById("cancel_lock");
const confirm_lock_password = document.getElementById("continue_lock");
confirm_lock_password.disabled = true;

function openMenu() {
    container.classList.remove("hide_menu");
    container.classList.add("show_menu");
    blur_background.style.visibility = "visible";
}

function closeMenu() {
        container.classList.remove("show_menu");
        container.classList.add("hide_menu");
        lock_bg.style.visibility = "hidden";
        blur_background.style.visibility = "hidden";
}

async function update(noteId) { //*Update the note
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const isImportant = filled;

    if (Content === "") {
        alert("Please enter some content before saving the note.");
        return;
    }

    if (!navigator.onLine) {
        alert("Your device is currently offline. Please connect to the internet to save your notes.");
        return;
    }

    const note = {
        id: noteId,
        title: Title,
        content: Content,
        isImportant: isImportant,
        updated_at: new Date().toISOString(),
        isLocked: isLocked,
        lock_password: lock_password
    };

    try {
        const response = await fetch("http://localhost:5216/api/Notes/edit_note", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(note)
        });

        if (response.status === 507 || message.includes("storage") || message.includes("space")) {
            alert("Your note couldn't be updated because Seluna's database is currently full and cannot store new notes. We're working on expanding it — please try again later.");
        }

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorData}`);
        }

        window.location.href = "../Notes/Notes.html";

    } catch (error) {
        console.error("Error updating note:", error);
        alert("There was an error updating your note. Please try again.");
    }
}

let filled = false;

function fill() {
    const icon = document.getElementById("important-icon");
    
    if (filled) {
        icon.style.fill = "none";
    }
    else {
        icon.style.fill = "#dda9ff";
    }
    
    filled = !filled;
}

//*Fix lock for locked notes (you can't lock a note that is already locked)

function lock() {
        const lock_menu = document.getElementById("lock_menu");
        lock_menu.classList.add("show_lock_menu");
        lock_menu.classList.remove("hide_lock_menu");
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
        lock_bg.style.visibility = "visible";
}

function closelockMenuBG() {
    lock_menu.classList.add("hide_lock_menu");
    lock_menu.classList.remove("show_lock_menu");
    lock_menu_lock_password.classList.add("hide_lock_menu");
    lock_menu_lock_password.classList.remove("show_lock_menu");
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    closeMenu();
}

function closelockMenu() {
        lock_menu.classList.add("hide_lock_menu");
        lock_menu.classList.remove("show_lock_menu");
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
        lock_bg.style.visibility = "hidden";
}

function continueLock() {
        lock_menu_lock_password.classList.add("show_lock_menu");
        lock_menu_lock_password.classList.remove("hide_lock_menu");
}

function cancelLockPassword() {
        passwordInput.value = "";
        passwordConfirmInput.value = "";
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
}

const passwordInput = document.getElementById("lock_password");
const passwordConfirmInput = document.getElementById("confirm_lock_password");
const continueLockBtn = document.getElementById("continue_lock");
continueLockBtn.disabled = true;

function validatePasswordInput() {
    const password = passwordInput.value;
    const confirmPassword = passwordConfirmInput.value;

    const noSpaces = !password.includes(" ") && !confirmPassword.includes(" ");
    const lock_password_Filled = password.length > 0 && confirmPassword.length > 0;
    const longEnough_lock_passwords = password.length >= 8 && confirmPassword.length >= 8;
    const lock_match = password === confirmPassword;

    if (lock_password_Filled && longEnough_lock_passwords && lock_match && noSpaces) {
        continueLockBtn.disabled = false;
    } else {
        continueLockBtn.disabled = true;
    }
}

passwordInput.addEventListener("input", validatePasswordInput);
passwordConfirmInput.addEventListener("input", validatePasswordInput);

let lock_password = "";
let isLocked = false;

function confirmLock() {
    lock_password = sanitize(passwordInput.value);
    isLocked = true;
    closelockMenuBG();
    update(noteId);
}

//*Download

async function deleteNote() { //*Moves the note to trash
    const token = localStorage.getItem("token");
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const isImportant = filled;

    try {
        const response = await fetch("http://localhost:5216/api/Notes/delete_note", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id: noteId,
                title: Title,
                Content: Content,
                isDeleted: true,
                deleted_at: new Date().toISOString(),
                isImportant: isImportant
            })
        });

        if (response.ok) {
            window.location.href = "../Notes/Notes.html";
        } else {
            const error = await response.text();
            alert("Failed to delete note: " + error);
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please check your internet connection or try again later.");
    }
}