//import { db } from "../../MAIN/firebaseadmin.js";
import { db2, auth2  } from "../../MAIN/firebaseadmin.js";
import { 
  collection, query, where, getDocs, addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { 
  getAuth, createUserWithEmailAndPassword, sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Elemen DOM
const muridForm = document.getElementById("muridForm");
const debugOverlay = document.getElementById("debugOverlay");
const muridModal = document.getElementById("muridModal");
const loginModal = document.getElementById("loginModal");
const closeMuridModal = document.getElementById("closeMuridModal");

// Fungsi tampilkan status di overlay
function showStatus(message) {
  if (!debugOverlay) return;
  debugOverlay.textContent = message;
  debugOverlay.style.display = "block";

  // Auto-hide setelah 3 detik
  setTimeout(() => {
    debugOverlay.style.display = "none";
  }, 3000);
}

// Tutup modal
closeMuridModal.addEventListener("click", () => {
  muridModal.style.display = "none";
});

// Fungsi cek NISN sudah digunakan atau belum
async function cekNISN(nisn) {
  if (!nisn) return false;
  const q = query(collection(db2, "PendaftarMurid"), where("nisn", "==", nisn));
  const querySnapshot = await getDocs(q);
  // Jika querySnapshot kosong → NISN belum digunakan
  return querySnapshot.empty; 
}

// Submit form
muridForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  debugOverlay.style.display = "none";

  const nama = document.getElementById("nama_murid").value.trim();
  const nisn = document.getElementById("nisn_murid").value.trim();
  const kelas = document.getElementById("kelas_murid").value.trim();
  const email = document.getElementById("email_murid").value.trim();
  const telepon = document.getElementById("telepon_murid").value.trim();
  const password = document.getElementById("password_murid").value.trim();
  const confirmPassword = document.getElementById("confirmPassword_murid").value.trim();

  // Validasi password
  if (password !== confirmPassword) {
    showStatus("Gagal: Password dan konfirmasi tidak cocok!");
    return;
  }

  // Cek NISN sudah digunakan
  const nisnAvailable = await cekNISN(nisn);
  if (!nisnAvailable) {
    showStatus("Gagal: NISN sudah digunakan! Tidak bisa daftar lagi.");
    return;
  }

const auth = auth2 ;

  try {
    // Buat akun Auth di Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Kirim email verifikasi
    await sendEmailVerification(user);
    showStatus("Berhasil: Email verifikasi telah dikirim! Silakan cek inbox.");

    // Simpan data murid ke Firestore
    await addDoc(collection(db2, "PendaftarMurid"), {
      nama,
      nisn,
      kelas,
      email,
      telepon,
      password,       // ⚠️ sebaiknya hash di produksi
      verified: false,
      authUID: user.uid,
      role: "murid",
      tanggalInput: new Date()
    });

    showStatus("Berhasil: Data murid berhasil disimpan.");

    // Simpan ke localStorage
    localStorage.setItem("userLogin", JSON.stringify({
      username: email,
      role: "murid"
    }));

    // Tutup modal setelah 2,5 detik
    setTimeout(() => {
      muridModal.style.display = "none";
      if (loginModal) loginModal.style.display = "flex";
      muridForm.reset();
    }, 2500);

  } catch (error) {
    console.error(error);
    showStatus("Gagal: " + error.message);
  }
});
