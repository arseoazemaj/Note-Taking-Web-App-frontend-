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

function save() {
    const title = document.getElementById("title").value.trim();
    const note_input = document.getElementById("note_input").value.trim();
    const userId = localStorage.getItem("userId");
    const important = filled;

    const save = document.getElementById("save");

    if (save) {
        alert("I am currently working to save your notes into the database. Please try again later.");
        return;
    }

    if (note_input === "") {
        alert("Please enter some content in order to save the note.");
        return;
    }

    if (!navigator.onLine) {
        alert("Your device is currently offline. Please connect to the internet to save your notes.");
        return;
    }

    const note = {
        title: title,
        content: note_input,
        userId: userId,
        important: important
    };
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