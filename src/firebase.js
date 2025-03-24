// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration


const firebaseConfig = {
  apiKey: "AIzaSyAvL5E_KG-zxkQEK0aeGbEgFRHkBOdCNA0",
  authDomain: "placement-52c3a.firebaseapp.com",
  projectId: "placement-52c3a",
  storageBucket: "placement-52c3a.firebasestorage.app",
  messagingSenderId: "1079780952354",
  appId: "1:1079780952354:web:9773fad831affa487cbd7b",
  measurementId: "G-LDVCM903HD"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
 const auth = getAuth()


 export { auth, db };