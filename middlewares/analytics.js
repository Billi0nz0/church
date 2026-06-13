const API_URL = "http://localhost:5000";

function trackVisit(pageId) {
    fetch(`${API_URL}/analytics/${pageId}`, {
        method: "POST",
        credentials: "include"
    }).catch(console.error);
}

document.addEventListener("DOMContentLoaded", () => {
    trackVisit("home");
});