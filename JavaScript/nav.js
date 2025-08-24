function toggleNav() {
            const nav = document.getElementById("myLinks");
            const iconAnchor = document.getElementById("menu-icon");
            const icon = iconAnchor.querySelector("i");

            nav.classList.toggle("show");

            if (nav.classList.contains("show")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-times");
            } else {
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            }
        }
