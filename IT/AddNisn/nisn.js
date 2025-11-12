 import { db2 } from "../../MAIN/firebaseadmin.js";
    import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

    const nisnInput = document.getElementById("nisnInput");
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
      const nisn = nisnInput.value.trim();
      if (!nisn) {
        showPopup("NISN tidak boleh kosong!", "error");
        return;
      }

      try {
        const nisnRef = collection(db2, "nisn");
        const q = query(nisnRef, where("nisn", "==", nisn));
        const snap = await getDocs(q);

        if (!snap.empty) {
          showPopup("NISN sudah ada!", "error");
          return;
        }

        await addDoc(nisnRef, { nisn, tanggalInput: new Date() });
        showPopup(`NISN ${nisn} berhasil ditambahkan!`, "success");
        nisnInput.value = "";
      } catch (error) {
        showPopup("Error: " + error.message, "error");
      }
    });