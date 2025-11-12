// ========================================================
// tampilkandatatablepengajuan.js
// ========================================================
import { db3 } from '../../../../../../MAIN/firebasesma.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export function initDataBarangMasuk() {
  const barangMasukRef = collection(db3, "DataBarangMasuk");

  const bmFieldsContainer = document.getElementById("bm_barangFields");
  const bmTabsContainer = document.getElementById("bm_barangTabs");
  const addBtn = document.getElementById("bm_addBarangBtn");
  const hapusBtn = document.getElementById("bm_hapusBarangBtn");

  let barangCounter = 1;
  const tabList = [];

  // 🔹 Fungsi switch tab
  function switchTab(id) {
    const allFields = bmFieldsContainer.querySelectorAll(".barang-field");
    const allTabs = bmTabsContainer.querySelectorAll(".tab-btn");
    const bmTitle = bmFieldsContainer.querySelector("h2");

    allFields.forEach(field => field.dataset.active = (field.dataset.id == id ? "true" : "false"));
    allFields.forEach(field => field.style.display = field.dataset.active == "true" ? "flex" : "none");

    allTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.id == id));

    if (bmTitle) {
      const index = tabList.findIndex(t => t.id == id) + 1;
      bmTitle.textContent = `Barang ${index}`;
    }
  }

  // 🔹 Tambah field & tab baru
  function addBarang() {
    barangCounter++;
    const uniqueId = `barang-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    // Tambah tab
    const newTab = document.createElement("button");
    newTab.type = "button";
    newTab.className = "tab-btn";
    newTab.dataset.id = uniqueId;
    newTab.textContent = `Barang ${tabList.length + 1}`;
    newTab.addEventListener("click", () => switchTab(uniqueId));
    bmTabsContainer.appendChild(newTab);

    // Tambah field
    const newField = document.createElement("div");
    newField.className = "barang-field";
    newField.dataset.id = uniqueId;
    newField.style.display = "none";
    newField.style.flexDirection = "column";
    newField.style.gap = "10px";

    const inputStyle = `
      width: 100%;
      padding: 10px 15px;
      margin: 0;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
    `;
newField.innerHTML = `
  <input type="text" class="namaBarangInput" id="bm_namaBarang-${uniqueId}" placeholder="Nama Barang (Pilih dari table)" readonly style="${inputStyle}">
  <input type="text" id="bm_satuanBarang-${uniqueId}" placeholder="Satuan Barang (Pilih dari table)" readonly style="${inputStyle}">
  <input type="text" id="bm_merekBarang-${uniqueId}" placeholder="Merek Barang" readonly style="${inputStyle}">
  <input type="number" id="bm_jumlahBarang-${uniqueId}" placeholder="Jumlah Barang" style="${inputStyle}">

  <!-- ✅ Tambahan checkbox -->
  <label for="bm_habisPakai-${uniqueId}" style="display:flex; align-items:center; gap:6px; margin-top:5px;">
    <input type="checkbox" class="checkboxHabisPakai" id="bm_habisPakai-${uniqueId}">
    Barang Habis Pakai
  </label>
`;



    bmFieldsContainer.appendChild(newField);
    tabList.push({id: uniqueId});

    switchTab(uniqueId);
  }

  addBtn.addEventListener("click", addBarang);

  // 🔹 Hapus field & tab aktif
  hapusBtn.addEventListener("click", () => {
    const activeTab = bmTabsContainer.querySelector(".tab-btn.active");
    if (!activeTab) return;

    if (bmTabsContainer.querySelectorAll(".tab-btn").length <= 1) {
      alert("Tidak bisa menghapus tab terakhir!");
      return;
    }

    const activeId = activeTab.dataset.id;

    const activeField = bmFieldsContainer.querySelector(`.barang-field[data-id="${activeId}"]`);
    if (activeField) activeField.remove();
    activeTab.remove();

    const idx = tabList.findIndex(t => t.id == activeId);
    if (idx > -1) tabList.splice(idx, 1);

    bmTabsContainer.querySelectorAll(".tab-btn").forEach((tab, i) => {
      tab.textContent = `Barang ${i + 1}`;
    });

    if (tabList.length > 0) switchTab(tabList[tabList.length - 1].id);
  });

  // 🔹 Tambah barang pertama otomatis
  addBarang();

  // 🔹 Load data dari Firestore
  async function loadBarangMasukData() {
    const tbody = document.querySelector("#bm_barangMasukTable tbody");
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">⏳ Memuat data...</td></tr>`;

    try {
      const snapshot = await getDocs(barangMasukRef);
      const barangMasukList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      tbody.innerHTML = "";

      if (barangMasukList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">📭 Data kosong</td></tr>`;
        return;
      }

      barangMasukList.forEach((barang, index) => {
        if (!barang.jumlah || barang.jumlah <= 0) return;

        const row = document.createElement("tr");
        const fotoCell = barang.fotoUrl
  ? `<a href="${barang.fotoUrl}" target="_blank" style="color:blue; text-decoration:underline;">Lihat Foto</a>`
  : "-";

row.innerHTML = `
  <td>${index + 1}</td>
  <td>${barang.namaBarang || "N/A"}</td>
  <td>${barang.satuan || "N/A"}</td>
  <td>${barang.merek || "N/A"}</td>
  <td>${barang.jumlah || "0"}</td>
  <td>${fotoCell}</td>
`;



        row.addEventListener("click", () => {
  const activeField = bmFieldsContainer.querySelector(".barang-field[data-active='true']");
  if (!activeField) return;

  const uniqueId = activeField.dataset.id;
  const namaField = document.getElementById(`bm_namaBarang-${uniqueId}`);
  const satuanField = document.getElementById(`bm_satuanBarang-${uniqueId}`);
  const merekField = document.getElementById(`bm_merekBarang-${uniqueId}`);
  const jumlahField = document.getElementById(`bm_jumlahBarang-${uniqueId}`);

  if (!namaField || !satuanField || !merekField || !jumlahField) return;

  // ❌ Cek apakah barang sudah dipakai di field lain
  const isAlreadyTaken = Array.from(bmFieldsContainer.querySelectorAll(".barang-field")).some(f => {
    if (f.dataset.id === uniqueId) return false;
    const namaF = f.querySelector(".namaBarangInput")?.value || "";
    return namaF === barang.namaBarang;
  });

  if (isAlreadyTaken) {
    alert(`❌ Barang ${barang.namaBarang} sudah dipilih di field lain!`);
    return;
  }

  // Pastikan jumlah <= stok
  const pinjamJumlah = parseInt(jumlahField.value) || 0;
  if (pinjamJumlah > barang.jumlah) {
    alert(`❌ Stok ${barang.namaBarang} tidak cukup!`);
    return;
  }

  // Isi field aktif
  namaField.value = barang.namaBarang || "";
  satuanField.value = barang.satuan || "";
  merekField.value = barang.merek || ""; // ✅ Auto isi merek


});


        tbody.appendChild(row);
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">❌ Gagal memuat data</td></tr>`;
    }
  }

  loadBarangMasukData();
}
