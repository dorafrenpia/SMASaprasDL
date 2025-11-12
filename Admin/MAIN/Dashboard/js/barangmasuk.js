import { db2 } from '../../../../../../MAIN/firebaseadmin.js';  // Pastikan ini sudah benar

import { db3 } from '../../../../../../MAIN/firebasesma.js';  // Pastikan ini sudah benar
import { collection, getDocs, addDoc, serverTimestamp, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";


export function initBarangMasuk() {
  // Tidak perlu tunggu DOMContentLoaded, karena halaman sudah dimasukkan oleh loader
  const namaBarangInput = document.getElementById("bm_namaBarang");
  const merekInput = document.getElementById("bm_merekInput");
  const dataSudahAda = document.getElementById("bm_dataSudahAda");
  const dataBaru = document.getElementById("bm_dataBaru");

  if (!namaBarangInput || !merekInput || !dataSudahAda || !dataBaru) {
    console.warn("⚠️ Elemen form belum siap, pastikan ID di HTML benar.");
    return;
  }

  // Saat pilih "Data sudah ada"
  dataSudahAda.addEventListener("change", () => {
    if (dataSudahAda.checked) {
      namaBarangInput.disabled = true;
      merekInput.disabled = true;
      namaBarangInput.value = "";
      merekInput.value = "";
    }
  });

  // Saat pilih "Data baru"
  dataBaru.addEventListener("change", () => {
    if (dataBaru.checked) {
      namaBarangInput.disabled = false;
      merekInput.disabled = false;
    }
  });

  // =======================
  // 🔹 LOAD DROPDOWN DARI FIRESTORE
  // =======================
  const satuanDropdown = document.getElementById("bm_satuanDropdown");
  const kategoriDropdown = document.getElementById("bm_kategoriDropdown");
  const danaDropdown = document.getElementById("bm_danaDropdown");

  async function loadDropdownData(dropdown, collectionName) {
    if (!dropdown) return console.warn(`Dropdown ${collectionName} tidak ditemukan`);
    dropdown.innerHTML = '<option value="">-- Pilih --</option>'; // Reset dulu
    try {
      const querySnapshot = await getDocs(collection(db2, collectionName)); // pakai db2
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.nama) { // field harus 'nama'
          const option = document.createElement("option");
          option.value = data.nama;
          option.textContent = data.nama;
          dropdown.appendChild(option);
        }
      });


    } catch (err) {
      console.error(`Gagal load ${collectionName}:`, err);
    }
  }

  // Load semua dropdown
  loadDropdownData(satuanDropdown, "satuan");
  loadDropdownData(kategoriDropdown, "kategori");
  loadDropdownData(danaDropdown, "jenisDana");

  // ========================================================
  // 📷 FULLSCREEN PREVIEW FOTO
  // ========================================================
  const previewImg = document.getElementById('bm_previewImage');
  if (!previewImg) return console.warn("Elemen barang masuk belum siap.");

  previewImg.addEventListener('click', () => {
    if (!previewImg.src) return;

    const overlay = document.createElement('div');
    overlay.classList.add('fullscreen-overlay');

    const fullImg = document.createElement('img');
    fullImg.src = previewImg.src;
    overlay.appendChild(fullImg);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.remove());
  });

  // ========================================================
  // 🔑 KONSTANTA GOOGLE DRIVE
  // ========================================================
  const CLIENT_ID = "1008287671477-rm03r2f3e52h8c95047uk3kjqlo52atn.apps.googleusercontent.com";
  const SCOPES = "https://www.googleapis.com/auth/drive.file";
  const FOLDER_ID = "1YacRANfXMvLnV5hXCHxCiywKJv7h13Gh";

  let accessToken = "";
  let tokenClient;

  // ========================================================
  // 🔹 ELEMEN DOM
  // ========================================================
  const loginBtn = document.getElementById("bm_loginBtn");
  const uploadBtn = document.getElementById("bm_sendBtn");
  const fotoInput = document.getElementById("bm_fotoInput");
  const uploadInfo = document.getElementById("bm_uploadInfo");
  const previewImage = document.getElementById("bm_previewImage");
  const form = document.getElementById("bm_barangForm");
// ========================================================
// 🔹 AUTO GENERATE KODE BARANG
// ========================================================

// Map angka bulan ke romawi
const romawiBulan = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

// Async function untuk ambil nomor urut terakhir berdasarkan jenisDana + bulan + tahun
async function getExistingItems(jenisDana, bulan, tahun) {
  // Ambil data dari Firestore
  const q = query(collection(db3, "HistoryBarangMasuk"));
  const querySnapshot = await getDocs(q);

  let maxUrutan = 0;

  querySnapshot.forEach(doc => {
    const data = doc.data();
    const kode = data.kodeBarang || "";

    // Cek apakah kode sesuai jenisDana + bulan romawi + tahun
    if (kode.startsWith(jenisDana.toUpperCase()) && kode.includes(`/${romawiBulan[bulan]}/${tahun}/`)) {
      // Ambil urutan terakhir
      const urutanMatch = kode.match(/\/(\d+)$/);
      if (urutanMatch) {
        const urutan = parseInt(urutanMatch[1]);
        if (urutan > maxUrutan) maxUrutan = urutan;
      }
    }
  });

  return maxUrutan;
}

async function generateKodeBM() {
  const danaDropdown = document.getElementById("bm_danaDropdown");
  const tanggalInput = document.getElementById("bm_tanggalBarang");
  const kodeInput = document.getElementById("bm_kodeBarang");

  const jenisDana = danaDropdown.value.trim();
  const tanggal = tanggalInput.value;

  if (!jenisDana || !tanggal) {
    kodeInput.value = "";
    return;
  }

  const tanggalObj = new Date(tanggal);
  const bulan = tanggalObj.getMonth(); // 0-11
  const tahun = tanggalObj.getFullYear();

  // Ambil urutan terakhir
  const urutan = await getExistingItems(jenisDana, bulan, tahun) + 1;

  // Generate kode dengan format baru
  kodeInput.value = `${jenisDana.toUpperCase()}/${romawiBulan[bulan]}/${tahun}/${urutan}`;
}

// Event listener
["bm_danaDropdown", "bm_tanggalBarang"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", generateKodeBM);
});

  // ========================================================
  // 📷 PREVIEW FOTO
  // ========================================================
  fotoInput.addEventListener("change", () => {
    const file = fotoInput.files[0];
    if (file) {
      previewImage.src = URL.createObjectURL(file);
      previewImage.style.display = "block";
      uploadInfo.textContent = `📷 File siap diupload: ${file.name}`;
    } else {
      previewImage.src = "";
      previewImage.style.display = "none";
      uploadInfo.textContent = "📷 Belum ada foto diupload";
    }
  });

  // ========================================================
  // 🔑 LOGIN & UPLOAD GOOGLE DRIVE
  // ========================================================
  function updateUI(isLoggedIn) {
    if (isLoggedIn) {
      loginBtn.textContent = "Logout Drive";
      loginBtn.style.backgroundColor = "red";
      loginBtn.style.color = "white";
      uploadBtn.disabled = false;
      fotoInput.disabled = false;
      uploadInfo.innerHTML = "<br>📷 Pilih Foto dahulu !<br><br> 🟢 Sudah login ke Google Drive.";

    } else {
      loginBtn.textContent = "Login Google Drive";
      loginBtn.style.backgroundColor = "";
      loginBtn.style.color = "";
      uploadBtn.disabled = true;
      fotoInput.disabled = true;
      uploadInfo.textContent = "📷 Belum ada foto diupload";
    }
  }

  // Jalankan saat halaman aktif
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("isDriveLoggedIn", "true");
      updateUI(true);
    },
  });

  const savedLogin = localStorage.getItem("isDriveLoggedIn");
  const savedToken = localStorage.getItem("accessToken");
  if (savedLogin === "true" && savedToken) {
    accessToken = savedToken;
    updateUI(true);
  } else {
    updateUI(false);
  }

  // 🟢 LOGIN / LOGOUT
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

  // 📤 UPLOAD FOTO
  uploadBtn.addEventListener("click", async () => {
  const file = fotoInput.files[0];
  if (!file) return alert("Pilih foto dulu!");
  if (!accessToken) return alert("Login dulu ke Google Drive!");

  const metadata = { name: file.name, parents: [FOLDER_ID] };
  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", file);

  try {
    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken },
      body: formData,
    });

    const result = await response.json();
    if (result.id) {
      const link = `https://drive.google.com/file/d/${result.id}/view?usp=sharing`;
      uploadInfo.innerHTML = `✅ Foto berhasil diupload! <a href="${link}" target="_blank">Lihat Foto</a>`;
      
      // Simpan link foto di Firestore
      previewImage.src = link;  // Update preview dengan link yang benar
    } else {
      uploadInfo.textContent = "❌ Gagal upload.";
    }
  } catch (err) {
    uploadInfo.textContent = "❌ Terjadi error: " + err;
  }
});
// ========================================================
// 🧾 SUBMIT FORM
// ========================================================
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Menghentikan default submit form

  // Periksa apakah semua field wajib sudah diisi
  const kodeBarang = document.getElementById("bm_kodeBarang").value.trim();
  const namaBarang = document.getElementById("bm_namaBarang").value.trim();
  const tanggal = document.getElementById("bm_tanggalBarang").value;
  const satuan = document.getElementById("bm_satuanDropdown").value;
  const kategori = document.getElementById("bm_kategoriDropdown").value;
  const jenisDana = document.getElementById("bm_danaDropdown").value;

  // Validasi form sebelum menyimpan
  if (!kodeBarang || !namaBarang || !tanggal || !satuan || !kategori || !jenisDana) {
    alert("⚠️ Harap isi semua field wajib!");
    return;
  }

  try {
    // Cek apakah foto sudah diupload (Jika diperlukan)
    const fotoUrl = previewImage.src || "";
    if (!fotoUrl) {
      alert("⚠️ Foto harus diupload!");
      return;
    }

    // Data barang yang akan disimpan
    const barangData = {
      kodeBarang,
      namaBarang,
      merek: document.getElementById("bm_merekInput").value.trim(),
      jumlah: parseInt(document.getElementById("bm_jumlahBarang").value.trim()),
      tanggalMasuk: tanggal,
      satuan,
      kategori,
      jenisDana,
      keterangan: document.getElementById("bm_keteranganInput").value.trim(),
      fotoUrl, // Foto default dari input upload
      createdAt: serverTimestamp(),
    };

    // Cek apakah barang dengan nama dan merek yang sama sudah ada di DataBarangMasuk
    const barangRef = collection(db3, "DataBarangMasuk");
    const q = query(
      barangRef,
      where("namaBarang", "==", namaBarang),
      where("merek", "==", barangData.merek)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Jika barang sudah ada, update jumlahnya
      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        const existingData = doc.data();
        const updatedJumlah = existingData.jumlah + barangData.jumlah;

        // Update jumlah barang tanpa mengganti foto lama
        await updateDoc(docRef, {
          jumlah: updatedJumlah,
          tanggalMasuk: tanggal,
          updatedAt: serverTimestamp(),
        });

        // Simpan ke HistoryBarangMasuk (foto baru tetap dicatat di sini)
        const historyData = {
          ...barangData,
          status: "update",
          createdAt: serverTimestamp(),
        };

        const docRefHistory = await addDoc(collection(db3, "HistoryBarangMasuk"), historyData);
        console.log("✅ Data berhasil dikirim ke HistoryBarangMasuk! ID dokumen:", docRefHistory.id);

        // Feedback ke user
        uploadInfo.innerHTML = `✅ Jumlah barang ${namaBarang} ${barangData.merek} berhasil diperbarui menjadi ${updatedJumlah}. ID History: ${docRefHistory.id}`;
        uploadInfo.style.color = "green";
      });
    } else {
      // Jika barang belum ada, simpan data baru ke DataBarangMasuk
      const docRefMinimal = await addDoc(barangRef, barangData);
      console.log("✅ Data berhasil dikirim ke DataBarangMasuk! ID dokumen:", docRefMinimal.id);

      // Simpan juga ke HistoryBarangMasuk
      const historyData = {
        ...barangData,
        status: "baru",
        createdAt: serverTimestamp(),
      };

      const docRefHistory = await addDoc(collection(db3, "HistoryBarangMasuk"), historyData);
      console.log("✅ Data berhasil dikirim ke HistoryBarangMasuk! ID dokumen:", docRefHistory.id);

      // Feedback ke user
      uploadInfo.innerHTML = `✅ Data barang ${namaBarang} berhasil disimpan dengan ID ${docRefMinimal.id}. ID History: ${docRefHistory.id}`;
      uploadInfo.style.color = "green";
    }

    // Reset form dan image setelah proses selesai
    form.reset();
    previewImage.src = "";
    previewImage.style.display = "none";

  } catch (err) {
    console.error("❌ Gagal menyimpan ke Firestore:", err);
    uploadInfo.innerHTML = "❌ Gagal menyimpan ke Firebase. Lihat console!";
    uploadInfo.style.color = "red";
  }
});
}