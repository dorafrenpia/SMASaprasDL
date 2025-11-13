
import { db3 } from "../../../../../../MAIN/firebasesma.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
export function initKerusakanPage() {
  console.log("✅ Halaman kerusakan siap");

const inputs = document.querySelectorAll('#formData input');
const btnTambahBarang = document.getElementById('btnTambahBarang');
const daftarBarang = [];

// 🔹 Ambil user login dari localStorage
const userLogin = JSON.parse(localStorage.getItem("userLogin"));
if (userLogin && userLogin.nama) {
  document.getElementById("melapor").value = userLogin.nama;
} else {
  alert("⚠️ Silakan login terlebih dahulu!");
}

// ========================================================
// 🔑 KONSTANTA GOOGLE DRIVE
// ========================================================
const CLIENT_ID = "1008287671477-rm03r2f3e52h8c95047uk3kjqlo52atn.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const FOLDER_ID = "1PlKBwBaz2_gsXl6MVHEXrXNXXir0EUon";

let tokenClient;
let accessToken = "";

// ========================================================
// 📷 LOGIN & UPLOAD FOTO
// ========================================================
const loginBtn = document.getElementById("bm_loginBtn");
const uploadBtn = document.getElementById("bm_sendBtn");
const fotoInput = document.getElementById("bm_fotoInput");
const uploadInfo = document.getElementById("bm_uploadInfo");
const previewImage = document.getElementById("bm_previewImage");

function updateUI(isLoggedIn) {
  if (isLoggedIn) {
    loginBtn.textContent = "Logout Drive";
    loginBtn.style.backgroundColor = "#e74c3c"; // merah soft
    loginBtn.style.color = "white";
    loginBtn.style.border = "2px solid #c0392b";
    loginBtn.style.borderRadius = "8px";
    loginBtn.style.padding = "8px 16px";
    loginBtn.style.cursor = "pointer";
    loginBtn.style.transition = "all 0.3s ease";

    fotoInput.disabled = false;
    uploadBtn.disabled = false;
    btnTambahBarang.disabled = false;
uploadInfo.innerHTML = `<br>📷 Pilih Foto Dahulu!<br>`;
uploadInfo.style.textAlign = "center"; // ini bikin teks rata tengah

    uploadInfo.style.color = "#000000ff"; // hijau
    uploadInfo.style.fontWeight = "bold";
    uploadInfo.style.transition = "all 0.3s ease";
  } else {
    loginBtn.textContent = "Login Google Drive";
    loginBtn.style.backgroundColor = "#34db5eff"; // biru soft
    loginBtn.style.color = "white";
    loginBtn.style.border = "2px solid #29b933ff";
    loginBtn.style.borderRadius = "8px";
    loginBtn.style.padding = "8px 16px";
    loginBtn.style.cursor = "pointer";
    loginBtn.style.transition = "all 0.3s ease";

    fotoInput.disabled = true;
    uploadBtn.disabled = true;
    btnTambahBarang.disabled = true;

    uploadInfo.textContent = "📷 Belum ada foto diupload";
    uploadInfo.style.color = "#e67e22"; // orange
    uploadInfo.style.fontWeight = "bold";
    uploadInfo.style.transition = "all 0.3s ease";
  }

  // efek hover keren untuk tombol
  loginBtn.onmouseover = () => loginBtn.style.opacity = "0.8";
  loginBtn.onmouseout = () => loginBtn.style.opacity = "1";
}


// Inisialisasi token jika sudah login sebelumnya
const savedToken = localStorage.getItem("accessToken");
if (savedToken) {
  accessToken = savedToken;
  updateUI(true);
} else {
  updateUI(false);
}

// 🔹 LOGIN / LOGOUT
loginBtn.addEventListener("click", () => {
  if (!accessToken) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) {
          alert("Login gagal: " + resp.error);
        } else {
          accessToken = resp.access_token;
          localStorage.setItem("accessToken", accessToken);
          updateUI(true);
        }
      }
    });
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    accessToken = "";
    localStorage.removeItem("accessToken");
    updateUI(false);
  }
});

// 🔹 Preview foto saat dipilih
fotoInput.addEventListener("change", () => {
  const file = fotoInput.files[0];
  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = "block";
    uploadInfo.textContent = `📷 File siap diupload: ${file.name}`;
    btnTambahBarang.disabled = true;
  } else {
    previewImage.src = "";
    previewImage.style.display = "none";
    uploadInfo.textContent = "📷 Belum ada foto diupload";
    btnTambahBarang.disabled = true;
  }
});

// 🔹 Upload foto
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
      btnTambahBarang.disabled = false;
      fotoInput.dataset.uploadedLink = link;
    } else {
      uploadInfo.textContent = "❌ Gagal upload.";
      btnTambahBarang.disabled = true;
    }
  } catch (err) {
    uploadInfo.textContent = "❌ Terjadi error: " + err;
    btnTambahBarang.disabled = true;
  }
});

/// 🔹 Tambah barang rusak ke daftar
btnTambahBarang.addEventListener('click', () => {
  const namaBarang = document.getElementById('namaBarang').value.trim();
  const spesifikasi = document.getElementById('spesifikasi').value.trim();
  const jumlah = document.getElementById('jumlah').value.trim();
  const lokasiBarang = document.getElementById('lokasiBarang').value.trim();
  const kondisi = document.getElementById('kondisi').value.trim();
  const tindakan = document.getElementById('tindakan').value.trim();
  const fotoLink = fotoInput.dataset.uploadedLink;

  if (!namaBarang) {
    alert("Masukkan minimal nama barang!");
    return;
  }
  if (!fotoLink) {
    alert("Upload foto dulu sebelum menambahkan barang!");
    return;
  }

  // Tambah barang ke daftar
  daftarBarang.push({
    namaBarang, spesifikasi, jumlah, lokasiBarang, kondisi, tindakan, fotoLink
  });

  // Reset input dan preview
  document.getElementById('namaBarang').value = "";
  document.getElementById('spesifikasi').value = "";
  document.getElementById('jumlah').value = "";
  document.getElementById('lokasiBarang').value = "";
  document.getElementById('kondisi').value = "";
  document.getElementById('tindakan').value = "";
  fotoInput.value = "";
  previewImage.src = "";
  previewImage.style.display = "none";
  uploadInfo.textContent = "📷 Belum ada foto diupload";
  delete fotoInput.dataset.uploadedLink;

  btnTambahBarang.disabled = true;

  // 🔹 Render table daftar barang
  renderDaftarBarang();
});

// 🔹 Fungsi untuk menampilkan table daftar barang
function renderDaftarBarang() {
  const container = document.getElementById('daftarBarangContainer');
  if (daftarBarang.length === 0) {
    container.innerHTML = `<p><i>Belum ada barang yang ditambahkan.</i></p>`;
    return;
  }

  let tableHTML = `<table border="1" cellpadding="5" cellspacing="0">
    <tr>
      <th>No.</th>
      <th>Nama Barang</th>
      <th>Spesifikasi</th>
      <th>Jumlah</th>
      <th>Lokasi</th>
      <th>Kondisi</th>
      <th>Tindakan</th>
      <th>Foto</th>
    </tr>`;

  daftarBarang.forEach((b, i) => {
    tableHTML += `<tr>
      <td>${i + 1}</td>
      <td>${b.namaBarang}</td>
      <td>${b.spesifikasi}</td>
      <td>${b.jumlah}</td>
      <td>${b.lokasiBarang}</td>
      <td>${b.kondisi}</td>
      <td>${b.tindakan}</td>
      <td><a href="${b.fotoLink}" target="_blank">Lihat Foto</a></td>
    </tr>`;
  });

  tableHTML += `</table>`;
  container.innerHTML = tableHTML;
}
// 🔹 Simpan ke Firestore
async function saveToFirestore() {
  const tanggalInput = document.getElementById('tanggalLengkap').value;
  const melapor = document.getElementById('melapor').value.trim() || "________________";

  if (!tanggalInput) {
    alert("Pilih tanggal kejadian!");
    return;
  }
  if (daftarBarang.length === 0) {
    alert("Belum ada barang yang ditambahkan!");
    return;
  }

  const date = new Date(tanggalInput);
  const hariArray = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const namaHari = hariArray[date.getDay()];

  try {
    const docRef = await addDoc(collection(db3, "beritaAcaraKerusakan"), {
      hari: namaHari,
      tanggal: date.toISOString(),
      melapor: melapor,
      barang: daftarBarang,
      createdAt: serverTimestamp()
    });
    alert("✅ Data berhasil disimpan di Firestore! ID: " + docRef.id);
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data: " + err.message);
  }
}

// 🔹 Tombol simpan ke Firestore
const saveBtn = document.createElement("button");
saveBtn.type = "button";
saveBtn.textContent = "💾 Simpan ke Firestore";
saveBtn.style.marginTop = "10px";
saveBtn.addEventListener("click", saveToFirestore);
document.getElementById("formData").appendChild(saveBtn);

// ========================================================
// 🔹 Load Google API Script
// ========================================================
const script = document.createElement('script');
script.src = "https://apis.google.com/js/api.js";
script.onload = () => {
  gapi.load('client', () => {
    gapi.client.init({
      apiKey: '',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    });
  });
};
document.body.appendChild(script);



}