// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ2v-5JYOcdRyldHH9A7p2UUoG4I0qlOo",
  authDomain: "gym-splitter.firebaseapp.com",
  projectId: "gym-splitter",
  storageBucket: "gym-splitter.firebasestorage.app",
  messagingSenderId: "504398201572",
  appId: "1:504398201572:web:58f7bbc12fec47cf8da2f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicijalizacija servisa
const auth = getAuth(app); // auth instanca
const db = getFirestore(app); // database instanca

// Izvoz servisa
export { auth, db };