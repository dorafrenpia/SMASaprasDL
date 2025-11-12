import { db3 } from '../../../../../../MAIN/firebasesma.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export function initDataBarangMasuk() {
  const barangMasukRef = collection(db3, "DataBarangMasuk");

  async function loadBarangMasukData() {
    try {
      const snapshot = await getDocs(barangMasukRef);
      const barangMasukList = snapshot.docs.map(doc => doc.data());

      console.log("Data dari Firestore:", barangMasukList);

      const tbody = document.querySelector("#db_barangTable tbody");
      tbody.innerHTML = "";

      barangMasukList.forEach((barang, index) => {
        const row = document.createElement("tr");

        // Jika fotoUrl ada, tampilkan link ke foto
        const fotoCell = barang.fotoUrl
          ? `<a href="${barang.fotoUrl}" target="_blank" style="color:blue; text-decoration:underline;">Lihat Foto</a>`
          : "-";

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${barang.namaBarang || "N/A"}</td>
          <td>${barang.merek || "N/A"}</td>
          <td>${barang.jumlah || "0"}</td>
          <td>${barang.kategori || "N/A"}</td>
          <td>${barang.satuan || "N/A"}</td>
          <td>${fotoCell}</td>
        `;

        tbody.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  loadBarangMasukData();
}
