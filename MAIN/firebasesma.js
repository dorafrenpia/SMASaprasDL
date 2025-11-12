// firebase3.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🔹 Konfigurasi Firebase db3
const firebaseConfig3 = {
  apiKey: "AIzaSyAXmwLsgQ8GyBjGw17_DcDA4JQ3MJz_xXY",
  authDomain: "smadlsapras.firebaseapp.com",
  projectId: "smadlsapras",
  storageBucket: "smadlsapras.firebasestorage.app",
  messagingSenderId: "302462390543",
  appId: "1:302462390543:web:bd006f8e67b2b903d12e7a"
};

// 🔹 Inisialisasi app dengan nama khusus "DB3"
let appdb3;
if (!getApps().some(a => a.name === "db3")) {
  appdb3 = initializeApp(firebaseConfig3, "db3");
} else {
  appdb3 = getApp("db3");
}

// 🔹 Export Firestore, Auth, Provider
export const db3 = getFirestore(appdb3);     // ← ini db3
export const auth3 = getAuth(appdb3);
export const provider3 = new GoogleAuthProvider();
provider3.addScope("https://www.googleapis.com/auth/drive.file");
