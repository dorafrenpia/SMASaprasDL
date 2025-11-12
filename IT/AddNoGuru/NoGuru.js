import { db } from "../../MAIN/firebaseadmin.js";
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const noGuruInput = document.getElementById("noGuruInput");
const addBtn = document.getElementById("addBtn");
const popup = document.getElementById("popup");

function showPopup(message, type = "info", duration = 3000) {
  popup.textContent = message;
  popup.className = `popup show ${type}`;
  setTimeout(() => {
    popup.className = "popup";
  }, duration);
}

addBtn.addEventListener("click", async () => {
  const noGuru = noGuruInput.value.trim();
  if (!noGuru) {
    showPopup("Nomor Guru tidak boleh kosong!", "error");
    return;
  }

  try {
    const guruRef = collection(db, "NoGuru");
    const q = query(guruRef, where("noGuru", "==", noGuru));
    const snap = await getDocs(q);

    if (!snap.empty) {
      showPopup("Nomor Guru sudah ada!", "error");
      return;
    }

    await addDoc(guruRef, { noGuru, tanggalInput: new Date() });
    showPopup(`Nomor Guru ${noGuru} berhasil ditambahkan!`, "success");
    noGuruInput.value = "";
  } catch (error) {
    showPopup("Error: " + error.message, "error");
  }
});
