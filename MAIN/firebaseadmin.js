// firebase2.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🔹 Konfigurasi Firebase db2
const firebaseConfig2 = {
  apiKey: "AIzaSyCAVsG_cBB_Ksbk4oqkXTH6oTlNKl-p-bU",
  authDomain: "manajemen-sma.firebaseapp.com",
  projectId: "manajemen-sma",
  storageBucket: "manajemen-sma.appspot.com",
  messagingSenderId: "1008287671477",
  appId: "1:1008287671477:web:7829d82b3da953d2598afc",
  measurementId: "G-ZSFSXW3C2C"
};

// 🔹 Inisialisasi app dengan nama khusus "DB2"
let appdb2;
if (!getApps().some(a => a.name === "db2")) {
  appdb2 = initializeApp(firebaseConfig2, "db2");
} else {
  appdb2 = getApp("db2");
}

// 🔹 Export Firestore, Auth, Provider
export const db2 = getFirestore(appdb2);     // ← ini db2
export const auth2 = getAuth(appdb2);
export const provider2 = new GoogleAuthProvider();
provider2.addScope("https://www.googleapis.com/auth/drive.file");
