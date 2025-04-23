const menuOpener = document.getElementById("menuopener");
const menuPage = document.getElementById("menu-page");
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

if (!token) {
    window.location.href = "../Login/login.html";
} else {
    fetch("http://localhost:5001/api/Notes/check-auth", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) {
            localStorage.removeItem("token");
            window.location.href = "../Login/login.html";
        }
    });
}
