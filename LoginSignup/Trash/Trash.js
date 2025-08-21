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

document.addEventListener('DOMContentLoaded', async function () {
    //*Shows notes younger than 30 days
    try {

        const response = await fetch('http://localhost:5216/api/Notes/get-deleted-notes', {
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

        notes.forEach(note => {
            const noteBox = document.createElement('div');
            noteBox.className = 'note-box';
            noteBox.setAttribute('id', note.id);

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
        });

        lucide.createIcons();
    } catch (error) {
        console.error("Fetch error:", error);
    }
});

document.getElementById("note_icon").innerHTML = note_icon;
document.getElementById("paint_icon").innerHTML = paint_icon;
document.getElementById("trash_icon").innerHTML = trash_icon;