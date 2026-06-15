document.addEventListener("DOMContentLoaded", async () => {
    
    const userContent = document.getElementById("userContent");
    const userPhoto = document.getElementById("userPhoto");
    const API_URL = "https://api.gcm.com.ng";


    let user = null;

    let editingEventId = null;
    let editingBlogId = null;
    let loadEvents;

    let eventsCache = [];
    let blogsCache = [];
   


    // ==========================
    // TOAST (GLOBAL)
    // ==========================
    (function () {
        const toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);

        window.showToast = function (message, type = "success") {
            toast.textContent = message;
            toast.className = `${type} show`;

            clearTimeout(toast.timeout);

            toast.timeout = setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        };
    })();

    // ==========================
    // AUTH INTERCEPTOR
    // ==========================
    async function requireAuth() {
        try {

            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: "include"
            });

            if (!res.ok) {
                throw new Error("Unauthorized");
            }

            const data = await res.json();

            return data.user;

        } catch (error) {

            window.location.href = "/auth/auth.html";

            return null;
        }
    }

    // ==========================
    // API WRAPPER (IMPORTANT)
    // ==========================
    async function api(url, options = {}) {

        const res = await fetch(url, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        let data = {};

        try {
            data = await res.json();
        } catch {}

        // SESSION EXPIRED
        if (res.status === 401) {

            showToast("Session expired. Please login again.", "error");

            setTimeout(() => {
                window.location.href = "/auth/auth.html";
            }, 1000);

            throw new Error("Unauthorized");
        }

        if (!res.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    }

    // ==========================
    // FETCH USER
    // ==========================
    async function requireAuth() {
        try {
            const data = await api(`${API_URL}/auth/me`);

            user = data.user;

            if (userPhoto) {
                userPhoto.src = user.profilePhoto || "/Images/defaultphoto.png";
            }

        } catch {
            console.log("User not logged in");
        }
    }

    await requireAuth();

    // ==========================
    // PAGES
    // ==========================
    const pages = {
        home: "/pages/home.html",
        users: "/pages/users.html",
        events: "/pages/manageEvents.html",
        blogs: "/pages/manageBlogs.html",
        live: "/pages/manageLive.html",
        profileLink: "/pages/myProfile.html"
    };

    const pageHandlers = {
        home: initHomePage,
        users: initUsersPage,
        events: initEventsPage,
        blogs: initBlogsPage,
        live: initLivePage,
        profileLink: initProfilePage,
    };

    // ==========================
    // LOAD PAGE
    // ==========================
    async function loadPage(page) {

        userContent.innerHTML = `<div class="loading">Loading...</div>`;

        try {
            const res = await fetch(pages[page]);

            if (!res.ok) {
                userContent.innerHTML = "<h2>Page not found</h2>";
                return;
            }

            const html = await res.text();
            userContent.innerHTML = html;

            document.querySelectorAll(".dynamic-page-style")
                .forEach(el => el.remove());

            const css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = `/pages/${page}.css`;
            css.classList.add("dynamic-page-style");
            document.head.appendChild(css);

            if (pageHandlers[page]) {
                pageHandlers[page](user);
            }

        } catch (err) {
            console.error(err);
            userContent.innerHTML = "<h2>Error loading page</h2>";
        }
    }

    // ==========================
    // HOME PAGE
    // ==========================
    async function initHomePage(user) {

        const greeting = document.getElementById("greeting");
        const subtext = document.getElementById("subtext");
        const photo = document.getElementById("userProfilePhoto");

        const userCountEl = document.getElementById("userCount");
        const blogCountEl = document.getElementById("blogCount");
        const eventCountEl = document.getElementById("eventCount");

        const activityList = document.getElementById("activityList");
        const todayUsersEl = document.getElementById("todayUsers");
        const weeklyBlogsEl = document.getElementById("weeklyBlogs");
        const upcomingEventsEl = document.getElementById("upcomingEvents");

        const liveStatusBox = document.getElementById("liveStatusBox");
        const userList = document.getElementById("userList");

        const chartCanvas = document.getElementById("chart");
       

        if (!greeting) return;

        // ======================
        // GREETING
        // ======================
        const hour = new Date().getHours();

        let greet = "Good Evening";
        if (hour < 12) greet = "Good Morning";
        else if (hour < 17) greet = "Good Afternoon";

        greeting.textContent = `${greet}, ${user?.fullName || "User"}`;
        subtext.textContent = "Welcome Onboard! Here are the Latest Updates.";

        if (photo) {
            photo.src = user?.profilePhoto || "https://i.ibb.co/PzspPfQm/defaultphoto.png";
        }

        try {

            // ======================
            // DATA FETCH
            // ======================
            const [usersData, blogsData, eventsData, liveData] = await Promise.all([
                api(`${API_URL}/manage/all`),
                api(`${API_URL}/blogs`),
                api(`${API_URL}/events`),
                api(`${API_URL}/live`).catch(() => null)
            ]);

            const users = usersData.users || [];
            const blogs = blogsData.blogs || [];
            const events = eventsData.events || [];

            // ======================
            // COUNTS
            // ======================
            userCountEl.textContent = users.length;
            blogCountEl.textContent = blogs.length;
            eventCountEl.textContent = events.length;

            // ======================
            // INSIGHTS
            // ======================

            const today = new Date().toDateString();

            if (todayUsersEl) {
                todayUsersEl.textContent = users.filter(u =>
                    new Date(u.createdAt).toDateString() === today
                ).length;
            }

            if (weeklyBlogsEl) {
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

                weeklyBlogsEl.textContent = blogs.filter(b =>
                    new Date(b.createdAt).getTime() > weekAgo
                ).length;
            }

            if (upcomingEventsEl) {
                upcomingEventsEl.textContent = events.filter(e =>
                    e.isLive || e.date
                ).length;
            }

            // ======================
            // ACTIVITY FEED
            // ======================
            if (activityList) {
                activityList.innerHTML = users.slice(0, 6).map(u => `
                    <div class="activity-item">
                        <span class="dot"></span>
                        <div>
                            <p>${u.fullName} Was Added </p>
                            <small>${new Date(u.createdAt).toLocaleString()}</small>
                        </div>
                    </div>
                `).join("");
            }

            // ======================
            // LIVE STATUS
            // ======================
            if (liveStatusBox) {

                if (liveData?.isLive) {
                    liveStatusBox.innerHTML = `
                        <div class="live-box">
                            🔴 LIVE NOW: ${liveData.title || "Service"}
                        </div>
                    `;
                } else {
                    liveStatusBox.innerHTML = `
                        <div class="offline-box">
                            No active broadcast
                        </div>
                    `;
                }
            }

            // ======================
            // RECENT USERS
            // ======================
            if (userList) {
                userList.innerHTML = users.slice(0, 5).map(u => `
                    <div class="user-item">
                        <img src="${u.profilePhoto || 'https://i.ibb.co/PzspPfQm/defaultphoto.png'}" />
                        <div>
                            <p>${u.fullName}</p>
                            <small> Was Added</small>
                        </div>
                    </div>
                `).join("");
            }

            // ======================
            // CHART (REAL ANALYTICS)
            // ======================
            if (chartCanvas && window.Chart) {

                try {
                    const res = await api(`${API_URL}/analytics/weekly`);
                    const stats = res || [];

                    const labels = stats.map(item => item.date || item._id);
                    const values = stats.map(item => item.count);

                    new Chart(chartCanvas, {
                        type: "line",
                        data: {
                            labels,
                            datasets: [{
                                label: "Website Visits",
                                data: values,
                                borderColor: "#7c3aed",
                                backgroundColor: "rgba(124,58,237,0.2)",
                                tension: 0.3,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: true
                                }
                            }
                        }
                    });

                } catch (err) {
                    console.error("Chart load failed:", err);
                }
            }

        } catch (error) {
            console.error(error);
        }
    }

    // ==========================
    // USERS PAGE
    // ==========================
    async function initUsersPage() {

        const container = document.getElementById("usersContainer");
        if (!container) return;

        async function loadUsers() {
            const data = await api(`${API_URL}/manage/all`);
            const users = data.users || [];

            document.getElementById("totalUsers").textContent = users.length;
            document.getElementById("bannedUsers").textContent =
                users.filter(u => u.isBanned).length;
            document.getElementById("activeUsers").textContent =
                users.filter(u => !u.isBanned).length;

            container.innerHTML = users.map(user => `
                <div class="userCard">
                    <img src="${user.profilePhoto || '/Images/defaultphoto.png'}" />
                    <div class="userInfo">
                        <h3>${user.fullName}</h3>
                        <p>${user.email}</p>
                        <span>${user.role}</span>
                    </div>
                    <div class="actions">
                        <button onclick="toggleBan('${user._id}', ${!user.isBanned})">
                            ${user.isBanned ? "Unban" : "Ban"}
                        </button>
                        <button onclick="deleteUser('${user._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join("");
        }

        await loadUsers();

        window.toggleBan = async function (_id, isBanned) {
            if (!confirm("Ban this user?")) return;
            await api(`${API_URL}/manage/profile/${_id}/ban`, {
                method: "PATCH",
                body: JSON.stringify({ isBanned })
            });

            showToast("User updated");
            loadUsers();
        };

        window.deleteUser = async function (_id) {
            if (!confirm("Delete this user?")) return;
            await api(`${API_URL}/manage/profile/${_id}`, {
                method: "DELETE"
            });

            showToast("User deleted");
            loadUsers();
        };
    }

    // ==========================
    // EVENTS PAGE
    // ==========================
    async function initEventsPage() {

        const table = document.getElementById("eventsTable");
        if (!table) return;

        loadEvents = async function () {
            const data = await api(`${API_URL}/events`);
            const events = data.events || [];
            eventsCache = events;

            document.getElementById("totalEvents").textContent = events.length;
            document.getElementById("activeEvents").textContent =
                events.filter(e => !e.isArchived).length;
            document.getElementById("archivedEvents").textContent =
                events.filter(e => e.isArchived).length;

            table.innerHTML = events.map(event => `
                <tr>
                    <td>${event.title}</td>
                    
                    <td>${event.isArchived ? "Archived" : "Active"}</td>
                    <td>
                        <button onclick="editEvent('${event._id}')">Edit</button>
                        ${
                            event.isArchived
                                ? `<button onclick="restoreEvent('${event._id}')">Restore</button>`
                                : `<button onclick="archiveEvent('${event._id}')">Archive</button>`
                        }
                        <button onclick="deleteEvent('${event._id}')">Delete</button>
                    </td>
                </tr>
            `).join("");
        };

        await loadEvents();

        const form = document.getElementById("eventForm");

        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const payload = {
                    title: document.getElementById("title").value,
                    description: document.getElementById("description").value,
                    date: document.getElementById("date").value,
                    time: document.getElementById("time").value,
                    imageUrl: document.getElementById("imageUrl").value
                };

                try {
                    if (editingEventId) {

                        await api(`${API_URL}/events/${editingEventId}`, {
                            method: "PUT",
                            body: JSON.stringify(payload)
                        });

                        showToast("Event updated");
                    } else {

                        await api(`${API_URL}/events`, {
                            method: "POST",
                            body: JSON.stringify(payload)
                        });

                        showToast("Event created");
                    }

                    form.reset()
                    await loadEvents();

                } catch (err) {
                    console.error(err);
                    showToast(err.message, "error");
                }
            });
        }

        window.deleteEvent = async function (id) {
            if (!confirm("Delete this event?")) return;
            await api(`${API_URL}/events/${id}`, { method: "DELETE" });
            showToast("Event deleted");
            loadEvents();
        };

        window.archiveEvent = async function (_id) {
            await api(`${API_URL}/events/archive/${_id}`, { method: "PATCH" });
            showToast("Event archived");
            loadEvents();
        };

        window.restoreEvent = async function (_id) {
            await api(`${API_URL}/events/restore/${_id}`, { method: "PATCH" });
            showToast("Event restored");
            loadEvents();
        };

        window.editEvent = function (id) {

            const event = eventsCache.find(e => e._id === id);

            if (!event) {
                showToast("Event not found", "error");
                return;
            }

            document.getElementById("title").value = event.title;
            document.getElementById("description").value = event.description;
            document.getElementById("date").value = event.date;
            document.getElementById("time").value = event.time;
            document.getElementById("imageUrl").value = event.imageUrl;

            editingEventId = id;

            showToast("Editing event");
        };
    }

    // ==========================
    // BLOGS PAGE
    // ==========================
    async function initBlogsPage() {

        const table = document.getElementById("blogsTable");
        if (!table) return;

        async function loadBlogs() {
            const data = await api(`${API_URL}/blogs`);
            const blogs = data.blogs || [];
            blogsCache = blogs;

            document.getElementById("totalBlogs").textContent = blogs.length;
            document.getElementById("activeBlogs").textContent = blogs.length;
            document.getElementById("archivedBlogs").textContent = 0;

            table.innerHTML = blogs.map(blog => `
                <tr>
                    <td>${blog.title}</td>
                    <td>${blog.author?.fullName || "Unknown"}</td>
                    <td>
                        <button onclick="editBlog('${blog._id}')">Edit</button>
                        <button onclick="deleteBlog('${blog._id}')">Delete</button>
                    </td>
                </tr>
            `).join("");
        }

        await loadBlogs();

        const form = document.getElementById("blogForm");
            form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const payload = {
                title: document.getElementById("title").value,
                text: document.getElementById("texts").value,
                imageUrl: document.getElementById("imageUrl").value,
                description: document.getElementById("description").value,
                content: document.getElementById("content").value,
                prayerPoints: document.getElementById("prayerPoints").value,
            };

            try {
                if (editingBlogId) {
                    await api(`${API_URL}/blogs/${editingBlogId}`, {
                        method: "PUT",
                        body: JSON.stringify(payload)
                    });

                    showToast("Blog updated");
                } else {
                    await api(`${API_URL}/blogs`, {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });

                    showToast("Blog created");
                }

                form.reset()
                await loadBlogs();

            } catch (err) {
                console.error(err);
                showToast(err.message, "error");
            }
        });

        window.deleteBlog = async function (id) {
            if (!confirm("Delete this blog?")) return;
            await api(`${API_URL}/blogs/${id}`, { method: "DELETE" });
            showToast("Blog deleted");
            loadBlogs();
        };

        window.editBlog = function (id) {

            const blog =
                blogsCache.find(b => b._id === id);

            if (!blog) {
                showToast("Blog not found", "error");
                return;
            }

            document.getElementById("title").value = blog.title;
            document.getElementById("texts").value = blog.text;
            document.getElementById("imageUrl").value = blog.imageUrl;
            document.getElementById("description").value = blog.description;
            document.getElementById("content").value = blog.content;
            document.getElementById("prayerPoints").value = blog.prayerPoints;

            editingBlogId = id;

            showToast("Editing blog");
        };

    }

    // ==========================
    // PROFILE PAGE
    // ==========================
    async function initProfilePage() {

        try {
            const data = await api(`${API_URL}/auth/me`);
            const user = data.user;

            document.getElementById("profilePhoto").src =
                user.profilePhoto || "/Images/defaultphoto.png";

            document.getElementById("fullName").textContent = user.fullName;

            document.getElementById("email").textContent = user.email;

            document.getElementById("username").textContent = user.username;

            document.getElementById("userRole").textContent = user.role;

            document.getElementById("userId").textContent = user._id;

            document.getElementById("roleBadge").textContent = user.role;

        } catch (err) {
            console.error(err);
        }

        document.getElementById("logoutBtn").addEventListener("click", async () => {
            await api(`${API_URL}/auth/logout`, { method: "POST" });
            showToast("Logged out");
            window.location.href = "/auth/auth.html";
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            if (!confirm("Delete your profile?")) return;

            const me = await api(`${API_URL}/auth/me`);
            await api(`${API_URL}/manage/profile/${me.user._id}`, {
                method: "DELETE"
            });

            showToast("Account deleted");
            window.location.href = "/auth/auth.html";
        });
    }

    // ==========================
    // WATCH-LIVE PAGE
    // ==========================
    async function initLivePage() {

        const table = document.getElementById("streamTableBody");
        const form = document.getElementById("liveForm");

        const statusCard =
            document.querySelector(".onAirCard");

        const liveStatus =
            document.getElementById("liveStatus");

        if (!table || !form) return;

        let streamsCache = [];
        let editingStreamId = null;

        // ==========================
        // LOAD STREAMS
        // ==========================

        async function loadStreams() {

            try {

                const data =
                    await api(`${API_URL}/live/admin`);

                const streams =
                    data.streams || [];

                streamsCache = streams;

                const activeStream =
                    streams.find(s => s.isLive);

                // STATUS CARD

                if (activeStream) {

                    liveStatus.textContent = "LIVE";

                    statusCard.classList.add("live");
                    statusCard.classList.remove("offline");

                    statusCard.querySelector(".onAirText")
                        .textContent = "ON AIR";

                } else {

                    liveStatus.textContent = "OFFLINE";

                    statusCard.classList.remove("live");
                    statusCard.classList.add("offline");

                    statusCard.querySelector(".onAirText")
                        .textContent = "OFF AIR";
                }

                // TABLE

                table.innerHTML = streams.map(stream => `

                    <tr>

                        <td>${stream.title}</td>

                        <td>${stream.platform}</td>

                        <td>

                            ${
                                stream.isLive
                                ?
                                `<span style="color:red;font-weight:bold">
                                    LIVE
                                </span>`
                                :
                                `<span style="color:gray">
                                    OFFLINE
                                </span>`
                            }

                        </td>

                        <td>
                            ${new Date(stream.createdAt)
                                .toLocaleString()}
                        </td>

                        <td>

                            <button
                                onclick="editStream('${stream._id}')">

                                <i class="fa-solid fa-pen"></i>

                            </button>

                            ${
                                stream.isLive
                                ?
                                `
                                <button
                                    onclick="endLive('${stream._id}')">

                                    <i class="fa-solid fa-circle-stop"></i>

                                </button>
                                `
                                :
                                `
                                <button
                                    onclick="goLive('${stream._id}')">

                                    <i class="fa-solid fa-circle-play"></i>

                                </button>
                                `
                            }

                            <button
                                onclick="deleteStream('${stream._id}')">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    </tr>

                `).join("");

            } catch (err) {

                console.error(err);
            }
        }

        // ==========================
        // CREATE / UPDATE
        // ==========================

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const payload = {

                title:
                    document.getElementById("liveTitle").value.trim(),

                description:
                    document.getElementById("liveDescription").value.trim(),

                liveUrl:
                    document.getElementById("liveUrl").value.trim(),

                thumbnail:
                    document.getElementById("thumbnail").value.trim(),

                platform:
                    document.getElementById("platform").value
            };

            try {

                if (editingStreamId) {

                    await api(
                        `${API_URL}/live/${editingStreamId}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(payload)
                        }
                    );

                    showToast("Stream updated");

                } else {

                    await api(
                        `${API_URL}/live`,
                        {
                            method: "POST",
                            body: JSON.stringify(payload)
                        }
                    );

                    showToast("Stream created");
                }

                form.reset();

                editingStreamId = null;

                await loadStreams();

            } catch (err) {

                console.error(err);

                showToast(err.message, "error");
            }
        });

        // ==========================
        // EDIT
        // ==========================

        window.editStream = function(id) {

            const stream =
                streamsCache.find(
                    s => s._id === id
                );

            if (!stream) return;

            document.getElementById("liveTitle").value =
                stream.title || "";

            document.getElementById("liveDescription").value =
                stream.description || "";

            document.getElementById("liveUrl").value =
                stream.liveUrl || "";

            document.getElementById("thumbnail").value =
                stream.thumbnail || "";

            document.getElementById("platform").value =
                stream.platform || "facebook";

            editingStreamId = id;

            showToast("Editing stream");
        };

        // ==========================
        // DELETE
        // ==========================

        window.deleteStream = async function(id) {

            if (!confirm("Delete this stream?"))
                return;

            await api(
                `${API_URL}/live/${id}`,
                {
                    method: "DELETE"
                }
            );

            showToast("Stream deleted");

            await loadStreams();
        };

        // ==========================
        // START LIVE
        // ==========================

        window.goLive = async function(id) {

            try {

                await api(
                    `${API_URL}/live/${id}/start`,
                    {
                        method: "PATCH"
                    }
                );

                showToast("Stream is LIVE");

                await loadStreams();

            } catch (err) {

                console.error(err);

                showToast(err.message, "error");
            }
        };

        // ==========================
        // END LIVE
        // ==========================

        window.endLive = async function(id) {

            try {

                await api(
                    `${API_URL}/live/${id}/end`,
                    {
                        method: "PATCH"
                    }
                );

                showToast("Stream ended");

                await loadStreams();

            } catch (err) {

                console.error(err);

                showToast(err.message, "error");
            }
        };

        await loadStreams();
    }
    
    // ==========================
    // START
    // ==========================
    loadPage("home");

    document.querySelectorAll(".navLink[data-page]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();

            document.querySelectorAll(".navLink")
                .forEach(l => l.classList.remove("active"));

            link.classList.add("active");

            loadPage(link.dataset.page);
        });
    });

    // ==========================
    // Global Unhandled Error Catch
    // ==========================

    window.addEventListener("unhandledrejection", (event) => {

        console.error(event.reason);

        showToast(
            event.reason?.message || "Something went wrong",
            "error"
        );
    });

});
