const menuOpener = document.getElementById("menuopener");
const menuPage = document.getElementById("menu-page");
const menu_bg = document.getElementById("menu_bg");

let menuOpen = false;

menuOpener.addEventListener("touchstart", () => {
    if (menuOpen) return;

    menuPage.classList.add("slide-in");
    menuPage.classList.remove("slide-out");
    menu_bg.style.visibility = "visible";
    menuOpen = true;

    if (SelectionMode) {
        hideDecision();
        Select_off();
    }
});

function Profile () {
    window.location.href = "../Profile/Profile.html";
}

const folderBox = document.querySelector(".folder-box.selected");

function Select_off() {
    const noteBox = document.querySelector(".note-box.selected");
    if (noteBox) {
        noteBox.classList.remove("selected");
        noteBox.style.transform = "scale(1)";
        const checkIcon = noteBox.querySelector(".note-check-icon");

        if (checkIcon) {
            checkIcon.style.display = "none";
        }
    }

    if (folderBox) {
        folderBox.classList.remove("selected");
        folderBox.style.transform = "scale(1)";
        const checkIcon = folderBox.querySelector(".folder-check-icon");

        if (checkIcon) {
            checkIcon.style.display = "none";
        }
    }
}

menu_bg.addEventListener("touchstart", () => {
    if (!menuOpen) return;

    menuPage.classList.add("slide-out");
    menuPage.classList.remove("slide-in");
    menu_bg.style.visibility = "hidden";
    menuOpen = false;
});

const noteButton = document.getElementById("note");
if (noteButton) {
    noteButton.addEventListener("touchstart", () => {
        if (!menuOpen) return;

        menuPage.classList.add("slide-out");
        menuPage.classList.remove("slide-in");
        menu_bg.style.visibility = "hidden";
        menuOpen = false;
    });
}

let SelectionMode = false;
let SelectedNotes = false;
let SelectedFolders = false;
let longPressTimer = null;
let longPressFired = false;
let wasCanceled = false;
const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 5;
let startX = 0;
let startY = 0;

document.addEventListener("DOMContentLoaded", loadNotes );

function anySelected() {
    return document.querySelectorAll(".note-box.selected, .folder-box.selected").length > 0;
}

function updateSelectionModeFromDOM() {
    const any = anySelected();
    if (any && !SelectionMode) {
        showDecision();
    } else if (!any && SelectionMode) {
        hideDecision();
    }
}

function DecisionBtnHandler() {
    move_btn.disabled = false;
    lock_btn.disabled = false;
    important_btn.disabled = false;
}

let LockedNotes = false;

async function loadNotes() {
    const container = document.getElementById("container");
    try {
        const response = await fetch("http://localhost:5216/api/Notes/get_notes", {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            // container.textContent = "Failed to load notes: " + response.status; Maybe uncomment it maybe not.
            return;
        }

        const notes = await response.json();
        container.innerHTML = "";

        function setupNoteEvents(noteBox, note) {
            noteBox.addEventListener("touchstart", function(e) {
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                longPressTimer = setTimeout(() => {
                    longPressFired = true;
                    SelectedNotes = true;
                    const checkIcon = noteBox.querySelector(".note-check-icon");
                    checkIcon.style.display = "block";
                    noteBox.classList.add("selected");
                    noteBox.style.transform = "scale(.9)";
                    showDecision();
                }, LONG_PRESS_MS);
            });

            noteBox.addEventListener("touchmove", function(e) {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    clearTimeout(longPressTimer);
                    wasCanceled = true;
                }
            });

            noteBox.addEventListener("touchcancel", function() {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            });

            noteBox.addEventListener("touchend", function() {
                clearTimeout(longPressTimer);

                if (wasCanceled) {
                    return;
                }

                if (SelectionMode) {
                    if (!longPressFired) {
                        const checkIcon = noteBox.querySelector(".note-check-icon");
                        const isSelected = noteBox.classList.toggle("selected");
                        if (isSelected) {
                            checkIcon.style.display = "block";
                            noteBox.style.transform = "scale(.9)";
                        } else {
                            checkIcon.style.display = "none";
                            noteBox.style.transform = "scale(1)";
                        }
                        updateSelectionModeFromDOM();
                    }
                } else if (!longPressFired && !wasCanceled) {
                    if (note.isLocked) {
                        LockedFolder = false;
                        LockedNotes = true;
                        showUnlockPrompt(note.id, null);
                    } else {
                        LockedNotes = false;
                        window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
                    }
                }
                longPressFired = false;
            });
        }

        notes.forEach(note => {
            const noteBox = document.createElement("div");
            noteBox.className = "note-box";
            noteBox.setAttribute("id", note.id);

            const checkIcon = document.createElement("i");
            checkIcon.setAttribute("data-lucide", "circle-check");
            checkIcon.classList.add("note-check-icon");
            checkIcon.style.display = "none";
            noteBox.appendChild(checkIcon);

            if (note.isImportant) {
                const isImportantIcon = document.createElement("i");
                noteBox.classList.add("important-note");
                isImportantIcon.setAttribute("data-lucide", "star");
                isImportantIcon.classList.add("important-icon");
                noteBox.appendChild(isImportantIcon);
            }

            const noteContent = document.createElement("p");
            noteContent.className = "note-content";

            if (note.isLocked) {
                const lockIcon = document.createElement("i");
                lockIcon.setAttribute("data-lucide", "lock-keyhole");
                lockIcon.classList.add("lock-icon");

                const lockBackground = document.createElement("div");
                lockBackground.classList.add("lock-background");
                lockBackground.appendChild(lockIcon);

                noteBox.classList.add("locked-note");
                noteBox.appendChild(lockBackground);

                noteContent.textContent = "This note is locked. You need to unlock it to see its content.";
            } else {
                noteContent.textContent = note.content;
            }

            const noteTitle = document.createElement("h3");
            noteTitle.textContent = note.title;
            noteTitle.className = "title";

            noteBox.appendChild(noteContent);
            noteBox.appendChild(noteTitle);
            container.appendChild(noteBox);

            setupNoteEvents(noteBox, note);
        });
        lucide.createIcons();
        LoadFolders();
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

const decide = document.getElementById("decide");

function showDecision() {
    decide.classList.add("slide-in");
    decide.classList.remove("slide-out");

    document.getElementById("new_note").style.visibility = "hidden";
    SelectionMode = true;
}

function hideDecision() {
    document.getElementById("new_note").style.visibility = "visible";
    decide.classList.add("slide-out");
    decide.classList.remove("slide-in");
    SelectionMode = false;
    SelectedNotes = false;
    SelectedFolders = false;
    blur_backgroundHandler();
    DecisionBtnHandler();
}

const blur_background = document.getElementById("blur_background");
const decision_hider = document.getElementById("decision_hider");

const move_btn = document.getElementById("move");
const move_menu = document.getElementById("move_menu");
const create_folder_btn = document.getElementById("create_folder-btn");
const create_folder_menu = document.getElementById("create_folder");
const folder_namer = document.getElementById("folder_namer");
const colorBox = document.querySelectorAll(".colors");
const color_check = document.getElementsByClassName("check_color");
const cancel_folder_btn = document.getElementById("cancel_folder");
const add_folder_btn = document.getElementById("add_folder");

const lock_btn = document.getElementById("lock");
const lock_menu = document.getElementById("lock_menu_ask");
const not_lock_btn = document.getElementById("not_lock");
const do_lock_btn = document.getElementById("do_lock");
const lock_password_menu = document.getElementById("lock_password_menu");
const lock_password = document.getElementById("lock_password");
const lock_password_confirm = document.getElementById("confirm_lock_password");
const cancel_lock_btn = document.getElementById("cancel_lock");
const continue_lock_btn = document.getElementById("continue_lock");
const unlock_menu = document.getElementById("unlock_menu");
const unlock_password = document.getElementById("unlock_password");
const cancel_unlock_btn = document.getElementById("cancel_unlock");
const continueUnlockBtn = document.getElementById("continue_unlock");

const important_btn = document.getElementById("mark_important");

const download_btn = document.getElementById("download");
const download_menu = document.getElementById("download_menu");

const delete_btn = document.getElementById("delete");
const delete_menu = document.getElementById("delete_menu");
const deletemsg = document.getElementById("delete_msg");

let selectedColor = null;

colorBox.forEach(box => {
    box.addEventListener("touchstart", () => {
        document.querySelectorAll(".check_color").forEach(icon => {
            icon.style.visibility = "hidden";
        });

        const checkIcon = box.querySelector(".check_color");
        if (checkIcon) {
            checkIcon.style.visibility = "visible";
        }

        selectedColor = box.getAttribute("data-color");
    });
});



//*blur backgroung handler

function blur_backgroundHandler() {
    setTimeout(() => {
        if (move_menu.classList.contains("slide-in")) {
            move_menu.classList.add("slide-out");
            move_menu.classList.remove("slide-in");
        }

        if (create_folder_menu.classList.contains("slide-in")) {
            create_folder_menu.classList.add("slide-out");
            create_folder_menu.classList.remove("slide-in");
            folder_namer.value = "";
        }

        for (let i = 0; i < color_check.length; i++) {
            color_check[i].style.visibility = "hidden";
        }

        if (lock_menu.classList.contains("slide-in")) {
            lock_menu.classList.add("slide-out");
            lock_menu.classList.remove("slide-in");
        }

        if (lock_password_menu.classList.contains("slide-in")) {
            lock_password_menu.classList.add("slide-out");
            lock_password_menu.classList.remove("slide-in");
        }

        if (unlock_menu.classList.contains("show")) {
            unlock_menu.classList.add("hide");
            unlock_menu.classList.remove("show");
            continueUnlockBtn.disabled = true;
            unlock_password.value = "";
            togglePassword();
        }

        if (download_menu.classList.contains("slide-in")) {
            download_menu.classList.add("slide-out");
            download_menu.classList.remove("slide-in");
        }

        if (delete_menu.classList.contains("slide-in")) {
            delete_menu.classList.add("slide-out");
            delete_menu.classList.remove("slide-in");
            deletemsg.textContent = "";
        }

        passwordInput.type = "password";
        eyeIcon.style.display = "inline";
        hiddenEyeIcon.style.display = "none";

        passwordInput_lock.type = "password";
        passwordInput_lock_confirm.type = "password";
        eyeIcon_lock.style.display = "inline";
        hiddenEyeIcon_lock.style.display = "none";
        eyeIcon_lock_confirm.style.display = "inline";
        hiddenEyeIcon_lock_confirm.style.display = "none";

        blur_background.style.visibility = "hidden";
        decision_hider.style.visibility = "hidden";
    }, 100);
}

function move() {
    setTimeout(() => {
        move_menu.classList.add("slide-in");
        move_menu.classList.remove("slide-out");
        blur_background.style.visibility = "visible";
        decision_hider.style.visibility = "visible";
    }, 150);
}

function create_folder() {
    setTimeout(() => {
        create_folder_menu.classList.add("slide-in");
        create_folder_menu.classList.remove("slide-out");
        move_menu.classList.add("slide-out");
        move_menu.classList.remove("slide-in");
    }, 150);
}

function cancel_folder() {
    setTimeout(() => {
        create_folder_menu.classList.add("slide-out");
        create_folder_menu.classList.remove("slide-in");
        move_menu.classList.add("slide-in");
        move_menu.classList.remove("slide-out");
        folder_namer.value = "";
        for (let i = 0; i < color_check.length; i++) {
            color_check[i].style.visibility = "hidden";
        }
    }, 150);
}

//*comment
async function add_folder() {
    create_folder_menu.classList.add("slide-out");
    create_folder_menu.classList.remove("slide-in");
    const folderName = document.getElementById("folder_namer").value.trim();
    const folderColor = selectedColor;

    if (!folderName || !folderColor) {
        let msg = "";
        create_folder_menu.classList.add("slide-in");
        create_folder_menu.classList.remove("slide-out");
        if (!folderName) msg += "Folder name is required.\n";
        if (!folderColor) msg += "Please select a folder color.";

        alert(msg);
        return;
    }

    const folder  = {
        Name: folderName,
        Color: folderColor,
    }

    try {
        const response = await fetch("http://localhost:5216/api/Folders/create_folder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(folder)
        });

        if (response.status === 507 || message.includes("storage") || message.includes("space")) {
            alert("Your folder couldn't be created because Seluna's database is currently full and cannot store new folders. We're working on expanding it — please try again later.");
        }

        if (!response.ok) {
            console.error("Failed to create folder");
        }
    }catch (err) {
        console.error("Error while creating a folder:", err);
    }
    
    document.getElementById("folder_namer").value = "";
    selectedColor = null;
    document.querySelectorAll(".check_color").forEach(icon => {
        icon.style.visibility = "hidden";
    });

    cancel_folder();
    LoadFolders();
    LoadFolderName();
}

const folders_menu = document.getElementById("folders_menu");
let LockedFolder = false;

async function LoadFolders() {
    try {
        const response = await fetch("http://localhost:5216/api/Folders/get_folder", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            folders_menu.textContent = "Failed to load folders: " + response.status;
            return;
        }

        const folders = await response.json();
        if (folders.length === 0) {
            folders_menu.style.display = "none";
            container.style.top = "40px";
        }
        folders_menu.innerHTML = "";

        function setupFolderEvents(folderBox, folder) {
            folderBox.addEventListener("touchstart", (e) => {
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                longPressTimer = setTimeout(() => {
                    longPressFired = true;
                    SelectedFolders = true;
                    const checkIcon = folderBox.querySelector(".folder-check-icon");
                    checkIcon.style.display = "block";
                    folderBox.classList.add("selected");
                    folderBox.style.transform = "scale(.9)";
                    showDecision();
                    chosingMoveDecisions();
                }, LONG_PRESS_MS);
            });

            folderBox.addEventListener("touchmove", (e) => {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    clearTimeout(longPressTimer);
                    wasCanceled = true;
                }
            });

            folderBox.addEventListener("touchcancel", () => {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            });

            folderBox.addEventListener("touchend", () => {
                clearTimeout(longPressTimer);

                if (wasCanceled) return;

                if (SelectionMode) {
                    if (!longPressFired) {
                        const checkIcon = folderBox.querySelector(".folder-check-icon");
                        const isSelected = folderBox.classList.toggle("selected");

                        if (isSelected) {
                            checkIcon.style.display = "block";
                            folderBox.style.transform = "scale(.9)";
                            chosingMoveDecisions();
                        } else {
                            checkIcon.style.display = "none";
                            folderBox.style.transform = "scale(1)";
                            chosingMoveDecisions();
                        }
                        updateSelectionModeFromDOM();
                    }
                } else if (!longPressFired && !wasCanceled) {
                    if (folder.is_locked) {
                        LockedFolder = true;
                        LockedNotes = false;
                        showUnlockPrompt(null, folder.id);
                    } else {
                        open_folder(folder.id);
                    }
                }
                longPressFired = false;
            });
        }

        folders.forEach(folder => {
            const folderBox = document.createElement("div");
            folderBox.className = "folder-box";
            folderBox.setAttribute("id", folder.id);

            const checkIcon = document.createElement("i");
            checkIcon.setAttribute("data-lucide", "circle-check");
            checkIcon.classList.add("folder-check-icon");
            checkIcon.style.display = "none";

            const folderIcon = document.createElement("i");
            folderIcon.setAttribute("data-lucide", "folder");
            folderIcon.classList.add("folder-icon");

            const Color = folder.color;
            const fillColor = withAlpha(folder.color, "73");
            folderIcon.style.color = Color;
            folderIcon.style.fill = fillColor;

            const folderName = document.createElement("p");
            folderName.className = "folder-name";
            folderName.style.color = Color;
            folderName.textContent = folder.name;

            if (folder.is_important) {
                const isImportantIcon = document.createElement("i");
                folderBox.classList.add("important-folder");
                isImportantIcon.setAttribute("data-lucide", "star");
                isImportantIcon.classList.add("important-iconF");
                folderBox.appendChild(isImportantIcon);
                isImportantIcon.style.color = Color;
                isImportantIcon.style.fill = fillColor;
            }

            if (folder.is_locked) {
                folderIcon.setAttribute("data-lucide", "folder-lock");
                folderBox.classList.add("locked-folder");
            }

            folderBox.appendChild(checkIcon);
            folderBox.appendChild(folderIcon);
            folderBox.appendChild(folderName);
            folders_menu.appendChild(folderBox);

            setupFolderEvents(folderBox, folder);
        });

        lucide.createIcons();
    } catch (err) {
        console.error("Error loading folders:", err);
    }
}

function showUnlockFolderPrompt(folderId) {
    blur_background.style.visibility = "visible";
    unlock_folder_menu.classList.add("show");
    unlock_folder_menu.classList.remove("hide");

    unlock_folder_menu.dataset.folderId = folderId;
}

function chosingMoveDecisions() {
    const anySelectedFolder = document.querySelector(".folder-box.selected");

    if (anySelectedFolder) {
        SelectedFolders = true;
        move_btn.disabled = true;
        download_btn.disabled = true;
    } else {
        SelectedFolders = false;
        move_btn.disabled = false;
        download_btn.disabled = false;
    }
}

const folderPage = document.getElementById("folder_page");
const folder_blur = document.getElementById("folder_blur");
let currentOpenedFolderId = null;
const main_folder = document.getElementById("main_folder");

function open_folder(folderId) {
    currentOpenedFolderId = folderId
    document.querySelectorAll(".folder-box").forEach(f => f.classList.remove("opened"));
    const openedFolder = document.getElementById(folderId);
    if (openedFolder) {
        openedFolder.classList.add("opened");
    }
    opened_folder(folderId);

    folderPage.classList.add("show");
    folderPage.classList.remove("hide");
    folder_blur.style.visibility = "visible";

    if (folderId) {
        main_folder.style.display = "flex";
    }
}

folder_blur.addEventListener("touchstart", () => {
    setTimeout(() => {
        folderPage.classList.add("hide");
        folderPage.classList.remove("show");
        folder_blur.style.visibility = "hidden";

        document.querySelectorAll(".note-box.selected, .folder-box.selected").forEach(el => {
            el.classList.remove("selected");
            el.style.transform = "scale(1)";
            const checkIcon = el.querySelector(".note-check-icon, .folder-check-icon");
            if (checkIcon) {
                checkIcon.style.display = "none";
            }
        });

        main_folder.style.display = "none";

        if (decide.classList.contains("slide-in")) {
            hideDecision();
        }

        const openedFolder = document.querySelector(".folder-box.opened");
        if (openedFolder) {
            openedFolder.classList.remove("opened");
        }
    }, 100);
});

function withAlpha(hexColor, alphaHex) {
    let base = hexColor.replace("#", "");
    if (base.length === 8) base = base.substring(0, 6);
    return `#${base}${alphaHex}`;
}

document.addEventListener("DOMContentLoaded", LoadFolderName );
let touchmoved = false;

async function LoadFolderName () {
    try {
        const response = await fetch("http://localhost:5216/api/Folders/get_folderName", {
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch folder name:", response.status);
            return;
        }

        const folderNames = await response.json();
        const folderList = document.getElementById("folder_list");
        folderList.innerHTML = "";
        folderList.appendChild(main_folder);

        folderNames.forEach(folder => {
            const folder_element = document.createElement("div");
            folder_element.className = "folders";
            folder_element.setAttribute("id", folder.id);

            const folderIcon = document.createElement("i");
            folderIcon.setAttribute("data-lucide", "folder");
            folderIcon.classList.add("folders_icon");
            folderIcon.style.color = folder.color;

            const folderName = document.createElement("h3");
            folderName.className = "folder_name";
            folderName.textContent = folder.name;
            folderName.style.color = folder.color;

            folder_element.appendChild(folderIcon);
            folder_element.appendChild(folderName);
            folderList.appendChild(folder_element);

            folder_element.addEventListener("touchstart", () => {
                touchmoved = false;
            });

            folder_element.addEventListener("touchmove", () => {
                touchmoved = true;
            });

            folder_element.addEventListener("touchend", () => {
                    if (!touchmoved) {
                    const folderId = folder.id;
                    const selectedNotes = document.querySelectorAll(".note-box.selected");
                    const selectedNoteIds = Array.from(selectedNotes).map(n => n.id);

                    selectedNoteIds.forEach(noteId => {
                        sendNoteToFolder(noteId, folderId);
                    });
                }
            });
        });
        lucide.createIcons();
    } catch (err) {
        console.error("Error loading folders name:", err);
    }
}

async function sendNoteToFolder(noteId, folderId) {
    try {
        const response = await fetch("http://localhost:5216/api/Folders/SendNoteToFolder", {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Id: noteId,
                folderId: folderId
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        await loadNotes();
        hideDecision();
    } catch (error) {
        console.error("Error moving note:", error);
    }
}

main_folder.addEventListener("click", () => {
    const selectedNotes = document.querySelectorAll(".note-box.selected");

    if (selectedNotes.length === 0) return;

    selectedNotes.forEach(note => {
        const noteId = note.id;
        sendNoteToMain(noteId);
    });
});

async function sendNoteToMain(noteId) {
    try {
        const response = await fetch("http://localhost:5216/api/Folders/SendNoteToFolder", {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Id: noteId,
                folderId: null
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        await loadNotes();
        hideDecision();

        if (currentOpenedFolderId) {
            open_folder(currentOpenedFolderId);
        }
    } catch (error) {
        console.error("Error moving note to main page:", error);
    }
}

async function opened_folder(folderId) {
    const folder_page = document.getElementById("folder_page");
    folder_page.innerHTML = "";
    try {
        const response = await fetch(`http://localhost:5216/api/Notes/folder/${folderId}`, {
            method: "GET", //* By default it"s GET so now it was just me wanting to add it but for other methods you need to specify it *//
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch notes from folder:", response.status);
            return;
        }

        const notes = await response.json();

        function NoteEvents(noteBox, note) {
            noteBox.addEventListener("touchstart", function(e) {
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                    longPressTimer = setTimeout(() => {
                        longPressFired = true;
                        SelectedNotes = true;
                        const checkIcon = noteBox.querySelector(".note-check-icon");
                        checkIcon.style.display = "block";
                        noteBox.classList.add("selected");
                        noteBox.style.transform = "scale(.9)";
                        showDecision();
                    }, LONG_PRESS_MS);
            });

            noteBox.addEventListener("touchmove", function(e) {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    clearTimeout(longPressTimer);
                    wasCanceled = true;
                }
            });

            noteBox.addEventListener("touchcancel", function() {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            });

            noteBox.addEventListener("touchend", function() {
                clearTimeout(longPressTimer);

                if (wasCanceled) {
                    return;
                }

                if (SelectionMode) {
                    if (!longPressFired) {
                        const checkIcon = noteBox.querySelector(".note-check-icon");
                        const isSelected = noteBox.classList.toggle("selected");
                        if (isSelected) {
                            checkIcon.style.display = "block";
                            noteBox.style.transform = "scale(.9)";
                        } else {
                            checkIcon.style.display = "none";
                            noteBox.style.transform = "scale(1)";
                        }

                        const anySelected = document.querySelector(".note-box.selected");
                        if (!anySelected) {
                            hideDecision();
                        }
                    }
                } else if (!longPressFired && !wasCanceled) {
                    if (note.isLocked) {
                        LockedFolder = false;
                        LockedNotes = true;
                        showUnlockPrompt(note.id, null);
                    } else {
                    window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
                    }
                }
                longPressFired = false;
            });
        }

        notes.forEach(note => {
            const noteBox = document.createElement("div");
            noteBox.className = "note-box";
            noteBox.setAttribute("id", note.id);

            const checkIcon = document.createElement("i");
            checkIcon.setAttribute("data-lucide", "circle-check");
            checkIcon.classList.add("note-check-icon");
            checkIcon.style.display = "none";
            noteBox.appendChild(checkIcon);

            if (note.isImportant) {
                const isImportantIcon = document.createElement("i");
                noteBox.classList.add("important-note");
                isImportantIcon.setAttribute("data-lucide", "star");
                isImportantIcon.classList.add("important-icon");
                noteBox.appendChild(isImportantIcon);
            }

            const noteContent = document.createElement("p");
            noteContent.className = "note-content";

            if (note.isLocked) {
                const lockIcon = document.createElement("i");
                lockIcon.setAttribute("data-lucide", "lock-keyhole");
                lockIcon.classList.add("lock-icon");

                const lockBackground = document.createElement("div");
                lockBackground.classList.add("lock-background");
                lockBackground.appendChild(lockIcon);

                noteBox.classList.add("locked-note");
                noteBox.appendChild(lockBackground);

                noteContent.textContent = "This note is locked. You need to unlock it to see its content.";
            } else {
                noteContent.textContent = note.content;
            }

            const noteTitle = document.createElement("h3");
            noteTitle.textContent = note.title;
            noteTitle.className = "title";

            noteBox.appendChild(noteContent);
            noteBox.appendChild(noteTitle);
            folder_page.appendChild(noteBox);
            NoteEvents(noteBox, note);
        });
        lucide.createIcons();
    } catch (err) {
        console.error("Error loading notes from folder:", err);
    }
}

function lock() {
    setTimeout(() => {
        lock_menu.classList.add("slide-in");
        lock_menu.classList.remove("slide-out");
        blur_background.style.visibility = "visible";
        decision_hider.style.visibility = "visible";
    }, 150);
}

function not_lock() {
    setTimeout(() => {
        lock_menu.classList.add("slide-out");
        lock_menu.classList.remove("slide-in");
        blur_background.style.visibility = "hidden";
        decision_hider.style.visibility = "hidden";
    }, 150);
}

function do_lock() {
    setTimeout(() => {
        lock_menu.classList.add("slide-out");
        lock_menu.classList.remove("slide-in");
        lock_password_menu.classList.add("slide-in");
        lock_password_menu.classList.remove("slide-out");
        lock_password.value = "";
        lock_password_confirm.value = "";
    }, 150);
}

function cancel_lock() {
    setTimeout(() => {
        lock_menu.classList.add("slide-in");
        lock_menu.classList.remove("slide-out");
        lock_password_menu.classList.add("slide-out");
        lock_password_menu.classList.remove("slide-in");

        passwordInput_lock.type = "password";
        passwordInput_lock_confirm.type = "password";
        eyeIcon_lock.style.display = "inline";
        hiddenEyeIcon_lock.style.display = "none";
        eyeIcon_lock_confirm.style.display = "inline";
        hiddenEyeIcon_lock_confirm.style.display = "none";
    }, 150);
}

continue_lock_btn.disabled = true;

function lock_password_validation() {
    const password = lock_password.value;
    const confirm = lock_password_confirm.value;

    const noSpaces = !password.includes(" ") && !confirm.includes(" ");
    const longEnough_lock_passwords = password.length >= 8 && confirm.length >= 8;
    const lock_match = password === confirm;

    if (noSpaces && longEnough_lock_passwords && lock_match) {
        continue_lock_btn.disabled = false;
    } else {
        continue_lock_btn.disabled = true;
    }
}

lock_password.addEventListener("input", lock_password_validation);
lock_password_confirm.addEventListener("input", lock_password_validation);

async function continue_lock() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in.");
        return;
    }

    const selectedNotes = document.querySelectorAll(".note-box.selected");
    const selectedFolders = document.querySelectorAll(".folder-box.selected");

    if (selectedNotes.length === 0 && selectedFolders.length === 0) {
        alert("No notes or folders selected.");
        return;
    }

    const password = sanitize(lock_password.value);
    const confirmPassword = sanitize(lock_password_confirm.value);

    if (!password || !confirmPassword) {
        alert("Please fill both password fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    const noteIds = Array.from(selectedNotes)
        .map(n => parseInt(n.id))
        .filter(id => !isNaN(id));

    const folderIds = Array.from(selectedFolders)
        .map(f => parseInt(f.id))
        .filter(id => !isNaN(id));

    try {
        if (noteIds.length > 0) {
            const noteResponse = await fetch(
                "http://localhost:5216/api/Notes/lock_note",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        NoteIds: noteIds,
                        Lock_Password: password
                    })
                }
            );

            if (!noteResponse.ok) {
                const err = await noteResponse.json();
                throw new Error(err.message || "Failed to lock notes.");
            }
        }

        if (folderIds.length > 0) {
            const folderResponse = await fetch("http://localhost:5216/api/Folders/lock_folder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        FolderIds: folderIds,
                        Lock_Password: password
                    })
                }
            );

            if (!folderResponse.ok) {
                const err = await folderResponse.json();
                throw new Error(err.message || "Failed to lock folders.");
            }
        }

        lock_password.value = "";
        lock_password_confirm.value = "";

        if (currentOpenedFolderId) {
            open_folder(currentOpenedFolderId);
        }

        hideDecision();
        loadNotes();
    } catch (error) {
        console.error("Lock error:", error);
        alert(error.message || "Error locking items.");
    }
}

const passwordInput = document.getElementById("unlock_password");
const eyeIcon = document.getElementById("eye_icon");
const hiddenEyeIcon = document.getElementById("hidden_eye_icon");
function togglePassword() {
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

function showUnlockPrompt(noteId = null, folderId = null) {
    blur_background.style.visibility = "visible";
    unlock_menu.classList.add("show");
    unlock_menu.classList.remove("hide");
    let unlock_text = document.getElementById("unlock_text");

    unlock_menu.dataset.noteId = "";
    unlock_menu.dataset.folderId = "";

    if (noteId !== null) {
        unlock_menu.dataset.noteId = noteId;
        unlock_text.innerHTML = "";
        unlock_text.textContent = "You are opening a locked note, you need to enter the password of the note in order to view or edit its content.";
    }

    if (folderId !== null) {
        unlock_menu.dataset.folderId = folderId;
        unlock_text.innerHTML = "";
        unlock_text.textContent = "You are opening a locked folder, you need to enter the password of the folder in order to view or edit its content.";
    }
}

function cancel_unlock() {
    setTimeout(() => {
        unlock_menu.classList.add("hide");
        unlock_menu.classList.remove("show");
        blur_background.style.visibility = "hidden";
        unlock_password.value = "";
    }, 150);
}

continueUnlockBtn.disabled = true;
unlock_password.addEventListener("input", unlock_password_validation);

function unlock_password_validation() {
    const password = unlock_password.value;
    const longEnough = password.length >= 8;
    const noSpaces = !password.includes(" ");

    if (longEnough && noSpaces) {
        continueUnlockBtn.disabled = false;
    } else {
        continueUnlockBtn.disabled = true;
    }
}

async function continue_unlock() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in.");
        return;
    }

    const password = sanitize(unlock_password.value);
    if (!password || password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    try {
        if (LockedNotes) {
            const noteId = parseInt(unlock_menu.dataset.noteId);

            const res = await fetch(
                "http://localhost:5216/api/Notes/open_locked_note",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Id: noteId,
                        Lock_Password: password
                    })
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            LockedNotes = false;
            window.location.href =
                `../Edit_notes/Edit_notes.html?id=${noteId}`;
            return;
        }

        if (LockedFolder) {
            const folderId = parseInt(unlock_menu.dataset.folderId);
        
            const res = await fetch(
                "http://localhost:5216/api/Folders/open_locked_folder",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        Id: folderId,
                        Lock_Password: password
                    })
                }
            );
        
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
        
            LockedFolder = false;
            unlock_password.value = "";
        
            unlock_menu.classList.add("hide");
            unlock_menu.classList.remove("show");
            blur_background.style.visibility = "hidden";
        
            open_folder(folderId);
        }

    } catch (err) {
        console.error(err);
        alert(err.message || "Unlock failed.");
    }
}

async function mark_important() {
    setTimeout(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to mark items as important.");
            return;
        }

        const noteIds = Array.from(document.querySelectorAll(".note-box.selected"))
            .map(note => parseInt(note.id))
            .filter(id => !isNaN(id));

        const folderIds = Array.from(document.querySelectorAll(".folder-box.selected"))
            .map(folder => parseInt(folder.dataset.id || folder.id))
            .filter(id => !isNaN(id));

        if (noteIds.length === 0 && folderIds.length === 0) {
            alert("No notes or folders selected.");
            return;
        }

        try {
            if (noteIds.length > 0) {
                const important_note = document.querySelectorAll(".note-box.selected.important-note");
                const unimportant_note = document.querySelectorAll(".note-box.selected:not(.important-note)");
                let Important_status = false;

                if (important_note.length > unimportant_note.length) {
                    Important_status = false;
                } else if (important_note.length < unimportant_note.length) {
                    Important_status = true;
                } else if (important_note.length === unimportant_note.length) {
                    Important_status = true;
                }

                const notesResponse = await fetch(
                    "http://localhost:5216/api/Notes/mark_important_Notes",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            NoteIds: noteIds,
                            isImportant: Important_status
                        })
                    }
                );

                if (!notesResponse.ok) {
                    const errorText = await notesResponse.text();
                    console.error("Notes error:", errorText);
                    throw new Error("Failed to update notes.");
                }
            }

            if (folderIds.length > 0) {
                const important_folder = document.querySelectorAll(".folder-box.selected.important-folder");
                const unimportant_folder = document.querySelectorAll(".folder-box.selected:not(.important-folder)");
                let Important_status = false;

                if (important_folder.length > unimportant_folder.length) {
                    Important_status = false;
                } else if (important_folder.length < unimportant_folder.length) {
                    Important_status = true;
                } else if (important_folder.length === unimportant_folder.length) {
                    Important_status = true;
                }

                const foldersResponse = await fetch(
                    "http://localhost:5216/api/Folders/mark_important_Folders",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            FolderIds: folderIds,
                            is_important: Important_status
                        })
                    }
                );

                if (!foldersResponse.ok) {
                    const errorText = await foldersResponse.text();
                    console.error("Folders error:", errorText);
                    throw new Error("Failed to update folders.");
                }
            }

            hideDecision();
            loadNotes();

            if (currentOpenedFolderId) {
                open_folder(currentOpenedFolderId);
            }
        } catch (error) {
            console.error("Error updating importance:", error);
            alert("Error updating importance.");
        }
    }, 150);
}

function download_note() {
    setTimeout(() => {
        download_menu.classList.add("slide-in");
        download_menu.classList.remove("slide-out");
        blur_background.style.visibility = "visible";
        decision_hider.style.visibility = "visible";
    }, 150);
}

async function download_txt () { //*For now have hardcoded text as content but will make it get the content the selected note
    try {
        if (!window.Capacitor?.isNativePlatform()) {
            console.log('Not running on native platform');
            return;
        }

        const { Filesystem } = Capacitor.Plugins; //*Just this 
        const textContent = "File test for download";

        await Filesystem.writeFile({ //*And this to be able to save things on the devices storage
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

function open_trash_menu() {
    setTimeout(() => {
        delete_menu.classList.add("slide-in");
        delete_menu.classList.remove("slide-out");
        blur_background.style.visibility = "visible";
        decision_hider.style.visibility = "visible";

        const noteIds = Array.from(document.querySelectorAll(".note-box.selected"))
            .map(note => parseInt(note.id))
            .filter(id => !isNaN(id));

        const folderIds = Array.from(document.querySelectorAll(".folder-box.selected"))
            .map(folder => parseInt(folder.id))
            .filter(id => !isNaN(id));

        if (noteIds.length === 1 && folderIds.length === 0) {
            deletemsg.textContent = "Are you sure you want to delete the selected note?";
        } else if (noteIds.length === 1 && folderIds.length === 1) {
            deletemsg.textContent = "Are you sure you want to delete the selected note and folder?";
        } else if (noteIds.length > 1 && folderIds.length > 1) {
            deletemsg.textContent = "Are you sure you want to delete the selected notes and folders?";
        } else if (noteIds.length === 1 && folderIds.length > 1) {
            deletemsg.textContent = "Are you sure you want to delete the selected note and folders?";
        } else if (noteIds.length > 1 && folderIds.length === 1) {
            deletemsg.textContent = "Are you sure you want to delete the selected notes and folder?";
        } else if (noteIds.length === 0 && folderIds.length > 1) {
            deletemsg.textContent = "Are you sure you want to delete the selected folders?";
        } else if (noteIds.length > 1 && folderIds.length === 0) {
            deletemsg.textContent = "Are you sure you want to delete the selected notes?";
        } else if (noteIds.length === 0 && folderIds.length === 1) {
            deletemsg.textContent = "Are you sure you want to delete the selected folder?";
        }
    }, 150);
}

function cancel_delete() {
    setTimeout(() => {
        delete_menu.classList.add("slide-out");
        delete_menu.classList.remove("slide-in");
        blur_background.style.visibility = "hidden";
        decision_hider.style.visibility = "hidden";
    }, 150);
}

async function send_to_trash() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to delete notes or folders.");
        return;
    }

    const noteIds = Array.from(document.querySelectorAll(".note-box.selected"))
        .map(note => parseInt(note.id))
        .filter(id => !isNaN(id));

    const folderIds = Array.from(document.querySelectorAll(".folder-box.selected"))
        .map(folder => parseInt(folder.id))
        .filter(id => !isNaN(id));

    if (noteIds.length === 0 && folderIds.length === 0) {
        alert("No notes or folders selected.");
        return;
    }

    try {
        if (noteIds.length > 0) {
            const notesResponse = await fetch("http://localhost:5216/api/Notes/delete_notes", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ noteIds })
            });

            const notesResult = await notesResponse.json();
            if (!notesResponse.ok) throw new Error(notesResult.message || "Failed to delete notes.");
        }

        if (folderIds.length > 0) {
            const foldersResponse = await fetch("http://localhost:5216/api/Folders/delete_folders", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ folderIds })
            });

            const foldersResult = await foldersResponse.json();
            if (!foldersResponse.ok) throw new Error(foldersResult.message || "Failed to delete folders.");
        }

        blur_backgroundHandler();
        hideDecision();

        if (currentOpenedFolderId) {
            open_folder(currentOpenedFolderId);
        }

        if (noteIds.length > 0 && folderIds.length > 0) {
            loadNotes();
            LoadFolders();
        } else if (noteIds.length > 0) {
            loadNotes();
        } else if (folderIds.length > 0) {
            LoadFolders();
        }

    } catch (error) {
        console.error("Error deleting notes or folders:", error);
        alert("Error deleting notes or folders.");
    }
}

//*Will be used to clear the local storage for testing purposes*//

// localStorage.removeItem("notes");


//TODO: Use only when wanting to see in your phone (when using comment code from line 50)
document.addEventListener("DOMContentLoaded", function() {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];

    function setupNoteEvents(noteBox, note) {
        noteBox.addEventListener("touchstart", function(e) {
            longPressFired = false;
            wasCanceled = false;

            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;

            longPressTimer = setTimeout(() => {
                longPressFired = true;
                SelectionMode = true;
                const checkIcon = noteBox.querySelector(".note-check-icon");
                checkIcon.style.display = "block";
                noteBox.classList.add("selected");
                noteBox.style.transform = "scale(.9)";
                showDecision();
            }, LONG_PRESS_MS);
        });

        noteBox.addEventListener("touchmove", function(e) {
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > MOVE_THRESHOLD) {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            }
        });

        noteBox.addEventListener("touchcancel", function() {
            clearTimeout(longPressTimer);
            wasCanceled = true;
        });

        noteBox.addEventListener("touchend", function() {
            clearTimeout(longPressTimer);

            if (wasCanceled) {
                return;
            }

            if (SelectionMode) {
                if (!longPressFired) {
                    const checkIcon = noteBox.querySelector(".note-check-icon");
                    const isSelected = noteBox.classList.toggle("selected");

                    if (isSelected) {
                        checkIcon.style.display = "block";
                        noteBox.style.transform = "scale(.9)";
                    } else {
                        checkIcon.style.display = "none";
                        noteBox.style.transform = "scale(1)";
                    }

                    const anySelected = document.querySelector(".note-box.selected");
                    if (anySelected) {
                        showDecision();
                    } else {
                        SelectionMode = false;
                        hideDecision();
                    }
                }
            } else if (!longPressFired && !wasCanceled) {
                window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
            }

            longPressFired = false;
        });
    }

    if (!token) {
            notes.forEach(note => {
            const noteBox = document.createElement("div");
            noteBox.className = "note-box";
            noteBox.setAttribute("id", note.id);

            const checkIcon = document.createElement("i");
            checkIcon.setAttribute("data-lucide", "circle-check");
            checkIcon.classList.add("note-check-icon");
            checkIcon.style.display = "none";
            noteBox.appendChild(checkIcon);

            if (note.isImportant) {
                const isImportantIcon = document.createElement("i");
                noteBox.classList.add("important-note");
                isImportantIcon.setAttribute("data-lucide", "star");
                isImportantIcon.classList.add("important-icon");
                noteBox.appendChild(isImportantIcon);
            }

            const noteContent = document.createElement("p");
            noteContent.className = "note-content";

            if (note.isLocked) {
                const lockIcon = document.createElement("i");
                lockIcon.setAttribute("data-lucide", "lock-keyhole");
                lockIcon.classList.add("lock-icon");

                const lockBackground = document.createElement("div");
                lockBackground.classList.add("lock-background");
                lockBackground.appendChild(lockIcon);

                noteBox.classList.add("locked-note");
                noteBox.appendChild(lockBackground);

                noteContent.textContent = "This note is locked. You need to unlock it to see its content.";
            } else {
                noteContent.textContent = note.content;
            }

            const noteTitle = document.createElement("h3");
            noteTitle.textContent = note.title;
            noteTitle.className = "title";

            noteBox.appendChild(noteContent);
            noteBox.appendChild(noteTitle);
            container.appendChild(noteBox);

            setupNoteEvents(noteBox, note);
        });
        lucide.createIcons();
    }
});