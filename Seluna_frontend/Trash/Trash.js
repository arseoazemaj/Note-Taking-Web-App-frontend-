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

const trashButton = document.getElementById("trash");
if (trashButton) {
    trashButton.addEventListener("click", () => {
        if (menuOpen) {
            menuPage.classList.remove("slide-in");
            menuPage.classList.add("slide-out");
            menuOpen = false;
        }
    });
}

let selectionMode = false;
let SelectedNotes = false;
let SelectedFolders = false;
let longPressTimer = null;
let longPressFired = false;
let wasCanceled = false;
const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 5;
let startX = 0;
let startY = 0;

document.addEventListener('DOMContentLoaded', load_deleted_Notes );
document.addEventListener('DOMContentLoaded', load_deleted_Folders );

function anySelected() {
    return document.querySelectorAll('.note-box.selected').length > 0;
}

function updateselectionModeFromDOM() {
    const any = anySelected();
    if (any && !selectionMode) {
        showDecisionBar();
    } else if (!any && selectionMode) {
        hideDecisionBar();
    }
}

async function load_deleted_Notes() {
    const container = document.getElementById("container");
    try {
        const response = await fetch("http://localhost:5216/api/Notes/get_deleted_notes", {
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
                    selectionMode = true;
                    SelectedNotes = true;
                    longPressFired = true;
                    const checkIcon = noteBox.querySelector('.note-check-icon');
                    checkIcon.style.display = 'block';
                    noteBox.classList.add('selected');
                    noteBox.style.transform = "scale(.9)";
                    showDecisionBar();
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

                if (selectionMode) {
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
                        updateselectionModeFromDOM();
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
    } catch (error) {
        console.error("Fetch error:", error);
    }
}


async function load_deleted_Folders() {
    try {
        const response = await fetch("http://localhost:5216/api/Folders/get_deleted_folders", {
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

function withAlpha(hexColor, alphaHex) {
    let base = hexColor.replace("#", "");
    if (base.length === 8) base = base.substring(0, 6);
    return `#${base}${alphaHex}`;
}

const decide = document.getElementById("decide");
function showDecisionBar() {
    decide.classList.add("slide-in");
    decide.classList.remove("slide-out");
    selectionMode = true
}

function hideDecisionBar() {
    decide.classList.add("slide-out");
    decide.classList.remove("slide-in");
    selectionMode = false;
}