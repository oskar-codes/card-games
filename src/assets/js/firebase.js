import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3oZkLGgL1zJCd1emC6AL6Rn4hf_t47FI",
  authDomain: "card-games-b8a4e.firebaseapp.com",
  projectId: "card-games-b8a4e",
  storageBucket: "card-games-b8a4e.firebasestorage.app",
  messagingSenderId: "905688075182",
  appId: "1:905688075182:web:7ec879f764a6bb1c5ed63f",
  measurementId: "G-YDW4CW73VT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);