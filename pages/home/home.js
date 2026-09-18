const slideCarrossel = document.querySelector('.slides');
let index = 0;
const totalSlides = document.querySelectorAll('#slide').length;

setInterval(() => {
    index = (index + 1) % totalSlides;
    slideCarrossel.style.transform = `translateX(-${index * 100}%)`;
}, 3000);
