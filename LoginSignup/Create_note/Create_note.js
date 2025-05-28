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

async function save() {
    const Title = document.getElementById("title").value.trim();
    const Content = document.getElementById("note_input").value.trim();
    const user_id = getUserIdFromToken();
    const isImportant = filled;

    const token = localStorage.getItem('token');
    console.log("JWT token from localStorage:", token);

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
        const response = await fetch("https://localhost:5001/api/Notes/create-note", {
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


//*Used to save the notes in local storage for testing purposes*//
// document.getElementById('save').addEventListener('click', function() {
//     const title = document.getElementById('title').value.trim();
//     const content = document.getElementById('note_input').value.trim();

//     if (content === "") {
//         alert("Please enter some content before saving.");
//         return;
//     }

//     const note = {
//         title: title,
//         content: content
//     };

//     let notes = JSON.parse(localStorage.getItem('notes')) || [];

//     notes.push(note);

//     localStorage.setItem('notes', JSON.stringify(notes));

//     window.location.href = "../Notes/Notes.html";
// });