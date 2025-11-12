import { db3 } from '../../../../../../MAIN/firebasesma.js';  // Pastikan ini sudah benar
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export function initDataBarangMasuk() {// Mengambil data dari Firebase Firestore

const barangMasukRef = collection(db3, "HistoryBarangMasuk");
async function loadBarangMasukData() {
  try {
    const snapshot = await getDocs(barangMasukRef);
    const barangMasukList = snapshot.docs.map(doc => doc.data());

    // Log data untuk memeriksa apakah sudah diambil
    console.log("Data dari Firestore:", barangMasukList);

    const tbody = document.querySelector("#db_barangTable tbody");
    tbody.innerHTML = ""; // Reset tabel

    barangMasukList.forEach((barang, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${barang.kodeBarang || "N/A"}</td>
        <td>${barang.namaBarang || "N/A"}</td>
        <td>${barang.merek || "N/A"}</td>
        <td>${barang.jumlah || "0"}</td>
        <td>${barang.tanggalMasuk || "N/A"}</td>
        <td>${barang.kategori || "N/A"}</td>
        <td>${barang.satuan || "N/A"}</td>
        <td>${barang.jenisDana || "N/A"}</td>
        <td><a href="${barang.fotoUrl || "#"}" target="_blank">Lihat Foto</a></td>
        <td>${barang.keterangan || "N/A"}</td>
      `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

loadBarangMasukData();
}