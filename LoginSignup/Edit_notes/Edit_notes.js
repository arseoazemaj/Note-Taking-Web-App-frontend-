const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('id');

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

document.addEventListener('DOMContentLoaded', async function () { //*Loads the note *//
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');

    if (!noteId) {
        console.error("No note ID found in URL");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5216/api/Notes/get_note/${noteId}`, {
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
        const response = await fetch("http://localhost:5216/api/Notes/edit_note", {
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
        const response = await fetch("http://localhost:5216/api/Notes/delete_note", {
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