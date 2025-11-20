// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8fQ0BaHXAOem3mmXWFqEa9J6gbcfzUG4",
  authDomain: "thepantauair.firebaseapp.com",
  projectId: "thepantauair",
  storageBucket: "thepantauair.firebasestorage.app",
  messagingSenderId: "177899866156",
  appId: "1:177899866156:web:2bca45064612f06f8e6989"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;