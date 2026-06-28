document.addEventListener("DOMContentLoaded", async function () { //*Loads the note *//
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get("id");

    if (!noteId) {
        console.error("No note ID found in URL");
        return;
    }

    try {
        const response = await fetch(`http://192.168.1.7:5216/api/Notes/get_note/${noteId}`, {
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
        alert("Your note couldn't be loaded.")
        console.error("Fetch error:", error);
        return;
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

const download_menu = document.getElementById("download_menu");

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
        download_menu.classList.remove("show_lock_menu");
        download_menu.classList.add("hide_lock_menu");
        blur_background.style.visibility = "hidden";
    }, 10);
}

async function update(noteId) { //*Update the note || doesn't keep the password for the lock so will need to work for it
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
        const response = await fetch("http://192.168.1.7:5216/api/Notes/edit_note", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(note)
        });

        const responseText = await response.text();

        if (
            response.status === 507 ||
            responseText.toLowerCase().includes("storage") ||
            responseText.toLowerCase().includes("space")
        ) {
            alert(
                "Your note couldn't be updated because Seluna's database is currently full and cannot store new notes. We're working on expanding it — please try again later."
            );
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${responseText}`);
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
    setTimeout(() => {
        const lock_menu = document.getElementById("lock_menu");
        lock_menu.classList.add("show_lock_menu");
        lock_menu.classList.remove("hide_lock_menu");
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
        lock_bg.style.visibility = "visible";
    }, 100);
}

function closelockMenuBG() {
    lock_menu.classList.add("hide_lock_menu");
    lock_menu.classList.remove("show_lock_menu");
    lock_menu_lock_password.classList.add("hide_lock_menu");
    lock_menu_lock_password.classList.remove("show_lock_menu");
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    passwordInput_lock.type = "password";
    passwordInput_lock_confirm.type = "password";
    eyeIcon_lock.style.display = "inline";
    hiddenEyeIcon_lock.style.display = "none";
    eyeIcon_lock_confirm.style.display = "inline";
    hiddenEyeIcon_lock_confirm.style.display = "none";
    closeMenu();
}

function closelockMenu() {
    setTimeout(() => {
        lock_menu.classList.add("hide_lock_menu");
        lock_menu.classList.remove("show_lock_menu");
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
        lock_bg.style.visibility = "hidden";
    }, 100);
}

function continueLock() {
    setTimeout(() => {
        lock_menu_lock_password.classList.add("show_lock_menu");
        lock_menu_lock_password.classList.remove("hide_lock_menu");
    }, 100);
}

const passwordInput_lock = document.getElementById("lock_password");
const passwordInput_lock_confirm = document.getElementById("confirm_lock_password");
const eyeIcon_lock = document.getElementById("eye_icon_lock");
const hiddenEyeIcon_lock = document.getElementById("hidden_eye_icon_lock");
const eyeIcon_lock_confirm = document.getElementById("eye_icon_lock_confirm");
const hiddenEyeIcon_lock_confirm = document.getElementById("hidden_eye_icon_lock_confirm");
function togglePasswordLock() {
    if (passwordInput_lock.type === "password") {
        passwordInput_lock.type = "text";
        passwordInput_lock_confirm.type = "text";
        eyeIcon_lock.style.display = "none";
        hiddenEyeIcon_lock.style.display = "inline";
        eyeIcon_lock_confirm.style.display = "none";
        hiddenEyeIcon_lock_confirm.style.display = "inline";
    } else {
        passwordInput_lock.type = "password";
        passwordInput_lock_confirm.type = "password";
        eyeIcon_lock.style.display = "inline";
        hiddenEyeIcon_lock.style.display = "none";
        eyeIcon_lock_confirm.style.display = "inline";
        hiddenEyeIcon_lock_confirm.style.display = "none";
    }
}

function cancelLockPassword() {
    setTimeout(() => {
        passwordInput.value = "";
        passwordConfirmInput.value = "";
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");

        passwordInput_lock.type = "password";
        passwordInput_lock_confirm.type = "password";
        eyeIcon_lock.style.display = "inline";
        hiddenEyeIcon_lock.style.display = "none";
        eyeIcon_lock_confirm.style.display = "inline";
        hiddenEyeIcon_lock_confirm.style.display = "none";
    }, 100);
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

function downloadNote() {
    setTimeout(() => {
        mini_menu = true;
        download_menu.classList.add("show_lock_menu");
        download_menu.classList.remove("hide_lock_menu");
        download_bg.style.visibility = "visible";
    }, 100);
}

function closeDownloadMenuBG() {
    setTimeout(() => {
        download_bg.style.visibility = "hidden";
        closeMenu();
    }, 100);
}

async function download_txt () {
    try {
        if (!window.Capacitor?.isNativePlatform()) {
            console.log('Not running on native platform');
            return;
        }

        const { Filesystem } = Capacitor.Plugins;
        const textContent = "File test for download";

        await Filesystem.writeFile({
            path: 'seluna/TXT_note_test.txt',
            data: textContent,
            directory: 'DOCUMENTS',
            encoding: 'UTF8',
        });

        alert('TXT file saved in Documents/seluna/');
    } catch (err) {
        console.error('Filesystem error:', err);

        alert(
            'Error saving TXT file\n\n' +
            (err?.message || JSON.stringify(err))
        );
    }
}

async function download_pdf() {
    console.log("This is a pdf file...");

    try {
        if (!window.Capacitor?.isNativePlatform()) {
            console.log("You are not on a native device.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const { Filesystem } = Capacitor.Plugins;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        doc.setFont('Times', 'Normal');
        doc.setFontSize(18);
        doc.text('Seluna — PDF Export', 20, 30);

        doc.setFontSize(12);
        doc.text(
            "This is a PDF file from seluna.",
            20,
            50
        );

        const pdfBase64 = doc.output('datauristring').split(',')[1];

        await Filesystem.writeFile({
            path: 'seluna/PDF_note_test.pdf',
            data: pdfBase64,
            directory: 'DOCUMENTS',
        });

        alert('PDF file saved in Documents/seluna/');
    } catch (err) {
        console.error('PDF save error:', err);
        alert('Failed to save PDF');
    }
}

async function download_md() {
    console.log(".md file...")

        try {
        if (!window.Capacitor?.isNativePlatform()) {
            console.log('Not running on native platform');
            return;
        }

        const { Filesystem } = Capacitor.Plugins;
        const markdownContent = "This is a test for .md";

        await Filesystem.writeFile({
            path: 'seluna/MD_note_test.md',
            data: markdownContent,
            directory: 'DOCUMENTS',
            encoding: 'UTF8',
        });

        alert('MD file saved in Documents/seluna/');
    } catch (err) {
        console.error('Filesystem error:', err);
        alert('Error saving MD file');
    }
}

async function deleteNote() { //*Moves the note to trash
    const token = localStorage.getItem("token");
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const isImportant = filled;

    try {
        const response = await fetch("http://192.168.1.7:5216/api/Notes/delete_note", {
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