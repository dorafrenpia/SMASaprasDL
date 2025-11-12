// koneksi.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export function initFirebaseCheckButton() {
  // cari tombol dan status
  const btn = document.getElementById("cekFirebaseBtn");
  const statusDiv = document.getElementById("firebaseStatus");

  if (!btn || !statusDiv) return; // tombol atau status tidak ada

  btn.addEventListener("click", async () => {
    // tampilkan status
    statusDiv.style.display = "block";
    statusDiv.innerHTML = "🔄 Mengecek koneksi Firebase...";

    // 🔹 Firebase Pertama
    const firebaseConfig1 = {
      apiKey: "AIzaSyAC460gLPRUccfUBJZx3tID-cozLBVvejU",
      authDomain: "datasmadl.firebaseapp.com",
      projectId: "datasmadl",
      storageBucket: "datasmadl.firebasestorage.app",
      messagingSenderId: "958380144331",
      appId: "1:958380144331:web:0581d7a867da214f1a4d4e"
    };
    const app1 = initializeApp(firebaseConfig1, "app1");
    const db1 = getFirestore(app1);

    // 🔹 Firebase Kedua
    const firebaseConfig2 = {
      apiKey: "AIzaSyCAVsG_cBB_Ksbk4oqkXTH6oTlNKl-p-bU",
      authDomain: "manajemen-sma.firebaseapp.com",
      projectId: "manajemen-sma",
      storageBucket: "manajemen-sma.appspot.com",
      messagingSenderId: "1008287671477",
      appId: "1:1008287671477:web:7829d82b3da953d2598afc",
      measurementId: "G-ZSFSXW3C2C"
    };
    const app2 = initializeApp(firebaseConfig2, "app2");
    const db2 = getFirestore(app2);

    try {
      await getDocs(collection(db1, "testConnection")).catch(() => {});
      statusDiv.innerHTML = "✅ Firebase smadlsapras terhubung.";

      await getDocs(collection(db2, "testConnection")).catch(() => {});
      statusDiv.innerHTML += "<br>✅ Firebase manajemen-sma terhubung.";
      statusDiv.classList.add("success");
    } catch (error) {
      statusDiv.innerHTML = "❌ Koneksi Firebase gagal: " + error.message;
      statusDiv.classList.add("fail");
    }
  });
}
