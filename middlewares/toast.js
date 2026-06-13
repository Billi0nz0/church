(function () {
    // create toast container once
    const toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);

    // expose globally
    window.showToast = function (message, type = "success") {
        toast.textContent = message;
        toast.className = `${type} show`;

        clearTimeout(toast.timeout);

        toast.timeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    };
})();