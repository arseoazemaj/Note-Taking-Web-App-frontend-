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

        if (notes.isImportant) {
            noteBox.classList.add('important');
        }

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
                    noteBox.style.transform = "scale(.95)";
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
                            noteBox.style.transform = "scale(.95)";
                        } else {
                            checkIcon.style.display = 'none';
                            noteBox.style.transform = "scale(1)";
                        }

                        updateSelectionModeFromDOM();
                    }
                } else if (!longPressFired && !wasCanceled) {
                    window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
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

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title;
            noteTitle.className = 'title';

            if (note.isImportant) {
                noteBox.classList.add('important-note');
                const isImportantIcon = document.createElement('i');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.id = 'star';
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

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
}

const selectionMore = document.querySelectorAll('.note-box.selected');
const move_menu = document.getElementById("move_menu");
const more_options = document.getElementById("more_options");
const create_folder_menu = document.getElementById("create_folder");
const blur_background = document.getElementById("blur-background");
const colorBox = document.querySelectorAll(".colors");

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

function create_folder() {
    if (create_folder_menu.style.display !== 'block') {
        create_folder_menu.style.visibility = 'visible';
        create_folder_menu.style.display = 'block';
        move_menu.style.visibility = 'hidden';
    }
}

const folders_menu = document.getElementById("folders_menu");

async function add() {
    const folderName = document.getElementById("folder_namer").value.trim();
    const folderColor = selectedColor;

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

function move() {
    if (move_menu) {
        move_menu.style.visibility = 'visible';
        blur_background.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        more_options.style.visibility = 'hidden';
    }
}

function more() {
    if (more_options.style.visibility === 'visible') {
        more_options.style.visibility = 'hidden';
    } else {
        more_options.style.visibility = 'visible';
    }
}

document.addEventListener("touchstart", function (event) {
    if (!move_menu.contains(event.target)) {
        move_menu.style.visibility = 'hidden';
        create_folder_menu.style.display = 'none';
        blur_background.style.visibility = 'hidden';
        document.body.style.overflow = 'visible';

        document.querySelectorAll('.check_color').forEach(icon => {
            icon.style.visibility = 'hidden';
        });
    }
});

function cancel() {
    if (create_folder_menu.style.display === 'block') {
        create_folder_menu.style.display = 'none';
        move_menu.style.visibility = 'visible';
    }
}


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

                    const checkIcon = folderBox.querySelector('.folder-check-icon');
                    checkIcon.style.display = 'block';
                    folderBox.classList.add('selected');
                    showDecision();
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
                            checkIcon.style.display = 'block';
                            folderBox.style.transform = "scale(.95)";
                        } else {
                            checkIcon.style.display = 'none';
                            folderBox.style.transform = "scale(1)";
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

const folderPage = document.getElementById("folder_page");
const folder_blur = document.getElementById("folder_blur");

function open_folder(folderId) {
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

            folder_element.addEventListener('touchend', () => {
                const folderId = folder.id;
                const selectedNotes = document.querySelectorAll('.note-box.selected');
                const selectedNoteIds = Array.from(selectedNotes).map(n => n.id);

                selectedNoteIds.forEach(noteId => {
                    sendNoteToFolder(noteId, folderId);
                });
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
                        const checkIcon = noteBox.querySelector('.note-check-icon');
                        checkIcon.style.display = 'block';
                        noteBox.classList.add('selected');
                        noteBox.style.transform = "scale(.95)";
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
                            noteBox.style.transform = "scale(.95)";
                        } else {
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
                    window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
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

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title;
            noteTitle.className = 'title';

            if (note.isImportant) {
                noteBox.classList.add('important-note');
                const isImportantIcon = document.createElement('i');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.id = 'star';
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

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



//*Will be used to clear the local storage for testing purposes*//

// localStorage.removeItem('notes');


//TODO: Use only when wanting to see in your phone (when using comment code from line 50)
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.getElementById('containers');
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Shared variables for all notes
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
                noteBox.style.transform = "scale(.95)";
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
                        noteBox.style.transform = "scale(.95)";
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
            checkIcon.classList.add('check-icon');
            checkIcon.style.display = 'none';
            noteBox.appendChild(checkIcon);

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title;
            noteTitle.className = 'title';

            if (note.isImportant) {
                noteBox.classList.add('important-note');
                const isImportantIcon = document.createElement('i');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.id = 'star';
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

            noteBox.appendChild(noteContent);
            noteBox.appendChild(noteTitle);
            containers.appendChild(noteBox);

            setupNoteEvents(noteBox, note);
        });

        lucide.createIcons();
    }
});