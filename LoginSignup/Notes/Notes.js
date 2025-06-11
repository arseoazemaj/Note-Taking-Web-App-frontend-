const menuOpener = document.getElementById("menuopener");
const menuPage = document.getElementById("menu-page");
const logoutBtn = document.getElementById("log-out_btn");
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

//TODO Uncomment in the end
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
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

document.addEventListener('DOMContentLoaded', async function() { //*Show the saved notes
    try {
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

        notes.forEach(note => {
            const noteBox = document.createElement('div');
            noteBox.className = 'note-box';

            noteBox.setAttribute('id', note.id);
            

            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'circle-check');
            checkIcon.classList.add('check-icon');
            noteBox.appendChild(checkIcon);

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content.length > 90 ? note.content.substring(0, 78) + "..." : note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title.length > 9 ? note.title.substring(0, 12) + "..." : note.title;
            noteTitle.className = 'title';

            if (note.isImportant) {
                noteBox.classList.add('important-note');
                const isImportantIcon = document.createElement('i');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.id = 'star';
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

            let longPressTimer = null;
            let longPressFired = false;
            let wasCanceled = false;
            const LONG_PRESS_MS = 1000;
            const MOVE_THRESHOLD = 15;
            let startX = 0;
            let startY = 0;

            function startPress(e) {
                e.preventDefault();
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                longPressTimer = setTimeout(() => {
                    longPressFired = true;
                    const checkIcon = noteBox.querySelector('.check-icon');
                    checkIcon.style.display = 'block';
                    noteBox.classList.toggle('selected');
                    noteBox.style.transform = "scale(.95)";
                }, LONG_PRESS_MS);
            }

            function cancelPress() {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            }

            function touchMove(e) {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    cancelPress();
                }
            }

            function endPress(e) {
                clearTimeout(longPressTimer);
                if (!longPressFired && !wasCanceled) {
                    window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
                }
            }

            noteBox.addEventListener('touchstart', startPress);
            noteBox.addEventListener('touchend',   endPress);
            noteBox.addEventListener('touchmove',  touchMove);
            noteBox.addEventListener('touchcancel',cancelPress);

            noteBox.appendChild(noteContent);
            noteBox.appendChild(noteTitle);
            containers.appendChild(noteBox);
        });
        lucide.createIcons();
    }
    catch (error) {
        console.error("Fetch error:", error);
    }
});



//*Will be used to clear the local storage for testing purposes*//

// localStorage.clear();


//TODO: Use only when wanting to see in your phone (when using comment code from line 50)
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.getElementById('containers');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

        notes.forEach(note => {
            const noteBox = document.createElement('div');
            noteBox.className = 'note-box';

            noteBox.setAttribute('id', note.id);
            

            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'circle-check');
            checkIcon.classList.add('check-icon');
            noteBox.appendChild(checkIcon);

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.content.length > 90 ? note.content.substring(0, 78) + "..." : note.content;

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title.length > 9 ? note.title.substring(0, 12) + "..." : note.title;
            noteTitle.className = 'title';

            if (note.isImportant) {
                noteBox.classList.add('important-note');
                const isImportantIcon = document.createElement('i');
                isImportantIcon.setAttribute('data-lucide', 'star');
                isImportantIcon.id = 'star';
                isImportantIcon.classList.add('important-icon');
                noteBox.appendChild(isImportantIcon);
            }

            let longPressTimer = null;
            let longPressFired = false;
            let wasCanceled = false;
            const LONG_PRESS_MS = 1000;
            const MOVE_THRESHOLD = 15;
            let startX = 0;
            let startY = 0;

            function startPress(e) {
                e.preventDefault();
                longPressFired = false;
                wasCanceled = false;

                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;

                longPressTimer = setTimeout(() => {
                    longPressFired = true;
                    const checkIcon = noteBox.querySelector('.check-icon');
                    checkIcon.style.display = 'block';
                    noteBox.classList.toggle('selected');
                    noteBox.style.transform = "scale(.95)";
                    noteContent.style.top = "0px"
                }, LONG_PRESS_MS);
            }

            function cancelPress() {
                clearTimeout(longPressTimer);
                wasCanceled = true;
            }

            function touchMove(e) {
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MOVE_THRESHOLD) {
                    cancelPress();
                }
            }

            function endPress(e) {
                clearTimeout(longPressTimer);
                if (!longPressFired && !wasCanceled) {
                    window.location.href = `../Edit_notes/Edit_notes.html?id=${note.id}`;
                }
            }

            noteBox.addEventListener('touchstart', startPress);
            noteBox.addEventListener('touchend',   endPress);
            noteBox.addEventListener('touchmove',  touchMove);
            noteBox.addEventListener('touchcancel',cancelPress);

            noteBox.appendChild(noteContent);
            noteBox.appendChild(noteTitle);
            containers.appendChild(noteBox);
        });
    lucide.createIcons();
});