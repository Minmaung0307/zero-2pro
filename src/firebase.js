// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY, // Pro Tip: Env သုံးပါ
  authDomain: "zero-2pro.firebaseapp.com",
  projectId: "zero-2pro",
  storageBucket: "zero-2pro.firebasestorage.app",
  messagingSenderId: "953176814570",
  appId: "1:953176814570:web:94ad63ec91b1a9cf03b893",
  measurementId: "G-TPYZH0PD9H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);