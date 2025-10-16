const menuOpener = document.getElementById("menuopener");
const menuPage = document.getElementById("menu-page");

let menuOpen = false;

menuOpener.addEventListener("touchstart", (e) => {
    e.stopPropagation();
    if (!menuOpen) {
        menuPage.classList.remove("slide-out");
        menuPage.classList.add("slide-in");
        menuOpen = true;
    }
});

document.addEventListener("touchstart", (e) => {
    if (menuOpen && !menuPage.contains(e.target)) {
        menuPage.classList.remove("slide-in");
        menuPage.classList.add("slide-out");
        menuOpen = false;
    }
});

const noteButton = document.getElementById("note");
if (noteButton) {
    noteButton.addEventListener("click", () => {
        if (menuOpen) {
            menuPage.classList.remove("slide-in");
            menuPage.classList.add("slide-out");
            menuOpen = false;
        }
    });
}

let SelectionMode = false;
let SelectedNotes = false;
let SelectedFolders = false;

document.addEventListener('DOMContentLoaded', loadNotes );

function anySelected() {
    return document.querySelectorAll('.note-box.selected, .folder-box.selected').length > 0;
}

function updateSelectionModeFromDOM() {
    const any = anySelected();
    if (any && !SelectionMode) {
        SelectionMode = true;
        showDecision();
    } else if (!any && SelectionMode) {
        SelectionMode = false;
        hideDecision();
    }
}

async function loadNotes() {
    const containers = document.getElementById("containers");
    try {
        const response = await fetch('http://localhost:5216/api/Notes/get_notes', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            containers.textContent = "Failed to load notes: " + response.status;
            return;
        }

        const notes = await response.json();

        containers.innerHTML = "";

        let longPressTimer = null;
        let longPressFired = false;
        let wasCanceled = false;
        const LONG_PRESS_MS = 500;
        const MOVE_THRESHOLD = 5;
        let startX = 0;
        let startY = 0;

        function setupNoteEvents(noteBox, note) {
            noteBox.addEventListener('touchstart', function(e) {
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                longPressTimer = setTimeout(() => {
                    longPressFired = true;
                    SelectionMode = true;
                    SelectedNotes = true;
                    const checkIcon = noteBox.querySelector('.note-check-icon');
                    checkIcon.style.display = 'block';
                    noteBox.classList.add('selected');
                    noteBox.style.transform = "scale(.9)";
                    showDecision();
                }, LONG_PRESS_MS);
            });

            noteBox.addEventListener('touchmove', function(e) {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    clearTimeout(longPressTimer);
                    wasCanceled = true;
                }
            });

            noteBox.addEventListener('touchcancel', function() {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            });

            noteBox.addEventListener('touchend', function() {
                clearTimeout(longPressTimer);

                if (wasCanceled) {
                    return;
                }

                if (SelectionMode) {
                    if (!longPressFired) {
                        const checkIcon = noteBox.querySelector('.note-check-icon');
                        const isSelected = noteBox.classList.toggle('selected');
                        if (isSelected) {
                            SelectedNotes = true;
                            checkIcon.style.display = 'block';
                            noteBox.style.transform = "scale(.9)";
                        } else {
                            SelectedNotes = false;
                            checkIcon.style.display = 'none';
                            noteBox.style.transform = "scale(1)";
                        }
                        updateSelectionModeFromDOM();
                    }
                } else if (!longPressFired && !wasCanceled) {
                    if (note.isLocked) {
                        console.log("This note is locked. Please unlock it to view or edit.");
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
            containers.appendChild(noteBox);

            setupNoteEvents(noteBox, note);
        });

        lucide.createIcons();
        LoadFolders();
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function showDecision() {
    document.getElementById("decide").style.display = 'block';
    document.getElementById("new_note").style.display = 'none';
}

function hideDecision() {
    document.getElementById("decide").style.display = 'none';
    document.getElementById("more_options").style.visibility = 'hidden';
    document.getElementById("new_note").style.display = 'block';
    blur_background.style.visibility = 'hidden';
    lock_password_menu.style.visibility = 'hidden';
}

const blur_background = document.getElementById("blur-background");
blur_background.addEventListener('touchstart', blur_backgroundHandler);

const move_btn = document.getElementById("move");
const move_menu = document.getElementById("move_menu");
const create_folder_menu = document.getElementById("create_folder");
const folder_namer = document.getElementById("folder_namer");
const colorBox = document.querySelectorAll(".colors");
const color_check = document.getElementsByClassName("check_color");

const lock_menu = document.getElementById("lock_menu_ask");
const lock_password_menu = document.getElementById("lock_password_menu");
const lock_password = document.getElementById("lock_password");
const lock_password_confirm = document.getElementById("confirm_lock_password");
const continueLockBtn = document.getElementById("continue_lock");
const lockPasswordInput = document.getElementById("lock_password");
const confirmLockPasswordInput = document.getElementById("confirm_lock_password");
const unlock_menu = document.getElementById("unlock_notes");
const unlock_password = document.getElementById("unlock_password");
const continueUnlockBtn = document.getElementById("continue_unlock");

const more_container = document.getElementById("more_container");
const more_options = document.getElementById("more_options");


let selectedColor = null;

colorBox.forEach(box => {
    box.addEventListener('touchstart', () => {
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

function blur_backgroundHandler() {
    console.log("Blur background activated");
    move_menu.style.visibility = 'hidden';
    create_folder_menu.style.visibility = 'hidden';
    folder_namer.value = "";
    for (let i = 0; i < color_check.length; i++) {
        color_check[i].style.visibility = 'hidden';
    }
    lock_menu.style.visibility = 'hidden';
    lock_password_menu.style.visibility = 'hidden';
    unlock_menu.style.visibility = 'hidden';
    unlock_password.value = "";

    blur_background.style.visibility = 'hidden';
}

function move() {
        document.body.style.overflow = 'hidden';
        more_options.style.visibility = 'hidden';
        move_menu.style.visibility = 'visible';
        blur_background.style.visibility = 'visible';
}

function create_folder() {
    create_folder_menu.style.visibility = 'visible';
    move_menu.style.visibility = 'hidden';
}

async function add_folder() {
    const folderName = document.getElementById("folder_namer").value.trim();
    const folderColor = selectedColor;

    if (!folderName && !folderColor) {
        alert("Folder name and color cannot be empty.");
        return;
    }
    if (!folderName) {
        alert("Folder name cannot be empty.");
        return;
    }
    if (!folderColor) {
        alert("Please select a color.");
        return;
    }

    const folder  = {
        Name: folderName,
        Color: folderColor
    }

    try {
        const response = await fetch('http://localhost:5216/api/Folders/create_folder', {
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

    cancel();
    LoadFolders();
    LoadFolderName();
}

function cancel_folder() {
    create_folder_menu.style.visibility = 'hidden';
    move_menu.style.visibility = 'visible';
    folder_namer.value = "";
    for (let i = 0; i < color_check.length; i++) {
        color_check[i].style.visibility = 'hidden';
    }
}

document.addEventListener("touchstart", function(event) {
    if (!more_container.contains(event.target)) {
        more_options.style.visibility = "hidden";
    }
});

const folders_menu = document.getElementById("folders_menu");

async function LoadFolders() {
    try {
        const response = await fetch('http://localhost:5216/api/Folders/get_folder', {
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

        let longPressTimer = null;
        let longPressFired = false;
        let wasCanceled = false;
        const LONG_PRESS_MS = 500;
        const MOVE_THRESHOLD = 5;
        let startX = 0;
        let startY = 0;

        function setupFolderEvents(folderBox, folder) {
            folderBox.addEventListener('touchstart', (e) => {
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                longPressTimer = setTimeout(() => {
                    longPressFired = true;
                    SelectionMode = true;
                    SelectedFolders = true;
                    const checkIcon = folderBox.querySelector('.folder-check-icon');
                    checkIcon.style.display = 'block';
                    folderBox.classList.add('selected');
                    showDecision();
                    chosingDecisions();
                }, LONG_PRESS_MS);
            });

            folderBox.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    clearTimeout(longPressTimer);
                    wasCanceled = true;
                }
            });

            folderBox.addEventListener('touchcancel', () => {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            });

            folderBox.addEventListener('touchend', () => {
                clearTimeout(longPressTimer);

                if (wasCanceled) return;

                if (SelectionMode) {
                    if (!longPressFired) {
                        const checkIcon = folderBox.querySelector('.folder-check-icon');
                        const isSelected = folderBox.classList.toggle('selected');

                        if (isSelected) {
                            SelectedFolders = true;
                            checkIcon.style.display = 'block';
                            folderBox.style.transform = "scale(.9)";
                            chosingDecisions();
                        } else {
                            SelectedFolders = false;
                            checkIcon.style.display = 'none';
                            folderBox.style.transform = "scale(1)";
                            chosingDecisions();
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

function chosingDecisions() {
    const anySelectedFolder = document.querySelector('.folder-box.selected');

    if (anySelectedFolder) {
        SelectedFolders = true;
        move_btn.disabled = true;
    } else {
        SelectedFolders = false;
        move_btn.disabled = false;
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
    folderPage.style.display = 'grid';
    folder_blur.style.visibility = 'visible';
}

folder_blur.addEventListener('touchstart', () => {
    folderPage.style.display = 'none';
    folder_blur.style.visibility = 'hidden';
    document.querySelectorAll('.note-box.selected, .folder-box.selected').forEach(el => {
        el.classList.remove('selected');
        el.style.transform = "scale(1)";
        const checkIcon = el.querySelector('.note-check-icon, .folder-check-icon');
        if (checkIcon) {
            checkIcon.style.display = 'none';
        }
    });

    SelectionMode = false;
    hideDecision();
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
        const response = await fetch('http://localhost:5216/api/Folders/get_folderName', {
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
            
            note_counter = document.createElement('p');
            note_counter.className = 'note_counter';

            folder_element.appendChild(folderIcon);
            folder_element.appendChild(folderName);
            folder_element.appendChild(note_counter);
            folderList.appendChild(folder_element);

            folder_element.addEventListener('touchstart', () => {
                touchmoved = false;
            });

            folder_element.addEventListener('touchmove', () => {
                touchmoved = true;
            });

            folder_element.addEventListener('touchend', () => {
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
        const response = await fetch('http://localhost:5216/api/Folders/SendNoteToFolder', {
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

        const result = await response.text();
        console.log(result);
        await loadNotes();
        SelectionMode = false;
        hideDecision();
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

        let longPressTimer = null;
        let longPressFired = false;
        let wasCanceled = false;
        const LONG_PRESS_MS = 500;
        const MOVE_THRESHOLD = 5;
        let startX = 0;
        let startY = 0;

        function NoteEvents(noteBox, note) {
            noteBox.addEventListener('touchstart', function(e) {
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                    longPressTimer = setTimeout(() => {
                        longPressFired = true;
                        SelectionMode = true;
                        SelectedNotes = true;
                        const checkIcon = noteBox.querySelector('.note-check-icon');
                        checkIcon.style.display = 'block';
                        noteBox.classList.add('selected');
                        noteBox.style.transform = "scale(.9)";
                        showDecision();
                    }, LONG_PRESS_MS);
            });

            noteBox.addEventListener('touchmove', function(e) {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    clearTimeout(longPressTimer);
                    wasCanceled = true;
                }
            });

            noteBox.addEventListener('touchcancel', function() {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            });

            noteBox.addEventListener('touchend', function() {
                clearTimeout(longPressTimer);

                if (wasCanceled) {
                    return;
                }

                if (SelectionMode) {
                    if (!longPressFired) {
                        const checkIcon = noteBox.querySelector('.note-check-icon');
                        const isSelected = noteBox.classList.toggle('selected');
                        if (isSelected) {
                            SelectedNotes = true;
                            checkIcon.style.display = 'block';
                            noteBox.style.transform = "scale(.9)";
                        } else {
                            SelectedNotes = false;
                            checkIcon.style.display = 'none';
                            noteBox.style.transform = "scale(1)";
                        }

                        const anySelected = document.querySelector('.note-box.selected');
                        if (anySelected) {
                            SelectionMode = true;
                        } else {
                            SelectionMode = false;
                            hideDecision();
                        }
                    }
                } else if (!longPressFired && !wasCanceled) {
                    if (note.isLocked) {
                        console.log("This note is locked. Please unlock it to view or edit.");
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

function more() {
    if (more_options.style.visibility === 'visible') {
        more_options.style.visibility = 'hidden';
    } else {
        more_options.style.visibility = 'visible';
    }
}

function lock() {
    lock_menu.style.visibility = 'visible';
    blur_background.style.visibility = 'visible';
}

function not_lock() {
    lock_menu.style.visibility = 'hidden';
    blur_background.style.visibility = 'hidden';
}

function do_lock() {
    lock_menu.style.visibility = 'hidden';
    lock_password_menu.style.visibility = 'visible';
    lock_password.value = "";
    lock_password_confirm.value = "";
}

function cancel_lock() {
    lock_password_menu.style.visibility = 'hidden';
    lock_menu.style.visibility = 'visible';
}

continueLockBtn.disabled = true;

function lock_password_validation() {
    const password = lock_password.value;
    const confirm = lock_password_confirm.value;

    const noSpaces = !password.includes(" ") && !confirm.includes(" ");
    const lock_password_Filled = password.length > 0 && confirm.length > 0;
    const longEnough_lock_passwords = password.length >= 8 && confirm.length >= 8;
    const lock_match = password === confirm;

    if (lock_password_Filled && longEnough_lock_passwords && lock_match && noSpaces) {
        continueLockBtn.disabled = false;
    } else {
        continueLockBtn.disabled = true;
    }
}

lock_password.addEventListener("input", lock_password_validation);
lock_password_confirm.addEventListener("input", lock_password_validation);

async function continue_lock() {
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
        const response = await fetch('http://localhost:5216/api/Notes/lock_note', {
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
        SelectionMode = false;

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
}

function showUnlockPrompt(noteId) {
    blur_background.style.visibility = 'visible';
    unlock_menu.style.visibility = 'visible';

    unlock_menu.dataset.noteId = noteId;

    console.log("Note unlocked.")
}

function cancel_unlock() {
    unlock_menu.style.visibility = 'hidden';
    blur_background.style.visibility = 'hidden';
    unlock_password.value = "";
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
}


//*Will be used to clear the local storage for testing purposes*//

// localStorage.removeItem('notes');


//TODO: Use only when wanting to see in your phone (when using comment code from line 50)
document.addEventListener('DOMContentLoaded', function() {
    let SelectionMode = false;
    const containers = document.getElementById('containers');
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    let longPressTimer = null;
    let longPressFired = false;
    let wasCanceled = false;
    const LONG_PRESS_MS = 500;
    const MOVE_THRESHOLD = 5;
    let startX = 0;
    let startY = 0;

    function setupNoteEvents(noteBox, note) {
        noteBox.addEventListener('touchstart', function(e) {
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

        noteBox.addEventListener('touchmove', function(e) {
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > MOVE_THRESHOLD) {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            }
        });

        noteBox.addEventListener('touchcancel', function() {
            clearTimeout(longPressTimer);
            wasCanceled = true;
        });

        noteBox.addEventListener('touchend', function() {
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
            containers.appendChild(noteBox);

            setupNoteEvents(noteBox, note);
        });

        lucide.createIcons();
    }
});