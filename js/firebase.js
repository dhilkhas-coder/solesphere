import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import * as fs from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import * as au from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import * as st from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
const firebaseConfig = {
  apiKey: "AIzaSyB4nc51tTkErsEwGLoII8DZ6I53TMwd10U",
  authDomain: "solesphere-40386.firebaseapp.com",
  projectId: "solesphere-40386",
  storageBucket: "solesphere-40386.firebasestorage.app",
  messagingSenderId: "337363185171",
  appId: "1:337363185171:web:c794a39acb3909082b19e6",
  measurementId: "G-SL1642GJY6"
};
const app = initializeApp(firebaseConfig);
export const db = fs.getFirestore(app), auth = au.getAuth(app), storage = st.getStorage(app);
export {fs, au, st};
