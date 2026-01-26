const username = document.getElementById("username");
const setting_page = document.getElementById("setting_page");

document.addEventListener("DOMContentLoaded", loadUsername );

async function loadUsername() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No JWT token found");
            return;
        }

        const response = await fetch("http://localhost:5216/api/account/username", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        username.textContent = data.username;
        console.log("Username is:", data.username);

    } catch (error) {
        console.error("Failed to load username:", error);
    }
}

function account() {
    console.log("Account settings opened");
    const account = document.getElementById("account");
    account.style.backgroundColor = "#251e45";
}

function change_name() {
    console.log("Change name clicked");
}