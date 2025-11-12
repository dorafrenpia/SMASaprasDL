// ========================================================
// tampilkandatapengajuan.js
// ========================================================
import { db1 } from "../../../MAIN/firebase.js";
import { db3 } from "../../../MAIN/firebasesma.js"; // <-- import db3
import { collection, query, where, getDocs, doc, updateDoc, increment } 
  from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export async function loadMyPengajuan() {
  const tblBody = document.getElementById("tblBodyMyPengajuan");
  tblBody.innerHTML = `<tr><td colspan="8">⏳ Memuat data...</td></tr>`; 

  const userLoginStr = localStorage.getItem("userLogin");
  if (!userLoginStr) {
    tblBody.innerHTML = `<tr><td colspan="8">❌ User belum login</td></tr>`;
    return;
  }
  const userLogin = JSON.parse(userLoginStr);
  const email = userLogin.username || "";

  try {
    const ref = collection(db1, "PengajuanBarang");
    const q = query(ref, where("emailUser", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      tblBody.innerHTML = `<tr><td colspan="8">📭 Belum ada pengajuan</td></tr>`;
      return;
    }

    tblBody.innerHTML = "";
    snapshot.forEach(doc => {
  const d = doc.data();

  // 🚫 Jika status sudah dikembalikan, lewati (tidak ditampilkan)
  if (d.status === "Sedang DiPinjam") return;

  const barangList = d.barang.map(b => `${b.namaBarang} (${b.merek || '-'}) - ${b.jumlah} ${b.satuan}`).join(", ");

      const fotoLink = d.fotoPengambilan ? `<a href="${d.fotoPengambilan}" target="_blank">Lihat Foto</a>` : "-";
      const foto2Link = d.foto2 ? `<a href="${d.foto2}" target="_blank">Lihat Foto 2</a>` : "-";

      const row = `
<tr>
  <td>${d.kodePengajuan || ""}</td>
  <td>${d.namaPeminjam || ""}</td>
  <td>${d.kelas || ""}</td>
  <td>${d.tanggalPeminjaman || ""}</td>
  <td>${d.keperluan || ""}</td>
  <td>${barangList}</td>
  <td>${fotoLink}</td>
  <td>${foto2Link}</td>
  <td>${d.status || "-"}</td>

</tr>
`;
      tblBody.innerHTML += row;
    });

    // ======================================================
    // EVENT LISTENER BUTTON
    // ======================================================
    document.querySelectorAll(".btnSelengkapnya").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const docId = e.target.dataset.id;
        const docRef = collection(db1, "PengajuanBarang");
        const snapshot = await getDocs(query(docRef, where("__name__", "==", docId)));
        let data = null;
        snapshot.forEach(d => data = d.data());
        if (!data) return;

        // ======================================================
        // MODAL POPUP
        // ======================================================
        const modal = document.createElement("div");
        modal.id = "modalDetail";
        modal.style = `
          position: fixed; top:0; left:0; width:100%; height:100%;
          background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;
          z-index:9999;
        `;
        modal.innerHTML = `
<div style="background:#fff; padding:20px; border-radius:8px; width:400px; max-height:80%; overflow-y:auto; position:relative;">
  <h3>Detail Pengajuan</h3>
  <p><strong>Kode:</strong> ${data.kodePengajuan}</p>
  <p><strong>Nama:</strong> ${data.namaPeminjam}</p>
  <p><strong>Kelas:</strong> ${data.kelas}</p>
  <p><strong>Tanggal:</strong> ${data.tanggalPeminjaman}</p>
  <p><strong>Keperluan:</strong> ${data.keperluan}</p>
  <p><strong>Email:</strong> ${data.emailUser}</p>
  <p><strong>Barang:</strong></p>
  <ul>
   ${data.barang.map(b => `<li>${b.namaBarang} (${b.merek || '-'}) - ${b.jumlah} ${b.satuan}</li>`).join("")}
  </ul>
  <p><strong>Foto:</strong> ${data.fotoPengambilan ? `<a href="${data.fotoPengambilan}" target="_blank">Lihat Foto</a>` : "-"}</p>

  <hr>
  <video id="driveVideo" width="100%" autoplay style="border:1px solid #ccc; border-radius:5px;"></video>
  <canvas id="driveCanvas" style="display:none;"></canvas>
  <button id="btnDriveLogin">Login Google Drive</button>
  <button id="btnDriveCapture" disabled>Ambil Foto</button>
  <button id="btnDriveUpload" disabled>Upload Foto</button>
  <p id="driveUploadInfo"></p>

  <button id="btnKembalikan" style="display:block; margin:20px auto; padding:10px 20px;">Kembalikan</button>
  <button id="btnCloseModal" style="position:absolute; top:10px; right:10px;">✖</button>
</div>
        `;
        document.body.appendChild(modal);

        // ======================================================
        // ELEMENT REFERENSI
        // ======================================================
        const video = document.getElementById("driveVideo");
        const canvas = document.getElementById("driveCanvas");
        const captureBtn = document.getElementById("btnDriveCapture");
        const uploadBtn = document.getElementById("btnDriveUpload");
        const info = document.getElementById("driveUploadInfo");
        const loginBtn = document.getElementById("btnDriveLogin");

        // ======================================================
        // 🔹 AKSES KAMERA
        // ======================================================
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
          .then(stream => video.srcObject = stream)
          .catch(err => info.textContent = "❌ Tidak bisa mengakses kamera");

        // ======================================================
        // 🔹 LOGIN GOOGLE DRIVE
        // ======================================================
        let accessToken = localStorage.getItem("accessToken") || "";
        let tokenClient;

        function updateDriveUI(isLoggedIn) {
          if (!loginBtn || !captureBtn || !uploadBtn || !info) return;
          loginBtn.textContent = isLoggedIn ? "Logout Drive" : "Login Google Drive";
          captureBtn.disabled = !isLoggedIn;
          uploadBtn.disabled = true;
          info.textContent = isLoggedIn ? "✅ Login berhasil" : "";
        }

        updateDriveUI(!!accessToken);

        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: "1008287671477-rm03r2f3e52h8c95047uk3kjqlo52atn.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/drive.file",
          callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            localStorage.setItem("accessToken", accessToken);
            updateDriveUI(true);
          }
        });

        loginBtn.addEventListener("click", () => {
          if (!accessToken) tokenClient.requestAccessToken({ prompt: "consent" });
          else {
            accessToken = "";
            localStorage.removeItem("accessToken");
            updateDriveUI(false);
          }
        });

        // ======================================================
        // 🔹 AMBIL FOTO
        // ======================================================
        captureBtn.addEventListener("click", () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          info.textContent = "📷 Foto siap diupload";
          uploadBtn.disabled = false;
        });

        // ======================================================
        // 🔹 UPLOAD FOTO KE GOOGLE DRIVE + SIMPAN KE FIRESTORE (foto2)
        // ======================================================
uploadBtn.addEventListener("click", async () => {
  if (!accessToken) return alert("Login dulu ke Google Drive!");
  info.textContent = "⏳ Upload ke Drive...";
  try {
    const dataURL = canvas.toDataURL("image/png");
    const res = await fetch(dataURL);
    const blob = await res.blob();

    const metadata = { name: `foto_${Date.now()}.png`, parents: ["1XhUw6mkPx64IOUxq0BdpiKR6BnOgHjYW"] };
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", blob);

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken },
      body: formData
    });

    const result = await response.json();
    if (result.id) {
      const link = `https://drive.google.com/file/d/${result.id}/view?usp=sharing`;
      info.innerHTML = `✅ Foto berhasil diupload! <a href="${link}" target="_blank">Lihat Foto</a>`;

      try {
        const pengajuanRef = doc(db1, "PengajuanBarang", docId);
        await updateDoc(pengajuanRef, { 
          foto2: link,
          status: "Sudah Dikembalikan"
        });
        info.innerHTML += `<br>📁 Disimpan di Firestore (field: foto2 + status)`;
      } catch (err) {
        console.error("❌ Gagal menyimpan ke Firestore:", err);
        info.innerHTML += `<br>❌ Gagal simpan ke Firestore`;
      }
    } else info.textContent = "❌ Gagal upload.";
  } catch (err) {
    console.error(err);
    info.textContent = "❌ Error upload ke Drive";
  }
});

        // ======================================================
        // 🔹 KEMBALIKAN STOK & CLOSE MODAL
        // ======================================================
        async function kembalikanStok(barangList) {
          try {
            for (let b of barangList) {
              const { namaBarang, merek, jumlah, satuan } = b;

              const ref = collection(db3, "DataBarangMasuk");
              const q = query(ref,
                where("namaBarang", "==", namaBarang),
                where("merek", "==", merek || ""),
                where("satuan", "==", satuan)
              );

              const snapshot = await getDocs(q);

              if (!snapshot.empty) {
                snapshot.forEach(async docSnap => {
                  const docRef = doc(db3, "DataBarangMasuk", docSnap.id);
                  await updateDoc(docRef, { jumlah: increment(jumlah) });
                  console.log(`✅ Stok ${namaBarang} (${merek}) +${jumlah}`);
                });
              } else {
                console.log(`⚠️ Barang ${namaBarang} (${merek}) tidak ditemukan di db3`);
              }
            }
          } catch (err) {
            console.error("❌ Gagal mengembalikan stok:", err);
          }
        }

        document.getElementById("btnCloseModal").addEventListener("click", () => modal.remove());
        document.getElementById("btnKembalikan").addEventListener("click", async () => {
          const barangList = data.barang.map(b => ({
            namaBarang: b.namaBarang,
            merek: b.merek || "",
            jumlah: parseInt(b.jumlah),
            satuan: b.satuan
          }));

          await kembalikanStok(barangList);

          const pengajuanRef = doc(db1, "PengajuanBarang", docId);
          await updateDoc(pengajuanRef, { status: "Sudah Dikembalikan" });

          alert(`✅ Pengajuan ${data.kodePengajuan} berhasil dikembalikan & stok diperbarui`);
          modal.remove();
        });
      });
    });

  } catch (err) {
    console.error(err);
    tblBody.innerHTML = `<tr><td colspan="8">❌ Gagal memuat data</td></tr>`;
  }
}
