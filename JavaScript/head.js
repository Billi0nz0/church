document.addEventListener("DOMContentLoaded", () => {
  fetch("head.html")
    .then(response => response.text())
    .then(data => {
      const headElement = document.getElementById("head");
      if (headElement) {
        headElement.innerHTML = data;
      } else {
        console.error('Element with id "head" not found.');
      }
      if (headElement) {
        headElement.innerHTML = data;
      } else {
        console.error('Element with id "head" not found.');
      }
    })
    .catch(error => console.error("Error loading head:", error));
});