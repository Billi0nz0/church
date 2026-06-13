const signinForm = document.getElementById("signin-form");
const signupForm = document.getElementById("signup-form");
const tabs = document.querySelectorAll(".tab-btn");

function showForm(type) {

    tabs.forEach(tab => tab.classList.remove("active"));

    if(type === "signin") {
        signinForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        tabs[0].classList.add("active");
    } else {
        signupForm.classList.remove("hidden");
        signinForm.classList.add("hidden");
        tabs[1].classList.add("active");
    }
}
