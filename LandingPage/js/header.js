// JS Sidebar Interaktif
const menuToggle = document.getElementById('menu-toggle');
const sideNav = document.getElementById('side-nav');
const overlay = document.getElementById('overlay');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  sideNav.classList.toggle('show');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
  menuToggle.classList.remove('active');
  sideNav.classList.remove('show');
  overlay.classList.remove('show');
});

document.querySelectorAll('.side-nav a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    sideNav.classList.remove('show');
    overlay.classList.remove('show');
  });
});
