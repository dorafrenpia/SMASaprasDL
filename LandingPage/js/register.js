const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const registerLink = document.getElementById("registerLink");
const closeModal = document.getElementById("closeModal");
const closeRegisterModal = document.getElementById("closeRegisterModal");

// buka modal login (misal dari tombol login)
function openLogin() {
  loginModal.classList.add("show");
}

// buka modal daftar dari login
registerLink.addEventListener("click", () => {
  loginModal.classList.remove("show");
  registerModal.classList.add("show");
});

// tutup modal login
closeModal.addEventListener("click", () => {
  loginModal.classList.remove("show");
});

// tutup modal daftar
closeRegisterModal.addEventListener("click", () => {
  registerModal.classList.remove("show");
});

// tutup modal kalau klik di luar
window.addEventListener("click", (e) => {
  if (e.target == loginModal) loginModal.classList.remove("show");
  if (e.target == registerModal) registerModal.classList.remove("show");
});


// ===== MODAL MURID =====
const muridModal = document.getElementById("muridModal");
const closeMuridModal = document.getElementById("closeMuridModal");
const muridBtn = document.getElementById("muridBtn");

// buka modal Murid saat tombol Murid diklik
muridBtn.addEventListener("click", () => {
  registerModal.classList.remove("show");
  muridModal.classList.add("show");
});

// tutup modal Murid
closeMuridModal.addEventListener("click", () => {
  muridModal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target == muridModal) muridModal.classList.remove("show");
});


// ===== MODAL GURU =====
const guruModal = document.getElementById("guruModal");
const closeGuruModal = document.getElementById("closeGuruModal");
const guruBtn = document.getElementById("guruBtn");

guruBtn.addEventListener("click", () => {
  registerModal.classList.remove("show");
  guruModal.classList.add("show");
});

closeGuruModal.addEventListener("click", () => {
  guruModal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target == guruModal) guruModal.classList.remove("show");
});


// ===== MODAL ORGANISASI =====
const orgModal = document.getElementById("orgModal");
const closeOrgModal = document.getElementById("closeOrgModal");
const orgBtn = document.getElementById("orgBtn");

orgBtn.addEventListener("click", () => {
  registerModal.classList.remove("show");
  orgModal.classList.add("show");
});

closeOrgModal.addEventListener("click", () => {
  orgModal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target == orgModal) orgModal.classList.remove("show");
});
