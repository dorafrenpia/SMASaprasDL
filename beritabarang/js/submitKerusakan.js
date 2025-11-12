// ============================================================
// 📦 submitKerusakan.js
// Simpan data Form Berita Acara Kerusakan Barang ke Firestore
// ============================================================

import { db3 } from "../../../../MAIN/firebaseSMA.js";
import { collection, addDoc, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🔹 Jalankan setelah form siap
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kerusakanForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // ======================================================
      // 🔹 Ambil tanggal dari input dan pecah menjadi bagian-bagian
      // ======================================================
      const tanggalInput = document.getElementById("tanggal").value;
      const date = new Date(tanggalInput);

      // Fungsi bantu untuk nama hari dan bulan
      const namaHari = [
        "Minggu", "Senin", "Selasa", "Rabu", 
        "Kamis", "Jumat", "Sabtu"
      ];
      const namaBulan = [
        "Januari", "Februari", "Maret", "April", 
        "Mei", "Juni", "Juli", "Agustus", 
        "September", "Oktober", "November", "Desember"
      ];

      const hari = namaHari[date.getDay()];
      const tanggal = date.getDate();
      const bulan = namaBulan[date.getMonth()];
      const tahun = date.getFullYear();

      // ======================================================
      // 🔹 Ambil semua grup barang
      // ======================================================
      const barangGroups = document.querySelectorAll(".barang-group");
      const daftarBarang = [];

      barangGroups.forEach((group) => {
        const namaBarang = group.querySelector('input[name="namaBarang"]').value.trim();
        const spesifikasi = group.querySelector('input[name="spesifikasi"]').value.trim();
        const jumlah = group.querySelector('input[name="jumlah"]').value.trim();
        const lokasi = group.querySelector('input[name="lokasi"]').value.trim();
        const kondisi = group.querySelector('textarea[name="kondisi"]').value.trim();

        if (namaBarang !== "") {
          daftarBarang.push({
            namaBarang,
            spesifikasi,
            jumlah,
            lokasi,
            kondisi
          });
        }
      });

      if (daftarBarang.length === 0) {
        alert("⚠️ Harap isi minimal satu data barang!");
        return;
      }

      // ======================================================
      // 🔹 Simpan ke koleksi Firestore
      // ======================================================
      const docRef = await addDoc(collection(db3, "BeritaAcaraKerusakan"), {
        tanggalInput, // format YYYY-MM-DD (asli dari input)
        hari,          // contoh: Senin
        tanggal,       // contoh: 10
        bulan,         // contoh: November
        tahun,         // contoh: 2025
        daftarBarang,
        waktuSubmit: serverTimestamp(),
      });

      alert("✅ Data berhasil disimpan ke Firestore!\nID: " + docRef.id);
      form.reset();

      // Bersihkan field tambahan
      const extraFields = document.querySelectorAll(".barang-group:not(:first-child)");
      extraFields.forEach(f => f.remove());

    } catch (error) {
      console.error("❌ Gagal menyimpan data:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  });
});
