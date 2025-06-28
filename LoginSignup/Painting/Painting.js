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

window.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
});

const paintButton = document.getElementById("painting");
if (paintButton) {
    paintButton.addEventListener("click", () => {
        if (menuOpen) {
            menuPage.classList.remove("slide-in");
            menuPage.classList.add("slide-out");
            menuOpen = false;
        }
    });
}

const goToNotes = document.getElementById("note");
if (goToNotes) {
    goToNotes.addEventListener("click", () => {
            window.location.href = "../Notes/Notes.html";
    });
}

const goToTrash = document.getElementById("trash");
if (goToTrash) {
    goToTrash.addEventListener("click", () => {
        window.location.href = "../Trash/Trash.html";
    });
}