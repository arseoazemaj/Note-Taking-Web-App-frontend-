//TODO Uncomment the following code when everything is finished

const token = localStorage.getItem("token");

// if (!token) {
//     window.location.href = "../LoginSignuppages/Log_in-and-Sign_up.html";
// } else {
//     fetch("http://localhost:5001/api/Notes/check-auth", {
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