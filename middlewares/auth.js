document.addEventListener("DOMContentLoaded", async () => {

    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");
    const signupTab = document.getElementById("SignUp-tab-btn")

    let currentUser = null;
    let isSuperAdmin = false;
    const API_URL = "https://api.gcm.com";
    // ==========================
    // GET USER ON LOAD 
    // ==========================
    async function loadUser() {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: "include"
            });

            if (!res.ok) return null;

            const data = await res.json();

            currentUser = data.user;
            isSuperAdmin = currentUser?.role === "superAdmin";

            return currentUser;

        } catch (err) {
            return null;
        }
    }

    await loadUser();

    // ==========================
    // HIDE SIGNUP IF NOT SUPERADMIN
    // ==========================
    if (!isSuperAdmin) {
        if (signupForm) signupForm.style.display = "none";

        if (signupTab) signupTab.style.display = "none";

        const msg = document.createElement("p");
        msg.textContent = "Only superadmins can create accounts.";
        msg.style.color = "red";
        msg.style.fontSize = "0.85rem"
        msg.style.marginTop = "10px"
        msg.style.textAlign = "center"

        document.querySelector(".auth-container")?.appendChild(msg);
    }
   
    // ==========================
    // LOGIN
    // ==========================
    if (signinForm) {
        signinForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = signinForm.querySelector("input[type='email']").value;
            const password = signinForm.querySelector("input[type='password']").value;

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    showToast(data.message || "Login failed", "error");
                    return;
                }

                showToast("Login successful", "success");
                window.location.href = "/dashboard.html";

            } catch (err) {
                console.error(err);
                showToast("Network error", "error");
            }
        });
    }

    // ==========================
    // SIGNUP (PROTECTED)
    // ==========================
    if (signupForm) {

        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // extra safety check (never trust UI alone)
            if (!isSuperAdmin) {
                showToast("Access denied: Superadmins only", "error");
                return;
            }

            const fullName = signupForm.querySelector("input[name='fullName']").value;
            const username = signupForm.querySelector("input[name='username']").value;
            const email = signupForm.querySelector("input[name='email']").value;
            const password = signupForm.querySelector("input[name='password']").value;
            const confirmPassword = signupForm.querySelector("input[name='confirmPassword']").value;

            if (password !== confirmPassword) {
                showToast("Passwords do not match", "error");
                return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        fullName,
                        username,
                        email,
                        password
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    showToast(data.message || "Signup failed", "error");
                    return;
                }

                showToast("Account created!", "success");
                window.location.href = "/auth/auth.html";

            } catch (err) {
                console.error(err);
                showToast("Network error", "error");
            }
        });
    }

});
