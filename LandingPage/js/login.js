// Modal Login Script
const openLogin = document.getElementById('openLogin');
const sideLogin = document.querySelector('.side-nav .btn-login');
const modal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');

function openModal() {
  modal.style.display = 'flex';
}

function closeModalFunc() {
  modal.style.display = 'none';
}

openLogin.addEventListener('click', openModal);
sideLogin.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalFunc);

// Klik di luar modal -> tutup
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModalFunc();
  }
});
