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
});

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

document.addEventListener('DOMContentLoaded', loadNotes );

function anySelected() {
    return document.querySelectorAll('.note-box.selected, .folder-box.selected').length > 0;
}

function updateSelectionModeFromDOM() {
    const any = anySelected();
    if (any && !SelectionMode) {
        showDecision();
    } else if (!any && SelectionMode) {
        hideDecision();
    }
}

async function loadNotes() {
    const container = document.getElementById("container");
    try {
        const response = await fetch("http://localhost:5216/api/Notes/get_notes", {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            container.textContent = "Failed to load notes: " + response.status;
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
                    const checkIcon = noteBox.querySelector('.note-check-icon');
                    checkIcon.style.display = 'block';
                    noteBox.classList.add('selected');
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
                        const checkIcon = noteBox.querySelector('.note-check-icon');
                        const isSelected = noteBox.classList.toggle('selected');
                        if (isSelected) {
                            checkIcon.style.display = 'block';
                            noteBox.style.transform = "scale(.9)";
                        } else {
                            checkIcon.style.display = 'none';
                            noteBox.style.transform = "scale(1)";
                        }
                        updateSelectionModeFromDOM();
                    }
                } else if (!longPressFired && !wasCanceled) {
                    if (note.isLocked) {
                        showUnlockPrompt(note.id);
                    } else {
                    window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
                    }
                }
                longPressFired = false;
            });
        }

        notes.forEach(note => {
            const noteBox = document.createElement('div');
            noteBox.className = 'note-box';
            noteBox.setAttribute('id', note.id);

            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'circle-check');
            checkIcon.classList.add('note-check-icon');
            checkIcon.style.display = 'none';
            noteBox.appendChild(checkIcon);

            if (note.isImportant) {
                const isImportantIcon = document.createElement('i');
                noteBox.classList.add('important-note');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

            if (note.isLocked) {
                const lockIcon = document.createElement('i');
                lockIcon.setAttribute('data-lucide', 'lock-keyhole');
                lockIcon.classList.add('lock-icon');
                const lockBackground = document.createElement('div');
                lockBackground.classList.add('lock-background');
                lockBackground.appendChild(lockIcon);
                noteBox.classList.add('locked-note');
                noteBox.appendChild(lockBackground);
            }

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title;
            noteTitle.className = 'title';

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

    document.getElementById("new_note").style.visibility = 'hidden';
    SelectionMode = true
}

function hideDecision() {
    decide.classList.add("slide-out");
    decide.classList.remove("slide-in");
    document.getElementById("new_note").style.visibility = 'visible';
    blur_backgroundHandler();
    SelectionMode = false;
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
const unlock_menu = document.getElementById("unlock_notes");
const unlock_password = document.getElementById("unlock_password");
const cancel_unlock_btn = document.getElementById("cancel_unlock");
const continueUnlockBtn = document.getElementById("continue_unlock");

const important_btn = document.getElementById("mark_important");

const download_btn = document.getElementById("download");
const download_menu = document.getElementById("download_menu");

const delete_btn = document.getElementById("delete");

let selectedColor = null;

colorBox.forEach(box => {
    box.addEventListener("touchstart", () => {
        document.querySelectorAll('.check_color').forEach(icon => {
            icon.style.visibility = 'hidden';
        });

        const checkIcon = box.querySelector('.check_color');
        if (checkIcon) {
            checkIcon.style.visibility = 'visible';
        }

        selectedColor = box.getAttribute("data-color");
    });
});

//*blur backgroung handler

function blur_backgroundHandler() {
    if (move_menu.classList.contains("slide-in")) {
        move_menu.classList.add("slide-out");
        move_menu.classList.remove("slide-in");
    }

    if (create_folder_menu.classList.contains("slide-in")) {
        create_folder_menu.classList.add("slide-out");
        create_folder_menu.classList.remove("slide-in");
    }

    folder_namer.value = "";

    for (let i = 0; i < color_check.length; i++) {
        color_check[i].style.visibility = 'hidden';
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
    }

    unlock_password.value = "";

    if (download_menu.classList.contains("slide-in")) {
        download_menu.classList.add("slide-out");
        download_menu.classList.remove("slide-in");
    }

    blur_background.style.visibility = 'hidden';
    decision_hider.style.visibility = 'hidden';
}

function move() {
    setTimeout(() => {
        move_menu.classList.add("slide-in");
        move_menu.classList.remove("slide-out");
        blur_background.style.visibility = 'visible';
        decision_hider.style.visibility = 'visible';
    }, 100);
}

function create_folder() {
    setTimeout(() => {
        create_folder_menu.classList.add("slide-in");
        create_folder_menu.classList.remove("slide-out");
        move_menu.classList.add("slide-out");
        move_menu.classList.remove("slide-in");
    }, 100);
}

function cancel_folder() {
    setTimeout(() => {
        create_folder_menu.classList.add("slide-out");
        create_folder_menu.classList.remove("slide-in");
        move_menu.classList.add("slide-in");
        move_menu.classList.remove("slide-out");
        folder_namer.value = "";
        for (let i = 0; i < color_check.length; i++) {
            color_check[i].style.visibility = 'hidden';
        }
    }, 100);
}

//*comment
async function add_folder() {
    setTimeout(async () => {
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
            Color: folderColor
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
        
            if (!response.ok) {
                console.error("Failed to create folder");
            }
        }catch (err) {
            console.error("Error while creating a folder:", err);
        }
        
        document.getElementById("folder_namer").value = "";
        selectedColor = null;
        document.querySelectorAll('.check_color').forEach(icon => {
            icon.style.visibility = 'hidden';
        });

        cancel_folder();
        LoadFolders();
        LoadFolderName();
    }, 100);
}

const folders_menu = document.getElementById("folders_menu");

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
                    const checkIcon = folderBox.querySelector('.folder-check-icon');
                    checkIcon.style.display = 'block';
                    folderBox.classList.add('selected');
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
                        const checkIcon = folderBox.querySelector('.folder-check-icon');
                        const isSelected = folderBox.classList.toggle('selected');

                        if (isSelected) {
                            checkIcon.style.display = 'block';
                            folderBox.style.transform = "scale(.9)";
                            chosingMoveDecisions();
                        } else {
                            checkIcon.style.display = 'none';
                            folderBox.style.transform = "scale(1)";
                            chosingMoveDecisions();
                        }
                        updateSelectionModeFromDOM();
                    }
                } else if (!longPressFired && !wasCanceled) {
                    open_folder(folder.id);
                }

                longPressFired = false;
            });
        }

        folders.forEach(folder => {
            const folderBox = document.createElement('div');
            folderBox.className = 'folder-box';
            folderBox.setAttribute('id', folder.id);

            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'circle-check');
            checkIcon.classList.add('folder-check-icon');
            checkIcon.style.display = 'none';

            const folderIcon = document.createElement('i');
            folderIcon.setAttribute('data-lucide', 'folder-closed');
            folderIcon.classList.add('folder-icon');

            const Color = folder.color;
            const fillColor = withAlpha(folder.color, "73");
            folderIcon.style.color = Color;
            folderIcon.style.fill = fillColor;

            const folderName = document.createElement('p');
            folderName.className = 'folder-name';
            folderName.style.color = Color;
            folderName.textContent = folder.name;

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

function chosingMoveDecisions() {
    const anySelectedFolder = document.querySelector('.folder-box.selected');

    if (anySelectedFolder) {
        SelectedFolders = true;
        move_btn.disabled = true;
        lock_btn.disabled = true;
        important_btn.disabled = true;
    } else {
        SelectedFolders = false;
        move_btn.disabled = false;
        lock_btn.disabled = false;
        important_btn.disabled = false;
    }
}

const folderPage = document.getElementById("folder_page");
const folder_blur = document.getElementById("folder_blur");

function open_folder(folderId) {
    document.querySelectorAll('.folder-box').forEach(f => f.classList.remove('opened'));
    const openedFolder = document.getElementById(folderId);
    if (openedFolder) {
        openedFolder.classList.add('opened');
    }
    opened_folder(folderId);
    folderPage.classList.add("show");
    folderPage.classList.remove("hide");
    folder_blur.style.visibility = 'visible';
}

folder_blur.addEventListener("touchstart", () => {
    setTimeout(() => {
        folderPage.classList.add("hide");
        folderPage.classList.remove("show");
        folder_blur.style.visibility = 'hidden';
        document.querySelectorAll('.note-box.selected, .folder-box.selected').forEach(el => {
            el.classList.remove('selected');
            el.style.transform = "scale(1)";
            const checkIcon = el.querySelector('.note-check-icon, .folder-check-icon');
            if (checkIcon) {
                checkIcon.style.display = 'none';
            }
        });

    hideDecision();
    }, 100);
});

function withAlpha(hexColor, alphaHex) {
    let base = hexColor.replace("#", "");
    if (base.length === 8) base = base.substring(0, 6);
    return `#${base}${alphaHex}`;
}

document.addEventListener('DOMContentLoaded', LoadFolderName );
let touchmoved = false;

async function LoadFolderName () {
    try {
        const response = await fetch("http://localhost:5216/api/Folders/get_folderName", {
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch folder name:", response.status);
            return;
        }

        const folderNames = await response.json();
        const folderList = document.getElementById("folder_list");

        folderList.innerHTML = "";

        folderNames.forEach(folder => {
            const folder_element = document.createElement('div');
            folder_element.className = 'folders';
            folder_element.setAttribute('id', folder.id);

            const folderIcon = document.createElement('i');
            folderIcon.setAttribute('data-lucide', 'folder');
            folderIcon.classList.add('folders_icon');
            folderIcon.style.color = folder.color;

            const folderName = document.createElement('p');
            folderName.className = 'folder_name';
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
                    const selectedNotes = document.querySelectorAll('.note-box.selected');
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
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
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

        move_menu.style.visibility = 'hidden';
        create_folder_menu.style.visibility = 'hidden';
    } catch (error) {
        console.error('Error moving note:', error);
    }
}

async function opened_folder(folderId) {
    const folder_page = document.getElementById("folder_page");
    folder_page.innerHTML = '';
    try {
        const response = await fetch(`http://localhost:5216/api/Notes/folder/${folderId}`, {
            method: 'GET', //* By default it's GET so now it was just me wanting to add it but for other methods you need to specify it *//
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
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
                        const checkIcon = noteBox.querySelector('.note-check-icon');
                        checkIcon.style.display = 'block';
                        noteBox.classList.add('selected');
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
                        const checkIcon = noteBox.querySelector('.note-check-icon');
                        const isSelected = noteBox.classList.toggle('selected');
                        if (isSelected) {
                            checkIcon.style.display = 'block';
                            noteBox.style.transform = "scale(.9)";
                        } else {
                            checkIcon.style.display = 'none';
                            noteBox.style.transform = "scale(1)";
                        }

                        const anySelected = document.querySelector('.note-box.selected');
                        if (anySelected) {
                        } else {
                            hideDecision();
                        }
                    }
                } else if (!longPressFired && !wasCanceled) {
                    if (note.isLocked) {
                        showUnlockPrompt(note.id);
                    } else {
                    window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
                    }
                }
                longPressFired = false;
            });
        }

        notes.forEach(note => {
            const noteBox = document.createElement('div');
            noteBox.className = 'note-box';
            noteBox.setAttribute('id', note.id);

            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'circle-check');
            checkIcon.classList.add('note-check-icon');
            checkIcon.style.display = 'none';
            noteBox.appendChild(checkIcon);

            if (note.isImportant) {
                const isImportantIcon = document.createElement('i');
                noteBox.classList.add('important-note');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

            if (note.isLocked) {
                const lockIcon = document.createElement('i');
                lockIcon.setAttribute('data-lucide', 'lock-keyhole');
                lockIcon.classList.add('lock-icon');
                const lockBackground = document.createElement('div');
                lockBackground.classList.add('lock-background');
                lockBackground.appendChild(lockIcon);
                noteBox.classList.add('locked-note');
                noteBox.appendChild(lockBackground);
            }

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title;
            noteTitle.className = 'title';

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
        blur_background.style.visibility = 'visible';
        decision_hider.style.visibility = 'visible';
    }, 100);
}

function not_lock() {
    setTimeout(() => {
        lock_menu.classList.add("slide-out");
        lock_menu.classList.remove("slide-in");
        blur_background.style.visibility = 'hidden';
        decision_hider.style.visibility = 'hidden';
    }, 100);
}

function do_lock() {
    setTimeout(() => {
        lock_menu.classList.add("slide-out");
        lock_menu.classList.remove("slide-in");
        lock_password_menu.classList.add("slide-in");
        lock_password_menu.classList.remove("slide-out");
        lock_password.value = "";
        lock_password_confirm.value = "";
    }, 100);
}

function cancel_lock() {
    setTimeout(() => {
        lock_menu.classList.add("slide-in");
        lock_menu.classList.remove("slide-out");
        lock_password_menu.classList.add("slide-out");
        lock_password_menu.classList.remove("slide-in");
    }, 100);
}

continue_lock_btn.disabled = true;

function lock_password_validation() {
    const password = lock_password.value;
    const confirm = lock_password_confirm.value;

    const noSpaces = !password.includes(" ") && !confirm.includes(" ");
    const lock_password_Filled = password.length > 0 && confirm.length > 0;
    const longEnough_lock_passwords = password.length >= 8 && confirm.length >= 8;
    const lock_match = password === confirm;

    if (lock_password_Filled && longEnough_lock_passwords && lock_match && noSpaces) {
        continue_lock_btn.disabled = false;
    } else {
        continue_lock_btn.disabled = true;
    }
}

lock_password.addEventListener("input", lock_password_validation);
lock_password_confirm.addEventListener("input", lock_password_validation);

async function continue_lock() {
        setTimeout(async () => {
        const selectedNotes = document.querySelectorAll('.note-box.selected');

        if (selectedNotes.length === 0) {
            alert("No note selected.");
            return;
        }

        const password = lock_password.value.trim();
        const confirmPassword = lock_password_confirm.value.trim();

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

        const noteIds = Array.from(selectedNotes).map(note => parseInt(note.id));

        let payload;

        if (noteIds.length === 1) {
            payload = {
                Id: noteIds[0],
                Lock_Password: password
            };
        } else {
            payload = {
                NoteIds: noteIds,
                Lock_Password: password
            };
        }

        try {
            const response = await fetch("http://localhost:5216/api/Notes/lock_note", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Failed to lock notes.");
                return;
            }

            hideDecision();

            selectedNotes.forEach(note => {
                const checkIcon = note.querySelector('.note-check-icon');
                if (checkIcon) checkIcon.style.display = 'none';
            });

            const folderPage = document.getElementById("folder_page");
            const isInsideFolder = folderPage && folderPage.style.display === 'grid';

            if (isInsideFolder) {
                const openedFolder = document.querySelector('.folder-box.opened');
                if (openedFolder) {
                    const folderId = openedFolder.id;
                    await opened_folder(folderId);
                }
            } else {
                await loadNotes();
            }

        } catch (error) {
            console.error("Error locking notes:", error);
            alert("Error locking notes.");
        }
    }, 100);
}

function showUnlockPrompt(noteId) {
    blur_background.style.visibility = 'visible';
    unlock_menu.classList.add("show");
    unlock_menu.classList.remove("hide");

    unlock_menu.dataset.noteId = noteId;
}

function cancel_unlock() {
    setTimeout(() => {
        unlock_menu.classList.add("hide");
        unlock_menu.classList.remove("show");
        blur_background.style.visibility = 'hidden';
        unlock_password.value = "";
    }, 100);
}

continueUnlockBtn.disabled = true;

function unlock_password_validation() {
    const password = unlock_password.value;
    const noSpaces = !password.includes(" ");
    const longEnough = password.length >= 8;

    if (noSpaces && longEnough) {
        continueUnlockBtn.disabled = false;
    } else {
        continueUnlockBtn.disabled = true;
    }
}

unlock_password.addEventListener("input", unlock_password_validation);

async function continue_unlock() {
        setTimeout(async () => {
        try {
            const noteId = parseInt(unlock_menu.dataset.noteId);
            const unlockPassword = unlock_password.value.replace(/\s+/g, '');

            if (!unlockPassword || unlockPassword.length < 8) {
                alert("Password must be at least 8 characters long.");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                alert("You must be logged in to unlock notes.");
                return;
            }

            const response = await fetch("http://localhost:5216/api/notes/open_locked_note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    Id: noteId,
                    Lock_Password: unlockPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to unlock note.");
                return;
            }

            window.location.href = `../Edit_notes/Edit_notes.html?id=${noteId}`;

        } catch (error) {
            console.error("Error unlocking note:", error);
            alert("An unexpected error occurred while unlocking the note.");
        }
    }, 100);
}

async function mark_important() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to mark notes as important.");
        return;
    }

    const noteIds = Array.from(document.querySelectorAll(".note-box.selected"))
        .map(note => parseInt(note.id))
        .filter(id => !isNaN(id));

    try {
        const response = await fetch("http://localhost:5216/api/Notes/mark_important", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                NoteIds: noteIds,
                isImportant: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error from backend:", errorText);
            throw new Error("Failed to update importance.");
        }

        hideDecision();
        loadNotes();
        open_folder(folderId);
    } catch (error) {
        console.error("Error updating notes:", error);
        alert("Error updating notes.");
    }
}

function download_note() {
    setTimeout(() => {
        console.log("Downloading note...");

        download_menu.classList.add("slide-in");
        download_menu.classList.remove("slide-out");
        blur_background.style.visibility = 'visible';
        decision_hider.style.visibility = 'visible';
    }, 100);
}

async function send_to_trash() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to delete notes.");
        return;
    }

    const noteIds = Array.from(document.querySelectorAll(".note-box.selected"))
        .map(note => parseInt(note.id))
        .filter(id => !isNaN(id));

    try {
        const response = await fetch("http://localhost:5216/api/Notes/delete_multiple_notes", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ noteIds })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete notes.");
        }

        blur_backgroundHandler();
        hideDecision();
        loadNotes();
    } catch (error) {
        console.error("Error deleting notes:", error);
        alert("Error deleting notes.");
    }
}


//*Will be used to clear the local storage for testing purposes*//

// localStorage.removeItem('notes');


//TODO: Use only when wanting to see in your phone (when using comment code from line 50)
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

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
                const checkIcon = noteBox.querySelector('.note-check-icon');
                checkIcon.style.display = 'block';
                noteBox.classList.add('selected');
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
                    const checkIcon = noteBox.querySelector('.note-check-icon');
                    const isSelected = noteBox.classList.toggle('selected');

                    if (isSelected) {
                        checkIcon.style.display = 'block';
                        noteBox.style.transform = "scale(.9)";
                    } else {
                        checkIcon.style.display = 'none';
                        noteBox.style.transform = "scale(1)";
                    }

                    const anySelected = document.querySelector('.note-box.selected');
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
            const noteBox = document.createElement('div');
            noteBox.className = 'note-box';
            noteBox.setAttribute('id', note.id);

            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'circle-check');
            checkIcon.classList.add('note-check-icon');
            checkIcon.style.display = 'none';
            noteBox.appendChild(checkIcon);

            if (note.isImportant) {
                const isImportantIcon = document.createElement('i');
                noteBox.classList.add('important-note');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

            if (note.isLocked) {
                const lockIcon = document.createElement('i');
                lockIcon.setAttribute('data-lucide', 'lock-keyhole');
                lockIcon.classList.add('lock-icon');
                const lockBackground = document.createElement('div');
                lockBackground.classList.add('lock-background');
                lockBackground.appendChild(lockIcon);
                noteBox.classList.add('locked-note');
                noteBox.appendChild(lockBackground);
            }

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title;
            noteTitle.className = 'title';

            noteBox.appendChild(noteContent);
            noteBox.appendChild(noteTitle);
            container.appendChild(noteBox);

            setupNoteEvents(noteBox, note);
        });

        lucide.createIcons();
    }
});