const posts = {
    1: {
        title: "Walking in Purpose",
        content: `
            <p>God created everyone with a unique assignment...</p>
            <p>When you understand your purpose, confusion fades.</p>
            <p>Stay consistent, stay prayerful, and stay focused.</p>
            <p>This journey is not about speed but direction.</p>
        `
    },

    2: {
        title: "Faith in Difficult Seasons",
        content: `
            <p>Hard seasons are not signs of abandonment.</p>
            <p>They are moments of growth and strengthening.</p>
            <p>Hold on — your season will shift.</p>
        `
    },

    3: {
        title: "The Power of Prayer",
        content: `
            <p>Prayer is not a ritual — it is connection.</p>
            <p>It aligns your spirit with God’s will.</p>
            <p>A consistent prayer life builds strength.</p>
        `
    }
};

function openPost(id) {
    const popup = document.getElementById("popup");
    const body = document.getElementById("popup-body");

    body.innerHTML = `
        <h2>${posts[id].title}</h2>
        ${posts[id].content}
    `;

    popup.style.display = "flex";
}

function closePost() {
    document.getElementById("popup").style.display = "none";
}

// close when clicking outside
window.onclick = function(e) {
    const popup = document.getElementById("popup");
    if (e.target === popup) {
        popup.style.display = "none";
    }
};