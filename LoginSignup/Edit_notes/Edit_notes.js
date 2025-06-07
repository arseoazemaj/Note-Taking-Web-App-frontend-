const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('id');

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
        window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
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

async function update(noteId) { //*Update the note
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const isImportant = filled;

    if (Content === "") {
        alert("Please enter some content before saving the note.");
        return;
    }

    if (!navigator.onLine) {
        alert("Your device is currently offline. Please connect to the internet to save your notes.");
        return;
    }

    const note = {
        id: noteId,
        title: Title,
        content: Content,
        isImportant: isImportant,
        updated_at: new Date().toISOString()
    };

    try {
        const response = await fetch("https://localhost:5001/api/Notes/edit-note", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(note)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorData}`);
        }

        window.location.href = "../Notes/Notes.html";

    } catch (error) {
        console.error("Error updating note:", error);
        alert("There was an error updating your note. Please try again.");
    }
}

async function deleteNote() { //*Moves the note to trash
    const token = localStorage.getItem("token");

    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const isImportant = filled;

    try {
        const response = await fetch("https://localhost:5001/api/Notes/delete-note", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id: noteId,
                title: Title,
                Content: Content,
                isDeleted: true,
                deleted_at: new Date().toISOString(),
                isImportant: isImportant
            })
        });

        if (response.ok) {
            window.location.href = "../Notes/Notes.html";
        } else {
            const error = await response.text();
            alert("Failed to delete note: " + error);
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please check your internet connection or try again later.");
    }
}