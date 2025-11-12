// ========================================================
// savepengajuandata.js
// ========================================================

import { db1 } from "../../../MAIN/firebase.js"; 
import { db3 } from "../../../../../../MAIN/firebasesma.js"; 
import { collection, addDoc, serverTimestamp, doc, getDocs, getDoc, updateDoc, increment } 
from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🔑 KONSTANTA GOOGLE DRIVE
const CLIENT_ID = "1008287671477-rm03r2f3e52h8c95047uk3kjqlo52atn.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const FOLDER_ID = "1YacRANfXMvLnV5hXCHxCiywKJv7h13Gh";

let accessToken = "";
let tokenClient;

// ========================================================
// 🔹 INISIALISASI PENGAJUAN
// ========================================================
export function initPengajuanPage() {
  // 🔹 ELEMEN DOM
  const loginBtn = document.getElementById("bm_loginBtn");
  const captureBtn = document.getElementById("bm_captureBtn");
  const uploadBtn = document.getElementById("bm_uploadBtn");
  const previewImage = document.getElementById("bm_previewImage");
  const uploadInfo = document.getElementById("bm_uploadInfo");
  const canvas = document.getElementById("bm_canvas");
  const video = document.getElementById("bm_camera");
  const fotoInput = document.getElementById("bm_fotoPengambilan");
  const form = document.getElementById("bm_barangForm");
  const addBarangBtn = document.getElementById("addBarangBtn");
  const namaInputSelect = document.getElementById("namaInputSelect");

  // ========================================================
  // 📷 AKSES KAMERA OTOMATIS
  // ========================================================
  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      video.srcObject = stream;
    } catch (err) {
      console.error("❌ Gagal mengakses kamera:", err);
      uploadInfo.textContent = "❌ Tidak bisa mengakses kamera";
    }
  }
Z
  // ========================================================
  // 🔹 UPDATE UI LOGIN
  // ========================================================
  function updateUI(isLoggedIn) {
    if (isLoggedIn) {
      loginBtn.textContent = "Logout Drive";
      loginBtn.style.backgroundColor = "red";

      captureBtn.disabled = false;
      captureBtn.style.cursor = "pointer";
      captureBtn.style.opacity = "1";

      uploadBtn.disabled = !previewImage.src;
      uploadBtn.style.cursor = uploadBtn.disabled ? "not-allowed" : "pointer";
      uploadBtn.style.opacity = uploadBtn.disabled ? "0.6" : "1";

      const submitBtn = form.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.style.cursor = "not-allowed";
      submitBtn.style.opacity = "0.6";
    } else {
      loginBtn.textContent = "Login Google";
      loginBtn.style.backgroundColor = "#27ae60";

      [captureBtn, uploadBtn, form.querySelector("button[type='submit']")].forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = "not-allowed";
        btn.style.opacity = "0.6";
      });
    }
  }

  // ========================================================
  // 🔹 LOGIN GOOGLE DRIVE
  // ========================================================
  initCamera();

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("isDriveLoggedIn", "true");
      updateUI(true);
    }
  });

  const savedLogin = localStorage.getItem("isDriveLoggedIn");
  const savedToken = localStorage.getItem("accessToken");

  if (savedLogin === "true" && savedToken) {
    accessToken = savedToken;
    updateUI(true);

    const lastFoto = localStorage.getItem("lastFoto");
    if (lastFoto) {
      previewImage.src = lastFoto;
      uploadBtn.disabled = false;
    }
  } else {
    updateUI(false);
  }

  loginBtn.addEventListener("click", () => {
    const isLoggedIn = localStorage.getItem("isDriveLoggedIn") === "true";
    if (!isLoggedIn) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      accessToken = "";
      localStorage.removeItem("isDriveLoggedIn");
      localStorage.removeItem("accessToken");
      updateUI(false);
    }
  });

  // ========================================================
  // 🔹 CAPTURE FOTO
  // ========================================================
  captureBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/png");
    previewImage.src = dataURL;
    localStorage.setItem("lastFoto", dataURL);
    uploadInfo.textContent = "📷 Foto siap diupload";

    uploadBtn.disabled = !accessToken;
    uploadBtn.style.cursor = uploadBtn.disabled ? "not-allowed" : "pointer";
    uploadBtn.style.opacity = uploadBtn.disabled ? "0.6" : "1";
  });

  // ========================================================
  // 🔹 UPLOAD FOTO KE GOOGLE DRIVE
  // ========================================================
  uploadBtn.addEventListener("click", async () => {
    if (!previewImage.src) return alert("📷 Ambil foto dulu!");
    if (!accessToken) return alert("🔑 Login dulu ke Google Drive!");

    try {
      const res = await fetch(previewImage.src);
      const fileBlob = await res.blob();
      const metadata = { name: `foto_${Date.now()}.png`, parents: [FOLDER_ID] };
      const formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      formData.append("file", fileBlob);

      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
        method: "POST",
        headers: { Authorization: "Bearer " + accessToken },
        body: formData
      });

      const result = await response.json();
      if (result.id) {
        const link = `https://drive.google.com/file/d/${result.id}/view?usp=sharing`;
        fotoInput.value = link;
        uploadInfo.innerHTML = `✅ Foto berhasil diupload! <a href="${link}" target="_blank">Lihat Foto</a>`;

        const submitBtn = form.querySelector("button[type='submit']");
        submitBtn.disabled = false;
        submitBtn.style.cursor = "pointer";
        submitBtn.style.opacity = "1";
      } else {
        uploadInfo.textContent = "❌ Gagal upload.";
      }
    } catch (err) {
      console.error(err);
      uploadInfo.textContent = "❌ Error upload ke Drive";
    }
  });

  // ========================================================
  // 🔹 VALIDASI & TAMBAH BARANG
  // ========================================================
  async function canAddBarang(namaBarang) {
  const snapshot = await getDocs(collection(db3, "DataBarangMasuk"));
  const docRef = snapshot.docs.find(doc => doc.data().namaBarang === namaBarang)?.ref;
  if (!docRef) return false;

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;

  const stokTersedia = docSnap.data().jumlah;

  const totalInputUser = Array.from(document.querySelectorAll(".barang-field"))
    .filter(f => f.querySelector(".namaBarangInput").value.trim() === namaBarang)
    .reduce((sum, f) => {
      const jumlah = parseInt(f.querySelector(".jumlahBarangInput").value) || 0;
      return sum + jumlah;
    }, 0);

  return totalInputUser < stokTersedia;
}
function createBarangField(namaBarang) {
  const container = document.getElementById("bm_barangFields");
  const uniqueId = Date.now();

  const div = document.createElement("div");
  div.classList.add("barang-field");
  div.dataset.id = uniqueId;

  div.innerHTML = `
    <div class="bm_field-group">
      <input type="text" class="namaBarangInput" id="bm_namaBarang-${uniqueId}" value="${namaBarang}" readonly />
      <input type="text" class="merekInput" id="bm_merekBarang-${uniqueId}" placeholder="Merek" readonly />
      <input type="text" class="satuanInput" id="bm_satuanBarang-${uniqueId}" placeholder="Satuan" />
      <input type="number" class="jumlahBarangInput" id="bm_jumlahBarang-${uniqueId}" min="1" value="1" />

      <!-- ✅ Checkbox BARU -->
      <label for="bm_habisPakai-${uniqueId}" class="bm_checkboxLabel">
        <input type="checkbox" class="checkboxHabisPakai" id="bm_habisPakai-${uniqueId}">
        Barang Habis Pakai
      </label>

      <button type="button" class="removeBtn">Hapus</button>
    </div>
  `;

  container.appendChild(div);

  // 🔹 Validasi jumlah minimal 1
  const jumlahInput = div.querySelector(".jumlahBarangInput");
  jumlahInput.addEventListener("input", () => {
    if (parseInt(jumlahInput.value) < 1 || isNaN(jumlahInput.value)) jumlahInput.value = 1;
  });

  // 🔹 Hapus field jika diklik
  div.querySelector(".removeBtn").addEventListener("click", () => div.remove());
}
// ========================================================
// 🔹 SUBMIT FORM (sekali & aman)
// ========================================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const kode = document.getElementById("bm_kodePengajuan").value.trim();
  const nama = document.getElementById("bm_namaPeminjam").value.trim();
  const kelas = document.getElementById("bm_kelasInput").value.trim();
  const tanggal = document.getElementById("bm_tanggalPeminjaman").value;
  const keperluan = document.getElementById("bm_keperluanInput").value.trim();
  const fotoUrl = fotoInput.value || "";

  // 🔹 Ambil email user dari localStorage
  const userLoginStr = localStorage.getItem("userLogin");
  const emailUser = userLoginStr ? JSON.parse(userLoginStr).username || "" : "";

  // 🔹 Kumpulkan semua barang
  const barangList = [];
  const barangFields = document.querySelectorAll("#bm_barangFields .barang-field");

  for (const field of barangFields) {
    const uniqueId = field.dataset.id;
    const namaInput = document.getElementById(`bm_namaBarang-${uniqueId}`);
    const satuanInput = document.getElementById(`bm_satuanBarang-${uniqueId}`);
    const merekInput = document.getElementById(`bm_merekBarang-${uniqueId}`);
    const jumlahInput = document.getElementById(`bm_jumlahBarang-${uniqueId}`);
    const habisPakaiCheckbox = document.getElementById(`bm_habisPakai-${uniqueId}`);

    if (!namaInput || !satuanInput || !merekInput || !jumlahInput) continue;

    const namaBarang = namaInput.value.trim();
    const satuan = satuanInput.value.trim();
    const merek = merekInput.value.trim();
    const jumlah = parseInt(jumlahInput.value) || 0;
    const habisPakai = habisPakaiCheckbox?.checked ? "Barang Habis Pakai" : "Tidak Habis Pakai";

    if (jumlah < 1) {
      alert(`❌ Jumlah barang "${namaBarang}" minimal 1!`);
      jumlahInput.focus();
      return;
    }

    if (namaBarang) barangList.push({ namaBarang, merek, satuan, jumlah, habisPakai });
  }

  if (barangList.length === 0) {
    alert("❌ Tambahkan minimal 1 barang!");
    return;
  }

  try {
    // 🔹 Cek stok dulu sebelum simpan
    for (const b of barangList) {
      const snapshot = await getDocs(collection(db3, "DataBarangMasuk"));
      const docRef = snapshot.docs.find(doc => doc.data().namaBarang === b.namaBarang)?.ref;
      if (!docRef) continue;

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) continue;

      const stokTersedia = docSnap.data().jumlah;
      if (b.jumlah > stokTersedia) {
        alert(`❌ Jumlah "${b.namaBarang}" melebihi stok (${stokTersedia})!`);
        return;
      }
    }

    // 🔹 Simpan pengajuan
    await addDoc(collection(db1, "PengajuanBarang"), {
      kodePengajuan: kode,
      namaPeminjam: nama,
      kelas,
      tanggalPeminjaman: tanggal,
      keperluan,
      barang: barangList,
      fotoPengambilan: fotoUrl,
      emailUser,
      status: "Sedang DiPinjam",
      createdAt: serverTimestamp(),
    });

    // 🔹 Kurangi stok
    for (const b of barangList) {
      const snapshot = await getDocs(collection(db3, "DataBarangMasuk"));
      const docRef = snapshot.docs.find(doc => doc.data().namaBarang === b.namaBarang)?.ref;
      if (docRef) {
        await updateDoc(docRef, { jumlah: increment(-b.jumlah) });
      }
    }

    alert("✅ Data pengajuan berhasil disimpan & stok dikurangi!");
    form.reset();
    previewImage.src = "";
    uploadInfo.textContent = "📷 Belum ada foto diambil";
    location.reload();

  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan ke Firestore!");
  }
});

}
// ========================================================
// 🔹 END OF FILE
// ========================================================
