  document.addEventListener("DOMContentLoaded", () => {
    const userLogin = JSON.parse(localStorage.getItem("userLogin"));

    if (!userLogin || userLogin.role !== "admin") {
      // User tidak login atau bukan admin
      alert("Akses ditolak! Silakan login sebagai admin.");
      window.location.href = "../../../../LandingPage/html/main.html"; // arahkan ke halaman login
    } 
    // Jika admin, halaman tetap bisa diakses
  });
    const logout = document.getElementById("logout-btn");

    logout.addEventListener("click", () => {
      // 🔹 Hapus data login dari localStorage
      localStorage.removeItem("userLogin");

      // 🔹 (Opsional) Tambahkan pesan singkat
      alert("Kamu telah logout!");

      // 🔹 Arahkan kembali ke halaman login
      window.location.href = "../../../../LandingPage/html/main.html"; // ubah sesuai nama file login kamu
    });