let index = 0;
const slides = document.getElementById("slides");
const total = slides.children.length;

function moveSlide(step) {
  index = (index + step + total) % total; // loop around
  slides.style.transform = `translateX(-${index * 100}%)`;
}