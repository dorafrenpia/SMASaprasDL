
  document.addEventListener("DOMContentLoaded", function () {
    const footer = document.querySelector('.footer-animate');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.classList.add('visible');
          observer.unobserve(footer); // hanya sekali tampil
        }
      });
    }, {
      threshold: 0.2
    });

    if (footer) {
      observer.observe(footer);
    }
  });