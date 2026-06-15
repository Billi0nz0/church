const API_URL = "https://api.gcm.com.ng";

function trackVisit(pageId) {
    fetch(`${API_URL}/analytics/${pageId}`, {
        method: "POST",
        credentials: "include"
    }).catch(console.error);
}

document.addEventListener("DOMContentLoaded", () => {
    trackVisit("home");
});
