import { db2 } from "../../MAIN/firebaseadmin.js";
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const form = document.getElementById("registerForm");
const statusText = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  // Validasi input kosong
  if (!username || !password || !role) {
    statusText.style.color = "red";
    statusText.textContent = "❌ Semua kolom wajib diisi!";
    return;
  }

  try {
    const usersRef = collection(db2, "DataAdmin");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    // Jika username sudah ada
    if (!querySnapshot.empty) {
      statusText.style.color = "red";
      statusText.textContent = "⚠️ Username sudah terdaftar, silakan gunakan nama lain.";
      return; // hentikan proses registrasi
    }

    // Simpan data baru ke Firestore
    await addDoc(usersRef, {
      username: username,
      password: password, // sebaiknya di-hash di produksi
      role: role,
      createdAt: new Date()
    });

    statusText.style.color = "green";
    statusText.textContent = "✅ Registrasi berhasil!";
    form.reset();

  } catch (error) {
    console.error("Error saat registrasi:", error);
    statusText.style.color = "red";
    statusText.textContent = "❌ Terjadi kesalahan, coba lagi.";
  }
});
