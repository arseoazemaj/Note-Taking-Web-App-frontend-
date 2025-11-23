const menu = document.getElementById("sub-menu_icon");
menu.addEventListener('touchstart', openMenu);
const container = document.getElementById("container");
const blur_background = document.getElementById("blur_background");
blur_background.addEventListener('touchstart', closeMenu);

function openMenu() {
    container.classList.remove("hide_menu");
    container.classList.add("show_menu");
    blur_background.style.visibility = "visible";
}

const lock_bg = document.getElementById("lock_bg");

function closeMenu() {
    setTimeout(() => {
        container.classList.remove("show_menu");
        container.classList.add("hide_menu");
        lock_bg.style.visibility = "hidden";
        blur_background.style.visibility = "hidden";
    }, 100);
}

blur_background.addEventListener('touchstart', closeMenus);

function closeMenus() {
    closeMenu();
    lock_menu.classList.add("hide_lock_menu");
    lock_menu.classList.remove("show_lock_menu");
}

async function save() { //* Save the note
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const user_id = getUserIdFromToken();
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
        title: Title,
        content: Content,
        user_id: user_id,
        isImportant: isImportant,
        created_at: new Date().toISOString()
    };

    try {
        const response = await fetch("http://localhost:5216/api/Notes/create_note", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(note)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorData}`);
        }

        window.location.href = "../Notes/Notes.html";

    } catch (error) {
        console.error("Error saving note:", error);
        alert("There was an error saving your note. Please try again.");
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

function lock() {
    const lock_menu = document.getElementById("lock_menu");
    lock_menu.classList.add("show_lock_menu");
    lock_menu.classList.remove("hide_lock_menu");
    lock_menu_lock_password.classList.add("hide_lock_menu");
    lock_menu_lock_password.classList.remove("show_lock_menu");
    lock_bg.style.visibility = "visible";
}

const passwordInput = document.getElementById("lock_password");
const passwordConfirmInput = document.getElementById("confirm_lock_password");

lock_bg.addEventListener('touchstart', closelockMenuBG);

function closelockMenuBG() {
    lock_menu.classList.add("hide_lock_menu");
    lock_menu.classList.remove("show_lock_menu");
    lock_menu_lock_password.classList.add("hide_lock_menu");
    lock_menu_lock_password.classList.remove("show_lock_menu");
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    closeMenu();
}

const close_lock_menu = document.getElementById("not_lock");
close_lock_menu.addEventListener('touchstart', closelockMenu);

function closelockMenu() {
    lock_menu.classList.add("hide_lock_menu");
    lock_menu.classList.remove("show_lock_menu");
    lock_menu_lock_password.classList.add("hide_lock_menu");
    lock_menu_lock_password.classList.remove("show_lock_menu");
    lock_bg.style.visibility = "hidden";
}

const continue_lock = document.getElementById("do_lock");
continue_lock.addEventListener('touchstart', continueLock);

const lock_menu_lock_password = document.getElementById("lock_password_menu");

function continueLock() {
    lock_menu_lock_password.classList.add("show_lock_menu");
    lock_menu_lock_password.classList.remove("hide_lock_menu");
    lock_menu.style.visibility = "hidden";
}

const cancel_lock_password = document.getElementById("cancel_lock");
cancel_lock_password.addEventListener('touchstart', cancelLockPassword);

function cancelLockPassword() {
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    lock_menu_lock_password.classList.add("hide_lock_menu");
    lock_menu_lock_password.classList.remove("show_lock_menu");
}

const confirm_lock_password = document.getElementById("continue_lock");
confirm_lock_password.disabled = true;

function validatePasswordInput() {
    const passwordInput = document.getElementById("lock_password").value;
    const passwordConfirmInput = document.getElementById("confirm_lock_password").value;

    const noSpaces = !passwordInput.includes(" ") && !passwordConfirmInput.includes(" ");
    const lock_password_Filled = passwordInput.length > 0 && passwordConfirmInput.length > 0;
    const longEnough_lock_passwords = passwordInput.length >= 8 && passwordConfirmInput.length >= 8;
    const lock_match = passwordInput === passwordConfirmInput;

    if (lock_password_Filled && longEnough_lock_passwords && lock_match && noSpaces) {
        confirm_lock_password.disabled = false;
    } else {
        confirm_lock_password.disabled = true;
    }
}


async function deleteNote() { //*Moves the note to trash
    const token = localStorage.getItem("token");

    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const isImportant = filled;

    if (Content === "" && Title === "") {
        window.location.href = "../Notes/Notes.html";
    }
    else {
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
}

//*Used to save the notes in local storage for testing purposes (will be deleted in the end)*//
document.getElementById('save').addEventListener('click', function() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('note_input').value.trim();

    if (content === "") {
        alert("Please enter some content before saving.");
        return;
    }

    const isImportant = filled;

    const note = {
        title: title,
        content: content,
        isImportant: isImportant
    };

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.push(note);

    localStorage.setItem('notes', JSON.stringify(notes));

    window.location.href = "../Notes/Notes.html";
});