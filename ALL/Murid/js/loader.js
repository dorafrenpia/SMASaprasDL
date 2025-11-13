// ========================================================
// loader.js
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar-menu a");
  const mainContent = document.getElementById("mainContent");

  links.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      // Hapus active sebelumnya
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const page = link.getAttribute("data-page");

      try {
        mainContent.innerHTML = "<p>⏳ Memuat halaman...</p>";
        const response = await fetch(`Main/${page}.html`);
        if (!response.ok) throw new Error("Halaman tidak ditemukan");

        const html = await response.text();
        mainContent.innerHTML = html;

        // =====================================================
        // 🔹 Jalankan script tambahan per halaman
        // =====================================================

        if (page === "koneksi") {
          const koneksiModule = await import(`./koneksi.js`);
          koneksiModule.initFirebaseCheckButton();
        } 
        else if (page === "data") {
          const bmModule = await import(`../js/tampilkandatapengajuan.js`);
          bmModule.loadMyPengajuan();
        } 
        else if (page === "history") {
          const bmModule = await import(`../js/tampilkandatapengembalian.js`);
          bmModule.loadMyPengajuan();
        } 
        else if (page === "users") {
          const userModule = await import(`../../../LandingPage/registerjavascript/murid.js`);
          if (userModule.initUsersPage) userModule.initUsersPage();
        } 
        // =====================================================
        // 🧩 PENGAJUAN BARANG
        // =====================================================
        else if (page === "pengajuan") {
          // Modul tabel (opsional)
          const dtModule = await import(`../js/tampilkandatatablepengajuan.js`);
          if (dtModule.initDataBarangMasuk) dtModule.initDataBarangMasuk();

          // Modul kamera + upload Drive
          const pengajuanModule = await import(`../js/savepengajuandata.js`);
          if (pengajuanModule.initPengajuanPage) {
            // Pastikan delay kecil agar DOM siap
            setTimeout(() => pengajuanModule.initPengajuanPage(), 50);
          }

          // =====================================================
          // 🔹 Auto-isi form userLogin (khusus pengajuan)
          // =====================================================
          try {
            const userLoginStr = localStorage.getItem("userLogin");
            if (!userLoginStr) return console.warn("⚠️ userLogin kosong");

            const userLogin = JSON.parse(userLoginStr);
            const namaInput = document.getElementById("bm_namaPeminjam");
            const kelasInput = document.getElementById("bm_kelasInput");
            const kodeInput = document.getElementById("bm_kodePengajuan");

            if (namaInput) {
              namaInput.value = userLogin.nama || "";
              namaInput.readOnly = true;
            }

            if (kelasInput) {
              let val = "";
              switch ((userLogin.role || "").toLowerCase()) {
                case "murid": val = userLogin.kelas || ""; break;
                case "guru": val = "Guru"; break;
                case "organisasi": val = userLogin.ketua || ""; break;
                default: val = "";
              }
              kelasInput.value = val;
              kelasInput.readOnly = true;
            }

            // =====================================================
            // ⚙️ AUTO GENERATE KODE BERDASARKAN USER
            // =====================================================
            if (kodeInput && namaInput && kelasInput) {
              const { db1 } = await import("../../../MAIN/firebase.js");
              const { collection, query, where, getDocs } =
                await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js");

              async function generateKode() {
                const nama = namaInput.value.trim();
                const kelas = kelasInput.value.trim();
                if (!nama || !kelas) {
                  kodeInput.value = "⚠️ Isi nama & kelas dulu";
                  return;
                }

                try {
                  const ref = collection(db1, "PengajuanBarang");
                  const q = query(ref, where("namaPeminjam", "==", nama), where("kelas", "==", kelas));
                  const snapshot = await getDocs(q);

                  let nextNumber = 1;
                  if (!snapshot.empty) {
                    const lastNumbers = snapshot.docs
                      .map(doc => {
                        const kode = doc.data().kodePengajuan || "";
                        const parts = kode.split("/");
                        const last = parts.length === 3 ? parseInt(parts[2]) : 0;
                        return isNaN(last) ? 0 : last;
                      })
                      .filter(num => num > 0);

                    if (lastNumbers.length > 0) nextNumber = Math.max(...lastNumbers) + 1;
                  }

                  const namaFormatted = nama.split(" ")[0].toUpperCase();
                  const kelasFormatted = kelas.toUpperCase();
                  const kode = `${namaFormatted}/${kelasFormatted}/${nextNumber}`;

                  kodeInput.value = kode;
                  console.log(`✅ [loader] Kode pengajuan terbaru: ${kode}`);
                } catch (err) {
                  console.error("❌ [loader] Gagal generate kode:", err);
                  kodeInput.value = "Error ambil data Firestore";
                }
              }

              setTimeout(generateKode, 800);
            }
          } catch (err) {
            console.error("❌ [loader] Gagal auto-isi form:", err);
          }
        } 
        // =====================================================
        // 🧾 HALAMAN KERUSAKAN
        // =====================================================
        else if (page === "kerusakan") {
          const kerusakanModule = await import(`../js/kerusakan.js`);
          if (kerusakanModule.initKerusakanPage) {
            setTimeout(() => kerusakanModule.initKerusakanPage(), 50);
          }
        }

      } catch (err) {
        console.error("❌ Gagal memuat halaman:", err);
        mainContent.innerHTML = "<p>⚠️ Gagal memuat halaman</p>";
      }
    });
  });
});
