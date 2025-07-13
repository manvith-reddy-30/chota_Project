// firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCpmbaV_jrCXxElWln1WV-SEXh0IUunkG4",
  authDomain: "cusinecraze-auth.firebaseapp.com",
  projectId: "cusinecraze-auth",
  storageBucket: "cusinecraze-auth.appspot.com", // fix: use `appspot.com`, not `firebasestorage.app`
  messagingSenderId: "837348427171",
  appId: "1:837348427171:web:e483c16c0424ef187e4616",
  measurementId: "G-CMLBQWK0ZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Add this for auth:
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
