function toggleSubMenu() {
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
    toggleSubMenu();
});

document.getElementById('save').addEventListener('click', function() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('note_input').value.trim();
    
    if (title === "" && content === "") {
        alert("Please enter a title or content before saving.");
        return;
    }

    const note = {
        title: title,
        content: content
    };

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.push(note);

    localStorage.setItem('notes', JSON.stringify(notes));

    window.location.href = "../Notes/Notes.html";
});