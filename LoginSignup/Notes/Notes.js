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

const goToPainting = document.getElementById("painting");
if (goToPainting) {
    goToPainting.addEventListener("click", () => {
            window.location.href = "../Painting/Painting.html";
    });
}

const goToTrash = document.getElementById("trash");
if (goToTrash) {
    goToTrash.addEventListener("click", () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You are not logged in.");
            window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
        }
        else {
            window.location.href = "../Trash/Trash.html";}
    });
}

// if (logoutBtn) {
//     logoutBtn.addEventListener("click", () => {
//         localStorage.removeItem("token");
//         window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
//     });
// }

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

document.addEventListener('DOMContentLoaded', async function () {
    try {
        //TODO: Comment it only when want to see in phone (Uncomment in the end)
        // const token = localStorage.getItem('token');
        // if (!token) {
        //     containers.textContent = "You are not logged in.";
        //     window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
        //     return;
        // }

        const response = await fetch('https://localhost:5001/api/Notes/get-notes', {
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
        const MOVE_THRESHOLD = 15;
        let startX = 0;
        let startY = 0;
        let SelectionMode = false;

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
                e.preventDefault();
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
            noteContent.textContent = note.content.length > 92 ? note.content.substring(0, 92) + "..." : note.content;

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
    } catch (error) {
        console.error("Fetch error:", error);
    }
});




//*Will be used to clear the local storage for testing purposes*//

// localStorage.clear();


//TODO: Use only when wanting to see in your phone (when using comment code from line 50)
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.getElementById('containers');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Shared variables for all notes
    let longPressTimer = null;
    let longPressFired = false;
    let wasCanceled = false;
    const LONG_PRESS_MS = 500;
    const MOVE_THRESHOLD = 15;
    let startX = 0;
    let startY = 0;
    let SelectionMode = false;

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
            e.preventDefault();
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
        noteContent.textContent = note.content.length > 92 ? note.content.substring(0, 92) + "..." : note.content;

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
});