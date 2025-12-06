const menu = document.getElementById("sub-menu_icon");
const container = document.getElementById("container");
const blur_background = document.getElementById("blur_background");

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
    setTimeout(() => {
        container.classList.remove("show_menu");
        container.classList.add("hide_menu");
        lock_bg.style.visibility = "hidden";
        blur_background.style.visibility = "hidden";
    }, 10);
}

async function save() { //* Save the note
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const user_id = getUserIdFromToken();
    const isImportant = filled;
    const lock_password_value = lock_password;

    // if (Content === "") {
    //     alert("Please enter some content before saving the note.");
    //     return;
    // }

    if (!navigator.onLine) {
        alert("Your device is currently offline. Please connect to the internet to save your notes.");
        return;
    }

    console.log("Lock password value from save:", lock_password);

    const note = {
        title: Title,
        content: Content,
        user_id: user_id,
        isImportant: isImportant,
        created_at: new Date().toISOString(),
        lock_password: lock_password
    };

    try {
        const response = await fetch("http://localhost:5216/api/Notes/create_notesssss", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
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
    setTimeout(() => {
        const lock_menu = document.getElementById("lock_menu");
        lock_menu.classList.add("show_lock_menu");
        lock_menu.classList.remove("hide_lock_menu");
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
        lock_bg.style.visibility = "visible";
    }, 150);
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
    setTimeout(() => {
        lock_menu.classList.add("hide_lock_menu");
        lock_menu.classList.remove("show_lock_menu");
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
        lock_bg.style.visibility = "hidden";
    }, 150);
}

function continueLock() {
    setTimeout(() => {
        lock_menu_lock_password.classList.add("show_lock_menu");
        lock_menu_lock_password.classList.remove("hide_lock_menu");
    }, 150);
}

function cancelLockPassword() {
    setTimeout(() => {
        passwordInput.value = "";
        passwordConfirmInput.value = "";
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
    }, 150);
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

let lock_password = ""; //Variable to be used in the save() function
let isLocked = false; //Variable to be used in the save() function

function confirmLock() {
    console.log("Locking the nore...");

    lock_password = sanitize(passwordInput.value);
    isLocked = true;

    console.log("Lock password set to:", lock_password);
    console.log("Is Locked set to:", isLocked);

    //* save();

    //* lock();
    
    //* save(); //Would save the note and create a id for it
    //* lock(); //would get that id and put a lock on it
    //But how wold the lock() function get the id of the note?
    //Maybe search the db and find the biggest id with that user_id and assume that is the one we created?
    
    //Another way
    //* lock();
    //* save();
    //lock() won't lock the note it would just create the password and save it in a variable or something
    //save() that would save the note and get the password from the variable and lock the note while saving it
    //So the lock() function would create the password and save them in a variable and also woulf make a variable like isLocked = true
    //Than the save() function would do what it does like normal (get the content title etc) but also would get the password from the variable
    //and the isLocked value and save them in the db

    //Functions to be created by lock():
    //lock_password and isLocked variables

    //lock_password would have the value of the password only if both the password and confirm_password fields are fillled and match eachother
    //is_locked would be true only if both fields are filled match and the lock button is pressed
    //Otherwise lock_password would be null and is_locked would be false
    //and those actions would take place when the save() function is called
    //If the user decides to cancel the locking process they can press the cancel button and the vaiables would go back to null and false
    //That can only happen before the save() function is called
    //If the user calls the lock() function and than call the cancelLock() function the variables would be reset to their default state
    //But whe the user would press the lock() button that would hide the page and the only way to go back is by the menu button but when the users would go back there
    //It would confuse them if they want to cancel the locking process because the input fields would be empty and give them the impression that they didn't
    //didn't put a lock on the note

    //What about doing this:
    //When on the lock page the user would fill the input fields for the password and when they would press the lock button it would run the lock() function
    //First that function would check the passwords if they are valid or not, if they are valid it would save that value to a variable and set isLocked = true
    //Than it would call the save() function and the save function would get those values and save them together with the other values lice title content and more

    

    
    
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
document.getElementById("save").addEventListener("click", function() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("note_input").value.trim();

    if (content === "") {
        return;
    }

    const isImportant = filled;

    const note = {
        title: title,
        content: content,
        isImportant: isImportant
    };

    let notes = JSON.parse(localStorage.getItem("notes")) || [];

    notes.push(note);

    localStorage.setItem("notes", JSON.stringify(notes));

    window.location.href = "../Notes/Notes.html";
});