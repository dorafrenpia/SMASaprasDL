import { db } from "../../MAIN/firebaseadmin.js";
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const noOrgInput = document.getElementById("noOrgInput");
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
  const noOrg = noOrgInput.value.trim();
  if (!noOrg) {
    showPopup("No Organisasi tidak boleh kosong!", "error");
    return;
  }

  try {
    const noOrgRef = collection(db, "NoOrganisasi");
    const q = query(noOrgRef, where("noOrg", "==", noOrg));
    const snap = await getDocs(q);

    if (!snap.empty) {
      showPopup("No Organisasi sudah ada!", "error");
      return;
    }

    await addDoc(noOrgRef, { noOrg, tanggalInput: new Date() });
    showPopup(`No Organisasi ${noOrg} berhasil ditambahkan!`, "success");
    noOrgInput.value = "";
  } catch (error) {
    showPopup("Error: " + error.message, "error");
  }
});
