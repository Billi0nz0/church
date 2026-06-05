async function loadComponent(id, file) {
  const response = await fetch(file);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;
}

loadComponent("header-container", "/components/header.html");
loadComponent("footer-container", "/components/footer.html");