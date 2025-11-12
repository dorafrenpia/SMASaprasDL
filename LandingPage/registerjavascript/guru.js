import { db2 } from "../../MAIN/firebaseadmin.js";
import { 
  collection, query, where, getDocs, addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { 
  getAuth, createUserWithEmailAndPassword, sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Elemen DOM
const guruForm = document.getElementById("guruForm");
const debugOverlay = document.getElementById("debugOverlay");
const guruModal = document.getElementById("guruModal");
const loginModal = document.getElementById("loginModal");
const closeGuruModal = document.getElementById("closeGuruModal");

// Tutup modal
closeGuruModal.addEventListener("click", () => {
  guruModal.style.display = "none";
});

// Fungsi cek nomor guru
async function cekNomorGuru(nomor) {
  if (!nomor) return false;
  const q = query(collection(db2, "NomorGuru"), where("nomorGuru", "==", nomor));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Submit form
guruForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  debugOverlay.style.display = "none";

  // Ambil data input dari form
  const nama = document.getElementById("nama").value.trim();
  const nomor = document.getElementById("nomor").value.trim();
  const email = document.getElementById("email").value.trim();
  const telepon = document.getElementById("telepon").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  // Validasi password
  if (password !== confirmPassword) {
    debugOverlay.textContent = "Gagal: Password dan konfirmasi tidak cocok!";
    debugOverlay.style.display = "block";
    return;
  }

  // Cek nomor guru
  const valid = await cekNomorGuru(nomor);
  if (!valid) {
    debugOverlay.textContent = "Gagal: Nomor guru tidak terdaftar!";
    debugOverlay.style.display = "block";
    return;
  }

  const auth = getAuth();

  try {
    // 🔹 Buat akun Auth di Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔹 Kirim email verifikasi
    await sendEmailVerification(user);

    debugOverlay.textContent = "Berhasil: Email verifikasi telah dikirim! Silakan cek inbox.";
    debugOverlay.style.display = "block";

    // 🔹 Simpan data guru ke Firestore (dengan role otomatis)
    await addDoc(collection(db2, "PendaftarGuru"), {
      nama,
      nomorGuru: nomor,
      email,
      telepon,
      password,          // ⚠️ sebaiknya nanti dihapus atau di-hash
      verified: false,
      authUID: user.uid,
      role: "guru",      // ✅ Tambahkan role otomatis di sini
      tanggalInput: new Date()
    });

    // 🔹 Simpan ke localStorage (opsional, jika ingin langsung login)
    localStorage.setItem("userLogin", JSON.stringify({
      username: email,
      role: "guru"
    }));

    // 🔹 Tutup form setelah sukses
    setTimeout(() => {
      guruModal.style.display = "none";
      if (loginModal) loginModal.style.display = "flex";
      debugOverlay.style.display = "none";
      guruForm.reset();
    }, 2500);

  } catch (error) {
    console.error(error);
    debugOverlay.textContent = "Gagal: " + error.message;
    debugOverlay.style.display = "block";
  }
});
