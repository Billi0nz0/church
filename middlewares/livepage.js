const API_URL = "https://api.gcm.com";

let refreshInterval = null;
let lastStreamId = null;
let lastIsLive = null;

async function initPublicLivePage() {

    const liveContainer = document.getElementById("liveContainer");
    const statusPill = document.getElementById("statusPill");
    const pastContainer = document.getElementById("pastContainer");

    if (!liveContainer) return;

    function updateStatus(stream) {

        if (!statusPill) return;

        if (stream?.isLive) {
            statusPill.textContent = "🔴 LIVE";
            statusPill.className = "status-pill status-live";
        } else {
            statusPill.textContent = "OFFLINE";
            statusPill.className = "status-pill status-offline";
        }
    }

    function getFacebookEmbed(url) {
        if (!url) return "";
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
    }

    function getYouTubeEmbed(url) {

        if (!url) return "";

        try {
            const parsed = new URL(url);

            if (parsed.hostname.includes("youtube.com")) {

                if (parsed.pathname === "/watch") {
                    return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
                }

                if (parsed.pathname.startsWith("/shorts/")) {
                    return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2]}`;
                }

                return url.replace("watch?v=", "embed/");
            }

            if (parsed.hostname === "youtu.be") {
                return `https://www.youtube.com/embed${parsed.pathname}`;
            }

            return url;

        } catch {
            return url;
        }
    }

    async function loadCurrentStream() {

        try {

            const stream = await api(`${API_URL}/live`);

            updateStatus(stream);

            if (!stream || !stream.isLive) {

                liveContainer.innerHTML = `
                    <div class="offline-box">

                        ${stream?.thumbnail ? `
                            <img src="${stream.thumbnail}" class="stream-thumbnail" />
                        ` : ""}

                        <h2>No Live Broadcast</h2>
                        <p>${stream?.title || "Service will begin soon."}</p>

                    </div>
                `;

                return;
            }

            let embedUrl = "";

            if (stream.platform === "facebook") {
                embedUrl = getFacebookEmbed(stream.liveUrl);
            }

            if (stream.platform === "youtube") {
                embedUrl = getYouTubeEmbed(stream.liveUrl);
            }

            liveContainer.innerHTML = `
                <div class="live-wrapper">

                    <h1>${stream.title || "Live Service"}</h1>
                    <p>${stream.description || ""}</p>

                    <div class="video-frame">
                        <iframe
                            src="${embedUrl}"
                            width="100%"
                            height="500"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            allowfullscreen
                        ></iframe>
                    </div>

                </div>
            `;

        } catch (err) {

            console.error(err);

            liveContainer.innerHTML = `
                <div class="offline-box">
                    <h2>Error Loading Stream</h2>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    }

    async function loadPastStreams() {

        if (!pastContainer) return;

        try {

            const res = await api(`${API_URL}/live/past`);
            const streams = res?.streams || [];

            pastContainer.innerHTML = streams.length
                ? streams.map(stream => {

                    const tag = stream.platform === "youtube"
                        ? "▶ YOUTUBE"
                        : stream.platform === "facebook"
                            ? "📘 FACEBOOK"
                            : "▶ REPLAY";

                    const embedUrl =
                        stream.platform === "facebook"
                            ? getFacebookEmbed(stream.liveUrl)
                            : getYouTubeEmbed(stream.liveUrl);

                    return `
                       
                        <div class="past-card">

                            <span class="past-tag">
                                ${stream.platform?.toUpperCase() || "REPLAY"}
                            </span>

                            ${stream.thumbnail ? `<img src="${stream.thumbnail}" />` : ""}

                            <div class="past-content">

                                <h3>${stream.title || "Untitled"}</h3>
                                <p>
                                ${stream.description
                                    ? stream.description.split(" ").slice(0, 12).join(" ") + "..."
                                    : ""}
                                </p>

                                ${stream.endedAt ? `
                                    <small>Ended: ${new Date(stream.endedAt).toLocaleString()}</small>
                                ` : ""} <br/>

                                <a href="${embedUrl}" target="_blank" class="watch-replay-btn">
                                    Watch Replay
                                </a>

                            </div>

                        </div>
                    `;
                }).join("")
                : `<p>No past services yet.</p>`;

        } catch (err) {
            console.error(err);
            pastContainer.innerHTML = `<p>Failed to load past services.</p>`;
        }
    }

    // INITIAL LOAD
    await loadCurrentStream();
    await loadPastStreams();

    // ======================
    // FIXED INTERVAL (NOW WORKS)
    // ======================
    refreshInterval = setInterval(async () => {

        try {

            const stream = await api(`${API_URL}/live`);

            updateStatus(stream);

            if (!stream) return;

            const changed =
                stream._id !== lastStreamId ||
                stream.isLive !== lastIsLive;

            if (!changed) return;

            lastStreamId = stream._id;
            lastIsLive = stream.isLive;

            await loadCurrentStream();

        } catch (err) {
            console.error(err);
        }

    }, 20000);
}

document.addEventListener("DOMContentLoaded", initPublicLivePage);
