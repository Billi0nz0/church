document.addEventListener("DOMContentLoaded", async () => {
    const blogGrid = document.querySelector(".blog-grid");
    const modal = document.getElementById("blogModal");
    const body = document.getElementById("modalBody");

    if (!blogGrid || !modal || !body) return;

    // =========================
    // LOAD BLOGS
    // =========================
    async function loadBlogs() {
        try {
            const res = await fetch("http://localhost:5000/blogs", {
                credentials: "include"
            });

            if (!res.ok) throw new Error("Failed to load blogs");

            const data = await res.json();
            const blogs = data.blogs || [];

            blogGrid.innerHTML = blogs.map(blog => `
                <article class="blog-card" onclick="openPost('${blog.slug}')">

                    <img src="${blog.imageUrl || 'https://i.ibb.co/ksw1vyg7/deeee.jpg'}" class="blog-image" />

                    <div class="blog-content">

                        <h2>${blog.title}</h2>

                        <p>${blog.description}</p>

                        <div class="blog-meta">

                            <span>
                                <i class="fa-solid fa-user"></i>
                                ${blog.author?.fullName || "Unknown"}
                            </span>

                            <span>
                                <i class="fa-solid fa-clock"></i>
                                ${new Date(blog.createdAt).toLocaleDateString()}
                            </span>

                        </div>

                        <span class="read-more">Read More →</span>

                    </div>

                </article>
            `).join("");

        } catch (err) {
            console.error("Blog load error:", err);
            blogGrid.innerHTML = `<p>Failed to load blogs.</p>`;
        }
    }

    await loadBlogs();

    // =========================
    // OPEN BLOG MODAL
    // =========================
    window.openPost = async function (slug) {
        try {
            const res = await fetch(`http://localhost:5000/blogs/${slug}`, {
                credentials: "include"
            });

            if (!res.ok) throw new Error("Blog not found");

            const data = await res.json();
            const blog = data.blog;

            body.innerHTML = `
                <div class="modalHead">

                    <img src="${blog.imageUrl || 'https://i.ibb.co/ksw1vyg7/deeee.jpg'}" />

                    <div class="modalText">
                        <small>
                            <i class="fa fa-user"></i>
                            ${blog.author?.fullName || "Unknown"}
                        </small>
                    </div>

                   

                </div>

                <h2 class="blogTitle">${blog.title}</h2>

                <small class="readings">
                    <strong>Readings:</strong> ${blog.text}
                </small>

                <div class="blogContent">
                    ${blog.content}
                </div>

                <p class="prayerTitle"><strong>Prayer Points:</strong></p>
                <p class="prayerPoint">${blog.prayerPoints || "None"}</p>
            `;

            modal.style.display = "flex";
            document.body.style.overflow = "hidden";

        } catch (err) {
            console.error("Open blog error:", err);
        }
    };

    // =========================
    // CLOSE MODAL
    // =========================
    window.closePost = function () {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    };

    // =========================
    // CLICK OUTSIDE TO CLOSE
    // =========================
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closePost();
        }
    });
});