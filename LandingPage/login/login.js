import { db2, auth2 } from "../../MAIN/firebaseadmin.js";
import { 
  collection, query, where, getDocs, updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { 
  getAuth, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// =====================
// 🎯 ELEMENTS
// =====================
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const btnLogin = document.querySelector(".btn-login-submit");
const debugOverlay = document.getElementById("debugOverlay");

// =====================
// 🔁 CEK LOGIN SEBELUMNYA
// =====================
const userLogin = JSON.parse(localStorage.getItem("userLogin"));
if (userLogin) {
  arahkanUser(userLogin.role);
}

// =====================
// 🔧 Fungsi bantu
// =====================
function showOverlay(message, duration = 2000) {
  debugOverlay.textContent = message;
  debugOverlay.style.display = "block";
  setTimeout(() => (debugOverlay.style.display = "none"), duration);
}

function simpanUserData(data) {
  let userData = { role: data.role };

  if (data.role === "murid") {
    userData = {
      ...userData,
      username: data.email,
      nama: data.nama,
      kelas: data.kelas,
      nisn: data.nisn,
      telepon: data.telepon,
      password: data.password
    };
  } else if (data.role === "guru") {
    userData = {
      ...userData,
      username: data.email,
      nama: data.nama,
      nomorGuru: data.nomorGuru,
      telepon: data.telepon,
      password: data.password
    };
  } else if (data.role === "organisasi") {
    userData = {
      ...userData,
      username: data.email,
      nama: data.nama,
      ketua: data.ketua,
      nomorOrg: data.nomorOrg,
      telepon: data.telepon,
      password: data.password
    };
  }

  // Simpan semua data ke localStorage
  localStorage.setItem("userLogin", JSON.stringify(userData));
}

function arahkanUser(role) {
  if (role === "IT") window.location.href = "../../IT/MAIN/Dashboard/html/main.html";
  else if (role === "admin") window.location.href = "../../Admin/MAIN/Dashboard/html/main.html";
  else if (role === "murid") window.location.href = "../../ALL/murid/html/main.html";
  else if (role === "guru") window.location.href = "../../ALL/guru/html/main.html";
  else if (role === "organisasi") window.location.href = "../../ALL/organisasi/html/main.html";
}

// =====================
// 🔍 CEK LOGIN DI SEMUA KOLEKSI
// =====================
async function cekLoginSemua(username, password) {
  const collectionsToCheck = [
    { nama: "DataAdmin", fieldUser: "username", fieldPass: "password", roleField: "role" },
    { nama: "PendaftarMurid", fieldUser: "email", fieldPass: "password", fixedRole: "murid" },
    { nama: "PendaftarGuru", fieldUser: "email", fieldPass: "password", fixedRole: "guru" },
    { nama: "PendaftarOrganisasi", fieldUser: "email", fieldPass: "password", fixedRole: "organisasi" }
  ];

  for (const item of collectionsToCheck) {
    const q = query(
      collection(db2, item.nama),
      where(item.fieldUser, "==", username),
      where(item.fieldPass, "==", password)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const role = item.fixedRole || data[item.roleField] || "unknown";
      const docId = docSnap.id;
      const koleksi = item.nama;
      return { ...data, role, docId, koleksi };
    }
  }

  return null;
}

// =====================
// 🧠 EVENT LOGIN UTAMA
// =====================
btnLogin.addEventListener("click", async () => {
  const username = document.querySelector("#loginModal input[type=text]").value.trim();
  const password = document.querySelector("#loginModal input[type=password]").value.trim();

  if (!username || !password) {
    showOverlay("Masukkan username dan password!");
    return;
  }

  const auth = auth2;

  try {
    let userCredential = null;

    // 🔹 Coba login via Firebase Auth
    try {
      userCredential = await signInWithEmailAndPassword(auth, username, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        showOverlay("Email belum diverifikasi! Silakan cek inbox Gmail Anda.", 4000);
        await auth.signOut();
        return;
      }
    } catch {
      // 🔸 Jika tidak ada di Firebase Auth, lanjut Firestore manual
    }

    // 🔹 Cek login di Firestore
    const userData = await cekLoginSemua(username, password);

    if (!userData) {
      showOverlay("Username atau password salah!", 2500);
      return;
    }

    // 🔹 Update verified = true di Firestore
    try {
      const docRef = doc(db2, userData.koleksi, userData.docId);
      await updateDoc(docRef, { verified: true });
    } catch (err) {
      console.warn("Gagal update verified di Firestore:", err);
    }

    // 🔹 Simpan ke localStorage
    simpanUserData(userData);
    showOverlay(`Login berhasil sebagai ${userData.role}...`, 1500);
    setTimeout(() => arahkanUser(userData.role), 1500);

  } catch (error) {
    console.error("Login error:", error);
    showOverlay("Terjadi kesalahan saat login!", 2500);
  }
});

// =====================
// ⌨️ ENTER UNTUK LOGIN
// =====================
const loginForm = document.querySelector("#loginModal .modal-content");
loginForm.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    btnLogin.click();
  }
});

// =====================
// ❌ TUTUP MODAL
// =====================
closeModal.addEventListener("click", () => {
  loginModal.style.display = "none";
  debugOverlay.style.display = "none";
});
