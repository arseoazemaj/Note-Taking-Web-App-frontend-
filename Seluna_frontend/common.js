//TODO Uncomment the following code when everything is finished

const token = localStorage.getItem("token");

// if (!token) {
//     window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
// } else {
//     fetch("http://localhost:5216/api/Notes/check-auth", {
//         headers: {
//             "Authorization": "Bearer " + token
//         }
//     })
//     .then(res => {
//         if (!res.ok) {
//             localStorage.removeItem("token");
//             window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
//         }
//     });
// }

const logoutBtn = document.getElementById("log-out_btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
    });
}

function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const base64Payload = token.split(".")[1];
        const payload = atob(base64Payload);
        const parsedPayload = JSON.parse(payload);
        return parsedPayload.nameid || null;
    } catch (e) {
        console.error("Failed to parse JWT token", e);
        return null;
    }
}

const sanitize = str => str.replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, "");