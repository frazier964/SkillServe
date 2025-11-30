// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUlTm7XqtP8AegObmD7hsgZQMmWHMh31o",
  authDomain: "skillserve-c4c53.firebaseapp.com",
  projectId: "skillserve-c4c53",
  storageBucket: "skillserve-c4c53.firebasestorage.app",
  messagingSenderId: "835909898750",
  appId: "1:835909898750:web:d50fcd8264121b2af230af",
  measurementId: "G-BKL8SEDPV0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics may fail in non-browser environments; guard it
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  analytics = null;
}

// Initialize commonly used services and export them
const auth = getAuth(app);
try {
  // persist auth in browser so users stay signed in across reloads
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} catch (e) {
  // ignore when persistence cannot be set (SSR/test)
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };