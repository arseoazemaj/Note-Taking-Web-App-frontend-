const menu = document.getElementById("sub-menu_icon");
menu.addEventListener('touchstart', openMenu);
const container = document.getElementById("container");
const blur_background = document.getElementById("blur_background");
blur_background.addEventListener('touchstart', closeMenu);

function openMenu() {
    container.style.visibility = "visible";
    blur_background.style.visibility = "visible";

    console.log("Opened menu");
}

function closeMenu() {
    container.style.visibility = "hidden";
    blur_background.style.visibility = "hidden";

    console.log("Closed menu");
}

async function save() { //* Save the note
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const user_id = getUserIdFromToken();
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
        title: Title,
        content: Content,
        user_id: user_id,
        isImportant: isImportant,
        created_at: new Date().toISOString()
    };

    try {
        const response = await fetch("http://localhost:5216/api/Notes/create_note", {
            method: "POST",
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
        console.error("Error saving note:", error);
        alert("There was an error saving your note. Please try again.");
    }
}

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




async function deleteNote() { //*Moves the note to trash
    const token = localStorage.getItem("token");

    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const isImportant = filled;

    if (Content === "" && Title === "") {
        window.location.href = "../Notes/Notes.html";
    }
    else {
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
}


//*Used to save the notes in local storage for testing purposes (will be deleted in the end)*//
document.getElementById('save').addEventListener('click', function() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('note_input').value.trim();

    if (content === "") {
        alert("Please enter some content before saving.");
        return;
    }

    const isImportant = filled;

    const note = {
        title: title,
        content: content,
        isImportant: isImportant
    };

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.push(note);

    localStorage.setItem('notes', JSON.stringify(notes));

    window.location.href = "../Notes/Notes.html";
});