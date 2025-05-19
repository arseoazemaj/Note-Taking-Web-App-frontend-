const menuOpener = document.getElementById("menuopener");
const menuPage = document.getElementById("menu-page");
const logoutBtn = document.getElementById("logoutBtn");
const token = localStorage.getItem("token");

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

document.addEventListener('DOMContentLoaded', function() {
    const containers = document.getElementById('containers');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.forEach((note, index) => {
        const noteBox = document.createElement('div');
        noteBox.className = 'note-box';
        noteBox.id = `${1 + index}`;

        const noteContent = document.createElement('p');
        noteContent.className = 'note-content';
        noteContent.textContent = note.content.length > 90 ? note.content.substring(0, 88) + "..." : note.content;

        const noteTitle = document.createElement('h3');
        noteTitle.textContent = note.title.length > 9 ? note.title.substring(0, 12) + "..." : note.title;
        noteTitle.className = 'title';

        noteBox.appendChild(noteContent);
        noteBox.appendChild(noteTitle);
        
        containers.appendChild(noteBox);
    });
});


//*Will be used to clear the local storage for testing purposes*//

// localStorage.clear();