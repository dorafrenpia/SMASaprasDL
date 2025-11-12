// Ambil elemen dari HTML
const header = document.querySelector('header'); // lebih fleksibel
const menuToggle = document.getElementById('menu-toggle');
const sideNav = document.getElementById('side-nav');

// Header scroll effect
window.addEventListener('scroll', function() {
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// Toggle side nav saat hamburger diklik
if (menuToggle && sideNav) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sideNav.classList.toggle('show');
  });
}
