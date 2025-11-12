import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🔹 Konfigurasi Firebase untuk db1
const firebaseConfig1 = {
  apiKey: "AIzaSyAC460gLPRUccfUBJZx3tID-cozLBVvejU",
  authDomain: "datasmadl.firebaseapp.com",
  projectId: "datasmadl",
  storageBucket: "datasmadl.firebasestorage.app",
  messagingSenderId: "958380144331",
  appId: "1:958380144331:web:0581d7a867da214f1a4d4e"
};

// 🔹 Inisialisasi app dengan nama unik "db1"
let appdb1;
if (!getApps().some(a => a.name === "db1")) {
  appdb1 = initializeApp(firebaseConfig1, "db1"); // ← pakai firebaseConfig1
} else {
  appdb1 = getApp("db1");
}

// 🔹 Export Firestore, Auth, Provider
export const db1 = getFirestore(appdb1);
export const auth1 = getAuth(appdb1);
export const provider1 = new GoogleAuthProvider();
provider1.addScope("https://www.googleapis.com/auth/drive.file");
