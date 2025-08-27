const menuOpener = document.getElementById("menuopener");
const menuPage = document.getElementById("menu-page");

let menuOpen = false;

menuOpener.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!menuOpen) {
        menuPage.classList.remove("slide-out");
        menuPage.classList.add("slide-in");
        menuOpen = true;
    }
});

document.addEventListener("click", (e) => {
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

function truncateText(element, wordLimit) {
    let text = element.textContent.trim();
    let words = text.split(/\s+/);

    if (words.length > wordLimit) {
        words = words.slice(0, wordLimit);
        element.textContent = words.join(' ') + '...';
    }
}

window.onload = function() {
    const noteContents = document.querySelectorAll('.note-content');
    noteContents.forEach(function(noteContent) {
        truncateText(noteContent, 10);
    });
};

let SelectionMode = false;

document.addEventListener('DOMContentLoaded', async function () {
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

        function showDecision() {
            document.getElementById("decide").style.display = 'block';
            document.getElementById("new_note").style.display = 'none';
        }

        function hideDecision() {
            document.getElementById("decide").style.display = 'none';
            document.getElementById("new_note").style.display = 'block';
        }

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
                        const checkIcon = noteBox.querySelector('.check-icon');
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
                        const checkIcon = noteBox.querySelector('.check-icon');
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
            noteTitle.textContent = note.title.length > 11 ? note.title.substring(0, 11) + "..." : note.title;
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
});

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

    LoadFolders();
    cancel();
}

function move() {
    if (move_menu) {
        move_menu.style.visibility = 'visible';
        blur_background.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
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


async function LoadFolders(){
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

        folders.forEach(folder => {
            const folderBox = document.createElement('div');
            folderBox.className = 'folder-box';
            folderBox.setAttribute('id', folder.id);

            const folderIcon = document.createElement('i');
            folderIcon.setAttribute('data-lucide', 'folder-closed');
            folderIcon.classList.add('folder-icon');

            const Color = folder.color;
            const fillColor = withAlpha(folder.color, "73");
            const shadowColor = withAlpha(folder.color, "BD");
            folderIcon.style.color = Color;
            folderIcon.style.fill = fillColor;
            folderIcon.style.filter = `drop-shadow(2px 2px 4px ${shadowColor})`;

            const folderName = document.createElement('p');
            folderName.className = 'folder-text';
            folderName.style.color = Color;
            folderName.textContent = folder.name.length > 14 ? folder.name.substring(0, 14) + "..." : folder.name;

            folderBox.appendChild(folderIcon);
            folderBox.appendChild(folderName);
            folders_menu.appendChild(folderBox);
        });

        lucide.createIcons();

    } catch (err) {
        console.error("Error loading folders:", err);
        folders_menu.textContent = "Error loading folders";
    }
}

function withAlpha(hexColor, alphaHex) {
    let base = hexColor.replace("#", "");
    if (base.length === 8) base = base.substring(0, 6);
    return `#${base}${alphaHex}`;
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

    function showDecisionMenu() {
        document.getElementById("decide").style.display = 'block';
        document.getElementById("new_note").style.display = 'none';
    }

    function hideDecisionMenu() {
        document.getElementById("decide").style.display = 'none';
        document.getElementById("new_note").style.display = 'block';
    }

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
                const checkIcon = noteBox.querySelector('.check-icon');
                checkIcon.style.display = 'block';
                noteBox.classList.add('selected');
                noteBox.style.transform = "scale(.95)";
                showDecisionMenu();
                document.getElementById("test_Logic").innerText = "Selection mode is on";
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
                    const checkIcon = noteBox.querySelector('.check-icon');
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
                        showDecisionMenu();
                    } else {
                        SelectionMode = false;
                        hideDecisionMenu();
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
            noteTitle.textContent = note.title.length > 11 ? note.title.substring(0, 11) + "..." : note.title;
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