// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";  // Importing Firebase Auth
import { getFirestore } from "firebase/firestore"; // Optional, if using Firestore

import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYP9D4bY9M13egUnomcz_SnnOMDkWwsb0",
  authDomain: "imdbclone-19d91.firebaseapp.com",
  projectId: "imdbclone-19d91",
  storageBucket: "imdbclone-19d91.firebasestorage.app",
  messagingSenderId: "618013357483",
  appId: "1:618013357483:web:63420f80f73d7b25734eee",
  measurementId: "G-3SMJMV7YTT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Optionally, initialize Firestore
const db = getFirestore(app);

const storage = getStorage(app);

// Export the auth object
export { auth, db,  storage};