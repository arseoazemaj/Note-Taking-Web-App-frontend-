function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);
        const parsedPayload = JSON.parse(payload);
        return parsedPayload.nameid || null;
    } catch (e) {
        console.error("Failed to parse JWT token", e);
        return null;
    }
}

function SubMenu() {
    const container = document.getElementById("container");
    const isVisible = container.style.display === "block";

    if(isVisible) {
        container.style.display = "none";
    }
    else {
        container.style.display = "block";
    }
}

document.addEventListener("click", function (event) {
    const subMenu = document.getElementById("sub-menu_icon");
    const container = document.getElementById("container");

    if (!subMenu.contains(event.target) && !container.contains(event.target)) {
        container.style.display = "none";
    }
});

document.getElementById("sub-menu_icon").addEventListener("click", function (event) {
    event.stopPropagation();
    SubMenu();
});

let filled = false;

function fill() {
    const icon = document.getElementById("important-icon");
    
    if (filled) {
        icon.style.fill = "none";
    }
    else {
        icon.style.fill = "#dda9ff";
    }
    
    filled = !filled;
}

document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');

    if (!noteId) {
        console.error("No note ID found in URL");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert("You are not logged in.");
        return;
    }

    try {
        const response = await fetch(`https://localhost:5001/api/Notes/get-note/${noteId}`, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error("Failed to load note: " + response.status);
            return;
        }

        const note = await response.json();

        document.getElementById('title').value = note.title;
        document.getElementById('note_input').value = note.content;

        if (note.isImportant) {
            document.getElementById('important-icon').style.fill = "#dda9ff";
            filled = true;
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
});