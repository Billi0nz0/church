document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
});

async function loadEvents() {

    const upcomingContainer =
        document.getElementById("upcomingEvents");

    const pastContainer =
        document.getElementById("pastEvents");

    if (!upcomingContainer || !pastContainer) return;

    try {

        const res =
            await fetch("https://api.gcm.com.ng/events", {
                credentials: "include"
            });

        const data =
            await res.json();

        const events =
            data.events || [];

        const upcoming =
            events.filter(e => !e.isArchived);

        const past =
            events.filter(e => e.isArchived);

        // ======================
        // UPCOMING EVENTS
        // ======================
        upcomingContainer.innerHTML =
            renderEvents(upcoming, "No upcoming events");

        // ======================
        // PAST EVENTS
        // ======================
        pastContainer.innerHTML =
            renderEvents(past, "No past events");

    } catch (error) {

        console.error("Events load error:", error);

        upcomingContainer.innerHTML =
            `<p>Failed to load events</p>`;

        pastContainer.innerHTML =
            `<p>Failed to load events</p>`;
    }
}

function renderEvents(list, emptyMessage) {

    if (!list.length) {

        return `
            <div class="event-card">
                <div class="event-content">
                    <h2>${emptyMessage}</h2>
                </div>
            </div>
        `;
    }

    return list.map(event => `

        <div class="event-card">

            <img src="${
                event.imageUrl?.trim()
                    ? event.imageUrl
                    : "/Images/church pix.svg"
            }" alt="${event.title}">

            <div class="event-content">

                <div class="meta">

                    <span>
                        <i class="fas fa-calendar-alt"></i>
                        ${(event.date)}
                    </span>

                    <span>
                        <i class="fas fa-clock"></i>
                        ${event.time || ""}
                    </span>

                </div>

                <h2>${event.title}</h2>

                <p>${event.description}</p>

                <a href="https://www.facebook.com/share/18mCtbcgD5" target="_blank" class="btn">
                    View Details
                </a>

            </div>

        </div>

    `).join("");
}

function formatDate(dateString) {

    try {
        return new Date(dateString).toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    } catch {
        return dateString;
    }
}
