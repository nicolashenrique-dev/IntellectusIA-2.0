// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDw-n_mwvBQWcdlfRuHHEy_L36SB9jVlWY",
  authDomain: "lista-de-compras-3b-2026.firebaseapp.com",
  projectId: "lista-de-compras-3b-2026",
  storageBucket: "lista-de-compras-3b-2026.firebasestorage.app",
  messagingSenderId: "421109867348",
  appId: "1:421109867348:web:31e4be05f0bb16b92e5ec1",
  measurementId: "G-ZY3VSZMQTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);