// 🔹 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// 🔹 Konfigurasi Firebase (client)
const firebaseConfig = {
  apiKey: "AIzaSyCAVsG_cBB_Ksbk4oqkXTH6oTlNKl-p-bU",
  authDomain: "manajemen-sma.firebaseapp.com",
  projectId: "manajemen-sma",
  storageBucket: "manajemen-sma.firebasestorage.app",
  messagingSenderId: "1008287671477",
  appId: "1:1008287671477:web:7829d82b3da953d2598afc",
  measurementId: "G-ZSFSXW3C2C"
};

// 🔹 Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // <-- gunakan db client
const auth = getAuth();         // hanya untuk logout

export function initDataBarangMasuk(){
  // 🔹 Logout Function
  window.logout = function() {
    localStorage.removeItem("isLoggedIn");
    window.accessToken = "";
    localStorage.removeItem("isDriveLoggedIn");
    localStorage.removeItem("driveAccessToken");

    const loginBtn = document.getElementById("loginBtn");
    const sendBtn = document.getElementById("sendBtn");

    if (loginBtn && window.updateLoginButton) window.updateLoginButton();
    if (sendBtn) sendBtn.disabled = true;

    signOut(auth).finally(() => {
      alert("✅ Berhasil logout dari aplikasi & Google Drive!");
      window.location.replace("/Login/login.html");
    });
  };

  // 🔹 DOM Elements
  const nisnTableBody = document.querySelector("#nisnTable tbody");
  const filterButtons = document.querySelectorAll(".filter-buttons button");

  // Popup Edit
  const editPopup = document.getElementById("editPopup");
  const editNamaInput = document.getElementById("editNama");
  const saveEditBtn = document.getElementById("saveEditBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  // Popup Delete
  const deletePopup = document.getElementById("deletePopup");
  const deleteNamaText = document.getElementById("deleteNama");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  // Popup Tambah
  const addPopup = document.getElementById("addPopup");
  const addNamaInput = document.getElementById("addNama");
  const saveAddBtn = document.getElementById("saveAddBtn");
  const cancelAddBtn = document.getElementById("cancelAddBtn");
  const openAddBtn = document.getElementById("openAddBtn");

  // Pagination
  const paginationContainer = document.createElement("div");
  paginationContainer.style.marginTop = "15px";
  paginationContainer.style.textAlign = "center";
  document.querySelector(".table-container").appendChild(paginationContainer);

  let currentCollection = "merek";
  let currentEditId = null;
  let currentDeleteId = null;
  let allData = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // 🔹 Notifikasi Manual
  function showManualNotif(pesan, warna = "green") {
    const box = document.getElementById("manualNotif");
    box.innerText = pesan;
    box.style.display = "block";
    box.style.color = "white";
    box.style.background = warna;
  }

  // 🔹 Load Data
  async function loadData(collectionName) {
    nisnTableBody.innerHTML = "";
    currentCollection = collectionName;
    allData = [];
    currentPage = 1;

    try {
      const querySnapshot = await getDocs(collection(db, collectionName)); // <-- db client
      querySnapshot.forEach((docSnap) => {
        allData.push({ id: docSnap.id, ...docSnap.data() });
      });
      renderTable();
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
  }

  // 🔹 Render Table
  function renderTable() {
    nisnTableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = allData.slice(startIndex, endIndex);

    pageData.forEach((data, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${startIndex + index + 1}</td>
        <td>${data.nama || "-"}</td>
        <td>
          <button class="edit-btn" data-id="${data.id}" data-nama="${data.nama || ""}">Edit</button>
          <button class="delete-btn" data-id="${data.id}" data-nama="${data.nama || ""}">Hapus</button>
        </td>
      `;
      nisnTableBody.appendChild(tr);
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => openEditPopup(btn.dataset.id, btn.dataset.nama));
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => openDeletePopup(btn.dataset.id, btn.dataset.nama));
    });

    renderPagination();
  }

  // 🔹 Pagination
  function renderPagination() {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.innerText = "⬅ Sebelumnya";
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.marginRight = "10px";
    prevBtn.onclick = () => { currentPage--; renderTable(); };
    paginationContainer.appendChild(prevBtn);

    const pageInfo = document.createElement("span");
    pageInfo.innerText = `Halaman ${currentPage} dari ${totalPages}`;
    paginationContainer.appendChild(pageInfo);

    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Selanjutnya ➡";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.marginLeft = "10px";
    nextBtn.onclick = () => { currentPage++; renderTable(); };
    paginationContainer.appendChild(nextBtn);
  }

  // 🔹 Edit Popup
  function openEditPopup(id, namaLama) {
    currentEditId = id;
    editNamaInput.value = namaLama;
    editPopup.style.display = "flex";
  }
  saveEditBtn.addEventListener("click", async () => {
    const newNama = editNamaInput.value.trim();
    if (!newNama) { showManualNotif("Nama tidak boleh kosong!", "orange"); return; }
    try {
      await updateDoc(doc(db, currentCollection, currentEditId), { nama: newNama });
      showManualNotif("Data berhasil diupdate!", "green");
      editPopup.style.display = "none";
      loadData(currentCollection);
    } catch (error) { console.error("Error updating document: ", error); }
  });
  cancelEditBtn.addEventListener("click", () => { editPopup.style.display = "none"; });

  // 🔹 Delete Popup
  function openDeletePopup(id, nama) {
    currentDeleteId = id;
    deleteNamaText.innerText = `Data: ${nama}`;
    deletePopup.style.display = "flex";
  }
  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      await deleteDoc(doc(db, currentCollection, currentDeleteId));
      showManualNotif("Data berhasil dihapus!", "red");
      deletePopup.style.display = "none";
      loadData(currentCollection);
    } catch (error) { console.error("Error deleting document:", error); }
  });
  cancelDeleteBtn.addEventListener("click", () => { deletePopup.style.display = "none"; });

  // 🔹 Add Popup
  openAddBtn.addEventListener("click", () => { addNamaInput.value = ""; addPopup.style.display = "flex"; });
  saveAddBtn.addEventListener("click", async () => {
    const newNama = addNamaInput.value.trim();
    if (!newNama) { showManualNotif("Nama tidak boleh kosong!", "orange"); return; }

    const existing = allData.find(d => d.nama.toLowerCase() === newNama.toLowerCase());
    if (existing) { showManualNotif("Nama sudah ada, tidak bisa ditambahkan!", "red"); return; }

    try {
      await addDoc(collection(db, currentCollection), { nama: newNama });
      showManualNotif("Data berhasil ditambahkan!", "green");
      addPopup.style.display = "none";
      loadData(currentCollection);
    } catch (error) { console.error("Error adding document:", error); }
  });
  cancelAddBtn.addEventListener("click", () => { addPopup.style.display = "none"; });

  // 🔹 Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => loadData(btn.dataset.collection));
  });

  // 🔹 Load default
  loadData("merek");

  // 🔹 Refresh Note
  const statusEl = document.getElementById("infoData");
  function setupRefreshNote() {
    let refreshContainer = document.getElementById("refresh-container");
    if (!refreshContainer) {
      refreshContainer = document.createElement("div");
      refreshContainer.id = "refresh-container";
      refreshContainer.style.marginBottom = "10px";
      refreshContainer.innerHTML = `
        <span id="refresh-note" style="font-size:0.9em; color:#555;">
          ⏳ Jika lebih dari 5 detik data belum muncul, tekan 
          <span class="refresh-link" style="color:#007bff; cursor:pointer;" onclick="location.reload()">refresh</span>
        </span>
      `;
      statusEl.parentElement.insertBefore(refreshContainer, statusEl);
    }
  }

  setupRefreshNote();
}
