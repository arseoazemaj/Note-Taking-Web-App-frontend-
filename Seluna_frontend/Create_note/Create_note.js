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

async function save() { //* Save the note
    const user_id = getUserIdFromToken();
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
        title: Title,
        content: Content,
        user_id: user_id,
        isImportant: isImportant,
        created_at: new Date().toISOString(),
        isLocked: isLocked,
        lock_password: lock_password
    };

    try {
        const response = await fetch("http://localhost:5216/api/Notes/create_note", {
            method: "POST",
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
                "Your note couldn't be saved because Seluna's database is currently full and cannot store new notes. We're working on expanding it — please try again later."
            );
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${responseText}`);
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
    }, 100);
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
    }, 100);
}

function continueLock() {
    setTimeout(() => {
        lock_menu_lock_password.classList.add("show_lock_menu");
        lock_menu_lock_password.classList.remove("hide_lock_menu");
    }, 100);
}

function cancelLockPassword() {
    setTimeout(() => {
        passwordInput.value = "";
        passwordConfirmInput.value = "";
        lock_menu_lock_password.classList.add("hide_lock_menu");
        lock_menu_lock_password.classList.remove("show_lock_menu");
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
    save();
}

//*Download
function downloadNote() {
    setTimeout(() => {
        mini_menu = true;
        console.log("Downloading note...");
        download_menu.classList.add("show_lock_menu");
        download_menu.classList.remove("hide_lock_menu");
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

//*Moves the note to trash | What is hell is this function even deleting the note is not created yet so what the hell is even being deleted?
async function deleteNote() {
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
    if (window.Capacitor?.isNativePlatform()) {
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
    }
});