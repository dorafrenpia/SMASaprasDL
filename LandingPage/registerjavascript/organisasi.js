import { db2 } from "../../MAIN/firebaseadmin.js";
import { 
  collection, query, where, getDocs, addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { 
  getAuth, createUserWithEmailAndPassword, sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Elemen DOM
const orgForm = document.getElementById("orgForm");
const debugOverlay = document.getElementById("debugOverlay");
const orgModal = document.getElementById("orgModal");
const loginModal = document.getElementById("loginModal");
const closeOrgModal = document.getElementById("closeOrgModal");

// Tutup modal
closeOrgModal.addEventListener("click", () => {
  orgModal.style.display = "none";
});

// Fungsi cek nomor organisasi
async function cekNoOrg(nomor) {
  if (!nomor) return false;
  const q = query(collection(db2, "NoOrganisasi"), where("noOrg", "==", nomor));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Submit form
orgForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  debugOverlay.style.display = "none";

  // Ambil data input
  const ketua = document.getElementById("orgKetua").value.trim();
  const nomorOrg = document.getElementById("orgNomor").value.trim();
  const nama = document.getElementById("orgNama").value.trim();
  const email = document.getElementById("orgEmail").value.trim();
  const telepon = document.getElementById("orgTelepon").value.trim();
  const password = document.getElementById("orgPassword").value.trim();
  const confirmPassword = document.getElementById("orgConfirmPassword").value.trim();

  // Validasi password
  if (password !== confirmPassword) {
    debugOverlay.textContent = "Gagal: Password dan konfirmasi tidak cocok!";
    debugOverlay.style.display = "block";
    return;
  }

  // Cek nomor organisasi
  const valid = await cekNoOrg(nomorOrg);
  if (!valid) {
    debugOverlay.textContent = "Gagal: Nomor organisasi tidak terdaftar!";
    debugOverlay.style.display = "block";
    return;
  }

  const auth = getAuth();

  try {
    // Buat akun Auth di Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Kirim email verifikasi
    await sendEmailVerification(user);

    debugOverlay.textContent = "Berhasil: Email verifikasi telah dikirim! Silakan cek inbox.";
    debugOverlay.style.display = "block";

    // Simpan data organisasi ke Firestore
    await addDoc(collection(db2, "PendaftarOrganisasi"), {
      ketua,
      nomorOrg,
      nama,
      email,
      telepon,
      password,           // ⚠️ sebaiknya nanti dihapus/hashing
      verified: false,
      authUID: user.uid,  // untuk menghubungkan data dengan akun Auth
      role: "organisasi", // ✅ role otomatis
      tanggalInput: new Date()
    });

    // (Opsional) Simpan ke localStorage agar langsung dikenal sistem proteksi
    localStorage.setItem("userLogin", JSON.stringify({
      username: email,
      role: "organisasi"
    }));

    // Tutup form setelah sukses
    setTimeout(() => {
      orgModal.style.display = "none";
      if (loginModal) loginModal.style.display = "flex";
      debugOverlay.style.display = "none";
      orgForm.reset();
    }, 2500);

  } catch (error) {
    console.error(error);
    debugOverlay.textContent = "Gagal: " + error.message;
    debugOverlay.style.display = "block";
  }
});
